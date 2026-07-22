import { NextResponse } from "next/server";

// Test endpoint for confirming a deployment is wired up correctly. Hit
// GET /api/health — it reports whether the required env vars are present
// and whether this server can actually reach the API backend, without
// leaking any secret values.
export async function GET() {
  const env = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
    API_URL: process.env.API_URL ?? null,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? null,
    AUTH_SECRET: process.env.AUTH_SECRET ? "set" : "MISSING",
  };

  let api: { reachable: boolean; status?: number; db?: unknown; error?: string };

  try {
    const res = await fetch(`${process.env.API_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const body = await res.json().catch(() => null);
    api = { reachable: res.ok, status: res.status, db: body?.db };
  } catch (err) {
    api = { reachable: false, error: err instanceof Error ? err.message : "Unknown fetch error" };
  }

  const ok = Boolean(env.NEXT_PUBLIC_API_URL && env.API_URL && env.AUTH_SECRET === "set" && api.reachable);

  return NextResponse.json({ ok, env, api, timestamp: new Date().toISOString() }, { status: ok ? 200 : 503 });
}
