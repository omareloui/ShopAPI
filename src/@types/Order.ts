import { Product } from ".";

export enum OrderState {
  ACTIVE = "active",
  COMPLETE = "complete",
}

export interface Order {
  id: number;
  u_id: number;
  state: OrderState;
}

export interface OrderWUser {
  id: number;
  state: OrderState;

  u_id: number;
  u_firstname: string;
  u_lastname: string;
  u_username: string;
}

export interface OrderProducts {
  id: number;
  product_id: number;
  order_id: number;
  quantity: number;
}

export interface PopulatedOrderProducts {
  id: number;
  product_id: number;
  order_id: number;
  quantity: number;
  u_id: number;
  state: OrderState;
  firstname: string;
  lastname: string;
  password: string;
  username: string;
  name: string;
  price: number;
  category: string;
}

export interface ProductForCreateOrder {
  id: number;
  quantity?: number;
}

export interface OrderProduct extends Product {
  quantity: number;
}

export interface CreateOrder {
  products: ProductForCreateOrder[];
  state: OrderState;
}

export interface PopulatedOrder extends OrderWUser {
  products: OrderProduct[];
}
