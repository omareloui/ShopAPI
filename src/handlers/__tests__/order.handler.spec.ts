import supertest from "supertest";

import { UserModel, ProductModel, AuthModel } from "../../models";
import { app } from "../../server";
import { query } from "../../utils";
import {
  CreateOrder,
  Order,
  OrderState,
  PopulatedOrder,
  Product,
  UpdateOrder,
  User,
} from "../../@types";

import { generate } from "../../__tests__/utils";

const userModel = new UserModel();
const productModel = new ProductModel();

const authModel = new AuthModel();
const request = supertest(app);

describe("Order Handler", () => {
  let user: User;
  let product: Product;

  const generateOrder = (): CreateOrder => generate.order(user.id, product.id);

  function clearDB() {
    return Promise.all(
      [
        "DELETE FROM orders *",
        "DELETE FROM products *",
        "DELETE FROM users *",
      ].map(q => query(q))
    );
  }

  afterAll(clearDB);

  describe("Existing end-points", () => {
    let token: string;

    beforeAll(async () => {
      user = await userModel.create(generate.user());
      product = await productModel.create(generate.product());

      const auth = await authModel.signup(generate.signup());
      token = `Bearer ${auth.token.body}`;
    });

    afterAll(clearDB);

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

    it("should have GET /orders/mine", async () => {
      const res = await request
        .get(`/orders/mine`)
        .set({ Authorization: token });
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have GET /orders/mine/complete", async () => {
      const res = await request
        .get(`/orders/mine/complete`)
        .set({ Authorization: token });
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

  describe("Require authentication", () => {
    it("should GET /orders/mine require to be authenticated", async () => {
      const res = await request.get("/orders/mine");
      expect(res.error).toBeTruthy();
      expect(res.error && res.error.text).toMatch("You have to signin");
      expect(res.statusCode).toEqual(401);
    });

    it("should GET /orders/mine/complete require to be authenticated", async () => {
      const res = await request.get("/orders/mine/complete");
      expect(res.error).toBeTruthy();
      expect(res.error && res.error.text).toMatch("You have to signin");
      expect(res.statusCode).toEqual(401);
    });
  });

  describe("Basic functionality", () => {
    beforeAll(async () => {
      user = await userModel.create(generate.user());
      product = await productModel.create(generate.product());
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

    it("should get current user's orders on GET /orders/mine", async () => {
      const auth = await authModel.signup(generate.user());

      const { body: order1 } = await request
        .post("/orders")
        .send(generate.order(auth.user.id, product.id));
      const { body: order2 } = await request
        .post("/orders")
        .send(generate.order(auth.user.id, product.id));
      const { body: order3 } = await request
        .post("/orders")
        .send(generate.order(auth.user.id, product.id));
      const { body: order4 } = await request
        .post("/orders")
        .send(generate.order(auth.user.id, product.id));

      const res = await request
        .get(`/orders/mine`)
        .set({ Authorization: `Bearer ${auth.token.body}` });
      const orders = res.body as PopulatedOrder[];

      expect(orders.length).toEqual(4);
      const sortOrders = (a: PopulatedOrder, b: PopulatedOrder) => a.id - b.id;
      expect(orders.sort(sortOrders)).toEqual(
        [order1, order2, order3, order4].sort(sortOrders)
      );
    });

    it("should get current user's completed orders on GET /orders/mine/complete", async () => {
      const auth = await authModel.signup(generate.user());

      const { body: order1 } = await request.post("/orders").send(
        generate.order(auth.user.id, product.id, {
          state: OrderState.COMPLETE,
        })
      );
      await request.post("/orders").send(
        generate.order(auth.user.id, product.id, {
          state: OrderState.ACTIVE,
        })
      );
      const { body: order3 } = await request.post("/orders").send(
        generate.order(auth.user.id, product.id, {
          state: OrderState.COMPLETE,
        })
      );
      await request.post("/orders").send(
        generate.order(auth.user.id, product.id, {
          state: OrderState.ACTIVE,
        })
      );

      const res = await request
        .get(`/orders/mine/complete`)
        .set({ Authorization: `Bearer ${auth.token.body}` });
      const orders = res.body as PopulatedOrder[];

      const sortOrders = (a: PopulatedOrder, b: PopulatedOrder) => a.id - b.id;

      expect(orders.length).toEqual(2);
      expect(orders.sort(sortOrders)).toEqual(
        [order1, order3].sort(sortOrders)
      );
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
