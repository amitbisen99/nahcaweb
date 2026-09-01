import { Prisma } from "@prisma/client";

// Seen in production: "Can't reach database server at `localhost:3306`"
// thrown mid-request, most likely MySQL closing an idle connection
// (wait_timeout) that Prisma's pool didn't yet know was stale, or a brief
// real connectivity blip — not a real query error, and a near-immediate
// retry clears it. P1001/P1002/P1008/P1017 are Prisma's own codes for
// exactly this class of failure (unreachable, timed out, or a connection
// the server already closed); the message-based fallback below catches
// the same failures on Prisma versions/wrappers that don't surface a code.
const RETRYABLE_CODES = new Set(["P1001", "P1002", "P1008", "P1017"]);
const RETRYABLE_MESSAGE = /can't reach database server|server has closed the connection|timed out/i;

function isRetryableDbError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  if (err instanceof Prisma.PrismaClientKnownRequestError && RETRYABLE_CODES.has(err.code)) return true;
  const message = err instanceof Error ? err.message : String(err);
  return RETRYABLE_MESSAGE.test(message);
}

const RETRY_DELAY_MS = 300;

// Wraps a single read-only Prisma operation with one retry on a transient
// connection failure. Only use this around reads (findUnique, findFirst,
// findMany, count, …) — a write retried blindly after a dropped connection
// risks a duplicate if the original write actually reached the database
// and only the response back was lost. Callers pass a thunk, not a bare
// promise, so nothing runs until this decides to (and can run it twice).
export async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (!isRetryableDbError(err)) throw err;
    console.error("withDbRetry: transient DB error, retrying once:", err);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return fn();
  }
}
