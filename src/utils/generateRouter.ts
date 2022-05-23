import { Router } from "express";

import type { RoutesArray } from "../@types";

export function generateRouter(routes: RoutesArray) {
  const router = Router();

  routes.forEach(([method, route, func]) => {
    router[method](route, async (req, res, next) => {
      try {
        await func(req, res, next);
      } catch (e) {
        next(e);
      }
    });
  });

  return router;
}
