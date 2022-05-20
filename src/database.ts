import { Pool } from "pg";

import config from "./config";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import databaseInfo from "../database.json";

const currentDB = config.isTest ? "test" : "dev";

const { database, host, password, port, user } = databaseInfo[currentDB];

const client = new Pool({
  database,
  host,
  port,
  user,
  password,
});

export default client;
