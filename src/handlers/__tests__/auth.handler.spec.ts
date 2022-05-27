import supertest from "supertest";
import { Auth } from "../../@types";
import { app } from "../../server";
import { query } from "../../utils";

import { generate } from "../../__tests__/utils";

const request = supertest(app);

describe("Auth Handler", () => {
  describe("Existing end-points", () => {
    it("should have POST /auth/signup", async () => {
      const res = await request.post("/auth/signup");
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have POST /auth/signin", async () => {
      const res = await request.post("/auth/signin");
      expect(res.statusCode).not.toEqual(404);
    });
  });

  describe("Basic functionality", () => {
    afterAll(async () => {
      await query("DELETE FROM users *");
    });

    it("should get the signup the user on POST /auth/signup", async () => {
      const res = await request.post("/auth/signup").send(generate.user());
      const auth = res.body as Auth;
      expect(auth).toBeDefined();
      expect(auth.token).toBeDefined();
      expect(auth.user).toBeDefined();
    });

    it("should get the signin the user on POST /auth/signin", async () => {
      const username = "u_name";
      const password = "pass1234";

      await request
        .post("/auth/signup")
        .send(generate.user({ username, password }));

      const res = await request
        .post("/auth/signin")
        .send({ username, password });
      const auth = res.body as Auth;

      expect(auth).toBeDefined();
      expect(auth.token).toBeDefined();
      expect(auth.user).toBeDefined();
    });
  });
});
