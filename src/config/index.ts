const env = process.env.NODE_ENV;

const isTest = env === "test";

export default {
  host: process.env.HOST || "127.0.0.1",
  port: (isTest
    ? process.env.PORT_TEST || 4000
    : process.env.PORT || 3000) as number,
  env,
  isProd: env === "production",
  isDev: env === "development",
  isTest,
};
