import "dotenv/config";

import express from "express";
import morgan from "morgan";
import helmet from "helmet";

import config from "./config";

import dbClient from "./database";
import { log, errorHandler, notFoundHandler } from "./utils";

const app = express();

const { host, port } = config;

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("*", notFoundHandler);
app.use(errorHandler);

app.listen(port, host, () => {
  log.info(`Starting app on: http://${host}:${port}`);
});

export { app };
