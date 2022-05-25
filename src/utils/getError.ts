import { APIError } from "../lib";

export async function getError<T extends () => unknown>(
  cb: T
): Promise<string | undefined> {
  let msg;
  try {
    await cb();
  } catch (err) {
    const e = err as APIError | Error;
    msg = e.message;
  }
  return msg;
}
