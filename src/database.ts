import { Pool } from "pg";

import config from "./config";

const database = config.isTest
  ? process.env.PGDATABASE_TEST
  : process.env.PGDATABASE;

const client = new Pool({
  database,
});

export default client;
