import dbClient from "../database";

export async function query(q: string, options?: unknown[]) {
  const conn = await dbClient.connect();
  const result = await conn.query(q, options);
  conn.release();
  return result;
}
