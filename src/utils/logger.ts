import pino from "pino";

import config from "../config";

function getLevel() {
  if (config.isProd) return "info";
  if (config.isTest) return "trace";
  return "debug";
}

const log = pino({ level: getLevel() });

export { log };
