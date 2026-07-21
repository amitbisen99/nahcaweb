import Link from "next/link";
import { auth } from "@/auth";
import { getAllMemberships } from "@/lib/api";
import { CONTENT_TYPES } from "@/lib/contentTypes";
import { listContent } from "@/lib/adminApi";

export default async function AdminDashboardPage() {
  const session = await auth();
  const token = session?.apiToken ?? "";

  const [memberships, contentCounts] = await Promise.all([
    getAllMemberships(token),
    Promise.all(
      Object.values(CONTENT_TYPES).map(async (config) => {
        const items = await listContent(config.key, token);
        return items.length;
      })
    ),
  ]);

  const activeMembers = memberships.filter((m) => m.status === "active").length;
  const totalContentItems = contentCounts.reduce((sum, n) => sum + n, 0);

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Dashboard</h1>
      <p className="mt-2 text-ink/70">Signed in as {session?.user?.name}.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/members"
          className="rounded-xl border border-ink/10 bg-white p-6 transition-colors hover:border-brand/40"
        >
          <p className="text-sm font-medium text-ink/60">Total Members</p>
          <p className="mt-1 font-heading text-3xl font-bold text-heading">{memberships.length}</p>
        </Link>
        <Link
          href="/admin/members"
          className="rounded-xl border border-ink/10 bg-white p-6 transition-colors hover:border-brand/40"
        >
          <p className="text-sm font-medium text-ink/60">Active Memberships</p>
          <p className="mt-1 font-heading text-3xl font-bold text-heading">{activeMembers}</p>
        </Link>
        <Link
          href="/admin/content"
          className="rounded-xl border border-ink/10 bg-white p-6 transition-colors hover:border-brand/40"
        >
          <p className="text-sm font-medium text-ink/60">Content Items</p>
          <p className="mt-1 font-heading text-3xl font-bold text-heading">{totalContentItems}</p>
        </Link>
      </div>

      <p className="mt-10 text-sm text-ink/40">
        Collections and upcoming-renewals reports will be built out in a follow-up phase.
      </p>
    </div>
  );
}
