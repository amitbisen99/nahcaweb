"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct, setProductPublished } from "@/app/admin/store/actions";
import { StoreProduct } from "@/lib/store";

// Same startTransition + router.refresh() pattern as ForumTopicAdminPanel —
// calling a Server Action directly from a plain onClick (not a <form>)
// needs a transition, or a revalidatePath() inside the action can throw
// instead of just refreshing data.
export function ProductRowActions({ product }: { product: StoreProduct }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.error) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch (err) {
        console.error("Product admin action failed:", err);
        setError("Something went wrong. Please try again.");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${product.title}"? This can't be undone.`)) return;
    run(() => deleteProduct(product.id));
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => setProductPublished(product.id, !product.published))}
          className="rounded-lg border border-ink/20 px-3 py-1.5 text-xs font-semibold text-black hover:border-brand disabled:opacity-50"
        >
          {product.published ? "Unpublish" : "Publish"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
