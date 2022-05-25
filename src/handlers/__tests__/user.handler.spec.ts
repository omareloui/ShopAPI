import supertest from "supertest";
import { UpdateUser, User } from "../../@types";
import { AuthModel } from "../../models";
import { app } from "../../server";
import { query } from "../../utils";

import { generate } from "../../__tests__/utils";

const authModel = new AuthModel();
const request = supertest(app);

describe("User Handler", () => {
  describe("Existing end-points", () => {
    let token: string;

    beforeAll(async () => {
      const auth = await authModel.signup(generate.signup());
      token = `Bearer ${auth.token.body}`;
    });

    afterAll(async () => {
      await query("DELETE FROM users *");
    });

    it("should have GET /users", async () => {
      const res = await request.get("/users").set({ Authorization: token });
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have POST /users", async () => {
      const res = await request
        .post("/users")
        .set({ Authorization: token })
        .send(generate.user());
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have GET /users/:id", async () => {
      const createRes = await request
        .post("/users")
        .set({ Authorization: token })
        .send(generate.user());
      const { id } = createRes.body as User;
      const res = await request
        .get(`/users/${id}`)
        .set({ Authorization: token });
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have DELETE /users/:id", async () => {
      const createRes = await request
        .post("/users")
        .set({ Authorization: token })
        .send(generate.user());
      const { id } = createRes.body as User;
      const res = await request
        .delete(`/users/${id}`)
        .set({ Authorization: token });
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have PUT /users/:id", async () => {
      const createRes = await request
        .post("/users")
        .set({ Authorization: token })
        .send(generate.user());
      const { id } = createRes.body as User;
      const res = await request.put(`/users/${id}`);
      expect(res.statusCode).not.toEqual(404);
    });
  });

  describe("Require authentication", () => {
    let token: string;

    afterAll(async () => query("DELETE FROM users *"));

    beforeAll(async () => {
      const auth = await authModel.signup(generate.signup());
      token = `Bearer ${auth.token.body}`;
    });

    it("should GET /users require to be authenticated", async () => {
      const res = await request.get("/users");
      expect(res.error).toBeTruthy();
      expect(res.error && res.error.text).toMatch("You have to signin");
      expect(res.statusCode).toEqual(401);
    });

    it("should POST /users require to be authenticated", async () => {
      const res = await request.post("/users");
      expect(res.error).toBeTruthy();
      expect(res.error && res.error.text).toMatch("You have to signin");
      expect(res.statusCode).toEqual(401);
    });

    it("should GET /users/:id require to be authenticated", async () => {
      const createRes = await request
        .post("/users")
        .set({ Authorization: token })
        .send(generate.user());
      const { id } = createRes.body as User;
      const res = await request.get(`/users/${id}`);
      expect(res.error).toBeTruthy();
      expect(res.error && res.error.text).toMatch("You have to signin");
      expect(res.statusCode).toEqual(401);
    });

    it("should DELETE /users/:id require to be authenticated", async () => {
      const createRes = await request
        .post("/users")
        .set({ Authorization: token })
        .send(generate.user());
      const { id } = createRes.body as User;
      const res = await request.delete(`/users/${id}`);
      expect(res.error).toBeTruthy();
      expect(res.error && res.error.text).toMatch("You have to signin");
      expect(res.statusCode).toEqual(401);
    });

    it("should PUT /users/:id require to be authenticated", async () => {
      const createRes = await request
        .post("/users")
        .set({ Authorization: token })
        .send(generate.user());
      const { id } = createRes.body as User;
      const res = await request.put(`/users/${id}`);
      expect(res.error).toBeTruthy();
      expect(res.error && res.error.text).toMatch("You have to signin");
      expect(res.statusCode).toEqual(401);
    });
  });

  describe("Basic functionality", () => {
    let token: string;

    beforeAll(async () => {
      const auth = await authModel.signup(generate.signup());
      token = `Bearer ${auth.token.body}`;
    });

    afterAll(async () => {
      await query("DELETE FROM users *");
    });

    it("should get the users on GET /users", async () => {
      const res = await request.get("/users").set({ Authorization: token });
      expect(Array.isArray(res.body)).toBeTrue();
      expect(res.body.length).toEqual(1);
    });

    it("should create a user on POST /users", async () => {
      const user = generate.user();
      const res = await request
        .post("/users")
        .send(user)
        .set({ Authorization: token });
      const resUser = res.body as User;
      expect(resUser.firstname).toEqual(user.firstname);
      expect(resUser.lastname).toEqual(user.lastname);
    });

    it("should get the user on GET /users/:id", async () => {
      const user = generate.user();
      const { body: createdUser } = await request
        .post("/users")
        .set({ Authorization: token })
        .send(user);
      const { body: resUser } = await request
        .get(`/users/${createdUser.id}`)
        .set({ Authorization: token });
      expect(resUser.firstname).toEqual(user.firstname);
      expect(resUser.lastname).toEqual(user.lastname);
    });

    it("should update the user on PUT /users/:id", async () => {
      const user = generate.user();
      const { body: createdUser } = await request
        .post("/users")
        .set({ Authorization: token })
        .send(user);
      const { body: resUser } = await request
        .put(`/users/${createdUser.id}`)
        .set({ Authorization: token })
        .send({ firstname: "new name" } as UpdateUser);
      expect(resUser.firstname).toEqual("new name");
    });

    it("should delete the user on DELETE /users/:id", async () => {
      const user = generate.user();
      const { body: createdUser } = await request
        .post("/users")
        .set({ Authorization: token })
        .send(user);
      const { body } = await request
        .delete(`/users/${createdUser.id}`)
        .set({ Authorization: token });
      expect(body.ok).toBeTrue();
    });
  });
});
