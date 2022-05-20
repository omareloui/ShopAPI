import bcrypt from "bcrypt";

import { buildUpdateQuery, log, query } from "../utils";

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
    const result = await query("SELECT * FROM USERS");
    return result.rows;
  }

  async show(userId: UnconfirmedID): Promise<User> {
    const { id } = await showUserSchema.validate({ id: userId });
    const result = await query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
  }

  async create(dto: CreateUser | DTO): Promise<User> {
    const { firstname, lastname, password } = await createUserSchema.validate(
      dto
    );
    const hashedPassword = await this.hashPassword(password);

    const result = await query(
      "INSERT INTO users (firstName, lastName, password) VALUES ($1, $2, $3) RETURNING *",
      [firstname, lastname, hashedPassword]
    );

    return result.rows[0];
  }

  async update(userId: UnconfirmedID, dto: UpdateUser | DTO): Promise<User> {
    const vData = await updateUserSchema.validate({ ...dto, id: userId });

    delete (vData as { id?: number }).id;

    if (vData.password)
      vData.password = await this.hashPassword(vData.password);

    const { query: q, fields } = buildUpdateQuery("users", vData, userId!);

    const result = await query(q, fields);
    const user = result.rows[0];

    return user;
  }

  async delete(userId: UnconfirmedID): Promise<DeleteResponse> {
    const { id } = await deleteUserSchema.validate({ id: userId });
    const result = await query("DELETE FROM users WHERE id = $1", [id]);
    return { ok: result.rowCount === 1 };
  }

  private hashPassword(plainPassword: string) {
    return bcrypt.hash(
      `${plainPassword}.${process.env.PASSWORD_PEPPER}`,
      parseInt(process.env.SALT_ROUNDS || "14", 10)
    );
  }
}
