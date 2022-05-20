import bcrypt from "bcrypt";

import { buildUpdateQuery, query } from "../utils";

import type {
  DTO,
  User,
  CreateUser,
  UpdateUser,
  DeleteResponse,
} from "../@types";

export class UserModel {
  async index(): Promise<User[]> {
    const result = await query("SELECT * FROM USERS");
    const users = result.rows;
    return users;
  }

  async show(userId: string | number | undefined): Promise<User> {
    this.validateId(userId);
    const result = await query("SELECT * FROM users WHERE id = $1", [userId]);
    const user = result.rows[0];
    return user;
  }

  async create(dto: CreateUser | DTO): Promise<User> {
    this.removeExtraProps(dto);
    this.validateCreationSchema(dto);
    this.validateCreationValues(dto);

    dto.password = await this.hashPassword(dto.password);

    const result = await query(
      "INSERT INTO users (firstName, lastName, password) VALUES ($1, $2, $3) RETURNING *",
      [dto.firstname, dto.lastname, dto.password]
    );

    const user = result.rows[0] as User;

    return user;
  }

  async update(
    userId: string | number | undefined,
    dto: UpdateUser | DTO
  ): Promise<User> {
    this.validateId(userId);
    this.removeExtraProps(dto);

    this.validateUpdateValues(dto);

    if ("password" in dto)
      dto.password = await this.hashPassword(dto.password as string);

    const { query: q, fields } = buildUpdateQuery(dto, userId);

    const result = await query(q, fields);
    const user = result.rows[0];

    return user;
  }

  async delete(userId: string | number | undefined): Promise<DeleteResponse> {
    this.validateId(userId);
    const result = await query("DELETE FROM users WHERE id = $1", [userId]);
    return { ok: result.rowCount === 1 };
  }

  private hashPassword(plainPassword: string) {
    return bcrypt.hash(
      `${plainPassword}.${process.env.PASSWORD_PEPPER}`,
      parseInt(process.env.SALT_ROUNDS || "14", 10)
    );
  }

  private removeExtraProps(dto: DTO) {
    Object.keys(dto).forEach(k => {
      const validKeys = [
        "firstname",
        "lastname",
        "password",
      ] as (keyof CreateUser)[];
      if (!validKeys.includes(k as unknown as keyof CreateUser)) delete dto[k];
    });
  }

  private validateCreationSchema(dto: DTO): asserts dto is CreateUser {
    (["firstname", "lastname", "password"] as (keyof CreateUser)[]).forEach(
      k => {
        if (!(k in dto))
          throw new Error(`${k} has to provided to create a user.`);
      }
    );
  }

  private validateCreationValues({
    firstname,
    lastname,
    password,
  }: CreateUser) {
    this.validatePassword(password);
    [firstname, lastname].forEach(n => this.validateName(n));
  }

  private validateUpdateValues(dto: UpdateUser) {
    if ("password" in dto) this.validatePassword(dto.password!);
    if ("firstname" in dto) this.validateName(dto.firstname!);
    if ("lastname" in dto) this.validateName(dto.lastname!);
  }

  private validatePassword(value: string) {
    if (value.length < 8)
      throw new Error("Password can't be less than 8 characters.");
  }

  private validateName(value: string) {
    if (value.length < 3)
      throw new Error("Names can't be less than 3 characters.");
  }

  private validateId(
    userId: string | number | undefined
  ): asserts userId is string | number {
    const throwError: () => never = () => {
      throw new Error("You have to provide a valid user id.");
    };
    if (!userId) throwError();
    const parsedId = parseInt(userId.toString(), 10);
    if (!parsedId) throwError();
  }
}
