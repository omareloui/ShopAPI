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
export interface PopulatedOrder {
  id: number;

  product: string;
  product_price: number;
  product_category: string;

  u_firstname: string;
  u_lastname: string;
  u_username: string;

  quantity: number;
  state: OrderState;
}

export type CreateOrder = Omit<Order, "id">;

export type UpdateOrder = Partial<CreateOrder>;
