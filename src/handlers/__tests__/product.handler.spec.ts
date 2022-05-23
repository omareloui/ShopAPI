import supertest from "supertest";
import { UpdateProduct, Product } from "../../@types";
import { app } from "../../server";
import { query } from "../../utils";

import { generate } from "../../__tests__/utils"

const request = supertest(app);

describe("Product Handler", () => {
  describe("Existing end-points", () => {
    afterAll(async () => {
      await query("DELETE FROM products *");
    });

    it("should have GET /products", async () => {
      const res = await request.get("/products");
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have POST /products", async () => {
      const res = await request.post("/products").send(generate.product());
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have GET /products/:id", async () => {
      const createRes = await request.post("/products").send(generate.product());
      const { id } = createRes.body as Product;
      const res = await request.get(`/products/${id}`);
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have DELETE /products/:id", async () => {
      const createRes = await request.post("/products").send(generate.product());
      const { id } = createRes.body as Product;
      const res = await request.delete(`/products/${id}`);
      expect(res.statusCode).not.toEqual(404);
    });

    it("should have PUT /products/:id", async () => {
      const createRes = await request.post("/products").send(generate.product());
      const { id } = createRes.body as Product;
      const res = await request.put(`/products/${id}`);
      expect(res.statusCode).not.toEqual(404);
    });
  });

  describe("Basic functionality", () => {
    afterAll(async () => {
      await query("DELETE FROM products *")
    })

    it("should get the products on GET /products", async () => {
      const res = await request.get("/products")
      expect(res.body).toEqual([])
    })

    it("should create a product on POST /products", async () => {
      const product = generate.product()
      const res = await request.post("/products").send(product)
      const resProduct = res.body as Product
      expect(resProduct.category).toEqual(product.category)
      expect(resProduct.name).toEqual(product.name)
      expect(resProduct.price).toEqual(product.price)
    })

    it("should get the product on GET /products/:id", async () => {
      const product = generate.product()
      const { body: createdProduct } = await request.post("/products").send(product)
      const { body: resProduct } = await request.get(`/products/${createdProduct.id}`)
      expect(resProduct.category).toEqual(product.category)
      expect(resProduct.name).toEqual(product.name)
      expect(resProduct.price).toEqual(product.price)
    })

    it("should update the product on PUT /products/:id", async () => {
      const product = generate.product()
      const { body: createdProduct } = await request.post("/products").send(product)
      const { body: resProduct } = await request.put(`/products/${createdProduct.id}`).send({ name: "new name" } as UpdateProduct)
      expect(resProduct.name).toEqual("new name")
    })

    it("should delete the product on DELETE /products/:id", async () => {
      const product = generate.product()
      const { body: createdProduct } = await request.post("/products").send(product)
      const { body } = await request.delete(`/products/${createdProduct.id}`)
      expect(body.ok).toBeTrue()
    })
  })
});
