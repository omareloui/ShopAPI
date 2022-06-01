import { query, buildUpdateQuery } from "../utils";

import {
  showProductSchema,
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
  showProductByCategorySchema,
} from "../validations";

import type {
  CreateProduct,
  Product,
  DTO,
  UnconfirmedID,
  UpdateProduct,
  DeleteResponse,
  OrderProduct,
} from "../@types";

export class ProductModel {
  async index(): Promise<Product[]> {
    const result = await query<Product>("SELECT * FROM products");
    return result.rows;
  }

  async show(productId: UnconfirmedID): Promise<Product> {
    const { id } = await showProductSchema.validate({ id: productId });
    const result = await query<Product>(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }

  async showByCategory(category: string): Promise<Product[]> {
    const { category: cat } = await showProductByCategorySchema.validate({
      category,
    });
    const result = await query<Product>(
      "SELECT * FROM products WHERE category = $1",
      [cat]
    );
    return result.rows;
  }

  async showTopFive() {
    const { rows: products } = await query<OrderProduct>(
      `
        SELECT
          products.*,
          SUM(order_products.quantity)::INTEGER AS quantity
        FROM order_products
        JOIN products ON order_products.product_id = products.id
        GROUP BY products.id
        ORDER BY quantity DESC
        LIMIT 5
      `
    );
    return products;
  }

  async create(dto: CreateProduct | DTO): Promise<Product> {
    const vData = await createProductSchema.validate(dto);

    const result = await query<Product>(
      "INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *",
      [vData.name, vData.price, vData.category]
    );

    return result.rows[0];
  }

  async update(
    productId: UnconfirmedID,
    dto: UpdateProduct | DTO
  ): Promise<Product> {
    const vData = await updateProductSchema.validate({
      id: productId,
      ...dto,
    });

    delete (vData as { id?: number }).id;

    const { query: q, fields } = buildUpdateQuery(
      "products",
      vData,
      productId!
    );

    const result = await query<Product>(q, fields);
    const product = result.rows[0];

    return product;
  }

  async delete(productId: UnconfirmedID): Promise<DeleteResponse> {
    const { id } = await deleteProductSchema.validate({ id: productId });
    const result = await query("DELETE FROM products WHERE id = $1", [id]);
    return { ok: result.rowCount === 1 };
  }
}
