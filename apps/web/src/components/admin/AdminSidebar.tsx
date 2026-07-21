"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CONTENT_TYPES } from "@/lib/contentTypes";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Members", href: "/admin/members" },
];

function linkClasses(active: boolean) {
  return `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    active ? "bg-brand text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
  }`;
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-4">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={linkClasses(Boolean(active))}>
            {item.label}
          </Link>
        );
      })}

      <div className="mt-2">
        <Link
          href="/admin/content"
          className={linkClasses(pathname === "/admin/content")}
        >
          Website Content
        </Link>
        <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-white/10 pl-3">
          {Object.values(CONTENT_TYPES).map((config) => {
            const href = `/admin/content/${config.key}`;
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={config.key}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  active ? "bg-brand text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {config.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
