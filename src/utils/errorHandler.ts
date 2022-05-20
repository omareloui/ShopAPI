import type { ErrorRequestHandler, RequestHandler } from "express";

import { log } from ".";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next({
    statusCode: 404,
    message: `Can't find "${req.url}".`,
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const code = err.statusCode || 500;
  const msg = err.message || "Something went wrong!";

  log[code >= 500 ? "fatal" : "error"](msg);

  return res.status(code).send(msg);
};
