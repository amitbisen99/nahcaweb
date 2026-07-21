"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/portal" },
  { label: "Purchases", href: "/portal/purchases" },
  { label: "News and Updates", href: "/portal/news" },
  { label: "Recommendations", href: "/portal/recommendations" },
  { label: "Resources", href: "/portal/resources" },
  { label: "Invite", href: "/portal/invite" },
  { label: "View/Update Profile", href: "/portal/profile" },
  { label: "Change Password", href: "/portal/password" },
];

function linkClasses(active: boolean) {
  return `whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors lg:whitespace-normal ${
    active ? "bg-brand text-white" : "text-ink/70 hover:bg-sand hover:text-ink"
  }`;
}

export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-xl border border-ink/10 bg-white p-3 lg:flex-col lg:overflow-visible">
      {NAV_ITEMS.map((item) => {
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
