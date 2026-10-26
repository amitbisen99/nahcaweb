import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminAccess } from "@/lib/adminUsers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Looked up fresh from the API (not the session) so a change a super admin
  // makes to this admin's permissions — or deleting/deactivating them —
  // shows up on their next page load rather than at their next login.
  const access = session?.apiToken ? await getAdminAccess(session.apiToken) : null;
  if (!access) redirect("/login");

  return (
    <AdminShell
      email={session?.user?.email}
      access={access}
      signOutAction={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      {children}
    </AdminShell>
  );
}
