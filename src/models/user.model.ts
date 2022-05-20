import bcrypt from "bcrypt";

import dbClient from "../database";
import { log } from "../utils";

type DTO = Record<string, unknown>;

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  password: string;
}

export type CreateUser = Omit<User, "id">;

export class UserModel {
  index() {}

  show() {}

  update() {}

  async create(dto: DTO | CreateUser): Promise<User> {
    try {
      log.trace("Connecting to the db");
      const conn = await dbClient.connect();

      log.trace("Removing extra props and validation");
      this.removeExtraProps(dto);
      this.validateCreationSchema(dto);
      this.validateCreationValues(dto);

      log.trace("Hashing the password");
      dto.password = await bcrypt.hash(
        `${dto.password}.${process.env.PASSWORD_PEPPER}`,
        parseInt(process.env.SALT_ROUNDS || "14", 10)
      );

      log.trace("Querying the db");
      const result = await conn.query(
        "INSERT INTO users (firstName, lastName, password) VALUES ($1, $2, $3) RETURNING *",
        [dto.firstname, dto.lastname, dto.password]
      );

      const user = result.rows[0] as User;
      log.trace({ user }, "Created user");

      conn.release();
      return user;
    } catch (err) {
      const e = err as Error;
      log.trace(e.message);
      throw new Error(e.message);
    }
  }

  delete() {}

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
    if (password.length < 8)
      throw new Error("Password can't be less than 8 characters.");
    if (firstname.length < 3)
      throw new Error("First name can't be less than 3 characters.");
    if (lastname.length < 3)
      throw new Error("Last name can't be less than 3 characters.");
  }
}
