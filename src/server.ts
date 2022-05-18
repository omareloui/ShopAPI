import express, { Request, Response } from "express";

import config from "./config";

const app: express.Application = express();

const { host, port } = config;

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.info(`Starting app on: http://${host}:${port}`);
});

export { app };
