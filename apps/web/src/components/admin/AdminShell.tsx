"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({
  children,
  email,
  signOutAction,
}: {
  children: ReactNode;
  email?: string | null;
  signOutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-none flex-col bg-ink transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          href="/admin"
          onClick={() => setOpen(false)}
          className="flex-none px-5 py-5 font-heading text-lg font-semibold text-white"
        >
          NAHCA Admin
        </Link>

        <div className="flex-1 overflow-y-auto">
          <AdminSidebar onNavigate={() => setOpen(false)} />
        </div>

        <div className="flex-none border-t border-white/10 p-4">
          <p className="truncate text-xs text-white/50">{email}</p>
          <div className="mt-2 flex flex-col gap-2">
            <Link href="/" className="text-sm font-medium text-white/70 hover:text-white">
              ← Back to Website
            </Link>
            <form action={signOutAction}>
              <button type="submit" className="text-sm font-medium text-white/70 hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-none items-center gap-3 border-b border-ink/10 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open admin menu"
            aria-expanded={open}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-md border border-ink/15"
          >
            <span className="sr-only">Open menu</span>
            <div className="flex flex-col gap-1">
              <span className="block h-0.5 w-4 bg-ink" />
              <span className="block h-0.5 w-4 bg-ink" />
              <span className="block h-0.5 w-4 bg-ink" />
            </div>
          </button>
          <span className="font-heading text-sm font-semibold text-heading">NAHCA Admin</span>
        </div>

        <div className="flex-1 overflow-y-auto bg-sand/20">
          <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
