// The admin areas a non-super admin can be granted. A super admin implicitly
// has all of them. Keep in sync with apps/web/src/lib/adminPermissions.ts.
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

export const ADMIN_PERMISSION_KEYS = ADMIN_PERMISSIONS.map((p) => p.key) as [AdminPermission, ...AdminPermission[]];

// Reads the stored JSON back as a clean list, ignoring anything that isn't a
// known key (e.g. an area that was later renamed or removed).
export function parsePermissions(value: unknown): AdminPermission[] {
  if (!Array.isArray(value)) return [];
  return ADMIN_PERMISSION_KEYS.filter((key) => value.includes(key));
}
