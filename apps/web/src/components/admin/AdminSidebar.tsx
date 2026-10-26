"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CONTENT_TYPES } from "@/lib/contentTypes";
import { AdminAccess, AdminPermission } from "@/lib/adminPermissions";

// `permission` ties an item to an area an admin can be granted; the
// Dashboard has none because every admin gets it.
const NAV_ITEMS: { label: string; href: string; permission?: AdminPermission }[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Members", href: "/admin/members", permission: "members" },
  { label: "All Users", href: "/admin/all-users", permission: "all_users" },
  { label: "Donations", href: "/admin/donations", permission: "donations" },
  { label: "Membership Plans", href: "/admin/membership-plans", permission: "membership_plans" },
  { label: "Coupons", href: "/admin/coupons", permission: "coupons" },
  { label: "Store", href: "/admin/store", permission: "store" },
  { label: "Forum Moderation", href: "/admin/forum", permission: "forum_moderation" },
];

// Only a super admin gets these.
const SUPER_ADMIN_ITEMS = [
  { label: "Admin Users", href: "/admin/admin-users" },
  { label: "Activity Log", href: "/admin/activity-log" },
];

function linkClasses(active: boolean) {
  return `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    active ? "bg-brand text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
  }`;
}

export function AdminSidebar({ access, onNavigate }: { access: AdminAccess; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isOnContentPage = pathname?.startsWith("/admin/content") ?? false;
  const [expanded, setExpanded] = useState(isOnContentPage);

  const visibleItems = NAV_ITEMS.filter((item) => !item.permission || access.permissions.includes(item.permission));
  const canSeeContent = access.permissions.includes("website_content");

  return (
    <nav className="flex flex-col gap-1 p-4">
      {visibleItems.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} className={linkClasses(Boolean(active))}>
            {item.label}
          </Link>
        );
      })}

      {canSeeContent && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className={`flex w-full items-center justify-between ${linkClasses(isOnContentPage && !expanded)}`}
          >
            Website Content
            <span className={`transition-transform ${expanded ? "rotate-180" : ""}`}>⌄</span>
          </button>

          {expanded && (
            <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-white/10 pl-3">
              {Object.values(CONTENT_TYPES).map((config) => {
                const href = `/admin/content/${config.key}`;
                const active = pathname?.startsWith(href);
                return (
                  <Link
                    key={config.key}
                    href={href}
                    onClick={onNavigate}
                    className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      active ? "bg-brand text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {config.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {access.isSuperAdmin && (
        <div className="mt-2 flex flex-col gap-1 border-t border-white/10 pt-3">
          {SUPER_ADMIN_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={linkClasses(Boolean(pathname?.startsWith(item.href)))}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
