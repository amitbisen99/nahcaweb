import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { CONTENT_TYPES, ContentTypeKey } from "@/lib/contentTypes";
import { getContentItem, listEventRegistrations } from "@/lib/adminApi";

const PAGE_SIZE = 10;

function buildQuery(page: number) {
  return page > 1 ? `?page=${page}` : "";
}

export default async function EventAttendeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { type, id } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const config = CONTENT_TYPES[type as ContentTypeKey];
  if (!config || (type !== "events" && type !== "webinars")) notFound();

  const session = await auth();
  const token = session?.apiToken ?? "";

  const item = await getContentItem(config.key, id, token);
  if (!item) notFound();

  const eventCode = String(item.eventCode ?? "");
  const { registrations, total } = eventCode
    ? await listEventRegistrations(eventCode, token, { page, pageSize: PAGE_SIZE })
    : { registrations: [], total: 0 };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <Link
        href={`/admin/content/${config.key}`}
        className="text-sm font-semibold text-brand hover:text-brand-dark"
      >
        ← {config.label}
      </Link>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-medium text-heading">
          Attendees — {String(item[config.titleField])} ({total})
        </h1>
        {eventCode && (
          <div className="flex gap-2">
            <Link
              href={`/admin/content/${config.key}/${id}/attendees/export`}
              className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/5"
            >
              Export as Excel
            </Link>
            <Link
              href={`/admin/content/${config.key}/${id}/attendees/send-email`}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Send Receipt Email
            </Link>
          </div>
        )}
      </div>
      {eventCode && (
        <p className="mt-1 font-mono text-xs text-black/60">{eventCode}</p>
      )}

      {registrations.length === 0 ? (
        <p className="mt-6 text-sm text-black">No one has joined this {config.singularLabel.toLowerCase()} yet.</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand/40 text-xs uppercase tracking-wide text-black">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Mobile No.</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount paid</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <tr key={r.id} className="border-t border-ink/10">
                    <td className="px-4 py-3 font-medium text-ink">{r.user?.name ?? r.name ?? "—"}</td>
                    <td className="px-4 py-3 text-black">{r.user?.email ?? r.email ?? "—"}</td>
                    <td className="px-4 py-3 text-black">{r.user?.profile?.phone ?? r.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-black">{r.user ? "Member" : "Guest"}</td>
                    <td className="px-4 py-3 text-black">
                      {r.payment ? `$${(r.payment.amountCents / 100).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-black">{new Date(r.createdAt).toDateString()}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/content/${config.key}/${id}/attendees/${r.id}`}
                        className="text-sm font-semibold text-brand hover:text-brand-dark"
                      >
                        View more →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-black">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/admin/content/${config.key}/${id}/attendees${buildQuery(page - 1)}`}
                  aria-disabled={page <= 1}
                  className={`rounded-lg border border-ink/20 px-3 py-1.5 font-medium ${
                    page <= 1
                      ? "pointer-events-none text-black/30"
                      : "text-black transition-colors hover:border-brand"
                  }`}
                >
                  ← Previous
                </Link>
                <Link
                  href={`/admin/content/${config.key}/${id}/attendees${buildQuery(page + 1)}`}
                  aria-disabled={page >= totalPages}
                  className={`rounded-lg border border-ink/20 px-3 py-1.5 font-medium ${
                    page >= totalPages
                      ? "pointer-events-none text-black/30"
                      : "text-black transition-colors hover:border-brand"
                  }`}
                >
                  Next →
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
