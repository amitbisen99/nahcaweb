"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteResource } from "@/app/admin/content/resources/actions";
import { PencilIcon, TrashIcon } from "./icons";

export function ResourceRowActions({ id, title }: { id: number; title: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteResource(String(id));
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/content/resources/${id}`}
          aria-label="Edit"
          title="Edit"
          className="text-black transition-colors hover:text-brand"
        >
          <PencilIcon className="h-[18px] w-[18px]" />
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          aria-label="Delete"
          title="Delete"
          className="text-black transition-colors hover:text-red-600 disabled:opacity-50"
        >
          <TrashIcon className="h-[18px] w-[18px]" />
        </button>
      </div>
      {error && <p className="max-w-xs text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}
