import "dotenv/config";

import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";

import config from "./config";

import dbClient from "./database";

const app = express();

const { host, port } = config;

app.use(morgan("dev"));
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.get("/db", async (_req, res, next) => {
  try {
    const result = await dbClient.query("SELECT NOW()");
    res.send(result.rows);
  } catch (e) {
    next(e);
  }
});

app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.info(`Starting app on: http://${host}:${port}`);
});

export { app };
