import { NextFunction, Request, Response } from "express";

import { User } from ".";

export type AuthenticatedRequest = Request & { user: User };

export type AuthenticatedRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;
