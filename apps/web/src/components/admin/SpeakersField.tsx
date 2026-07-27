"use client";

import { ChangeEvent, useRef, useState } from "react";

interface SpeakerRow {
  key: string;
  name: string;
  title: string;
  existingPhotoUrl: string | null;
  photoPreviewUrl: string | null;
  removePhoto: boolean;
}

function makeKey() {
  return Math.random().toString(36).slice(2);
}

function toRows(currentValue: unknown): SpeakerRow[] {
  if (!Array.isArray(currentValue)) return [];
  return currentValue.map((raw) => {
    const speaker = raw as { name?: unknown; title?: unknown; photoUrl?: unknown };
    return {
      key: makeKey(),
      name: typeof speaker?.name === "string" ? speaker.name : "",
      title: typeof speaker?.title === "string" ? speaker.title : "",
      existingPhotoUrl: typeof speaker?.photoUrl === "string" ? speaker.photoUrl : null,
      photoPreviewUrl: null,
      removePhoto: false,
    };
  });
}

export function SpeakersField({
  name,
  label,
  currentValue,
}: {
  name: string;
  label: string;
  currentValue?: unknown;
}) {
  const [rows, setRows] = useState<SpeakerRow[]>(() => toRows(currentValue));
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function addRow() {
    setRows((prev) => [
      ...prev,
      { key: makeKey(), name: "", title: "", existingPhotoUrl: null, photoPreviewUrl: null, removePhoto: false },
    ]);
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function updateRow(key: string, patch: Partial<SpeakerRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function handlePhotoChange(key: string, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    updateRow(key, { photoPreviewUrl: URL.createObjectURL(file), removePhoto: false });
  }

  function removePhoto(key: string) {
    updateRow(key, { photoPreviewUrl: null, removePhoto: true });
    const input = fileInputRefs.current[key];
    if (input) input.value = "";
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-black">{label}</span>
        <span className="text-xs text-black/50">Optional</span>
      </div>

      {rows.map((row, index) => {
        const photoSrc =
          row.photoPreviewUrl ??
          (row.existingPhotoUrl && !row.removePhoto
            ? `${process.env.NEXT_PUBLIC_API_URL}${row.existingPhotoUrl}`
            : null);

        return (
          <div
            key={row.key}
            className="flex flex-col gap-3 rounded-lg border border-ink/10 p-4 sm:flex-row sm:items-start"
          >
            <div className="flex flex-none flex-col items-center gap-1.5">
              {photoSrc ? (
                <img
                  src={photoSrc}
                  alt=""
                  className="h-16 w-16 rounded-full border border-ink/10 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sand text-[10px] text-black/50">
                  No photo
                </div>
              )}
              <label className="cursor-pointer text-xs font-medium text-brand hover:text-brand-dark">
                {photoSrc ? "Change" : "Upload"}
                <input
                  ref={(el) => {
                    fileInputRefs.current[row.key] = el;
                  }}
                  type="file"
                  accept="image/*"
                  name={`${name}[${index}][photo]`}
                  className="hidden"
                  onChange={(e) => handlePhotoChange(row.key, e)}
                />
              </label>
              {photoSrc && (
                <button
                  type="button"
                  onClick={() => removePhoto(row.key)}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
              <input
                type="hidden"
                name={`${name}[${index}][existingPhotoUrl]`}
                value={row.removePhoto ? "" : (row.existingPhotoUrl ?? "")}
              />
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <input
                type="text"
                placeholder="Speaker name"
                value={row.name}
                onChange={(e) => updateRow(row.key, { name: e.target.value })}
                name={`${name}[${index}][name]`}
                className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
              <input
                type="text"
                placeholder="Title / role (optional)"
                value={row.title}
                onChange={(e) => updateRow(row.key, { title: e.target.value })}
                name={`${name}[${index}][title]`}
                className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => removeRow(row.key)}
              className="text-xs font-medium text-red-600 hover:text-red-700 sm:self-start"
            >
              Remove speaker
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addRow}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-sand/40"
      >
        + Add More
      </button>
    </div>
  );
}
