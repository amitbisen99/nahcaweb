import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Proxies the actual .xlsx generation to the API (GET /memberships/export —
// see apps/api/src/routes/memberships.ts) rather than duplicating it here,
// and rather than linking the browser straight at the API: that route
// needs an admin bearer token, which never gets exposed to the browser —
// same pattern as the Donations and Attendees exports.
export async function GET() {
  const session = await auth();
  if (!session?.apiToken || session.user?.role !== "admin") {
    return new NextResponse("Not authorized", { status: 401 });
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${process.env.API_URL}/memberships/export`, {
      headers: { Authorization: `Bearer ${session.apiToken}` },
    });
  } catch (err) {
    console.error("members export: request failed:", err);
    return new NextResponse("Couldn't reach the server. Please try again.", { status: 502 });
  }

  if (!apiRes.ok) {
    console.error(`members export: API responded ${apiRes.status}`);
    return new NextResponse("Couldn't generate the export. Please try again.", { status: 502 });
  }

  const buffer = await apiRes.arrayBuffer();
  const contentDisposition = apiRes.headers.get("content-disposition") ?? `attachment; filename="Members.xlsx"`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": contentDisposition,
    },
  });
}
