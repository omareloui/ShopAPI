import { buildUpdateQuery, query } from "../utils";

import {
  showOrderSchema,
  createOrderSchema,
  deleteOrderSchema,
  updateOrderSchema,
} from "../validations";

import type {
  CreateOrder,
  Order,
  UnconfirmedID,
  DTO,
  DeleteResponse,
  UpdateOrder,
  PopulatedOrder,
} from "../@types";

export class OrderModel {
  async index(): Promise<PopulatedOrder[]> {
    const result = await query(
      `
        SELECT
          orders.id,
          orders.quantity,
          orders.state,
          products.name AS product,
          products.category AS product_category,
          products.price AS product_price,
          users.firstname AS u_firstname,
          users.lastname AS u_lastname
        FROM orders
        JOIN products ON orders.product_id=products.id
        JOIN users ON orders.u_id=users.id
      `
    );
    return result.rows;
  }

  async show(orderId: UnconfirmedID): Promise<PopulatedOrder> {
    const { id } = await showOrderSchema.validate({ id: orderId });
    const result = await query(
      `
        SELECT
          orders.id,
          orders.quantity,
          orders.state,
          products.name AS product,
          products.category AS product_category,
          products.price AS product_price,
          users.firstname AS u_firstname,
          users.lastname AS u_lastname
        FROM orders
        JOIN products ON orders.product_id = products.id
        JOIN users ON orders.u_id = users.id
        WHERE orders.id = $1
      `,
      [id]
    );
    return result.rows[0];
  }

  async create(dto: DTO | CreateOrder): Promise<PopulatedOrder> {
    const { u_id, product_id, quantity, state } =
      await createOrderSchema.validate(dto);
    const result = await query<Order>(
      "INSERT INTO orders (u_id, product_id, quantity, state) VALUES ($1, $2, $3,$4) RETURNING *",
      [u_id, product_id, quantity, state]
    );
    const order = await this.show(result.rows[0].id);
    return order;
  }

  async update(
    orderId: UnconfirmedID,
    dto: UpdateOrder | DTO
  ): Promise<PopulatedOrder> {
    const vData = await updateOrderSchema.validate({ ...dto, id: orderId });
    delete (vData as { id?: number }).id;
    const { query: q, fields } = buildUpdateQuery("orders", vData, orderId!);
    const result = await query(q, fields);
    const order = await this.show(result.rows[0].id);
    return order;
  }

  async delete(orderId: UnconfirmedID): Promise<DeleteResponse> {
    const { id } = await deleteOrderSchema.validate({ id: orderId });
    const result = await query("DELETE FROM orders WHERE id = $1", [id]);
    return { ok: result.rowCount === 1 };
  }
}
