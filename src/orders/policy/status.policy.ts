import { OrderStatus } from '../interfaces/order.interface';

export const AllowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.pending]:   [OrderStatus.confirmed, OrderStatus.canceled],
  [OrderStatus.confirmed]: [OrderStatus.assigned,  OrderStatus.canceled],
  [OrderStatus.assigned]:  [OrderStatus.on_way,    OrderStatus.canceled],
  [OrderStatus.on_way]:    [OrderStatus.delivered, OrderStatus.canceled],
  [OrderStatus.delivered]: [],
  [OrderStatus.canceled]:  [],
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return AllowedTransitions[from]?.includes(to) ?? false;
}
