// The admin areas a non-super admin can be granted; a super admin has all of
// them. Keep in sync with apps/api/src/lib/adminPermissions.ts.
export const ADMIN_PERMISSIONS = [
  { key: "members", label: "Members" },
  { key: "all_users", label: "All Users" },
  { key: "donations", label: "Donations" },
  { key: "membership_plans", label: "Membership Plans" },
  { key: "coupons", label: "Coupons" },
  { key: "store", label: "Store" },
  { key: "forum_moderation", label: "Forum Moderation" },
  { key: "website_content", label: "Website Content" },
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number]["key"];

export const ADMIN_PERMISSION_KEYS: AdminPermission[] = ADMIN_PERMISSIONS.map((p) => p.key);

export function permissionLabel(key: string): string {
  return ADMIN_PERMISSIONS.find((p) => p.key === key)?.label ?? key;
}

// The signed-in admin's own access, as returned by GET /admin-users/me.
export interface AdminAccess {
  id: number;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  permissions: AdminPermission[];
}
