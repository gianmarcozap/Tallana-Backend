
export enum OrderStatus {
  pending   = 'pending',
  confirmed = 'confirmed',
  assigned  = 'assigned',
  on_way    = 'on_way',
  delivered = 'delivered',
  canceled  = 'canceled',
}

export interface Order {
  id?: string;
  orderNumber: string;
  customerId: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  restaurantId: string;
  restaurantInfo: {
    name: string;
    phone: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  deliveryAddress: {
    fullAddress: string;
    district: string;
    reference?: string;
    latitude: number;
    longitude: number;
  };
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'assigned' | 'on_way' | 'delivered' | 'cancelled';
  deliveryId?: string;
  deliveryInfo?: {
    name: string;
    phone: string;
    vehicleType: string;
    licensePlate?: string;
  };
  route?: {
    distance: string;
    duration: string;
    durationInSeconds: number;
    polyline: string;
    estimatedArrival?: Date;
  };
  deliveryTracking?: {
    currentLatitude: number;
    currentLongitude: number;
    lastUpdate: Date;
    isMoving: boolean;
    speed?: number;
  };
  createdAt: Date;
  confirmedAt?: Date;
  assignedAt?: Date;
  startedAt?: Date;
  deliveredAt?: Date;
  updatedAt: Date;
  
}



