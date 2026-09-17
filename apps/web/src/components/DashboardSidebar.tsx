"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Store", href: "/dashboard" },
  { label: "Forum", href: "/dashboard/forum" },
];

function linkClasses(active: boolean) {
  return `whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors lg:whitespace-normal ${
    active ? "bg-brand text-white" : "text-black hover:bg-sand hover:text-ink"
  }`;
}

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-xl border border-ink/10 bg-white p-3 lg:flex-col lg:overflow-visible">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={linkClasses(Boolean(active))}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
