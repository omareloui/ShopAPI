const env = process.env.NODE_ENV;

export default {
  host: process.env.HOST || "127.0.0.1",
  port: (process.env.PORT || 3000) as number,
  env,
  isProd: env === "production",
  isDev: env === "development",
  isTest: env === "test",
};