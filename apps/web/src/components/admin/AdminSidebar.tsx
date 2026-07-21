"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CONTENT_TYPES } from "@/lib/contentTypes";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Members", href: "/admin/members" },
  { label: "Membership Plans", href: "/admin/membership-plans" },
];

function linkClasses(active: boolean) {
  return `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    active ? "bg-brand text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
  }`;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const isOnContentPage = pathname?.startsWith("/admin/content") ?? false;
  const [expanded, setExpanded] = useState(isOnContentPage);

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
    </nav>
  );
}
