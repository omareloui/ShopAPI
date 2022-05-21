export enum OrderState {
  ACTIVE = "active",
  COMPLETE = "complete",
}

export interface Order {
  id: number;
  product_id: number;
  u_id: number;
  quantity: number;
  state: OrderState;
}

export type CreateOrder = Omit<Order, "id">;

export type UpdateOrder = Partial<Order>;
