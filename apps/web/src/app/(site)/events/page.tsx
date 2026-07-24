import Link from "next/link";
import { Container } from "@/components/Container";
import { AddToCalendar } from "@/components/AddToCalendar";
import { getUpcomingEvents } from "@/lib/cms";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function monthLabel(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short" }).toUpperCase();
}

function dayLabel(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { day: "numeric" });
}

export default async function EventsPage() {
  const events = await getUpcomingEvents(50);

  return (
    <div className="bg-white">
      <Container>
        <div className="py-16">
          <h1 className="font-heading text-3xl font-medium text-heading">Events</h1>
          <p className="mt-2 text-ink/70">
            Annual Conference, Monthly Q&amp;A, Webinars, Sangha, and Members-Only Meetings.
          </p>

          {events.length > 0 ? (
            <div className="mt-8 border-t border-ink/10">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col gap-4 border-b border-ink/10 py-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 flex-none flex-col items-center justify-center rounded-lg bg-forest text-white">
                      <span className="text-[10px] font-semibold uppercase tracking-wide">
                        {monthLabel(event.date)}
                      </span>
                      <span className="text-xl font-bold leading-none">{dayLabel(event.date)}</span>
                    </div>

                    <div className="min-w-0">
                      <Link
                        href={`/events/${event.id}`}
                        className="font-heading text-lg font-medium text-heading hover:text-brand"
                      >
                        {event.title}
                      </Link>
                      <p className="mt-0.5 text-sm text-ink/50">
                        {formatDate(event.date)}
                        {event.time ? ` · ${event.time}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-none flex-wrap items-center gap-3 sm:justify-end">
                    <AddToCalendar
                      event={{
                        title: event.title,
                        description: event.description,
                        date: event.date,
                        time: event.time,
                        url: event.registrationLink,
                      }}
                    />
                    <Link
                      href={`/events/${event.id}`}
                      className="text-sm font-medium text-brand hover:text-brand-dark"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-ink/50">
              No events published yet — once events are added in the CMS, they&apos;ll appear here automatically.
            </p>
          )}
        </div>
      </Container>
    </div>
  );
}
