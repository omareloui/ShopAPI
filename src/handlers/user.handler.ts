import { RequestHandler } from "express";

import { UserModel } from "../models";
import { generateRouter } from "../utils";
import { HTTPMethods } from "../@types";

const userModel = new UserModel();

const index: RequestHandler = async (_req, res) => {
  const data = await userModel.index();
  res.json(data);
};

const show: RequestHandler = async (req, res) => {
  const data = await userModel.show(parseInt(req.params.id, 10));
  res.json(data);
};

const create: RequestHandler = async (req, res) => {
  const data = await userModel.create(req.body);
  res.json(data);
};

const update: RequestHandler = async (req, res) => {
  const data = await userModel.update(parseInt(req.params.id, 10), req.body);
  res.json(data);
};

const destroy: RequestHandler = async (req, res) => {
  const data = await userModel.delete(parseInt(req.params.id, 10));
  res.json(data);
};

const router = generateRouter([
  [HTTPMethods.GET, "/users", index],
  [HTTPMethods.GET, "/users/:id", show],
  [HTTPMethods.POST, "/users", create],
  [HTTPMethods.PUT, "/users/:id", update],
  [HTTPMethods.DELETE, "/users/:id", destroy],
]);

export { router as usersRoutes };
