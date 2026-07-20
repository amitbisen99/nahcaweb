import Link from "next/link";
import { Container } from "@/components/Container";
import { auth } from "@/auth";
import { getAllMemberships } from "@/lib/api";

const TIER_LABELS: Record<string, string> = {
  regular: "Regular",
  student: "Student",
  institutional: "Institutional",
  conference: "Conference",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-forest/10 text-forest",
  pending: "bg-brand/10 text-brand-dark",
  expired: "bg-ink/10 text-ink/60",
};

export default async function AdminPage() {
  const session = await auth();
  const memberships = session?.apiToken ? await getAllMemberships(session.apiToken) : [];

  return (
    <Container>
      <div className="py-16">
        <h1 className="font-heading text-3xl font-medium text-heading">Admin Dashboard</h1>
        <p className="mt-2 text-ink/70">Signed in as {session?.user?.name} (admin).</p>

        <Link
          href="/admin/content"
          className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-brand px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Manage Website Content →
        </Link>

        <h2 className="mt-10 font-heading text-xl font-medium text-heading">
          All Members ({memberships.length})
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          This list is only visible to admin accounts — regular members only see their own
          membership on the Member Portal.
        </p>

        {memberships.length === 0 ? (
          <p className="mt-4 text-sm text-ink/60">No memberships have been created yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand/40 text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {memberships.map((m) => (
                  <tr key={m.id} className="border-t border-ink/10">
                    <td className="px-4 py-3 font-medium text-ink">{m.user.name}</td>
                    <td className="px-4 py-3 text-ink/70">{m.user.email}</td>
                    <td className="px-4 py-3 text-ink/70">{TIER_LABELS[m.type] ?? m.type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[m.status] ?? "bg-ink/10 text-ink/60"}`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink/70">${(m.priceCents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-ink/70">
                      {new Date(m.createdAt).toDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-10 text-sm text-ink/40">
          Collections and upcoming-renewals reports will be built out in a follow-up phase.
        </p>
      </div>
    </Container>
  );
}
