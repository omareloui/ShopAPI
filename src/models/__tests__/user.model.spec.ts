import { faker } from "@faker-js/faker";

import { UserModel } from "..";
import { getError, query } from "../../utils";

import type { User, CreateUser } from "../../@types";

const userModel = new UserModel();

const BCRYPT_PASS_REGEX = /^\$2b\$.{56}$/i;

describe("User Model", () => {
  afterAll(async () => {
    await query("DELETE FROM users *");
  });

  describe("Read all", () => {
    it("should have an index method", () => {
      expect(userModel.index).toBeDefined();
    });

    it("should get users", async () => {
      const users = await userModel.index();
      expect(users).toEqual([]);
    });
  });

  describe("Create", () => {
    it("should have a create method", () => {
      expect(userModel.create).toBeDefined();
    });

    it("should create a user successfully on providing all valid data", async () => {
      const user: CreateUser = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        password: faker.random.words(3),
      };
      const createUser = await userModel.create(user);

      expect(createUser).toBeTruthy();
    });

    it("should get the user after creating it", async () => {
      const user: CreateUser = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        password: faker.random.words(3),
      };
      const createdUser = await userModel.create(user);
      expect(createdUser).toEqual({
        id: createdUser.id,
        ...user,
        password: createdUser.password,
      });
    });

    it("should make sure the password is at least 8 characters", async () => {
      const user: CreateUser = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        password: "123",
      };
      const message = await getError(() => userModel.create(user));
      expect(message).toMatch("less than 8 characters");
    });

    it("should make sure the first and last names is at least 3 characters", async () => {
      const user1: CreateUser = {
        firstname: faker.name.firstName(),
        lastname: "h",
        password: faker.random.words(3),
      };
      const message1 = await getError(() => userModel.create(user1));

      const user2: CreateUser = {
        firstname: "hi",
        lastname: faker.name.firstName(),
        password: faker.random.words(3),
      };
      const message2 = await getError(() => userModel.create(user2));

      expect(message1).toMatch(/names can't be/i);
      expect(message2).toMatch(/names can't be/i);
    });

    it("should hash the password", async () => {
      const user: CreateUser = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        password: faker.random.words(3),
      };
      const createdUser = await userModel.create(user);
      expect(createdUser.password).toMatch(BCRYPT_PASS_REGEX);
    });
  });

  describe("Read one", () => {
    let user: User;
    beforeAll(async () => {
      user = await userModel.create({
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        password: faker.random.words(3),
      });
    });

    it("should have a show method", () => {
      expect(userModel.show).toBeDefined();
    });

    it("should get the created user", async () => {
      const userFromModel = await userModel.show(user.id);
      expect(userFromModel).toEqual(user);
    });

    it("should throw an error on not providing an id", async () => {
      const msg1 = await getError(() => userModel.show(""));
      const msg2 = await getError(() => userModel.show("some_test"));
      expect(msg1).toEqual("You have to provide a valid user id.");
      expect(msg2).toEqual("You have to provide a valid user id.");
    });
  });

  describe("Update", () => {
    let user: User;

    beforeAll(async () => {
      user = await userModel.create({
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        password: faker.random.words(3),
      });
    });

    it("should have an update method", () => {
      expect(userModel.update).toBeDefined();
    });

    it("should update the firstname field to 'new'", async () => {
      const result = await userModel.update(user.id, { firstname: "new" });
      expect(result.firstname).toBe("new");
    });

    it("should get the user after updating it", async () => {
      const result = await userModel.update(user.id, { firstname: "new_2" });
      expect(result.id).toBeDefined();
      expect(result.firstname).toBeDefined();
      expect(result.lastname).toBeDefined();
    });

    it("should update the firstname and lastname fields to 'new_firstname' and 'new_lastname'", async () => {
      const result = await userModel.update(user.id, {
        firstname: "new_firstname",
        lastname: "new_lastname",
      });
      expect(result.firstname).toBe("new_firstname");
      expect(result.lastname).toBe("new_lastname");
    });

    it("should hash the password if it was included", async () => {
      const result = await userModel.update(user.id, {
        password: "this_is_a_password",
      });
      expect(result.password).toMatch(BCRYPT_PASS_REGEX);
    });

    it("should not use any extra invalid provided data", async () => {
      const result = await userModel.update(user.id, {
        firstname: "new firstname",
        invalidField: false,
      });
      expect(
        (result as User & { invalidField: boolean }).invalidField
      ).not.toBeDefined();
    });

    it("should throw error on invalid id", async () => {
      const msg1 = await getError(() => userModel.show(""));
      const msg2 = await getError(() => userModel.show("some_test"));
      expect(msg1).toEqual("You have to provide a valid user id.");
      expect(msg2).toEqual("You have to provide a valid user id.");
    });

    it("should throw error on providing invalid values", async () => {
      const msg1 = await getError(() =>
        userModel.update(user.id, { firstname: "hi" })
      );
      const msg2 = await getError(() =>
        userModel.update(user.id, { password: "" })
      );

      expect(msg1).toMatch("Names can't be less than 3 characters.");
      expect(msg2).toMatch("Password can't be less than 8 characters.");
    });
  });

  describe("Delete", () => {
    let user: User;

    beforeEach(async () => {
      user = await userModel.create({
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        password: faker.random.words(3),
      });
    });

    afterEach(async () => {
      await userModel.delete(user.id);
    });

    it("should have a delete method", () => {
      expect(userModel.delete).toBeDefined();
    });

    it("should delete the created user", async () => {
      const result = await userModel.delete(user.id);
      expect(result).toEqual({ ok: true });
    });

    it("should throw an error on not providing an id", async () => {
      const msg1 = await getError(() => userModel.show(""));
      const msg2 = await getError(() => userModel.show("some_test"));
      expect(msg1).toEqual("You have to provide a valid user id.");
      expect(msg2).toEqual("You have to provide a valid user id.");
    });
  });
});
