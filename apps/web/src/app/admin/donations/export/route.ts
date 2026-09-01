import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Proxies the actual .xlsx generation to the API (GET /donations/export —
// see apps/api/src/routes/donations.ts) rather than duplicating it here,
// and rather than linking the browser straight at the API: that route
// needs an admin bearer token, which never gets exposed to the browser —
// same reason every other admin fetch in this app goes through a
// server-side call instead of hitting the API directly from the client.
// Forwards the same email/from/to filters the donations list page uses, so
// the export always matches whatever the admin currently has filtered to.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.apiToken || session.user?.role !== "admin") {
    return new NextResponse("Not authorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const params = new URLSearchParams();
  for (const key of ["email", "from", "to"]) {
    const value = searchParams.get(key);
    if (value) params.set(key, value);
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${process.env.API_URL}/donations/export?${params.toString()}`, {
      headers: { Authorization: `Bearer ${session.apiToken}` },
    });
  } catch (err) {
    console.error("donations export: request failed:", err);
    return new NextResponse("Couldn't reach the server. Please try again.", { status: 502 });
  }

  if (!apiRes.ok) {
    console.error(`donations export: API responded ${apiRes.status}`);
    return new NextResponse("Couldn't generate the export. Please try again.", { status: 502 });
  }

  const buffer = await apiRes.arrayBuffer();
  const contentDisposition = apiRes.headers.get("content-disposition") ?? `attachment; filename="Donations.xlsx"`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": contentDisposition,
    },
  });
}
