import { faker } from "@faker-js/faker";

import { UserModel, ProductModel, OrderModel } from "..";

import { query, getError } from "../../utils";

import {
  CreateOrder,
  CreateProduct,
  CreateUser,
  Order,
  OrderState,
  Product,
  User,
} from "../../@types";

const userModel = new UserModel();
const productModel = new ProductModel();
const orderModel = new OrderModel();

describe("Order Model", () => {
  let user: User;
  let product: Product;

  const generate = {
    user: (): CreateUser => ({
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName(),
      password: faker.random.words(3),
    }),

    product: (): CreateProduct => ({
      name: faker.random.words(3),
      price: parseInt(faker.random.numeric(3), 10),
      category: faker.random.word(),
    }),

    order: (): CreateOrder => ({
      u_id: user.id,
      product_id: product.id,
      quantity: parseInt(faker.random.numeric(), 10),
      state: OrderState.ACTIVE,
    }),
  };

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
  });

  describe("Create", () => {
    it("should have a create method", () => {
      expect(orderModel.create).toBeDefined();
    });

    it("should create a order successfully on providing all valid data", async () => {
      const createOrder = await orderModel.create(generate.order());
      expect(createOrder).toBeTruthy();
    });

    it("should get the order after creating it", async () => {
      const order = generate.order();
      const createdOrder = await orderModel.create(order);
      expect(createdOrder).toEqual({ id: createdOrder.id, ...order });
    });

    it("should make sure the product and user ids are valid", async () => {
      const msg1 = await getError(() =>
        orderModel.create({ ...generate.order(), product_id: "some_id" })
      );

      const msg2 = await getError(() =>
        orderModel.create({ ...generate.order(), u_id: "" })
      );

      [msg1, msg2].forEach(m => expect(m).toMatch("must be a `number` type"));
    });

    it("should default to 1 quantity if not provided", async () => {
      const result = await orderModel.create({
        ...generate.order(),
        quantity: undefined,
      });
      expect(result.quantity).toEqual(1);
    });

    it("should accept only positive numbers greater than 1 for quantity", async () => {
      const msg = await getError(() =>
        orderModel.create({ ...generate.order(), quantity: -2 })
      );
      expect(msg).toMatch("must be greater than or equal to 1");
    });

    it("should only accept 'active' or 'complete' for status", async () => {
      const msg1 = await getError(() =>
        orderModel.create({ ...generate.order(), state: OrderState.ACTIVE })
      );
      const msg2 = await getError(() =>
        orderModel.create({ ...generate.order(), state: OrderState.COMPLETE })
      );
      const msg3 = await getError(() =>
        orderModel.create({ ...generate.order(), state: "invalid_state" })
      );

      [msg1, msg2].forEach(m => expect(m).toBeFalsy());
      expect(msg3).toMatch(
        "must be one of the following values: active, complete"
      );
    });
  });

  describe("Read one", () => {
    let order: Order;

    beforeAll(async () => {
      order = await orderModel.create(generate.order());
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
  });

  //   describe("Update", () => {
  //     let order: Order;

  //     beforeEach(async () => {
  //       order = await orderModel.create(generateRandomOrder());
  //     });

  //     it("should have an update method", () => {
  //       expect(orderModel.update).toBeDefined();
  //     });

  //     it("should update the name field to 'new_name'", async () => {
  //       const result = await orderModel.update(order.id, {
  //         name: "new_name",
  //       });
  //       expect(result.name).toBe("new_name");
  //     });

  //     it("should get the order after updating it", async () => {
  //       const result = await orderModel.update(order.id, {
  //         name: "new_name",
  //       });
  //       expect(result.id).toBeDefined();
  //       expect(result.name).toBeDefined();
  //       expect(result.category).toBeDefined();
  //       expect(result.price).toBeDefined();
  //     });

  //     it("should update the name and category fields to 'new_name' and 'new_category'", async () => {
  //       const result = await orderModel.update(order.id, {
  //         name: "new_name",
  //         category: "new_category",
  //       });
  //       expect(result.name).toBe("new_name");
  //       expect(result.category).toBe("new_category");
  //     });

  //     it("should update only the provided fields", async () => {
  //       const result = await orderModel.update(order.id, {
  //         name: "new_name",
  //       });
  //       expect(result.category).toEqual(order.category);
  //       expect(result.name).toEqual("new_name");
  //       expect(result.price).toEqual(order.price);
  //     });

  //     it("should not use any extra invalid provided data", async () => {
  //       const result = await orderModel.update(order.id, {
  //         name: "new_name",
  //         invalidField: false,
  //       });
  //       expect(
  //         (result as Order & { invalidField: boolean }).invalidField
  //       ).not.toBeDefined();
  //     });

  //     it("should throw error on invalid id", async () => {
  //       const msg1 = await getError(() =>
  //         orderModel.show("" as unknown as number)
  //       );
  //       const msg2 = await getError(() =>
  //         orderModel.show("some_test" as unknown as number)
  //       );
  //       [msg1, msg2].forEach(m =>
  //         expect(m).toMatch("id must be a `number` type")
  //       );
  //     });

  //     it("should throw error on providing invalid values", async () => {
  //       const msg1 = await getError(() =>
  //         orderModel.update(order.id, { name: "hi" })
  //       );
  //       const msg2 = await getError(() =>
  //         orderModel.update(order.id, { category: "" })
  //       );

  //       [msg1, msg2].forEach(m => expect(m).toMatch("be at least 3 characters"));
  //     });
  //   });

  //   describe("Delete", () => {
  //     let order: Order;

  //     beforeEach(async () => {
  //       order = await orderModel.create(generateRandomOrder());
  //     });

  //     afterEach(async () => {
  //       await orderModel.delete(order.id);
  //     });

  //     it("should have a delete method", () => {
  //       expect(orderModel.delete).toBeDefined();
  //     });

  //     it("should delete the created order", async () => {
  //       const result = await orderModel.delete(order.id);
  //       expect(result).toEqual({ ok: true });
  //     });

  //     it("should throw an error on not providing an id", async () => {
  //       const msg1 = await getError(() =>
  //         orderModel.show("" as unknown as number)
  //       );
  //       const msg2 = await getError(() =>
  //         orderModel.show("some_test" as unknown as number)
  //       );
  //       [msg1, msg2].forEach(m =>
  //         expect(m).toMatch("id must be a `number` type")
  //       );
  //     });
  //   });
});
