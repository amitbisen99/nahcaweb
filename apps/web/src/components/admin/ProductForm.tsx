"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Button } from "@/components/Button";
import { ProductFormState } from "@/app/admin/store/actions";
import { StoreProduct } from "@/lib/store";

const initialState: ProductFormState = {};

export function ProductForm({
  product,
  action,
}: {
  product?: StoreProduct;
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [type, setType] = useState<"video" | "file">(product?.type ?? "video");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Type</span>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as "video" | "file")}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        >
          <option value="video">Video (Vimeo or YouTube link)</option>
          <option value="file">File (uploaded, downloadable after purchase)</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Title</span>
        <input
          type="text"
          name="title"
          required
          defaultValue={product?.title}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Description</span>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={product?.description}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Price (USD)</span>
        <input
          type="number"
          name="price"
          min={0.01}
          step={0.01}
          required
          defaultValue={product ? (product.priceCents / 100).toFixed(2) : undefined}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      {type === "video" ? (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-black">Video URL</span>
          <input
            type="url"
            name="videoUrl"
            placeholder="https://vimeo.com/... or https://youtube.com/watch?v=..."
            defaultValue={product?.videoUrl ?? ""}
            className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
          />
          <span className="text-xs text-black/60">
            Buyers only ever see an embedded player — never this link itself.
          </span>
        </label>
      ) : (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-black">File</span>
          <input
            type="file"
            name="file"
            className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
          />
          <span className="text-xs text-black/60">
            {product?.fileUrl
              ? "A file is already uploaded — choose a new one only to replace it."
              : "Any file type, up to 50MB."}
          </span>
        </label>
      )}

      <label className="flex items-center gap-2 text-sm font-medium text-black">
        <input type="checkbox" name="published" defaultChecked={product?.published ?? false} />
        Published (visible and purchasable in the Store)
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" variant="solid" className="self-start" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
