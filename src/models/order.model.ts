import { query } from "../utils";

import { showOrderSchema, createOrderSchema } from "../validations";

import type { CreateOrder, Order, UnconfirmedID, DTO } from "../@types";

export class OrderModel {
  async index(): Promise<Order[]> {
    const result = await query("SELECT * FROM orders");
    return result.rows;
  }

  async show(orderId: UnconfirmedID): Promise<Order> {
    const { id } = await showOrderSchema.validate({ id: orderId });
    const result = await query("SELECT * FROM orders WHERE id = $1", [id]);
    return result.rows[0];
  }

  async create(dto: DTO | CreateOrder): Promise<Order> {
    const { u_id, product_id, quantity, state } =
      await createOrderSchema.validate(dto);
    const result = await query(
      "INSERT INTO orders (u_id, product_id, quantity, state) VALUES ($1, $2, $3,$4) RETURNING *",
      [u_id, product_id, quantity, state]
    );
    return result.rows[0];
  }
}
