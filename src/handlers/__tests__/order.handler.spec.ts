import supertest from "supertest";

import { UserModel, ProductModel } from "../../models";
import { app } from "../../server";
import { query } from "../../utils";
import {
  CreateOrder,
  Order,
  PopulatedOrder,
  Product,
  UpdateOrder,
  User,
} from "../../@types";

import { generate } from "../../__tests__/utils";

const userModel = new UserModel();
const productModel = new ProductModel();

const request = supertest(app);

describe("Order Handler", () => {
  let user: User;
  let product: Product;

  const generateOrder = (): CreateOrder => generate.order(user.id, product.id);

  beforeAll(async () => {
    user = await userModel.create(generate.user());
    product = await productModel.create(generate.product());
  });

  afterAll(async () => {
    await query("DELETE FROM orders *");
    await query("DELETE FROM products *");
    await query("DELETE FROM users *");
  });

  describe("Existing end-points", () => {
    it("should have GET /orders", async () => {
      const res = await request.get("/orders");
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have POST /orders", async () => {
      const res = await request.post("/orders").send(generateOrder());
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have GET /orders/:id", async () => {
      const createRes = await request.post("/orders").send(generateOrder());
      const { id } = createRes.body as Order;
      const res = await request.get(`/orders/${id}`);
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have DELETE /orders/:id", async () => {
      const createRes = await request.post("/orders").send(generateOrder());
      const { id } = createRes.body as Order;
      const res = await request.delete(`/orders/${id}`);
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have PUT /orders/:id", async () => {
      const createRes = await request.post("/orders").send(generateOrder());
      const { id } = createRes.body as Order;
      const res = await request.put(`/orders/${id}`);
      expect(res.statusCode).not.toEqual(404);
    });
  });

  describe("Basic functionality", () => {
    beforeAll(async () => {
      await query("DELETE FROM orders *");
    });

    it("should get the orders on GET /orders", async () => {
      const res = await request.get("/orders");
      expect(res.body).toEqual([]);
    });

    it("should create a order on POST /orders", async () => {
      const order = generateOrder();
      const res = await request.post("/orders").send(order);
      const resOrder = res.body as PopulatedOrder;
      expect(resOrder.product).toEqual(product.name);
      expect(resOrder.u_firstname).toEqual(user.firstname);
      expect(resOrder.quantity).toEqual(order.quantity);
      expect(resOrder.state).toEqual(order.state);
    });

    it("should get the order on GET /orders/:id", async () => {
      const order = generateOrder();
      const { body: createdOrder } = await request.post("/orders").send(order);
      const res = await request.get(`/orders/${createdOrder.id}`);
      const resOrder = res.body as PopulatedOrder;
      expect(resOrder.product).toEqual(product.name);
      expect(resOrder.u_firstname).toEqual(user.firstname);
      expect(resOrder.quantity).toEqual(order.quantity);
      expect(resOrder.state).toEqual(order.state);
    });

    it("should update the order on PUT /orders/:id", async () => {
      const order = generateOrder();
      const { body: createdOrder } = await request.post("/orders").send(order);
      const { body: resOrder } = await request
        .put(`/orders/${createdOrder.id}`)
        .send({ quantity: 899 } as UpdateOrder);
      expect(resOrder.quantity).toEqual(899);
    });

    it("should delete the order on DELETE /orders/:id", async () => {
      const order = generateOrder();
      const { body: createdOrder } = await request.post("/orders").send(order);
      const { body } = await request.delete(`/orders/${createdOrder.id}`);
      expect(body.ok).toBeTrue();
    });
  });
});
