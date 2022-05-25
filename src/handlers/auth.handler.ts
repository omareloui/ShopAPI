import { RequestHandler } from "express";

import { AuthModel } from "../models";
import { generateRouter } from "../utils";
import { HTTPMethods } from "../@types";

const authModel = new AuthModel();

const signin: RequestHandler = async (req, res) => {
  const data = await authModel.signin(req.body);
  res.json(data);
};

const signup: RequestHandler = async (req, res) => {
  const data = await authModel.signup(req.body);
  res.json(data);
};

const router = generateRouter([
  [HTTPMethods.POST, "/auth/signin", signin],
  [HTTPMethods.POST, "/auth/signup", signup],
]);

export { router as authRoutes };
