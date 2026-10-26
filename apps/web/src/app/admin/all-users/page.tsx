import Link from "next/link";
import { auth } from "@/auth";
import { AllUsersFilters, UserKind, allUsersQuery, getAllUsers } from "@/lib/adminUsers";
import { EyeIcon } from "@/components/admin/icons";
import { formatDate } from "@/lib/formatDate";

const PAGE_SIZE = 10;

const KIND_LABELS: Record<UserKind, string> = {
  member: "Member",
  general: "General User",
  newsletter: "Newsletter Signup",
};

const KIND_STYLES: Record<UserKind, string> = {
  member: "bg-brand/10 text-brand-dark",
  general: "bg-forest/10 text-forest",
  newsletter: "bg-ink/10 text-black",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-forest/10 text-forest",
  pending: "bg-brand/10 text-brand-dark",
  expired: "bg-ink/10 text-black",
};

const fieldClass = "rounded-lg border border-ink/20 px-3 py-1.5 text-sm focus:border-brand focus:outline-none";

export default async function AllUsersPage({
  searchParams,
}: {
  searchParams: Promise<AllUsersFilters & { page?: string }>;
}) {
  const { page: pageParam, ...filters } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const session = await auth();
  const { users, total } = session?.apiToken
    ? await getAllUsers(session.apiToken, filters, { page, pageSize: PAGE_SIZE })
    : { users: [], total: 0 };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-medium text-heading">All Users ({total})</h1>
          <p className="mt-1 text-sm text-black">
            Everyone who isn&rsquo;t an admin: members, general users (a free account with no membership) and people
            who only signed up for the newsletter.
          </p>
        </div>
        {users.length > 0 && (
          <Link
            href={`/admin/all-users/export${allUsersQuery(filters)}`}
            className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/5"
          >
            Export as Excel
          </Link>
        )}
      </div>

      <form className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-ink/10 bg-white p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">Search</span>
          <input
            type="text"
            name="search"
            defaultValue={filters.search ?? ""}
            placeholder="Name or email"
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">User type</span>
          <select name="type" defaultValue={filters.type ?? ""} className={fieldClass}>
            <option value="">All types</option>
            <option value="member">Members</option>
            <option value="general">General users</option>
            <option value="newsletter">Newsletter signups only</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">Membership tier</span>
          <select name="tier" defaultValue={filters.tier ?? ""} className={fieldClass}>
            <option value="">Any tier</option>
            <option value="regular">Regular</option>
            <option value="student">Student</option>
            <option value="institutional">Institutional</option>
            <option value="conference">Conference</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">Membership status</span>
          <select name="status" defaultValue={filters.status ?? ""} className={fieldClass}>
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">Newsletter</span>
          <select name="newsletter" defaultValue={filters.newsletter ?? ""} className={fieldClass}>
            <option value="">Any</option>
            <option value="yes">Subscribed</option>
            <option value="no">Not subscribed</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">Joined from</span>
          <input type="date" name="from" defaultValue={filters.from ?? ""} className={fieldClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">Joined to</span>
          <input type="date" name="to" defaultValue={filters.to ?? ""} className={fieldClass} />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Search
        </button>
        {hasFilters && (
          <Link href="/admin/all-users" className="text-sm font-semibold text-black/60 hover:text-black">
            Clear filters
          </Link>
        )}
      </form>

      {users.length === 0 ? (
        <p className="mt-4 text-sm text-black">
          {hasFilters ? "No users match these filters." : "Nobody has signed up yet."}
        </p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand/40 text-xs uppercase tracking-wide text-black">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Membership</th>
                  <th className="px-4 py-3">Newsletter</th>
                  <th className="px-4 py-3">Contact Number</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="sticky right-0 bg-sand/40 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.key} className="border-t border-ink/10 align-top">
                    <td className="px-4 py-3 font-medium text-ink">
                      {u.name ?? "—"}
                      {!u.isActive && (
                        <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-black">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${KIND_STYLES[u.kind]}`}>
                        {KIND_LABELS[u.kind]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-black">
                      {u.tierLabel ? (
                        <div className="flex flex-col items-start gap-1">
                          <span>{u.tierLabel}</span>
                          {u.status && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[u.status] ?? "bg-ink/10 text-black"}`}
                            >
                              {u.status}
                            </span>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-black">{u.newsletter ? "Subscribed" : "—"}</td>
                    <td className="px-4 py-3 text-black">{u.phone ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-black">{formatDate(u.createdAt)}</td>
                    <td className="sticky right-0 border-l border-ink/10 bg-white px-4 py-3">
                      {u.membershipId && (
                        <Link
                          href={`/admin/members/${u.membershipId}`}
                          aria-label="View member"
                          title="View member"
                          className="inline-flex text-black transition-colors hover:text-brand"
                        >
                          <EyeIcon className="h-[18px] w-[18px]" />
                        </Link>
                      )}
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
                  href={`/admin/all-users${allUsersQuery(filters, { page: String(page - 1) })}`}
                  aria-disabled={page <= 1}
                  className={`rounded-lg border border-ink/20 px-3 py-1.5 font-medium ${
                    page <= 1 ? "pointer-events-none text-black/30" : "text-black transition-colors hover:border-brand"
                  }`}
                >
                  ← Previous
                </Link>
                <Link
                  href={`/admin/all-users${allUsersQuery(filters, { page: String(page + 1) })}`}
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
