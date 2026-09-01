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

// Seen in production (2026-09-01 pm2 logs): a single 300ms retry was NOT
// enough — the retry itself failed too, with a *different* code (P1001 on
// the first attempt, P1017 "server has closed the connection" 300ms later)
// — direct proof the outage window on that occasion outlasted one retry.
// Three attempts total (two retries, backing off 300ms then 1000ms) gives
// ~1.3s of extra breathing room without making a genuinely-down DB hang a
// request for long.
const RETRY_DELAYS_MS = [300, 1000];

// Wraps a read-only Prisma operation with a couple of retries on a
// transient connection failure. Only use this around reads (findUnique,
// findFirst, findMany, count, …) — a write retried blindly after a dropped
// connection risks a duplicate if the original write actually reached the
// database and only the response back was lost. Callers pass a thunk, not
// a bare promise, so nothing runs until this decides to (and can run it
// more than once).
export async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!isRetryableDbError(err) || attempt >= RETRY_DELAYS_MS.length) throw err;
      console.error(
        `withDbRetry: transient DB error, retrying (${attempt + 1}/${RETRY_DELAYS_MS.length}):`,
        err
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
    }
  }
}
