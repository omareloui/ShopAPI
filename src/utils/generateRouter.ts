import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from "express";

import { APIError } from "../lib";
import { hasToBeAuthed } from "../middleware";

import type { RoutesArray } from "../@types";

export function generateRouter(routes: RoutesArray) {
  const router = Router();

  routes.forEach(([method, route, func, requireAuthentication]) => {
    const middleware = [] as RequestHandler[];

    if (requireAuthentication) middleware.push(hasToBeAuthed);

    middleware.push(async (req: Request, res: Response, next: NextFunction) => {
      try {
        await func(req, res, next);
      } catch (e) {
        next(new APIError(e));
      }
    });

    router[method](route, middleware);
  });

  return router;
}
