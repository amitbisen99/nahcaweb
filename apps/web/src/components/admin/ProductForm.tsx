"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { Button } from "@/components/Button";
import { RichTextField } from "@/components/admin/RichTextField";
import { ProductFormState, uploadProductFile, uploadProductThumbnail } from "@/app/admin/store/actions";
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
  const [fileUrl, setFileUrl] = useState(product?.fileUrl ?? "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();

  const [thumbnailUrl, setThumbnailUrl] = useState(product?.thumbnailUrl ?? "");
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isUploadingThumbnail, startThumbnailUpload] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);

    startUpload(async () => {
      try {
        const result = await uploadProductFile({}, formData);
        if (result.error) {
          setUploadError(result.error);
          return;
        }
        setFileUrl(result.url ?? "");
        setFileName(file.name);
      } catch (err) {
        console.error("File upload failed:", err);
        setUploadError("Something went wrong uploading that file. Please try again.");
      }
    });
  }

  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailError(null);
    const formData = new FormData();
    formData.append("file", file);

    startThumbnailUpload(async () => {
      try {
        const result = await uploadProductThumbnail({}, formData);
        if (result.error) {
          setThumbnailError(result.error);
          return;
        }
        setThumbnailUrl(result.url ?? "");
      } catch (err) {
        console.error("Thumbnail upload failed:", err);
        setThumbnailError("Something went wrong uploading that image. Please try again.");
      }
    });
  }

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

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Thumbnail Image (optional)</span>
        <span className="text-xs text-black/60">
          Recommended: 1280×720px (16:9), JPG/PNG/WebP, up to 10MB. If you don&rsquo;t upload one, a video gets a
          thumbnail pulled from its link automatically; a file gets a generic file icon.
        </span>
        {thumbnailUrl && (
          <div className="mt-1 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl.startsWith("http") ? thumbnailUrl : `${process.env.NEXT_PUBLIC_API_URL}${thumbnailUrl}`}
              alt=""
              className="h-20 w-32 rounded-lg border border-ink/10 object-cover"
            />
            <button
              type="button"
              onClick={() => setThumbnailUrl("")}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleThumbnailChange}
          disabled={isUploadingThumbnail}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
        <input type="hidden" name="thumbnailUrl" value={thumbnailUrl} />
        {isUploadingThumbnail && <span className="text-xs text-black/60">Uploading…</span>}
        {!isUploadingThumbnail && thumbnailError && <span className="text-xs text-red-600">{thumbnailError}</span>}
      </div>

      <RichTextField name="description" label="Description" currentValue={product?.description} />

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
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-black">File</span>
          <input
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
            className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
          />
          <input type="hidden" name="fileUrl" value={fileUrl} />
          {isUploading && <span className="text-xs text-black/60">Uploading…</span>}
          {!isUploading && uploadError && <span className="text-xs text-red-600">{uploadError}</span>}
          {!isUploading && !uploadError && fileUrl && (
            <span className="text-xs text-forest">
              {fileName ? `Uploaded: ${fileName}` : "A file is already uploaded — choose a new one only to replace it."}
            </span>
          )}
          {!isUploading && !uploadError && !fileUrl && (
            <span className="text-xs text-black/60">Any file type, up to 50MB.</span>
          )}
        </div>
      )}

      <label className="flex items-center gap-2 text-sm font-medium text-black">
        <input type="checkbox" name="published" defaultChecked={product?.published ?? false} />
        Published (visible and purchasable in the Store)
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-black">
        <input type="checkbox" name="membersOnly" defaultChecked={product?.membersOnly ?? false} />
        Members only (free for members, shown in their Portal Resources — not sold in the public Store)
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button
        type="submit"
        variant="solid"
        className="self-start"
        disabled={isPending || isUploading || isUploadingThumbnail}
      >
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
