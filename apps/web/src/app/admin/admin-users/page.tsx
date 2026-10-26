import Link from "next/link";
import { auth } from "@/auth";
import { listAdminUsers } from "@/lib/adminUsers";
import { permissionLabel } from "@/lib/adminPermissions";
import { formatDate } from "@/lib/formatDate";

export default async function AdminUsersPage() {
  const session = await auth();
  const admins = session?.apiToken ? await listAdminUsers(session.apiToken) : [];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-medium text-heading">Admin Users ({admins.length})</h1>
          <p className="mt-1 text-sm text-black">
            Super admins can do everything. Other admins can only open the areas you give them.
          </p>
        </div>
        <Link
          href="/admin/admin-users/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + New Admin
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-sand/40 text-xs uppercase tracking-wide text-black">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Access</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-t border-ink/10 align-top">
                <td className="px-4 py-3 font-medium text-ink">{a.name}</td>
                <td className="px-4 py-3 text-black">{a.email}</td>
                <td className="px-4 py-3 text-black">
                  {a.isSuperAdmin ? (
                    <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-dark">
                      Super Admin
                    </span>
                  ) : a.permissions.length === 0 ? (
                    <span className="text-black/60">No areas yet</span>
                  ) : (
                    <span>{a.permissions.map(permissionLabel).join(", ")}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      a.isActive ? "bg-forest/10 text-forest" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {a.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-black">{formatDate(a.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/admin-users/${a.id}`}
                    className="text-sm font-semibold text-brand hover:text-brand-dark"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
