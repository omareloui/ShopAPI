import { Router } from "express";

import type { RoutesArray } from "../@types";
import { APIError } from "../lib";

export function generateRouter(routes: RoutesArray) {
  const router = Router();

  routes.forEach(([method, route, func]) => {
    router[method](route, async (req, res, next) => {
      try {
        await func(req, res, next);
      } catch (e) {
        next(new APIError(e));
      }
    });
  });

  return router;
}
