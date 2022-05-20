export async function getError<T extends () => unknown>(
  cb: T
): Promise<string | undefined> {
  let msg;
  try {
    await cb();
  } catch (err) {
    const e = err as Error;
    msg = e.message;
  }
  return msg;
}
