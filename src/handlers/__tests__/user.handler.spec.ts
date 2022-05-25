import supertest from "supertest";
import { UpdateUser, User } from "../../@types";
import { app } from "../../server";
import { query } from "../../utils";

import { generate } from "../../__tests__/utils";

const request = supertest(app);

describe("User Handler", () => {
  describe("Existing end-points", () => {
    afterAll(async () => {
      await query("DELETE FROM users *");
    });

    it("should have GET /users", async () => {
      const res = await request.get("/users");
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have POST /users", async () => {
      const res = await request.post("/users").send(generate.user());
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have GET /users/:id", async () => {
      const createRes = await request.post("/users").send(generate.user());
      const { id } = createRes.body as User;
      const res = await request.get(`/users/${id}`);
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have DELETE /users/:id", async () => {
      const createRes = await request.post("/users").send(generate.user());
      const { id } = createRes.body as User;
      const res = await request.delete(`/users/${id}`);
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have PUT /users/:id", async () => {
      const createRes = await request.post("/users").send(generate.user());
      const { id } = createRes.body as User;
      const res = await request.put(`/users/${id}`);
      expect(res.statusCode).not.toEqual(404);
    });
  });

  describe("Basic functionality", () => {
    afterAll(async () => {
      await query("DELETE FROM users *");
    });

    it("should get the users on GET /users", async () => {
      const res = await request.get("/users");
      expect(res.body).toEqual([]);
    });

    it("should create a user on POST /users", async () => {
      const user = generate.user();
      const res = await request.post("/users").send(user);
      const resUser = res.body as User;
      expect(resUser.firstname).toEqual(user.firstname);
      expect(resUser.lastname).toEqual(user.lastname);
    });

    it("should get the user on GET /users/:id", async () => {
      const user = generate.user();
      const { body: createdUser } = await request.post("/users").send(user);
      const { body: resUser } = await request.get(`/users/${createdUser.id}`);
      expect(resUser.firstname).toEqual(user.firstname);
      expect(resUser.lastname).toEqual(user.lastname);
    });

    it("should update the user on PUT /users/:id", async () => {
      const user = generate.user();
      const { body: createdUser } = await request.post("/users").send(user);
      const { body: resUser } = await request
        .put(`/users/${createdUser.id}`)
        .send({ firstname: "new name" } as UpdateUser);
      expect(resUser.firstname).toEqual("new name");
    });

    it("should delete the user on DELETE /users/:id", async () => {
      const user = generate.user();
      const { body: createdUser } = await request.post("/users").send(user);
      const { body } = await request.delete(`/users/${createdUser.id}`);
      expect(body.ok).toBeTrue();
    });
  });
});
