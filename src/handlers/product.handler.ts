import { RequestHandler } from "express";

import { ProductModel } from "../models";
import { generateRouter } from "../utils";
import { HTTPMethods } from "../@types";

const productModel = new ProductModel();

const index: RequestHandler = async (_req, res) => {
  const data = await productModel.index();
  res.json(data);
};

const show: RequestHandler = async (req, res) => {
  const data = await productModel.show(parseInt(req.params.id, 10));
  res.json(data);
};

const create: RequestHandler = async (req, res) => {
  const data = await productModel.create(req.body);
  res.json(data);
};

const update: RequestHandler = async (req, res) => {
  const data = await productModel.update(parseInt(req.params.id, 10), req.body);
  res.json(data);
};

const destroy: RequestHandler = async (req, res) => {
  const data = await productModel.delete(parseInt(req.params.id, 10));
  res.json(data);
};

const router = generateRouter([
  [HTTPMethods.GET, "/products", index],
  [HTTPMethods.GET, "/products/:id", show],
  [HTTPMethods.POST, "/products", create, true],
  [HTTPMethods.PUT, "/products/:id", update],
  [HTTPMethods.DELETE, "/products/:id", destroy],
]);

export { router as productsRoutes };
