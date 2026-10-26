import { fetchJson } from "./fetchJson";
import { AdminAccess, AdminPermission } from "./adminPermissions";

function authed(token: string): RequestInit {
  return { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" };
}

// ---- All Users (members, general users, newsletter signups) ----

export type UserKind = "member" | "general" | "newsletter";

export interface AllUserRow {
  key: string;
  kind: UserKind;
  name: string | null;
  email: string;
  tier: string | null;
  tierLabel: string | null;
  status: string | null;
  membershipId: number | null;
  newsletter: boolean;
  phone: string | null;
  address: string;
  isActive: boolean;
  createdAt: string;
}

// Query-string filters shared by the page, the export link and the API.
export interface AllUsersFilters {
  search?: string;
  type?: string;
  tier?: string;
  status?: string;
  newsletter?: string;
  from?: string;
  to?: string;
}

export function allUsersQuery(filters: AllUsersFilters, extra: Record<string, string> = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...filters, ...extra })) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getAllUsers(
  token: string,
  filters: AllUsersFilters,
  opts: { page?: number; pageSize?: number } = {}
): Promise<{ users: AllUserRow[]; total: number }> {
  const query = allUsersQuery(filters, {
    page: String(opts.page ?? 1),
    pageSize: String(opts.pageSize ?? 10),
  });
  const data = await fetchJson<{ users: AllUserRow[]; total: number }>(
    `${process.env.API_URL}/users/all${query}`,
    authed(token)
  );
  return data ?? { users: [], total: 0 };
}

// ---- Admin accounts ----

// null when the account is no longer an active admin (e.g. it was deleted or
// deactivated since this session started).
export async function getAdminAccess(token: string): Promise<AdminAccess | null> {
  const data = await fetchJson<{ admin: AdminAccess }>(`${process.env.API_URL}/admin-users/me`, {
    ...authed(token),
    silentStatuses: [401, 403],
  });
  return data?.admin ?? null;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  permissions: AdminPermission[];
  createdAt: string;
}

export async function listAdminUsers(token: string): Promise<AdminUser[]> {
  const data = await fetchJson<{ admins: AdminUser[] }>(`${process.env.API_URL}/admin-users`, authed(token));
  return data?.admins ?? [];
}

// ---- Activity log ----

export interface ActivityLogEntry {
  id: number;
  adminId: number | null;
  adminName: string;
  adminEmail: string;
  action: string;
  details: string | null;
  createdAt: string;
}

export async function getActivityLog(
  token: string,
  opts: { page?: number; pageSize?: number } = {}
): Promise<{ entries: ActivityLogEntry[]; total: number }> {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 25;
  const data = await fetchJson<{ entries: ActivityLogEntry[]; total: number }>(
    `${process.env.API_URL}/activity-log?page=${page}&pageSize=${pageSize}`,
    authed(token)
  );
  return data ?? { entries: [], total: 0 };
}
