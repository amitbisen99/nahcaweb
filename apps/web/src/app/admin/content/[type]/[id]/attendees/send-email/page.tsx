import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { CONTENT_TYPES, ContentTypeKey } from "@/lib/contentTypes";
import { getContentItem, listEventRegistrations, getReceiptEmailLogs } from "@/lib/adminApi";
import { SendReceiptEmailForm } from "./SendReceiptEmailForm";

export default async function SendReceiptEmailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  const config = CONTENT_TYPES[type as ContentTypeKey];
  if (!config || (type !== "events" && type !== "webinars")) notFound();

  const session = await auth();
  const token = session?.apiToken ?? "";

  const item = await getContentItem(config.key, id, token);
  if (!item) notFound();

  const eventCode = String(item.eventCode ?? "");
  if (!eventCode) notFound();

  const [{ total: activeCount }, logs] = await Promise.all([
    listEventRegistrations(eventCode, token, { status: "active", pageSize: 1 }),
    getReceiptEmailLogs(eventCode, token),
  ]);

  return (
    <div className="max-w-2xl">
      <Link
        href={`/admin/content/${config.key}/${id}/attendees`}
        className="text-sm font-semibold text-brand hover:text-brand-dark"
      >
        ← Attendees
      </Link>
      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">
        Send Receipt Email — {String(item[config.titleField])}
      </h1>
      <p className="mt-2 text-sm text-black">
        This will be sent to every active attendee — currently{" "}
        <span className="font-semibold text-heading">{activeCount}</span>{" "}
        {activeCount === 1 ? "attendee" : "attendees"}. Pending (unpaid/incomplete) registrations are not included.
      </p>

      <div className="mt-8">
        <SendReceiptEmailForm eventCode={eventCode} activeCount={activeCount} />
      </div>

      {logs.length > 0 && (
        <div className="mt-10">
          <h2 className="font-heading text-lg font-medium text-heading">Previously sent</h2>
          <div className="mt-3 flex flex-col gap-2">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg border border-ink/10 bg-white p-3 text-sm">
                <p className="font-medium text-ink">{log.subject}</p>
                <p className="mt-0.5 text-xs text-black/60">
                  {new Date(log.createdAt).toLocaleString()} · by {log.sentByEmail} · sent to {log.sentCount}
                  {log.failedCount > 0 ? `, ${log.failedCount} failed` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
