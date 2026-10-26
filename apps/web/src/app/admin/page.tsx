import Link from "next/link";
import { auth } from "@/auth";
import { getAllMemberships } from "@/lib/api";
import { CONTENT_TYPES } from "@/lib/contentTypes";
import { listContent } from "@/lib/adminApi";
import { getAdminAccess } from "@/lib/adminUsers";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { denied } = await searchParams;
  const session = await auth();
  const token = session?.apiToken ?? "";
  const access = await getAdminAccess(token);

  // Each card needs its own area's permission to read its number, so only
  // fetch (and show) the ones this admin has been granted.
  const canSeeMembers = access?.permissions.includes("members") ?? false;
  const canSeeContent = access?.permissions.includes("website_content") ?? false;

  // pageSize: 1 — only the `total` count is needed here, not the rows.
  const [allMemberships, activeMemberships, contentCounts] = await Promise.all([
    canSeeMembers ? getAllMemberships(token, { pageSize: 1 }) : null,
    canSeeMembers ? getAllMemberships(token, { pageSize: 1, status: "active" }) : null,
    canSeeContent
      ? Promise.all(
          Object.values(CONTENT_TYPES).map(async (config) => {
            const items = await listContent(config.key, token);
            return items.length;
          })
        )
      : null,
  ]);

  const totalContentItems = contentCounts?.reduce((sum, n) => sum + n, 0) ?? 0;
  const hasAnyCard = canSeeMembers || canSeeContent;

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Dashboard</h1>
      <p className="mt-2 text-black">Signed in as {session?.user?.name}.</p>

      {denied && (
        <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-black">
          You don&rsquo;t have access to that part of the admin panel. Ask a super admin if you need it.
        </p>
      )}

      {hasAnyCard ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {canSeeMembers && allMemberships && activeMemberships && (
            <>
              <Link
                href="/admin/members"
                className="rounded-xl border border-ink/10 bg-white p-6 transition-colors hover:border-brand/40"
              >
                <p className="text-sm font-medium text-black">Total Members</p>
                <p className="mt-1 font-heading text-3xl font-bold text-heading">{allMemberships.total}</p>
              </Link>
              <Link
                href="/admin/members"
                className="rounded-xl border border-ink/10 bg-white p-6 transition-colors hover:border-brand/40"
              >
                <p className="text-sm font-medium text-black">Active Memberships</p>
                <p className="mt-1 font-heading text-3xl font-bold text-heading">{activeMemberships.total}</p>
              </Link>
            </>
          )}
          {canSeeContent && (
            <Link
              href="/admin/content"
              className="rounded-xl border border-ink/10 bg-white p-6 transition-colors hover:border-brand/40"
            >
              <p className="text-sm font-medium text-black">Content Items</p>
              <p className="mt-1 font-heading text-3xl font-bold text-heading">{totalContentItems}</p>
            </Link>
          )}
        </div>
      ) : (
        <p className="mt-8 text-sm text-black">Use the menu on the left to open the areas you have access to.</p>
      )}

      <p className="mt-10 text-sm text-black">
        Collections and upcoming-renewals reports will be built out in a follow-up phase.
      </p>
    </div>
  );
}
