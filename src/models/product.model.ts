import { query, buildUpdateQuery } from "../utils";

import {
  showProductSchema,
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
} from "../validations";

import type {
  CreateProduct,
  Product,
  DTO,
  UnconfirmedID,
  UpdateProduct,
  DeleteResponse,
} from "../@types";

export class ProductModel {
  async index(): Promise<Product[]> {
    const result = await query("SELECT * FROM products");
    return result.rows;
  }

  async show(productId: UnconfirmedID): Promise<Product> {
    const { id } = await showProductSchema.validate({ id: productId });
    const result = await query("SELECT * FROM products WHERE id = $1", [id]);
    const product = result.rows[0];
    return product;
  }

  async create(dto: CreateProduct | DTO): Promise<Product> {
    const vData = await createProductSchema.validate(dto);

    const result = await query(
      "INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *",
      [vData.name, vData.price, vData.category]
    );

    return result.rows[0];
  }

  async update(
    productId: UnconfirmedID,
    dto: UpdateProduct | DTO
  ): Promise<Product> {
    const { id, name, category, price } = await updateProductSchema.validate({
      id: productId,
      ...dto,
    });

    const { query: q, fields } = buildUpdateQuery(
      "products",
      { name, category, price },
      id
    );

    const result = await query(q, fields);
    const product = result.rows[0];

    return product;
  }

  async delete(productId: UnconfirmedID): Promise<DeleteResponse> {
    const { id } = await deleteProductSchema.validate({ id: productId });
    const result = await query("DELETE FROM products WHERE id = $1", [id]);
    return { ok: result.rowCount === 1 };
  }
}