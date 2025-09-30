import { OrderStatus } from './interfaces/order.interface';
import { canTransition } from './policy/status.policy';
import * as admin from 'firebase-admin';

// createOrder: usa serverTimestamp
const orderData: any = {
  orderNumber,
  ...createOrderDto,
  status: OrderStatus.pending,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
};

async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  return this.firebaseService.runTransaction(async tx => {
    const ref = this.firebaseService.firestore.collection('orders').doc(orderId);
    const snap = await tx.get(ref);
    if (!snap.exists) throw new NotFoundException(`Order ${orderId} not found`);
    const current = snap.data() as Order;

    if (!canTransition(current.status as OrderStatus, status)) {
      throw new BadRequestException(`Invalid transition ${current.status} -> ${status}`);
    }

    const update: any = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (status === OrderStatus.confirmed) update.confirmedAt = admin.firestore.FieldValue.serverTimestamp();
    if (status === OrderStatus.assigned)  update.assignedAt  = admin.firestore.FieldValue.serverTimestamp();
    if (status === OrderStatus.on_way)    update.startedAt   = admin.firestore.FieldValue.serverTimestamp();
    if (status === OrderStatus.delivered) update.deliveredAt = admin.firestore.FieldValue.serverTimestamp();

    tx.update(ref, update);
    return { id: snap.id, ...(current as any), ...update } as Order;
  });
}

// assignDeliveryToOrder: transacción para order+delivery
async assignDeliveryToOrder(orderId: string, deliveryId: string): Promise<Order> {
  return this.firebaseService.runTransaction(async tx => {
    const ordersRef = this.firebaseService.firestore.collection('orders').doc(orderId);
    const delivRef  = this.firebaseService.firestore.collection('deliveries').doc(deliveryId);

    const [oSnap, dSnap] = await Promise.all([tx.get(ordersRef), tx.get(delivRef)]);
    if (!oSnap.exists) throw new NotFoundException('Order not found');
    if (!dSnap.exists) throw new NotFoundException('Delivery not found');

    const deliveryData = dSnap.data() || {};
    const updateOrder = {
      deliveryId,
      deliveryInfo: {
        name: deliveryData.personalInfo?.name ?? 'Delivery',
        phone: deliveryData.personalInfo?.phone ?? '',
        vehicleType: deliveryData.vehicleInfo?.type ?? 'motorcycle',
        licensePlate: deliveryData.vehicleInfo?.licensePlate ?? '',
      },
      status: OrderStatus.assigned,
      assignedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const updateDelivery = {
      status: 'busy',
      currentOrder: {
        orderId,
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    tx.update(ordersRef, updateOrder);
    tx.update(delivRef, updateDelivery);

    const currentOrder = oSnap.data() as Order;
    return { id: oSnap.id, ...currentOrder, ...updateOrder } as Order;
  });
}
