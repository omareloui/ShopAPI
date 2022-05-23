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
import { APIError } from "../lib";

export class ProductModel {
  async index(): Promise<Product[]> {
    try {
      const result = await query<Product>("SELECT * FROM products");
      return result.rows;
    } catch (e) {
      throw new APIError(e);
    }
  }

  async show(productId: UnconfirmedID): Promise<Product> {
    try {
      const { id } = await showProductSchema.validate({ id: productId });
      const result = await query<Product>(
        "SELECT * FROM products WHERE id = $1",
        [id]
      );
      return result.rows[0];
    } catch (e) {
      throw new APIError(e);
    }
  }

  async create(dto: CreateProduct | DTO): Promise<Product> {
    try {
      const vData = await createProductSchema.validate(dto);

      const result = await query<Product>(
        "INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *",
        [vData.name, vData.price, vData.category]
      );

      return result.rows[0];
    } catch (e) {
      throw new APIError(e);
    }
  }

  async update(
    productId: UnconfirmedID,
    dto: UpdateProduct | DTO
  ): Promise<Product> {
    try {
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
    } catch (e) {
      throw new APIError(e);
    }
  }

  async delete(productId: UnconfirmedID): Promise<DeleteResponse> {
    try {
      const { id } = await deleteProductSchema.validate({ id: productId });
      const result = await query("DELETE FROM products WHERE id = $1", [id]);
      return { ok: result.rowCount === 1 };
    } catch (e) {
      throw new APIError(e);
    }
  }
}
