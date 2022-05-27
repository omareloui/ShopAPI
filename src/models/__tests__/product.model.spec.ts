import { ProductModel } from "..";
import { getError, query } from "../../utils";

import type { Product } from "../../@types";
import { generate } from "../../__tests__/utils";
import { OrderModel } from "../order.model";
import { UserModel } from "../user.model";

const productModel = new ProductModel();

describe("Product Model", () => {
  afterAll(async () => {
    await query("DELETE FROM products *");
  });

  describe("Read all", () => {
    it("should have an index method", () => {
      expect(productModel.index).toBeDefined();
    });

    it("should get users", async () => {
      const users = await productModel.index();
      expect(users).toEqual([]);
    });
  });

  describe("Create", () => {
    it("should have a create method", () => {
      expect(productModel.create).toBeDefined();
    });

    it("should create a product successfully on providing all valid data", async () => {
      const product = generate.product();
      const createProduct = await productModel.create(product);
      expect(createProduct).toBeTruthy();
    });

    it("should get the product after creating it", async () => {
      const product = generate.product();
      const createdProduct = await productModel.create(product);
      expect(createdProduct).toEqual({
        id: createdProduct.id,
        ...product,
      });
    });

    it("should make sure the name and category are at least 3 characters", async () => {
      const message1 = await getError(() =>
        productModel.create({
          ...generate.product(),
          name: "hi",
        })
      );

      const message2 = await getError(() =>
        productModel.create({
          ...generate.product(),
          category: "hi",
        })
      );

      expect(message1).toMatch("at least 3 characters");
      expect(message2).toMatch("at least 3 characters");
    });
  });

  describe("Read one", () => {
    let product: Product;
    beforeAll(async () => {
      product = await productModel.create(generate.product());
    });

    it("should have a show method", () => {
      expect(productModel.show).toBeDefined();
    });

    it("should get the created product", async () => {
      const productFromModel = await productModel.show(product.id);
      expect(productFromModel).toEqual(product);
    });

    it("should throw an error on not providing an id", async () => {
      const msg1 = await getError(() =>
        productModel.show("" as unknown as number)
      );
      const msg2 = await getError(() =>
        productModel.show("some_test" as unknown as number)
      );
      [msg1, msg2].forEach(m =>
        expect(m).toMatch("id must be a `number` type")
      );
    });
  });

  describe("Read category", () => {
    const products: Product[] = [];

    beforeAll(async () => {
      const createProduct = (category?: string) =>
        productModel.create(generate.product(category ? { category } : {}));
      products.push(await createProduct("cat_to_repeat"));
      products.push(await createProduct(products[0].category));
      products.push(await createProduct(products[0].category));
      products.push(await createProduct());
      products.push(await createProduct());
    });

    it("should have a showByCategory method", () => {
      expect(productModel.showByCategory).toBeDefined();
    });

    it("should get product with the same provided category", async () => {
      const categoryProducts = await productModel.showByCategory(
        products[0].category
      );
      expect(categoryProducts.length).toEqual(3);
      expect(categoryProducts).toEqual([products[0], products[1], products[2]]);
    });

    it("should throw an error on not providing a category", async () => {
      const msg = await getError(() => productModel.showByCategory(""));
      expect(msg).toMatch("category is a required field");
    });
  });

  describe("Read top five", () => {
    it("should have showTopFive method", () => {
      expect(productModel.showTopFive).toBeDefined();
    });

    it("should get the top five ordered products", async () => {
      const userModel = new UserModel();
      const orderModel = new OrderModel();

      const user = await userModel.create(generate.user());

      const product1 = await productModel.create(generate.product());
      const product2 = await productModel.create(generate.product());
      const product3 = await productModel.create(generate.product());
      const product4 = await productModel.create(generate.product());
      const product5 = await productModel.create(generate.product());
      const product6 = await productModel.create(generate.product());
      const product7 = await productModel.create(generate.product());

      await orderModel.create(
        generate.order(user.id, product1.id, { quantity: 10 })
      );
      await orderModel.create(
        generate.order(user.id, product2.id, { quantity: 1 })
      );
      await orderModel.create(
        generate.order(user.id, product3.id, { quantity: 1000 })
      );
      await orderModel.create(
        generate.order(user.id, product2.id, { quantity: 1 })
      );
      await orderModel.create(
        generate.order(user.id, product2.id, { quantity: 1 })
      );
      await orderModel.create(
        generate.order(user.id, product2.id, { quantity: 1 })
      );
      await orderModel.create(
        generate.order(user.id, product4.id, { quantity: 2 })
      );
      await orderModel.create(
        generate.order(user.id, product5.id, { quantity: 1 })
      );
      await orderModel.create(
        generate.order(user.id, product6.id, { quantity: 1 })
      );
      await orderModel.create(
        generate.order(user.id, product7.id, { quantity: 1 })
      );

      const topProducts = await productModel.showTopFive();

      expect(topProducts.length).toBeLessThanOrEqual(5);

      expect(topProducts[0].id).toEqual(product3.id);
      expect(topProducts[1].id).toEqual(product1.id);
      expect(topProducts[2].id).toEqual(product2.id);
      expect(topProducts[3].id).toEqual(product4.id);

      await query("DELETE FROM orders *");
    });
  });

  describe("Update", () => {
    let product: Product;

    beforeEach(async () => {
      product = await productModel.create(generate.product());
    });

    it("should have an update method", () => {
      expect(productModel.update).toBeDefined();
    });

    it("should update the name field to 'new_name'", async () => {
      const result = await productModel.update(product.id, {
        name: "new_name",
      });
      expect(result.name).toBe("new_name");
    });

    it("should get the product after updating it", async () => {
      const result = await productModel.update(product.id, {
        name: "new_name",
      });
      expect(result.id).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.category).toBeDefined();
      expect(result.price).toBeDefined();
    });

    it("should update the name and category fields to 'new_name' and 'new_category'", async () => {
      const result = await productModel.update(product.id, {
        name: "new_name",
        category: "new_category",
      });
      expect(result.name).toBe("new_name");
      expect(result.category).toBe("new_category");
    });

    it("should update only the provided fields", async () => {
      const result = await productModel.update(product.id, {
        name: "new_name",
      });
      expect(result.category).toEqual(product.category);
      expect(result.name).toEqual("new_name");
      expect(result.price).toEqual(product.price);
    });

    it("should not use any extra invalid provided data", async () => {
      const result = await productModel.update(product.id, {
        name: "new_name",
        invalidField: false,
      });
      expect(
        (result as Product & { invalidField: boolean }).invalidField
      ).not.toBeDefined();
    });

    it("should throw error on invalid id", async () => {
      const msg1 = await getError(() =>
        productModel.show("" as unknown as number)
      );
      const msg2 = await getError(() =>
        productModel.show("some_test" as unknown as number)
      );
      [msg1, msg2].forEach(m =>
        expect(m).toMatch("id must be a `number` type")
      );
    });

    it("should throw error on providing invalid values", async () => {
      const msg1 = await getError(() =>
        productModel.update(product.id, { name: "hi" })
      );
      const msg2 = await getError(() =>
        productModel.update(product.id, { category: "" })
      );

      [msg1, msg2].forEach(m => expect(m).toMatch("be at least 3 characters"));
    });
  });

  describe("Delete", () => {
    let product: Product;

    beforeEach(async () => {
      product = await productModel.create(generate.product());
    });

    afterEach(async () => {
      await productModel.delete(product.id);
    });

    it("should have a delete method", () => {
      expect(productModel.delete).toBeDefined();
    });

    it("should delete the created product", async () => {
      const result = await productModel.delete(product.id);
      expect(result).toEqual({ ok: true });
    });

    it("should throw an error on not providing an id", async () => {
      const msg1 = await getError(() =>
        productModel.show("" as unknown as number)
      );
      const msg2 = await getError(() =>
        productModel.show("some_test" as unknown as number)
      );
      [msg1, msg2].forEach(m =>
        expect(m).toMatch("id must be a `number` type")
      );
    });
  });
});
