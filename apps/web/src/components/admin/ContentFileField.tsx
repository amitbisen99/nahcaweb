"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { isImageUrl } from "./icons";

export function ContentFileField({
  name,
  label,
  currentValue,
}: {
  name: string;
  label: string;
  currentValue?: string | null;
}) {
  const [removed, setRemoved] = useState(false);
  const [preview, setPreview] = useState<{ url: string; isImage: boolean; name: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  const hasCurrent = typeof currentValue === "string" && currentValue.length > 0 && !removed;

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview({ url: URL.createObjectURL(file), isImage: file.type.startsWith("image/"), name: file.name });
    setRemoved(false);
  }

  function clearSelection() {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeCurrent() {
    setRemoved(true);
    clearSelection();
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink/80">{label}</span>

      {preview ? (
        <div className="flex items-center gap-3">
          {preview.isImage ? (
            <img src={preview.url} alt="" className="h-20 w-20 rounded-lg border border-ink/10 object-cover" />
          ) : (
            <span className="text-sm text-ink/70">{preview.name}</span>
          )}
          <button
            type="button"
            onClick={clearSelection}
            className="text-xs font-medium text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ) : hasCurrent ? (
        <div className="flex items-center gap-3">
          {isImageUrl(currentValue as string) ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${currentValue}`}
              alt=""
              className="h-20 w-20 rounded-lg border border-ink/10 object-cover"
            />
          ) : (
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}${currentValue}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-brand hover:text-brand-dark"
            >
              View current file
            </a>
          )}
          <button
            type="button"
            onClick={removeCurrent}
            className="text-xs font-medium text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ) : null}

      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-sand/40">
        Upload Image
        <input ref={inputRef} type="file" name={name} onChange={handleFileChange} className="hidden" />
      </label>

      <input type="hidden" name={`${name}__remove`} value={removed ? "on" : ""} />
    </div>
  );
}
