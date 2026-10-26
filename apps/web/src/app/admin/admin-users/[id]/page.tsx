import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { listAdminUsers } from "@/lib/adminUsers";
import { AdminUserForm } from "@/components/admin/AdminUserForm";
import { ResetAdminPasswordForm } from "@/components/admin/ResetAdminPasswordForm";
import { DeleteAdminButton } from "@/components/admin/DeleteAdminButton";
import { updateAdminUser } from "../actions";

export default async function ManageAdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminId = Number(id);
  if (!Number.isInteger(adminId)) notFound();

  const session = await auth();
  const admins = session?.apiToken ? await listAdminUsers(session.apiToken) : [];
  const admin = admins.find((a) => a.id === adminId);
  if (!admin) notFound();

  const isSelf = session?.user?.email === admin.email;
  const action = updateAdminUser.bind(null, adminId);

  return (
    <div>
      <Link href="/admin/admin-users" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Admin Users
      </Link>
      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">{admin.name}</h1>

      <div className="mt-6 flex max-w-2xl flex-col gap-10">
        <AdminUserForm admin={admin} action={action} isSelf={isSelf} />

        <section className="border-t border-ink/10 pt-6">
          <h2 className="font-heading text-lg font-medium text-heading">Reset password</h2>
          <div className="mt-3">
            <ResetAdminPasswordForm adminId={adminId} />
          </div>
        </section>

        {!isSelf && (
          <section className="border-t border-ink/10 pt-6">
            <h2 className="font-heading text-lg font-medium text-heading">Delete admin</h2>
            <p className="mt-1 text-sm text-black">
              Removes this admin&rsquo;s account. Their entries in the Activity Log stay.
            </p>
            <div className="mt-3">
              <DeleteAdminButton adminId={adminId} name={admin.name} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
