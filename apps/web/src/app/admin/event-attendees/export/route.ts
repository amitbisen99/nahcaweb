import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Proxies GET /event-attendees/export (the admin bearer token never reaches the
// browser), forwarding the filters the Event Attendees page is currently showing.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.apiToken || session.user?.role !== "admin") {
    return new NextResponse("Not authorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const params = new URLSearchParams();
  for (const key of ["q", "eventCode", "status", "type"]) {
    const value = searchParams.get(key);
    if (value) params.set(key, value);
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${process.env.API_URL}/event-attendees/export?${params.toString()}`, {
      headers: { Authorization: `Bearer ${session.apiToken}` },
    });
  } catch (err) {
    console.error("event attendees export: request failed:", err);
    return new NextResponse("Couldn't reach the server. Please try again.", { status: 502 });
  }

  if (!apiRes.ok) {
    console.error(`event attendees export: API responded ${apiRes.status}`);
    return new NextResponse("Couldn't generate the export. Please try again.", { status: 502 });
  }

  return new NextResponse(await apiRes.arrayBuffer(), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": apiRes.headers.get("content-disposition") ?? 'attachment; filename="Event Attendees.xlsx"',
    },
  });
}
