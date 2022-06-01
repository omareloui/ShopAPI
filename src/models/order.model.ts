import { query } from "../utils";

import {
  showOrderSchema,
  createOrderSchema,
  deleteOrderSchema,
  showByUserSchema,
  userIdForOrderSchema,
} from "../validations";

import type {
  CreateOrder,
  Order,
  UnconfirmedID,
  DTO,
  DeleteResponse,
  PopulatedOrder,
  OrderProducts,
  PopulatedOrderProducts,
} from "../@types";

export class OrderModel {
  async index(): Promise<PopulatedOrder[]> {
    const result = await query<PopulatedOrderProducts>(
      `
        SELECT *
        FROM order_products
        JOIN orders ON orders.id = order_products.order_id
        JOIN users ON orders.u_id = users.id
        JOIN products ON products.id = order_products.product_id
      `
    );
    return this.populatedOrderProductsToPopulatedOrder(result.rows);
  }

  async show(orderId: UnconfirmedID): Promise<PopulatedOrder> {
    const { id } = await showOrderSchema.validate({ id: orderId });
    const orderResult = await query<PopulatedOrderProducts>(
      `
        SELECT *
        FROM order_products
        JOIN orders ON orders.id = order_products.order_id
        JOIN users ON orders.u_id = users.id
        JOIN products ON products.id = order_products.product_id
        WHERE order_products.order_id = $1
      `,
      [id]
    );

    return this.populatedOrderProductsToPopulatedOrder(orderResult.rows)[0];
  }

  async showByUser(userId: UnconfirmedID): Promise<PopulatedOrder[]> {
    const { userId: uId } = await showByUserSchema.validate({ userId });
    const result = await query<PopulatedOrderProducts>(
      `
        SELECT *
        FROM order_products
        JOIN orders ON orders.id = order_products.order_id
        JOIN users ON orders.u_id = users.id
        JOIN products ON products.id = order_products.product_id
        WHERE orders.u_id = $1
      `,
      [uId]
    );
    return this.populatedOrderProductsToPopulatedOrder(result.rows);
  }

  async showCompleteByUser(userId: UnconfirmedID): Promise<PopulatedOrder[]> {
    const { userId: uId } = await showByUserSchema.validate({ userId });
    const result = await query<PopulatedOrderProducts>(
      `
        SELECT *
        FROM order_products
        JOIN orders ON orders.id = order_products.order_id
        JOIN users ON orders.u_id = users.id
        JOIN products ON products.id = order_products.product_id
        WHERE orders.u_id = $1 AND orders.state = 'complete'
      `,
      [uId]
    );
    return this.populatedOrderProductsToPopulatedOrder(result.rows);
  }

  async create(
    userId: UnconfirmedID,
    dto: DTO | CreateOrder
  ): Promise<PopulatedOrder> {
    const vUserId = await userIdForOrderSchema.validate(userId);
    const { products, state } = await createOrderSchema.validate(dto);

    const orderResult = await query<Order>(
      "INSERT INTO orders (u_id, state) VALUES ($1, $2) RETURNING *",
      [vUserId, state]
    );
    const { id: orderId } = orderResult.rows[0];

    await Promise.all(
      products.map(p =>
        query<OrderProducts>(
          "INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
          [orderId, p.id, p.quantity]
        )
      )
    );

    return this.show(orderId);
  }

  async delete(orderId: UnconfirmedID): Promise<DeleteResponse> {
    const { id } = await deleteOrderSchema.validate({ id: orderId });
    await query("DELETE FROM order_products WHERE order_id = $1", [id]);
    const result = await query("DELETE FROM orders WHERE id = $1", [id]);
    return { ok: result.rowCount === 1 };
  }

  private populatedOrderProductsToPopulatedOrder(
    pop: PopulatedOrderProducts[]
  ): PopulatedOrder[] {
    const orders: Map<number, PopulatedOrder> = new Map();

    pop.forEach(p => {
      const prevProducts = orders.get(p.order_id)?.products || [];
      orders.set(p.order_id, {
        id: p.order_id,
        state: p.state,
        u_id: p.u_id,
        u_firstname: p.firstname,
        u_lastname: p.lastname,
        u_username: p.username,
        products: [
          ...prevProducts,
          {
            id: p.product_id,
            name: p.name,
            price: p.price,
            category: p.category,
            quantity: p.quantity,
          },
        ],
      });
    });
    return [...orders.values()];
  }
}
