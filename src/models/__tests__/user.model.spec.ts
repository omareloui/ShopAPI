import { faker } from "@faker-js/faker";

import { UserModel } from "..";
import { getError, query } from "../../utils";

import type { User, CreateUser } from "../../@types";

const userModel = new UserModel();

const BCRYPT_PASS_REGEX = /^\$2b\$.{56}$/i;

describe("User Model", () => {
  const generateRandomUser = () => ({
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    password: faker.random.words(3),
  });

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
      const user: CreateUser = generateRandomUser();
      const createUser = await userModel.create(user);
      expect(createUser).toBeTruthy();
    });

    it("should get the user after creating it", async () => {
      const user: CreateUser = generateRandomUser();
      const createdUser = await userModel.create(user);
      expect(createdUser).toEqual({
        id: createdUser.id,
        ...user,
        password: createdUser.password,
      });
    });

    it("should make sure the password is at least 8 characters", async () => {
      const user: CreateUser = { ...generateRandomUser(), password: "123" };
      const message = await getError(() => userModel.create(user));
      expect(message).toMatch("least 8 characters");
    });

    it("should make sure the first and last names is at least 3 characters", async () => {
      const user1: CreateUser = { ...generateRandomUser(), lastname: "h" };
      const msg1 = await getError(() => userModel.create(user1));

      const user2: CreateUser = { ...generateRandomUser(), firstname: "hi" };
      const msg2 = await getError(() => userModel.create(user2));

      [msg1, msg2].forEach(m => expect(m).toMatch("least 3 characters"));
    });

    it("should hash the password", async () => {
      const user: CreateUser = generateRandomUser();
      const createdUser = await userModel.create(user);
      expect(createdUser.password).toMatch(BCRYPT_PASS_REGEX);
    });
  });

  describe("Read one", () => {
    let user: User;
    beforeAll(async () => {
      user = await userModel.create(generateRandomUser());
    });

    it("should have a show method", () => {
      expect(userModel.show).toBeDefined();
    });

    it("should get the created user", async () => {
      const userFromModel = await userModel.show(user.id);
      expect(userFromModel).toEqual(user);
    });

    it("should throw an error on not providing an id", async () => {
      const msg1 = await getError(() =>
        userModel.show("" as unknown as number)
      );
      const msg2 = await getError(() =>
        userModel.show("some_test" as unknown as number)
      );

      [msg1, msg2].forEach(m => expect(m).toMatch("id must be a `number`"));
    });
  });

  describe("Update", () => {
    let user: User;

    beforeEach(async () => {
      user = await userModel.create(generateRandomUser());
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

    it("should update only the provided fields", async () => {
      const result = await userModel.update(user.id, { firstname: "new_name" });
      expect(result.firstname).toEqual("new_name");
      expect(result.lastname).toEqual(user.lastname);
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
      const msg1 = await getError(() =>
        userModel.show("" as unknown as number)
      );
      const msg2 = await getError(() =>
        userModel.show("some_test" as unknown as number)
      );
      [msg1, msg2].forEach(m => expect(m).toMatch("id must be a `number`"));
    });

    it("should throw error on providing invalid values", async () => {
      const msg1 = await getError(() =>
        userModel.update(user.id, { firstname: "hi" })
      );
      const msg2 = await getError(() =>
        userModel.update(user.id, { password: "" })
      );

      [msg1, msg2].forEach(m =>
        expect(m).toMatch(/must be at least \d characters/)
      );
    });
  });

  describe("Delete", () => {
    let user: User;

    beforeEach(async () => {
      user = await userModel.create(generateRandomUser());
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
      const msg1 = await getError(() =>
        userModel.show("" as unknown as number)
      );
      const msg2 = await getError(() =>
        userModel.show("some_test" as unknown as number)
      );
      [msg1, msg2].forEach(m => expect(m).toMatch("id must be a `number`"));
    });
  });
});
