"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NAV } from "@/lib/nav";

export function MobileNav({
  isAdmin,
  isLoggedIn,
  signOutAction,
}: {
  isAdmin: boolean;
  isLoggedIn: boolean;
  signOutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const panel = (
    <div className="fixed inset-0 top-16 z-40 overflow-y-auto bg-cream px-6 py-6">
      <ul className="flex flex-col gap-1">
        {NAV.map((item) => {
          const href = item.label === "Member Portal" && isAdmin ? "/admin" : item.href;

          return (
            <li key={item.label} className="border-b border-ink/10 py-2">
              {item.children ? (
                <>
                  <button
                    type="button"
                    onClick={() => setExpanded((cur) => (cur === item.label ? null : item.label))}
                    aria-expanded={expanded === item.label}
                    className="flex w-full items-center justify-between py-2 font-heading text-base font-medium text-ink"
                  >
                    {item.label}
                    <span className={`transition-transform ${expanded === item.label ? "rotate-180" : ""}`}>
                      ⌄
                    </span>
                  </button>
                  {expanded === item.label && (
                    <ul className="ml-3 flex flex-col gap-1 pb-2">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.href}
                            target={child.external ? "_blank" : undefined}
                            rel={child.external ? "noopener noreferrer" : undefined}
                            onClick={() => setOpen(false)}
                            className="block py-1.5 text-sm text-ink/70"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block py-2 font-heading text-base font-medium text-ink"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      {isLoggedIn && (
        <form action={signOutAction} className="pt-4">
          <button type="submit" className="text-sm font-medium text-ink/50">
            Sign out
          </button>
        </form>
      )}
    </div>
  );

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 transition-colors group-data-[mode=transparent]/header:border-white/30"
      >
        <span className="sr-only">Toggle menu</span>
        <div className="flex flex-col gap-1.5">
          <span
            className={`block h-0.5 w-5 bg-ink transition-transform group-data-[mode=transparent]/header:bg-white ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 bg-ink transition-opacity group-data-[mode=transparent]/header:bg-white ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 bg-ink transition-transform group-data-[mode=transparent]/header:bg-white ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </div>
      </button>

      {open && createPortal(panel, document.body)}
    </div>
  );
}
