import { UserModel, ProductModel, OrderModel } from "..";

import { getError, query } from "../../utils";
import { clearDB, generate } from "../../__tests__/utils";

import {
  CreateOrder,
  OrderState,
  PopulatedOrder,
  Product,
  User,
} from "../../@types";

const userModel = new UserModel();
const productModel = new ProductModel();
const orderModel = new OrderModel();

describe("Order Model", () => {
  let user: User;
  const products: Product[] = [];

  const generateOrder = (override: Partial<CreateOrder> = {}): CreateOrder =>
    generate.order(
      products.map(p => p.id),
      override
    );

  beforeAll(async () => {
    await clearDB();
    user = await userModel.create(generate.user());
    products.push(await productModel.create(generate.product()));
    products.push(await productModel.create(generate.product()));
  });

  afterAll(clearDB);

  describe("Read all", () => {
    it("should have an index method", () => {
      expect(orderModel.index).toBeDefined();
    });

    it("should get list of orders", async () => {
      const orders = await orderModel.index();
      expect(orders).toEqual([]);
    });

    it("should join the user and product tables", async () => {
      await orderModel.create(user.id, generateOrder());

      const orders = await orderModel.index();
      const o = orders[0];

      expect(o.id).toBeDefined();
      expect(o.products).toBeDefined();
      expect(o.products[0]).toBeDefined();
      expect(o.products[0].id).toBeDefined();
      expect(o.products[0].name).toBeDefined();
      expect(o.products[0].category).toBeDefined();
      expect(o.products[0].price).toBeDefined();
      expect(o.products[0].quantity).toBeDefined();
      expect(o.state).toBeDefined();
      expect(o.u_id).toBeDefined();
      expect(o.u_firstname).toBeDefined();
      expect(o.u_lastname).toBeDefined();
      expect(o.u_username).toBeDefined();
    });
  });

  describe("Create", () => {
    it("should have a create method", () => {
      expect(orderModel.create).toBeDefined();
    });

    it("should create a order successfully on providing all valid data", async () => {
      const createOrder = await orderModel.create(user.id, generateOrder());
      expect(createOrder).toBeTruthy();
    });

    it("should get the order after creating it", async () => {
      const order = generateOrder();
      const createdOrder = await orderModel.create(user.id, order);
      expect(createdOrder).toEqual({
        id: createdOrder.id,
        products: [
          {
            id: products[0].id,
            name: products[0].name,
            category: products[0].category,
            price: products[0].price,
            quantity: order.products[0].quantity as number,
          },
          {
            id: products[1].id,
            name: products[1].name,
            category: products[1].category,
            price: products[1].price,
            quantity: order.products[1].quantity as number,
          },
        ],
        state: order.state,
        u_id: user.id,
        u_firstname: user.firstname,
        u_lastname: user.lastname,
        u_username: user.username,
      });
    });

    it("should make sure the product and user ids are valid", async () => {
      const msg1 = await getError(() =>
        orderModel.create(
          user.id,
          generateOrder({
            products: [{ id: "some_id" as unknown as number, quantity: 2 }],
          })
        )
      );

      const msg2 = await getError(() =>
        orderModel.create("" as unknown as number, generateOrder())
      );

      [msg1, msg2].forEach(m => expect(m).toMatch("must be a `number` type"));
    });

    it("should default to 1 quantity if not provided", async () => {
      const result = await orderModel.create(
        user.id,
        generateOrder({ products: [{ id: products[0].id }] })
      );
      expect(result.products[0].quantity).toEqual(1);
    });

    it("should accept only positive numbers greater than 1 for quantity", async () => {
      const msg = await getError(() =>
        orderModel.create(
          user.id,
          generateOrder({ products: [{ id: products[0].id, quantity: -2 }] })
        )
      );
      expect(msg).toMatch("must be greater than or equal to 1");
    });

    it("should only accept 'active' or 'complete' for status", async () => {
      const msg1 = await getError(() =>
        orderModel.create(user.id, generateOrder({ state: OrderState.ACTIVE }))
      );
      const msg2 = await getError(() =>
        orderModel.create(
          user.id,
          generateOrder({ state: OrderState.COMPLETE })
        )
      );
      const msg3 = await getError(() =>
        orderModel.create(
          user.id,
          generateOrder({ state: "invalid_state" as unknown as OrderState })
        )
      );

      [msg1, msg2].forEach(m => expect(m).toBeFalsy());
      expect(msg3).toMatch(
        "must be one of the following values: active, complete"
      );
    });

    it("should throw an error on providing id for user that doesn't exist", async () => {
      const msg = await getError(() =>
        orderModel.create(5155, generateOrder())
      );
      expect(msg).toBeTruthy();
    });

    it("should throw an error on providing id for product that doesn't exist", async () => {
      const msg = await getError(() =>
        orderModel.create(user.id, generateOrder({ products: [{ id: 5155 }] }))
      );
      expect(msg).toBeTruthy();
    });

    it("should populate the product and user", async () => {
      const order = await orderModel.create(user.id, generateOrder());
      expect(order.id).toBeDefined();
      expect(order.products).toBeDefined();
      expect(order.products[0]).toBeDefined();
      expect(order.products[0].id).toBeDefined();
      expect(order.products[0].name).toBeDefined();
      expect(order.products[0].category).toBeDefined();
      expect(order.products[0].price).toBeDefined();
      expect(order.products[0].quantity).toBeDefined();
      expect(order.state).toBeDefined();
      expect(order.u_id).toBeDefined();
      expect(order.u_firstname).toBeDefined();
      expect(order.u_lastname).toBeDefined();
      expect(order.u_username).toBeDefined();
    });
  });

  describe("Read one", () => {
    let order: PopulatedOrder;

    beforeAll(async () => {
      order = await orderModel.create(user.id, generateOrder());
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
      [msg1, msg2].forEach(m => expect(m).toMatch("id must be a `number`"));
    });

    it("should join the user and product tables", async () => {
      const o = await orderModel.show(order.id);
      expect(o.id).toBeDefined();
      expect(o.products).toBeDefined();
      expect(o.products[0]).toBeDefined();
      expect(o.products[0].id).toBeDefined();
      expect(o.products[0].name).toBeDefined();
      expect(o.products[0].category).toBeDefined();
      expect(o.products[0].price).toBeDefined();
      expect(o.products[0].quantity).toBeDefined();
      expect(o.state).toBeDefined();
      expect(o.u_id).toBeDefined();
      expect(o.u_firstname).toBeDefined();
      expect(o.u_lastname).toBeDefined();
      expect(o.u_username).toBeDefined();
    });
  });

  describe("Read by user id", () => {
    it("should have showByUser", () => {
      expect(orderModel.showByUser).toBeDefined();
    });

    it("should get the required user orders only", async () => {
      const user1 = await userModel.create(generate.user());
      const user2 = await userModel.create(generate.user());
      const user3 = await userModel.create(generate.user());

      const order1 = await orderModel.create(
        user1.id,
        generateOrder({ products: [{ id: products[0].id }] })
      );
      const order2 = await orderModel.create(
        user1.id,
        generateOrder({ products: [{ id: products[0].id }] })
      );
      const order3 = await orderModel.create(
        user2.id,
        generateOrder({ products: [{ id: products[0].id }] })
      );
      const order4 = await orderModel.create(
        user3.id,
        generateOrder({ products: [{ id: products[0].id }] })
      );
      const order5 = await orderModel.create(
        user2.id,
        generateOrder({ products: [{ id: products[0].id }] })
      );

      const user1Orders = await orderModel.showByUser(user1.id);
      const user2Orders = await orderModel.showByUser(user2.id);
      const user3Orders = await orderModel.showByUser(user3.id);

      expect(user1Orders.length).toEqual(2);
      expect(user2Orders.length).toEqual(2);
      expect(user3Orders.length).toEqual(1);

      const sortOrders = (order: PopulatedOrder[]) =>
        order
          .sort((a, b) => a.id - b.id)
          .map(o => o.products.sort((a, b) => a.id - b.id));

      expect(sortOrders(user1Orders)).toEqual(sortOrders([order1, order2]));
      expect(sortOrders(user2Orders)).toEqual(sortOrders([order3, order5]));
      expect(user3Orders).toEqual([order4]);
    });
  });

  describe("Read complete by user id", () => {
    it("should have showByUser", () => {
      expect(orderModel.showCompleteByUser).toBeDefined();
    });

    it("should get the required user orders only", async () => {
      const user1 = await userModel.create(generate.user());
      const user2 = await userModel.create(generate.user());
      const user3 = await userModel.create(generate.user());
      await orderModel.create(
        user1.id,
        generateOrder({ state: OrderState.ACTIVE })
      );
      const order2 = await orderModel.create(
        user1.id,
        generateOrder({ state: OrderState.COMPLETE })
      );
      const order3 = await orderModel.create(
        user2.id,
        generateOrder({ state: OrderState.COMPLETE })
      );
      await orderModel.create(
        user3.id,
        generateOrder({ state: OrderState.ACTIVE })
      );
      await orderModel.create(
        user2.id,
        generateOrder({ state: OrderState.ACTIVE })
      );

      const user1CompleteOrders = await orderModel.showCompleteByUser(user1.id);
      const user2CompleteOrders = await orderModel.showCompleteByUser(user2.id);
      const user3CompleteOrders = await orderModel.showCompleteByUser(user3.id);

      expect(user1CompleteOrders.length).toEqual(1);
      expect(user2CompleteOrders.length).toEqual(1);
      expect(user3CompleteOrders.length).toEqual(0);

      expect(user1CompleteOrders).toEqual([order2]);
      expect(user2CompleteOrders).toEqual([order3]);
      expect(user3CompleteOrders).toEqual([]);
    });
  });

  describe("Delete", () => {
    let order: PopulatedOrder;

    beforeEach(async () => {
      order = await orderModel.create(user.id, generateOrder());
    });

    it("should have a delete method", () => {
      expect(orderModel.delete).toBeDefined();
    });

    it("should delete the created order", async () => {
      const result = await orderModel.delete(order.id);
      expect(result).toEqual({ ok: true });
    });

    it("should delete all records from order_products", async () => {
      await orderModel.delete(order.id);
      const orderProductsRes = await query(
        "SELECT * from order_products WHERE order_id = $1",
        [order.id]
      );
      expect(orderProductsRes.rows.length).toEqual(0);
    });

    it("should throw an error on not providing an id", async () => {
      const msg1 = await getError(() =>
        orderModel.show("" as unknown as number)
      );
      const msg2 = await getError(() =>
        orderModel.show("some_test" as unknown as number)
      );
      [msg1, msg2].forEach(m =>
        expect(m).toMatch("id must be a `number` type")
      );
    });
  });
});
