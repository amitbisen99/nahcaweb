import Link from "next/link";
import { auth } from "@/auth";
import { getAllMemberships } from "@/lib/api";
import { PencilIcon } from "@/components/admin/icons";

const TIER_LABELS: Record<string, string> = {
  regular: "Regular",
  student: "Student",
  institutional: "Institutional",
  conference: "Conference",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-forest/10 text-forest",
  pending: "bg-brand/10 text-brand-dark",
  expired: "bg-ink/10 text-black",
};

export default async function MembersPage() {
  const session = await auth();
  const memberships = session?.apiToken ? await getAllMemberships(session.apiToken) : [];

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">
        Members ({memberships.length})
      </h1>
      <p className="mt-1 text-sm text-black">
        Every registered member and their membership status, price, and join date.
      </p>

      {memberships.length === 0 ? (
        <p className="mt-4 text-sm text-black">No memberships have been created yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand/40 text-xs uppercase tracking-wide text-black">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Joined</th>
                <th className="sticky right-0 bg-sand/40 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((m) => (
                <tr key={m.id} className="border-t border-ink/10">
                  <td className="px-4 py-3 font-medium text-ink">{m.user.name}</td>
                  <td className="px-4 py-3 text-black">{m.user.email}</td>
                  <td className="px-4 py-3 text-black">{TIER_LABELS[m.type] ?? m.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[m.status] ?? "bg-ink/10 text-black"}`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-black">${(m.priceCents / 100).toFixed(2)}</td>
                  <td className="px-4 py-3 text-black">{new Date(m.createdAt).toDateString()}</td>
                  <td className="sticky right-0 border-l border-ink/10 bg-white px-4 py-3">
                    <Link
                      href={`/admin/members/${m.id}`}
                      aria-label="View/update profile"
                      title="View/update profile"
                      className="inline-flex text-black transition-colors hover:text-brand"
                    >
                      <PencilIcon className="h-[18px] w-[18px]" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-10 text-sm text-black">
        Collections and upcoming-renewals reports will be built out in a follow-up phase.
      </p>
    </div>
  );
}
