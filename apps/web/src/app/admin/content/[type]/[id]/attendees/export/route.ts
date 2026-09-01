import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { CONTENT_TYPES, ContentTypeKey } from "@/lib/contentTypes";
import { getContentItem } from "@/lib/adminApi";

// Proxies the actual .xlsx generation to the API (GET
// /event-registrations/export — see apps/api/src/routes/
// eventRegistrations.ts) rather than duplicating it here, and rather than
// linking the browser straight at the API: the API route needs an admin
// bearer token, which never gets exposed to the browser (same reason every
// other admin fetch in this app goes through a server-side lib/adminApi
// call instead of hitting the API directly from the client).
export async function GET(_req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  const config = CONTENT_TYPES[type as ContentTypeKey];
  if (!config || (type !== "events" && type !== "webinars")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const session = await auth();
  if (!session?.apiToken || session.user?.role !== "admin") {
    return new NextResponse("Not authorized", { status: 401 });
  }

  const item = await getContentItem(config.key, id, session.apiToken);
  if (!item) return new NextResponse("Not found", { status: 404 });

  const eventCode = String(item.eventCode ?? "");
  if (!eventCode) return new NextResponse("Not found", { status: 404 });

  let apiRes: Response;
  try {
    apiRes = await fetch(
      `${process.env.API_URL}/event-registrations/export?eventCode=${encodeURIComponent(eventCode)}`,
      { headers: { Authorization: `Bearer ${session.apiToken}` } }
    );
  } catch (err) {
    console.error(`attendees export ${eventCode}: request failed:`, err);
    return new NextResponse("Couldn't reach the server. Please try again.", { status: 502 });
  }

  if (!apiRes.ok) {
    console.error(`attendees export ${eventCode}: API responded ${apiRes.status}`);
    return new NextResponse("Couldn't generate the export. Please try again.", { status: 502 });
  }

  const buffer = await apiRes.arrayBuffer();
  const contentDisposition = apiRes.headers.get("content-disposition") ?? `attachment; filename="attendees.xlsx"`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": contentDisposition,
    },
  });
}
