import { ProductModel } from "..";
import { getError, query } from "../../utils";

import type { Product } from "../../@types";
import { generate } from "../../__tests__/utils";

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
