import { faker } from "@faker-js/faker";

import { UserModel, CreateUser } from "..";
import { getError } from "../../utils";

const userModel = new UserModel();

describe("User Model", () => {
  describe("Has all required methods", () => {
    it("should have an index method", () => {
      expect(userModel.index).toBeDefined();
    });

    it("should have an show method", () => {
      expect(userModel.show).toBeDefined();
    });

    it("should have an create method", () => {
      expect(userModel.create).toBeDefined();
    });

    it("should have an update method", () => {
      expect(userModel.update).toBeDefined();
    });

    it("should have an delete method", () => {
      expect(userModel.delete).toBeDefined();
    });
  });

  describe("Create", () => {
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

      expect(message1).toMatch(/last name/i);
      expect(message2).toMatch(/first name/i);
    });

    it("should hash the password", async () => {
      const user: CreateUser = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        password: faker.random.words(3),
      };
      const createdUser = await userModel.create(user);
      expect(createdUser.password).toMatch(/^\$2b\$.{56}$/);
    });
  });

  // describe("Read", () => {});

  // describe("Update", () => {});

  // describe("Delete", () => {});
});
