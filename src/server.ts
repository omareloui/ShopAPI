import express from "express";
import morgan from "morgan";
import helmet from "helmet";

import { addUser } from "./middleware";
import { router } from "./handlers";

import { log, errorHandler, notFoundHandler } from "./utils";

import config from "./config";

const app = express();

const { host, port } = config;

app.use(helmet());
app.use(express.json());

if (!config.isTest) app.use(morgan("dev"));

app.use(addUser);
app.use(router);

app.use("*", notFoundHandler);
app.use(errorHandler);

app.listen(port, host, () => {
  if (!config.isTest) log.info(`Starting app on: http://${host}:${port}`);
});

export { app };
