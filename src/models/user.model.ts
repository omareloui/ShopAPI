import bcrypt from "bcrypt";

import { buildUpdateQuery, query } from "../utils";
import { APIError } from "../lib";

import {
  showUserSchema,
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
} from "../validations";

import type {
  DTO,
  User,
  CreateUser,
  UpdateUser,
  DeleteResponse,
  UnconfirmedID,
} from "../@types";

export class UserModel {
  async index(): Promise<User[]> {
    try {
      const result = await query<User>("SELECT * FROM USERS");
      return result.rows;
    } catch (e) {
      throw new APIError(e);
    }
  }

  async show(userId: UnconfirmedID): Promise<User> {
    try {
      const { id } = await showUserSchema.validate({ id: userId });
      const result = await query<User>("SELECT * FROM users WHERE id = $1", [
        id,
      ]);
      const user = result.rows[0];
      if (!user) throw new Error("Can't find the requested user.");
      return user;
    } catch (e) {
      throw new APIError(e);
    }
  }

  async create(dto: CreateUser | DTO): Promise<User> {
    try {
      const { firstname, lastname, password } = await createUserSchema.validate(
        dto
      );
      const hashedPassword = await this.hashPassword(password);

      const result = await query<User>(
        "INSERT INTO users (firstName, lastName, password) VALUES ($1, $2, $3) RETURNING *",
        [firstname, lastname, hashedPassword]
      );

      return result.rows[0];
    } catch (e) {
      throw new APIError(e);
    }
  }

  async update(userId: UnconfirmedID, dto: UpdateUser | DTO): Promise<User> {
    try {
      const vData = await updateUserSchema.validate({ ...dto, id: userId });

      delete (vData as { id?: number }).id;

      if (vData.password)
        vData.password = await this.hashPassword(vData.password);

      const { query: q, fields } = buildUpdateQuery("users", vData, userId!);

      const result = await query<User>(q, fields);
      const user = result.rows[0];

      return user;
    } catch (e) {
      throw new APIError(e);
    }
  }

  async delete(userId: UnconfirmedID): Promise<DeleteResponse> {
    try {
      const { id } = await deleteUserSchema.validate({ id: userId });
      const result = await query<User>("DELETE FROM users WHERE id = $1", [id]);
      return { ok: result.rowCount === 1 };
    } catch (e) {
      throw new APIError(e);
    }
  }

  private hashPassword(plainPassword: string) {
    return bcrypt.hash(
      `${plainPassword}.${process.env.PASSWORD_PEPPER}`,
      parseInt(process.env.SALT_ROUNDS || "14", 10)
    );
  }
}
