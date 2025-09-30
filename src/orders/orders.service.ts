import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './interfaces/order.interface';
import * as admin from 'firebase-admin';

@Injectable()
export class OrdersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderNumber = await this.generateOrderNumber();
    
    const orderData: any = {
      orderNumber,
      ...createOrderDto,
      status: OrderStatus.pending,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await this.firebaseService.firestore
      .collection('orders')
      .add(orderData);
    const freshSnap = await docRef.get();
    const data = freshSnap.data() as any;
    return {
      id: freshSnap.id,
      ...data,
      createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
    } as Order;
  }

  async getOrderById(orderId: string): Promise<Order> {
    const snap = await this.firebaseService.firestore
      .collection('orders')
      .doc(orderId)
      .get();

    if (!snap.exists) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return {
      id: snap.id,
      ...snap.data(),
    } as Order;
  }

  async assignDeliveryToOrder(orderId: string, deliveryId: string): Promise<Order> {
    const updated = await this.firebaseService.runTransaction(async (tx) => {
      const ordersRef = this.firebaseService.firestore
        .collection('orders')
        .doc(orderId);
      const delivRef = this.firebaseService.firestore
        .collection('deliveries')
        .doc(deliveryId);

      const [oSnap, dSnap] = await Promise.all([
        tx.get(ordersRef),
        tx.get(delivRef),
      ]);

      if (!oSnap.exists) throw new NotFoundException('Order not found');
      if (!dSnap.exists) throw new NotFoundException('Delivery not found');

      const order = oSnap.data() as Order;
      if (order.status !== OrderStatus.confirmed) {
        throw new BadRequestException('Order must be confirmed before assignment');
      }

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

      await Promise.all([
        tx.update(ordersRef, updateOrder),
        tx.update(delivRef, updateDelivery),
      ]);

      return { orderId: oSnap.id } as any;
    });
    const freshSnap = await this.firebaseService.firestore
      .collection('orders')
      .doc(orderId)
      .get();
    const data = freshSnap.data() as any;
    return {
      id: freshSnap.id,
      ...data,
      createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
      assignedAt: data?.assignedAt?.toDate ? data.assignedAt.toDate() : undefined,
      confirmedAt: data?.confirmedAt?.toDate ? data.confirmedAt.toDate() : undefined,
      startedAt: data?.startedAt?.toDate ? data.startedAt.toDate() : undefined,
      deliveredAt: data?.deliveredAt?.toDate ? data.deliveredAt.toDate() : undefined,
    } as Order;
  }

  private async generateOrderNumber(): Promise<string> {
    // Implementa la lógica para generar números de orden únicos
    const date = new Date();
    const prefix = date.getFullYear().toString().slice(-2) +
                  (date.getMonth() + 1).toString().padStart(2, '0') +
                  date.getDate().toString().padStart(2, '0');
    
    const counterRef = this.firebaseService.firestore
      .collection('counters')
      .doc('orders');
    
    return this.firebaseService.runTransaction(async (tx) => {
      const snap = await tx.get(counterRef);
      const current = (snap.exists ? snap.data()?.current : 0) || 0;
      const next = current + 1;
      
      await tx.set(counterRef, { current: next }, { merge: true });
      
      return `${prefix}-${next.toString().padStart(4, '0')}`;
    });
  }
}