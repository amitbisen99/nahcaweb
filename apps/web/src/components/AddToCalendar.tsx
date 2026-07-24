"use client";

import { useEffect, useRef, useState } from "react";
import { SVGProps } from "react";
import { buildCalendarLinks, type CalendarEventInput } from "@/lib/calendar";

function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
      <path d="M3.5 9.5h17M8 3v3M16 3v3" strokeLinecap="round" />
    </svg>
  );
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "event";
}

const DEFAULT_TRIGGER_CLASSNAME =
  "inline-flex items-center gap-1.5 rounded-md border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:border-brand hover:text-brand";

export function AddToCalendar({
  event,
  className,
  triggerClassName,
}: {
  event: CalendarEventInput;
  className?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  const { googleUrl, icsHref } = buildCalendarLinks(event);

  return (
    <div ref={containerRef} className={`relative inline-block ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={triggerClassName ?? DEFAULT_TRIGGER_CLASSNAME}
      >
        <CalendarIcon className="h-4 w-4" />
        Add to Calendar
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-52 rounded-lg border border-ink/10 bg-white py-1 shadow-lg"
        >
          <a
            role="menuitem"
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-ink/75 hover:bg-sand"
          >
            Google Calendar
          </a>
          <a
            role="menuitem"
            href={icsHref}
            download={`${slugify(event.title)}.ics`}
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-ink/75 hover:bg-sand"
          >
            Apple / Outlook (.ics)
          </a>
        </div>
      )}
    </div>
  );
}
