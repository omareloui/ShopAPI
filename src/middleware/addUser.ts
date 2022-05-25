import { NextFunction, Request, Response } from "express";

import { AuthModel } from "../models";

import { User } from "../@types";

export async function addUser(
  req: Request & { user?: User },
  _res: Response,
  next: NextFunction
) {
  const authHeader = (req.headers.Authorization ||
    req.headers.authorization) as string;

  if (authHeader && authHeader.match(/^Bearer /)) {
    const authModel = new AuthModel();

    const token = authHeader.split("Bearer ")[1];
    const user = await authModel.getMe(token);
    req.user = user;
  }

  next();
}
