import supertest from "supertest";

import { ProductModel, AuthModel } from "../../models";
import { app } from "../../server";
import {
  CreateOrder,
  Order,
  OrderState,
  PopulatedOrder,
  Product,
  Signup,
} from "../../@types";

import { clearDB, generate } from "../../__tests__/utils";

const productModel = new ProductModel();

const authModel = new AuthModel();
const request = supertest(app);

describe("Order Handler", () => {
  let products: Product[] = [];

  const generateOrder = (override: Partial<CreateOrder> = {}): CreateOrder =>
    generate.order(
      products.map(p => p.id),
      override
    );
  const getToken = async (signupOptions?: Signup) => {
    const auth = await authModel.signup(signupOptions || generate.signup());
    return `Bearer ${auth.token.body}`;
  };

  afterAll(clearDB);

  describe("Existing end-points", () => {
    let token: string;

    beforeAll(async () => {
      products.push(await productModel.create(generate.product()));
      products.push(await productModel.create(generate.product()));
      token = await getToken();
    });

    afterAll(async () => {
      await clearDB();
      products = [];
    });

    it("should have GET /orders", async () => {
      const res = await request.get("/orders");
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have POST /orders", async () => {
      const res = await request
        .post("/orders")
        .send(generateOrder())
        .set({ Authorization: token });
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
  });

  describe("Require authentication", () => {
    it("should POST /orders require to be authenticated", async () => {
      const res = await request.post("/orders");
      expect(res.error).toBeTruthy();
      expect(res.error && res.error.text).toMatch("You have to signin");
      expect(res.statusCode).toEqual(401);
    });

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
    let token: string;

    beforeAll(async () => {
      token = await getToken();
      products = [];
      products.push(await productModel.create(generate.product()));
      products.push(await productModel.create(generate.product()));
    });

    afterAll(clearDB);

    it("should get the orders on GET /orders", async () => {
      const res = await request.get("/orders");
      expect(res.body).toEqual([]);
    });

    it("should create a order on POST /orders", async () => {
      const signupOptions = generate.signup();
      const jwt = await getToken(signupOptions);
      const order = generateOrder({ products: [products[0]] });
      const res = await request
        .post("/orders")
        .set({ Authorization: jwt })
        .send(order);
      const resOrder = res.body as PopulatedOrder;
      expect(resOrder.products[0].id).toEqual(order.products[0].id);
      expect(resOrder.u_firstname).toEqual(signupOptions.firstname);
      expect(resOrder.state).toEqual(order.state);
    });

    it("should get the order on GET /orders/:id", async () => {
      const signupOptions = generate.signup();
      const jwt = await getToken(signupOptions);
      const order = generateOrder({ products: [products[0]] });
      const { body: createdOrder } = await request
        .post("/orders")
        .set({ Authorization: jwt })
        .send(order);
      const res = await request.get(`/orders/${createdOrder.id}`);
      const resOrder = res.body as PopulatedOrder;
      expect(resOrder.products[0].id).toEqual(order.products[0].id);
      expect(resOrder.u_firstname).toEqual(signupOptions.firstname);
      expect(resOrder.state).toEqual(order.state);
    });

    it("should get current user's orders on GET /orders/mine", async () => {
      const { body: order1 } = await request
        .post("/orders")
        .set({ Authorization: token })
        .send(generateOrder());
      const { body: order2 } = await request
        .post("/orders")
        .set({ Authorization: token })
        .send(generateOrder());
      const { body: order3 } = await request
        .post("/orders")
        .set({ Authorization: token })
        .send(generateOrder());
      const { body: order4 } = await request
        .post("/orders")
        .set({ Authorization: token })
        .send(generateOrder());
      const res = await request
        .get("/orders/mine")
        .set({ Authorization: token });
      const orders = res.body as PopulatedOrder[];
      expect(orders.length).toEqual(4);
      const sortOrders = (a: PopulatedOrder, b: PopulatedOrder) => a.id - b.id;
      expect(orders.sort(sortOrders)).toEqual(
        [order1, order2, order3, order4].sort(sortOrders)
      );
    });

    it("should get current user's completed orders on GET /orders/mine/complete", async () => {
      const { body: order1 } = await request
        .post("/orders")
        .set({ Authorization: token })
        .send(generateOrder({ state: OrderState.COMPLETE }));
      await request
        .post("/orders")
        .set({ Authorization: token })
        .send(generateOrder({ state: OrderState.ACTIVE }));
      const { body: order3 } = await request
        .post("/orders")
        .set({ Authorization: token })
        .send(generateOrder({ state: OrderState.COMPLETE }));
      await request
        .post("/orders")
        .set({ Authorization: token })
        .send(generateOrder({ state: OrderState.ACTIVE }));
      const res = await request
        .get(`/orders/mine/complete`)
        .set({ Authorization: token });
      const orders = res.body as PopulatedOrder[];
      const sortOrders = (a: PopulatedOrder, b: PopulatedOrder) => a.id - b.id;
      expect(orders.length).toEqual(2);
      expect(orders.sort(sortOrders)).toEqual(
        [order1, order3].sort(sortOrders)
      );
    });

    it("should delete the order on DELETE /orders/:id", async () => {
      const order = generateOrder();
      const createdOrderRes = await request
        .post("/orders")
        .set({ Authorization: token })
        .send(order);
      const createdOrder = createdOrderRes.body as PopulatedOrder;
      const { body } = await request.delete(`/orders/${createdOrder.id}`);
      expect(body.ok).toBeTrue();
    });
  });
});
