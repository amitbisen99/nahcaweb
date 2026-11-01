import Link from "next/link";
import { AddToCalendar } from "@/components/AddToCalendar";
import { formatDate } from "@/lib/formatDate";
import type { ApiMyEventRegistration } from "@/lib/api";

// One event/webinar the member registered for, on the portal's
// "Events & Webinars" page and the dashboard.
export function MyEventCard({ item }: { item: ApiMyEventRegistration }) {
  const isWebinar = item.type === "webinar";
  const detailHref = isWebinar ? `/events/webinars/${item.id}` : `/events/${item.id}`;
  // Event dates are a bare date (midnight UTC), so compare as YYYY-MM-DD.
  const upcoming = item.date !== null && item.date.slice(0, 10) >= new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand-dark">
            {isWebinar ? "Webinar" : "Event"}
          </span>
          {item.status === "pending" && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              Payment pending
            </span>
          )}
        </div>
        <Link href={detailHref} className="mt-1 block font-medium text-ink hover:text-brand">
          {item.title}
        </Link>
        <p className="text-sm text-black">
          {item.date ? `${formatDate(item.date)}${item.time ? ` · ${item.time}` : ""}` : "Date to be announced"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-brand hover:text-brand-dark"
          >
            {isWebinar ? "Join webinar →" : "Event link →"}
          </a>
        )}
        {upcoming && item.date && item.status === "active" && (
          <AddToCalendar
            event={{
              title: item.title,
              description: item.description,
              date: item.date,
              time: item.time,
              url: item.link ?? `${process.env.NEXTAUTH_URL ?? ""}${detailHref}`,
            }}
          />
        )}
      </div>
    </div>
  );
}
