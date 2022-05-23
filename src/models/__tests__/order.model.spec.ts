import { UserModel, ProductModel, OrderModel } from "..";

import { query, getError } from "../../utils";
import { generate } from "../../__tests__/utils";

import { CreateOrder, OrderState, PopulatedOrder, Product, User } from "../../@types";

const userModel = new UserModel();
const productModel = new ProductModel();
const orderModel = new OrderModel();

describe("Order Model", () => {
  let user: User;
  let product: Product;

  const generateOrder = (): CreateOrder => generate.order(user.id, product.id)

  beforeAll(async () => {
    user = await userModel.create(generate.user());
    product = await productModel.create(generate.product());
  });

  afterAll(async () => {
    await Promise.all(
      [
        "DELETE FROM orders *",
        "DELETE FROM products *",
        "DELETE FROM users *",
      ].map(q => query(q))
    );
  });

  describe("Read all", () => {
    it("should have an index method", () => {
      expect(orderModel.index).toBeDefined();
    });

    it("should get list of orders", async () => {
      const orders = await orderModel.index();
      expect(orders).toEqual([]);
    });

    it("should join the user and product tables", async () => {
      await orderModel.create(generateOrder());

      const orders = await orderModel.index();
      const o = orders[0];

      expect(o.id).toBeDefined();
      expect(o.product).toBeDefined();
      expect(o.product_category).toBeDefined();
      expect(o.product_price).toBeDefined();
      expect(o.quantity).toBeDefined();
      expect(o.state).toBeDefined();
      expect(o.u_firstname).toBeDefined();
      expect(o.u_lastname).toBeDefined();

      await query("DELETE FROM orders *");
    });
  });

  describe("Create", () => {
    it("should have a create method", () => {
      expect(orderModel.create).toBeDefined();
    });

    it("should create a order successfully on providing all valid data", async () => {
      const createOrder = await orderModel.create(generateOrder());
      expect(createOrder).toBeTruthy();
    });

    it("should get the order after creating it", async () => {
      const order = generateOrder();
      const createdOrder = await orderModel.create(order);
      expect(createdOrder).toEqual({
        id: createdOrder.id,
        product: product.name,
        product_category: product.category,
        product_price: product.price,
        quantity: order.quantity,
        state: order.state,
        u_firstname: user.firstname,
        u_lastname: user.lastname,
      });
    });

    it("should make sure the product and user ids are valid", async () => {
      const msg1 = await getError(() =>
        orderModel.create({ ...generateOrder(), product_id: "some_id" })
      );

      const msg2 = await getError(() =>
        orderModel.create({ ...generateOrder(), u_id: "" })
      );

      [msg1, msg2].forEach(m => expect(m).toMatch("must be a `number` type"));
    });

    it("should default to 1 quantity if not provided", async () => {
      const result = await orderModel.create({
        ...generateOrder(),
        quantity: undefined,
      });
      expect(result.quantity).toEqual(1);
    });

    it("should accept only positive numbers greater than 1 for quantity", async () => {
      const msg = await getError(() =>
        orderModel.create({ ...generateOrder(), quantity: -2 })
      );
      expect(msg).toMatch("must be greater than or equal to 1");
    });

    it("should only accept 'active' or 'complete' for status", async () => {
      const msg1 = await getError(() =>
        orderModel.create({ ...generateOrder(), state: OrderState.ACTIVE })
      );
      const msg2 = await getError(() =>
        orderModel.create({ ...generateOrder(), state: OrderState.COMPLETE })
      );
      const msg3 = await getError(() =>
        orderModel.create({ ...generateOrder(), state: "invalid_state" })
      );

      [msg1, msg2].forEach(m => expect(m).toBeFalsy());
      expect(msg3).toMatch(
        "must be one of the following values: active, complete"
      );
    });

    it("should throw an error on providing id for user that doesn't exist", async () => {
      const msg = await getError(() =>
        orderModel.create({ ...generateOrder, u_id: 5155 })
      );
      expect(msg).toBeTruthy();
    });

    it("should throw an error on providing id for product that doesn't exist", async () => {
      const msg = await getError(() =>
        orderModel.create({ ...generateOrder, product_id: 5155 })
      );
      expect(msg).toBeTruthy();
    });

    it("should populate the product and user", async () => {
      const order = await orderModel.create(generateOrder());
      expect(order.id).toBeDefined();
      expect(order.product).toBeDefined();
      expect(order.product_category).toBeDefined();
      expect(order.product_price).toBeDefined();
      expect(order.quantity).toBeDefined();
      expect(order.state).toBeDefined();
      expect(order.u_firstname).toBeDefined();
      expect(order.u_lastname).toBeDefined();
    });
  });

  describe("Read one", () => {
    let order: PopulatedOrder;

    beforeAll(async () => {
      order = await orderModel.create(generateOrder());
    });

    it("should have a show method", () => {
      expect(orderModel.show).toBeDefined();
    });

    it("should get the created order", async () => {
      const orderFromModel = await orderModel.show(order.id);
      expect(orderFromModel).toEqual(order);
    });

    it("should throw an error on not providing an id", async () => {
      const msg1 = await getError(() =>
        orderModel.show("" as unknown as number)
      );
      const msg2 = await getError(() =>
        orderModel.show("some_test" as unknown as number)
      );
      expect(msg1).toMatch("id is a required field");
      expect(msg2).toMatch("invalid input syntax for type integer");
    });

    it("should join the user and product tables", async () => {
      const o = await orderModel.show(order.id);
      expect(o.id).toBeDefined();
      expect(o.product).toBeDefined();
      expect(o.product_category).toBeDefined();
      expect(o.product_price).toBeDefined();
      expect(o.quantity).toBeDefined();
      expect(o.state).toBeDefined();
      expect(o.u_firstname).toBeDefined();
      expect(o.u_lastname).toBeDefined();
    });
  });

  describe("Update", () => {
    let order: PopulatedOrder;

    beforeEach(async () => {
      order = await orderModel.create(generateOrder());
    });

    it("should have an update method", () => {
      expect(orderModel.update).toBeDefined();
    });

    it("should update the quantity field to 500", async () => {
      const result = await orderModel.update(order.id, { quantity: 500 });
      expect(result.quantity).toBe(500);
    });

    it("should get the order after updating it", async () => {
      const result = await orderModel.update(order.id, {
        state: OrderState.COMPLETE,
      });
      expect(result.id).toBeDefined();
      expect(result.quantity).toBeDefined();
      expect(result.state).toBeDefined();
    });

    it("should do nothing on providing no data to update", async () => {
      const msg = await getError(() => orderModel.update(order.id, {}));
      expect(msg).toMatch("No fields provided to update");
    });

    it("should update the product_id and u_id fields", async () => {
      const result = await orderModel.update(order.id, {
        product_id: product.id,
        u_id: user.id,
      });
      expect(result.u_firstname).toBe(user.firstname);
      expect(result.product).toBe(product.name);
    });

    it("should update only the provided fields", async () => {
      const result = await orderModel.update(order.id, {
        state: OrderState.COMPLETE,
      });
      expect(result.product).toEqual(order.product);
      expect(result.quantity).toEqual(order.quantity);
      expect(result.u_firstname).toEqual(order.u_firstname);
      expect(result.state).toEqual(OrderState.COMPLETE);
    });

    it("should not use any extra invalid provided data", async () => {
      const result = await orderModel.update(order.id, {
        quantity: 400,
        invalidField: false,
      });
      expect(
        (result as PopulatedOrder & { invalidField: boolean }).invalidField
      ).not.toBeDefined();
    });

    it("should throw error on invalid id", async () => {
      const msg1 = await getError(() =>
        orderModel.show("" as unknown as number)
      );
      const msg2 = await getError(() =>
        orderModel.show("some_test" as unknown as number)
      );
      expect(msg1).toMatch("id is a required field");
      expect(msg2).toMatch("invalid input syntax for type integer");
    });

    it("should throw error on providing invalid values", async () => {
      const msg1 = await getError(() =>
        orderModel.update(order.id, { quantity: "hi" })
      );
      const msg2 = await getError(() =>
        orderModel.update(order.id, { product_id: "some_id" })
      );
      expect(msg1).toMatch("quantity must be a `number` type");
      expect(msg2).toMatch("product_id must be a `number` type");
    });

    it("should throw an error on providing id for user that doesn't exist", async () => {
      const msg = await getError(() =>
        orderModel.update(order.id, { u_id: 1000 })
      );
      expect(msg).toBeTruthy();
    });

    it("should throw an error on providing id for product that doesn't exist", async () => {
      const msg = await getError(() =>
        orderModel.update(order.id, { product_id: 1000 })
      );
      expect(msg).toBeTruthy();
    });

    it("should join the user and product tables", async () => {
      const o = await orderModel.update(order.id, { u_id: user.id });
      expect(o.id).toBeDefined();
      expect(o.product).toBeDefined();
      expect(o.product_category).toBeDefined();
      expect(o.product_price).toBeDefined();
      expect(o.quantity).toBeDefined();
      expect(o.state).toBeDefined();
      expect(o.u_firstname).toBeDefined();
      expect(o.u_lastname).toBeDefined();
    });
  });

  describe("Delete", () => {
    let order: PopulatedOrder;

    beforeEach(async () => {
      order = await orderModel.create(generateOrder());
    });

    afterEach(async () => {
      await orderModel.delete(order.id);
    });

    it("should have a delete method", () => {
      expect(orderModel.delete).toBeDefined();
    });

    it("should delete the created order", async () => {
      const result = await orderModel.delete(order.id);
      expect(result).toEqual({ ok: true });
    });

    it("should throw an error on not providing an id", async () => {
      const msg1 = await getError(() =>
        orderModel.show("" as unknown as number)
      );
      const msg2 = await getError(() =>
        orderModel.show("some_test" as unknown as number)
      );
      expect(msg1).toMatch("id is a required field");
      expect(msg2).toMatch("invalid input syntax for type integer");
    });
  });
});
