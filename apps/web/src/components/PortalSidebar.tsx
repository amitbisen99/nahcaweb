"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS_BASE = [
  { label: "Dashboard", href: "/portal" },
  { label: "Purchases", href: "/portal/purchases" },
  { label: "News and Updates", href: "/portal/news" },
  { label: "Conference Videos", href: "/portal/conference-videos" },
  { label: "Recommendations", href: "/portal/recommendations" },
  { label: "Resources", href: "/portal/resources" },
  { label: "Invite", href: "/portal/invite" },
];

const NAV_ITEMS_END = [
  { label: "View/Update Profile", href: "/portal/profile" },
  { label: "Change Password", href: "/portal/password" },
];

// An institution's own login manages/distributes codes — it never redeems
// one itself, so that link is student/member-only. Conversely, only the
// institution's own login gets its dashboard.
const REDEEM_ITEM = { label: "Redeem Institution Code", href: "/portal/redeem" };
const INSTITUTION_ITEM = { label: "Institution Dashboard", href: "/portal/institution" };

function linkClasses(active: boolean) {
  return `whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors lg:whitespace-normal ${
    active ? "bg-brand text-white" : "text-black hover:bg-sand hover:text-ink"
  }`;
}

export function PortalSidebar({ isInstitution = false }: { isInstitution?: boolean }) {
  const pathname = usePathname();
  const items = [
    ...NAV_ITEMS_BASE,
    isInstitution ? INSTITUTION_ITEM : REDEEM_ITEM,
    ...NAV_ITEMS_END,
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-xl border border-ink/10 bg-white p-3 lg:flex-col lg:overflow-visible">
      {items.map((item) => {
        const active = item.href === "/portal" ? pathname === "/portal" : pathname?.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={linkClasses(Boolean(active))}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
