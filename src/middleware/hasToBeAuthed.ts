import { NextFunction, Request, Response } from "express";

import { APIError } from "../lib";

import { User } from "../@types";

export async function hasToBeAuthed(
  req: Request & { user?: User },
  _res: Response,
  next: NextFunction
) {
  if (!req.user)
    next(new APIError("You have to signin to view this data.", 401));
  next();
}
