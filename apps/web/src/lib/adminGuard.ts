import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAdminAccess } from "./adminUsers";
import { AdminAccess, AdminPermission } from "./adminPermissions";

// Server-side page guards for the admin panel. The API enforces every
// permission itself — these just keep an admin from landing on a page they
// can't use (it would load empty and every action would be refused).

async function currentAdmin(): Promise<AdminAccess> {
  const session = await auth();
  const access = session?.apiToken ? await getAdminAccess(session.apiToken) : null;
  // Signed out, or no longer an active admin (deleted/deactivated mid-session).
  if (!access) redirect("/login");
  return access;
}

export async function requireAdminArea(permission: AdminPermission): Promise<AdminAccess> {
  const access = await currentAdmin();
  if (!access.permissions.includes(permission)) redirect("/admin?denied=1");
  return access;
}

export async function requireSuperAdminPage(): Promise<AdminAccess> {
  const access = await currentAdmin();
  if (!access.isSuperAdmin) redirect("/admin?denied=1");
  return access;
}
