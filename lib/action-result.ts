/** What a signed-in server action returns: data, or the error message to show. */
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** Turns an action result back into a value, or throws the server's message. */
export async function unwrap<T>(result: Promise<ActionResult<T>>): Promise<T> {
  const r = await result;
  if (!r.ok) throw new Error(r.error);
  return r.data;
}
