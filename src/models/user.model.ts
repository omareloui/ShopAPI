import { buildUpdateQuery, query } from "../utils";
import { APIError, PasswordHelper } from "../lib";

import {
  showUserSchema,
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
  showUserWithUsernameSchema,
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
    const result = await query<User>("SELECT * FROM USERS");
    return result.rows;
  }

  async show(userId: UnconfirmedID): Promise<User> {
    const { id } = await showUserSchema.validate({ id: userId });
    const result = await query<User>("SELECT * FROM users WHERE id = $1", [id]);
    const user = result.rows[0];
    if (!user) throw new Error("Can't find the requested user.");
    return user;
  }

  async showWithUsername(username: string): Promise<User> {
    const { username: uname } = await showUserWithUsernameSchema.validate({
      username,
    });
    const result = await query<User>(
      "SELECT * FROM users WHERE LOWER(username) = LOWER($1)",
      [uname]
    );
    const user = result.rows[0];
    if (!user) throw new Error("Can't find the requested user.");

    return user;
  }

  async create(dto: CreateUser | DTO): Promise<User> {
    const { firstname, lastname, username, password } =
      await createUserSchema.validate(dto);

    await this.checkForDuplicate(username);

    const hashedPassword = await PasswordHelper.hashPassword(password);

    const result = await query<User>(
      "INSERT INTO users (firstname, lastname, username, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [firstname, lastname, username, hashedPassword]
    );

    return result.rows[0];
  }

  async update(userId: UnconfirmedID, dto: UpdateUser | DTO): Promise<User> {
    const vData = await updateUserSchema.validate({ ...dto, id: userId });

    delete (vData as { id?: number }).id;

    if (vData.username) await this.checkForDuplicate(vData.username);

    if (vData.password)
      vData.password = await PasswordHelper.hashPassword(vData.password);

    const { query: q, fields } = buildUpdateQuery("users", vData, userId!);

    const result = await query<User>(q, fields);
    const user = result.rows[0];

    return user;
  }

  async delete(userId: UnconfirmedID): Promise<DeleteResponse> {
    const { id } = await deleteUserSchema.validate({ id: userId });
    const result = await query<User>("DELETE FROM users WHERE id = $1", [id]);
    return { ok: result.rowCount === 1 };
  }

  private async checkForDuplicate(username: string) {
    const duplicatedUserResult = await query<User>(
      "SELECT id FROM users WHERE LOWER(username) = LOWER($1)",
      [username]
    );
    if (duplicatedUserResult.rows[0])
      throw new APIError("The username already in use. Try another one.", 409);
  }
}
