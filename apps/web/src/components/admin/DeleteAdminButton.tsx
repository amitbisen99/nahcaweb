"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAdminUser } from "@/app/admin/admin-users/actions";

// Same startTransition pattern as the Store's row actions — a Server Action
// called straight from a click handler (not a <form>) goes through a
// transition so a failure shows as a message instead of crashing the page.
export function DeleteAdminButton({ adminId, name }: { adminId: number; name: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!window.confirm(`Delete the admin "${name}"? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteAdminUser(adminId);
        if (result.error) {
          setError(result.error);
          return;
        }
        router.push("/admin/admin-users");
        router.refresh();
      } catch (err) {
        console.error("Delete admin failed:", err);
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="self-start rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {isPending ? "Deleting…" : "Delete this admin"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
