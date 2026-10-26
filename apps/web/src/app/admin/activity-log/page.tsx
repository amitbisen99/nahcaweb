import Link from "next/link";
import { auth } from "@/auth";
import { getActivityLog } from "@/lib/adminUsers";
import { formatDateTime } from "@/lib/formatDate";

const PAGE_SIZE = 25;

export default async function ActivityLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const session = await auth();
  const { entries, total } = session?.apiToken
    ? await getActivityLog(session.apiToken, { page, pageSize: PAGE_SIZE })
    : { entries: [], total: 0 };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Activity Log ({total})</h1>
      <p className="mt-1 text-sm text-black">
        Every add, edit and delete made by any admin, newest first. Entries stay here even if the admin is later
        deleted.
      </p>

      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-black">Nothing has been recorded yet.</p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand/40 text-xs uppercase tracking-wide text-black">
                <tr>
                  <th className="px-4 py-3">Date &amp; Time</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Activity</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-ink/10 align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-black">{formatDateTime(e.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{e.adminName}</p>
                      <p className="text-xs text-black/60">{e.adminEmail}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{e.action}</td>
                    <td className="px-4 py-3 text-black">{e.details ?? "—"}</td>
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
                  href={`/admin/activity-log?page=${page - 1}`}
                  aria-disabled={page <= 1}
                  className={`rounded-lg border border-ink/20 px-3 py-1.5 font-medium ${
                    page <= 1 ? "pointer-events-none text-black/30" : "text-black transition-colors hover:border-brand"
                  }`}
                >
                  ← Previous
                </Link>
                <Link
                  href={`/admin/activity-log?page=${page + 1}`}
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
