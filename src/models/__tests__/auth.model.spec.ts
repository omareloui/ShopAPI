import { UserModel, AuthModel } from "..";
import { JWTHelper } from "../../lib";

import { getError, query, sleep } from "../../utils";
import { generate } from "../../__tests__/utils";

const userModel = new UserModel();
const authModel = new AuthModel();

describe("Auth Model", () => {
  afterAll(async () => {
    await query("DELETE FROM users *");
  });

  describe("Signup", () => {
    it("should have a signup method", () => {
      expect(authModel.signup).toBeDefined();
    });

    it("should get the user and token on providing valid information", async () => {
      const auth = await authModel.signup(generate.signup());
      expect(auth.token).toBeDefined();
      expect(auth.token.body).toBeDefined();
      expect(auth.token.expiresIn).toBeDefined();
      expect(auth.user).toBeDefined();
      expect(auth.user.username).toBeDefined();
    });
  });

  describe("Signin", () => {
    it("should have a signin method", () => {
      expect(authModel.signin).toBeDefined();
    });

    it("should signin and get the user and token on providing the required data", async () => {
      const user = await generate.user();
      await authModel.signup(user);
      const auth = await authModel.signin(user);
      expect(auth.token).toBeDefined();
      expect(auth.token.body).toBeDefined();
      expect(auth.token.expiresIn).toBeDefined();
      expect(auth.user).toBeDefined();
      expect(auth.user.username).toBeDefined();
    });
  });

  describe("Get Me", () => {
    it("should have a getMe method", async () => {
      expect(authModel.getMe).toBeDefined();
    });

    it("should get me (the token user) after providing a the token", async () => {
      const user = generate.user();
      const auth = await authModel.signup(user);
      const tokenUser = await authModel.getMe(auth.token.body);
      expect(tokenUser.firstname).toEqual(user.firstname);
      expect(tokenUser.lastname).toEqual(user.lastname);
      expect(tokenUser.username).toEqual(user.username);
    });

    it("should throw an error on providing an expired token", async () => {
      const userData = generate.user();
      const user = await userModel.create(userData);
      const token = JWTHelper.create(user.id, "0");
      await sleep(100);
      const msg = await getError(() => authModel.getMe(token.body));
      expect(msg).toBeTruthy();
      expect(msg).toMatch("Invalid token");
    });
  });
});
