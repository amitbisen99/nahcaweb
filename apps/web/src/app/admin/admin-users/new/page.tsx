import Link from "next/link";
import { AdminUserForm } from "@/components/admin/AdminUserForm";
import { createAdminUser } from "../actions";

export default function NewAdminUserPage() {
  return (
    <div>
      <Link href="/admin/admin-users" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Admin Users
      </Link>
      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">New Admin</h1>
      <div className="mt-6 max-w-2xl">
        <AdminUserForm action={createAdminUser} />
      </div>
    </div>
  );
}
