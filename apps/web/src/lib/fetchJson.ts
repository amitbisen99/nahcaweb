// Every server-side data fetch in this app (lib/api.ts, lib/adminApi.ts,
// lib/institutions.ts, lib/cms.ts) goes through this. A fetch against our
// own API almost always succeeds quickly — when it doesn't, it's usually a
// cold connection between the Next.js and API processes (or Prisma's pool
// spinning back up after sitting idle) rather than a real outage, and an
// almost-immediate retry clears it. One retry with a short backoff turns
// that into an invisible extra beat instead of a page silently rendering
// as empty with no sign anything went wrong — every caller here treats a
// failed fetch as "no data", not as a visible error.
//
// Retries a genuinely failed *connection* (timeout, DNS, reset) or a 2xx
// response whose body fails to parse (the connection dropped mid-stream —
// the same failure mode fixed for login in auth.ts). Does NOT retry a real
// HTTP error status (401/404/500) — that's a meaningful answer from the
// API, not a transient hiccup, and retrying it can't fix it.
const PRIMARY_TIMEOUT_MS = 10_000;
const RETRY_TIMEOUT_MS = 5_000;
const RETRY_DELAY_MS = 300;

interface FetchJsonOptions extends RequestInit {
  timeoutMs?: number;
  // Status codes that mean "nothing here" rather than "something broke"
  // (e.g. 404 for a sponsorship record that legitimately might not exist)
  // — resolved to null same as any other non-ok status, but without the
  // console.error noise.
  silentStatuses?: number[];
}

export async function fetchJson<T>(url: string, options: FetchJsonOptions = {}): Promise<T | null> {
  const { timeoutMs, silentStatuses, ...init } = options;
  const timeouts = [timeoutMs ?? PRIMARY_TIMEOUT_MS, timeoutMs ?? RETRY_TIMEOUT_MS];

  for (let attempt = 0; attempt < timeouts.length; attempt++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeouts[attempt]) });

      if (silentStatuses?.includes(res.status)) return null;

      if (!res.ok) {
        console.error(`fetchJson ${url} failed: ${res.status} ${res.statusText}`);
        return null;
      }

      return (await res.json()) as T;
    } catch (err) {
      const isLastAttempt = attempt === timeouts.length - 1;
      console.error(
        `fetchJson ${url} threw on attempt ${attempt + 1}/${timeouts.length}${
          isLastAttempt ? ", giving up" : ", retrying"
        }:`,
        err
      );
      if (isLastAttempt) return null;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  return null;
}
