"use client";

import { useRef, useState } from "react";
import { CalendarIcon } from "./icons";

function isoToMDY(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

function mdyToIso(mdy: string): string {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(mdy.trim());
  if (!match) return "";
  const [, mm, dd, yyyy] = match;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

// Auto-inserts slashes as digits are typed, e.g. "08202026" -> "08/20/2026" —
// keeps the display format strictly MM/DD/YYYY regardless of the browser's
// locale (a plain <input type="date"> renders per OS/browser locale, which
// isn't guaranteed to be MM/DD/YYYY).
function formatAsTyped(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join("/");
}

export function DateField({
  name,
  label,
  currentValue,
  required,
}: {
  name: string;
  label: string;
  currentValue?: string | null;
  required?: boolean;
}) {
  const [display, setDisplay] = useState(isoToMDY(currentValue));
  // Drives the calendar popup only — a real <input type="date"> so we get
  // the browser's native picker UI for free, kept visually hidden (via
  // sr-only, not display:none — showPicker() needs the element to still be
  // rendered) since the typed text field above is what actually displays
  // and is submitted. Picking a date here just updates that text field.
  const nativeRef = useRef<HTMLInputElement>(null);

  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-black">{label}</span>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          placeholder="MM/DD/YYYY"
          required={required}
          value={display}
          onChange={(e) => setDisplay(formatAsTyped(e.target.value))}
          className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 pr-10 focus:border-brand focus:outline-none"
        />
        <button
          type="button"
          aria-label="Open calendar"
          onClick={() => nativeRef.current?.showPicker?.()}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 hover:text-brand"
        >
          <CalendarIcon className="h-5 w-5" />
        </button>
        <input
          ref={nativeRef}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          value={mdyToIso(display)}
          onChange={(e) => setDisplay(isoToMDY(e.target.value))}
          className="sr-only"
        />
      </div>
      {/* The form actually submits a clean ISO date under `name` — avoids any
          ambiguity in how a raw MM/DD/YYYY string gets parsed server-side. */}
      <input type="hidden" name={name} value={mdyToIso(display)} />
    </label>
  );
}
