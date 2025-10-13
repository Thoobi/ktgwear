export function supabaseAuthError(
  err: unknown,
  fallback = "An error occurred"
) {
  if (!err) return fallback;
  // Supabase errors often have 'message' and 'status' fields
  if (typeof err === "string") return err;
  if (typeof err === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyErr = err as any;
    if (typeof anyErr.message === "string" && anyErr.message.length > 0)
      return anyErr.message;
    if (typeof anyErr.error === "string" && anyErr.error.length > 0)
      return anyErr.error;
    if (typeof anyErr.msg === "string" && anyErr.msg.length > 0)
      return anyErr.msg;
  }
  return fallback;
}
