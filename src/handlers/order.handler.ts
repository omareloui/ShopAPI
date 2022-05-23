import { RequestHandler } from "express";

import { OrderModel } from "../models";
import { generateRouter } from "../utils";
import { HTTPMethods } from "../@types";

const orderModel = new OrderModel();

const index: RequestHandler = async (_req, res) => {
  const data = await orderModel.index();
  res.json(data);
};

const show: RequestHandler = async (req, res) => {
  const data = await orderModel.show(parseInt(req.params.id, 10));
  res.json(data);
};

const create: RequestHandler = async (req, res) => {
  const data = await orderModel.create(req.body);
  res.json(data);
};

const update: RequestHandler = async (req, res) => {
  const data = await orderModel.update(parseInt(req.params.id, 10), req.body);
  res.json(data);
};

const destroy: RequestHandler = async (req, res) => {
  const data = await orderModel.delete(parseInt(req.params.id, 10));
  res.json(data);
};

const router = generateRouter([
  [HTTPMethods.GET, "/orders", index],
  [HTTPMethods.GET, "/orders/:id", show],
  [HTTPMethods.POST, "/orders", create],
  [HTTPMethods.PUT, "/orders/:id", update],
  [HTTPMethods.DELETE, "/orders/:id", destroy],
]);

export { router as ordersRoutes };
