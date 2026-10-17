import Link from "next/link";
import { auth } from "@/auth";
import { getGeneralUsers } from "@/lib/adminUsers";
import { formatDate } from "@/lib/formatDate";

const PAGE_SIZE = 10;

export default async function GeneralUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const session = await auth();
  const { users, total } = session?.apiToken
    ? await getGeneralUsers(session.apiToken, { page, pageSize: PAGE_SIZE })
    : { users: [], total: 0 };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">General Users ({total})</h1>
      <p className="mt-1 text-sm text-black">
        Free accounts with no membership — they can use the Store and the Forum, but not the Member Portal.
      </p>

      {users.length === 0 ? (
        <p className="mt-4 text-sm text-black">No general users have signed up yet.</p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand/40 text-xs uppercase tracking-wide text-black">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Store Orders</th>
                  <th className="px-4 py-3">Forum Topics</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-ink/10">
                    <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                    <td className="px-4 py-3 text-black">{u.email}</td>
                    <td className="px-4 py-3 text-black">{u._count.productOrders}</td>
                    <td className="px-4 py-3 text-black">{u._count.forumTopics}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          u.isActive ? "bg-forest/10 text-forest" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-black">{formatDate(u.createdAt)}</td>
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
                  href={`/admin/general-users?page=${page - 1}`}
                  aria-disabled={page <= 1}
                  className={`rounded-lg border border-ink/20 px-3 py-1.5 font-medium ${
                    page <= 1 ? "pointer-events-none text-black/30" : "text-black transition-colors hover:border-brand"
                  }`}
                >
                  ← Previous
                </Link>
                <Link
                  href={`/admin/general-users?page=${page + 1}`}
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
