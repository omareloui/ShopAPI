import supertest from "supertest";
import { UpdateProduct, Product, OrderProduct } from "../../@types";
import { AuthModel } from "../../models";
import { app } from "../../server";
import { query } from "../../utils";

import { clearDB, generate } from "../../__tests__/utils";

const authModel = new AuthModel();
const request = supertest(app);

describe("Product Handler", () => {
  afterAll(async () => {
    await query(
      "DELETE FROM orders *; DELETE FROM users *; DELETE FROM products *"
    );
  });

  describe("Existing end-points", () => {
    let token: string;

    beforeAll(async () => {
      const auth = await authModel.signup(generate.signup());
      token = `Bearer ${auth.token.body}`;
    });

    afterAll(async () => {
      await query("DELETE FROM products *");
      await query("DELETE FROM users *");
    });

    it("should have GET /products", async () => {
      const res = await request.get("/products");
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have POST /products", async () => {
      const res = await request
        .post("/products")
        .set({ Authorization: token })
        .send(generate.product());
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have GET /products/category/:cat", async () => {
      const createRes = await request
        .post("/products")
        .set({ Authorization: token })
        .send(generate.product());
      const { category } = createRes.body as Product;
      const res = await request.get(`/products/category/${category}`);
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have GET /products/top-five", async () => {
      const res = await request.get("/products/top-five");
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have GET /products/:id", async () => {
      const createRes = await request
        .post("/products")
        .set({ Authorization: token })
        .send(generate.product());
      const { id } = createRes.body as Product;
      const res = await request.get(`/products/${id}`);
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have DELETE /products/:id", async () => {
      const createRes = await request
        .post("/products")
        .set({ Authorization: token })
        .send(generate.product());
      const { id } = createRes.body as Product;
      const res = await request.delete(`/products/${id}`);
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have PUT /products/:id", async () => {
      const createRes = await request
        .post("/products")
        .set({ Authorization: token })
        .send(generate.product());
      const { id } = createRes.body as Product;
      const res = await request.put(`/products/${id}`);
      expect(res.statusCode).not.toEqual(404);
    });
  });

  describe("Require authentication", () => {
    it("should POST /products require to be authenticated", async () => {
      const res = await request.post("/products");
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

    afterAll(clearDB);

    it("should get the products on GET /products", async () => {
      const res = await request.get("/products");
      expect(res.body).toEqual([]);
    });

    it("should create a product on POST /products on providing the token", async () => {
      const product = generate.product();
      const res = await request
        .post("/products")
        .send(product)
        .set({ Authorization: token });
      const resProduct = res.body as Product;
      expect(resProduct.category).toEqual(product.category);
      expect(resProduct.name).toEqual(product.name);
      expect(resProduct.price).toEqual(product.price);
    });

    it("should get products on GET /products/category/:cat", async () => {
      const product = generate.product();
      const { body: createdProduct } = await request
        .post("/products")
        .set({ Authorization: token })
        .send(product);
      const { body: resProducts } = await request.get(
        `/products/category/${createdProduct.category}`
      );
      expect(resProducts.length).toBeGreaterThanOrEqual(1);
      resProducts.forEach((p: Product) =>
        expect(p.category).toEqual(product.category)
      );
    });

    it("should get products on GET /products/top-five", async () => {
      const create = async () => {
        const resProduct = await request
          .post("/products")
          .set({ Authorization: token })
          .send(generate.product());
        const product = resProduct.body as Product;
        const o = generate.order([product.id]);
        await request.post("/orders").set({ Authorization: token }).send(o);
      };

      for (let i = 0; i < 10; i += 1) await create();

      const res = await request.get("/products/top-five");

      const products = res.body as OrderProduct[];

      expect(products.length).not.toBe(0);
      expect(products.length).toBeLessThanOrEqual(5);

      await query("DELETE FROM order_products *; DELETE FROM orders *;");
    });

    it("should get the product on GET /products/:id", async () => {
      const product = generate.product();
      const { body: createdProduct } = await request
        .post("/products")
        .set({ Authorization: token })
        .send(product);
      const { body: resProduct } = await request.get(
        `/products/${createdProduct.id}`
      );
      expect(resProduct.category).toEqual(product.category);
      expect(resProduct.name).toEqual(product.name);
      expect(resProduct.price).toEqual(product.price);
    });

    it("should update the product on PUT /products/:id", async () => {
      const product = generate.product();
      const { body: createdProduct } = await request
        .post("/products")
        .set({ Authorization: token })
        .send(product);
      const { body: resProduct } = await request
        .put(`/products/${createdProduct.id}`)
        .send({ name: "new name" } as UpdateProduct);
      expect(resProduct.name).toEqual("new name");
    });

    it("should delete the product on DELETE /products/:id", async () => {
      const product = generate.product();
      const { body: createdProduct } = await request
        .post("/products")
        .set({ Authorization: token })
        .send(product);
      const { body } = await request.delete(`/products/${createdProduct.id}`);
      expect(body.ok).toBeTrue();
    });
  });
});
