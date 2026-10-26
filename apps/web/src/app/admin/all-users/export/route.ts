import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Proxies the .xlsx generation to the API (GET /users/all/export — see
// apps/api/src/routes/users.ts) because that route needs an admin bearer
// token, which never gets exposed to the browser. Forwards the same filters
// the All Users page is showing, so the export matches what's on screen —
// same pattern as the Donations export.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.apiToken || session.user?.role !== "admin") {
    return new NextResponse("Not authorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const params = new URLSearchParams();
  for (const key of ["search", "type", "tier", "status", "newsletter", "from", "to"]) {
    const value = searchParams.get(key);
    if (value) params.set(key, value);
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${process.env.API_URL}/users/all/export?${params.toString()}`, {
      headers: { Authorization: `Bearer ${session.apiToken}` },
    });
  } catch (err) {
    console.error("all users export: request failed:", err);
    return new NextResponse("Couldn't reach the server. Please try again.", { status: 502 });
  }

  if (apiRes.status === 403) {
    return new NextResponse("You don't have permission to export this.", { status: 403 });
  }
  if (!apiRes.ok) {
    console.error(`all users export: API responded ${apiRes.status}`);
    return new NextResponse("Couldn't generate the export. Please try again.", { status: 502 });
  }

  const buffer = await apiRes.arrayBuffer();
  const contentDisposition = apiRes.headers.get("content-disposition") ?? `attachment; filename="All-Users.xlsx"`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": contentDisposition,
    },
  });
}
