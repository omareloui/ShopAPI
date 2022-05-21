import dbClient from "../database";

export async function query<T = unknown>(q: string, options?: unknown[]) {
  const conn = await dbClient.connect();
  const result = await conn.query<T>(q, options);
  conn.release();
  return result;
}
