import Link from "next/link";
import type { CmsEvent } from "@/lib/cms";
import { ChevronIcon } from "./icons";

function monthLabel(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short" }).toUpperCase();
}

function dayLabel(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { day: "numeric" });
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function UpcomingEventsSnippet({ events }: { events: CmsEvent[] }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-cream p-6 sm:p-8">
      <h3 className="font-heading text-xl font-medium text-heading">Upcoming Events</h3>

      {events.length === 0 ? (
        <p className="mt-4 text-sm text-black">No upcoming events published yet — check back soon.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-5">
          {events.map((event) => (
            <li key={event.id} className="flex items-center gap-4 border-t border-ink/10 pt-5 first:border-t-0 first:pt-0">
              <div className="flex h-12 w-12 flex-none flex-col items-center justify-center rounded-lg bg-sand text-heading">
                <span className="text-[9px] font-semibold uppercase tracking-wide text-brand">
                  {monthLabel(event.date)}
                </span>
                <span className="text-lg font-bold leading-none">{dayLabel(event.date)}</span>
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/events/${event.id}`}
                  className="block truncate font-heading font-semibold text-heading hover:text-brand-dark"
                >
                  {event.title}
                </Link>
                <p className="mt-0.5 text-sm text-black/60">
                  {formatDate(event.date)}
                  {event.time ? ` · ${event.time}` : ""}
                </p>
              </div>

              <Link
                href={`/events/${event.id}`}
                aria-label={`View details for ${event.title}`}
                className="flex-none text-sm font-semibold text-brand hover:text-brand-dark"
              >
                <span className="hidden sm:inline">Details </span>→
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/events"
        className="mt-6 inline-flex w-fit items-center gap-2 font-semibold text-brand hover:text-brand-dark"
      >
        View All Events
        <ChevronIcon className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
