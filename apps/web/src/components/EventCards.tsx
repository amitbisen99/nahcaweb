import Link from "next/link";
import type { CmsEvent } from "@/lib/cms";
import { AddToCalendar } from "./AddToCalendar";
import { SpeakerAvatarStack } from "./SpeakerCards";
import { RevealGroup, RevealItem } from "./Reveal";

const CARD_IMAGES = [
  "/events/mysore-green-hotel.jpg",
  "/chaplaincy/puja.jpg",
  "/brand/temple-home.jpg",
  "/brand/hero-temple.jpg",
];

const EXCERPT_LENGTH = 90;

function excerptOf(html: string, max = EXCERPT_LENGTH): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function monthLabel(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short" }).toUpperCase();
}

function dayLabel(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { day: "numeric" });
}

export function EventCards({ events }: { events: CmsEvent[] }) {
  return (
    <RevealGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event, index) => {
        const imageSrc = event.featuredImageUrl
          ? `${process.env.NEXT_PUBLIC_API_URL}${event.featuredImageUrl}`
          : CARD_IMAGES[index % CARD_IMAGES.length];
        const speakers = event.speakers ?? [];

        return (
          <RevealItem
            key={event.id}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-black/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- may be an uploaded file from an arbitrary host, not in next.config.js image patterns */}
            <img
              src={imageSrc}
              alt={event.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute left-4 top-4 z-10 flex h-12 w-12 flex-none flex-col items-center justify-center rounded-lg bg-white/95 text-heading shadow">
              <span className="text-[9px] font-semibold uppercase tracking-wide">
                {monthLabel(event.date)}
              </span>
              <span className="text-lg font-bold leading-none">{dayLabel(event.date)}</span>
            </div>

            {event.access === "members_only" && (
              <span className="absolute right-4 top-4 z-10 inline-block w-fit rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">
                Members Only
              </span>
            )}

            {/* Default state: title + speaker avatars over bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-100 transition-opacity duration-300 group-hover:opacity-0" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6 transition-opacity duration-300 group-hover:opacity-0">
              <h3 className="font-heading text-lg font-semibold text-white">{event.title}</h3>
              {speakers.length > 0 && <SpeakerAvatarStack speakers={speakers} />}
            </div>

            {/* Hover state: date/time + excerpt + actions */}
            <div className="absolute inset-0 flex flex-col justify-center bg-navy/95 p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <h3 className="font-heading text-[20px] font-semibold text-white">{event.title}</h3>
              <p className="mt-1 text-[13px] font-medium text-white/70">
                {formatDate(event.date)}
                {event.time ? ` · ${event.time}` : ""}
              </p>
              {event.description && (
                <p className="mt-2 text-[15px] leading-snug text-white/90">
                  {excerptOf(event.description)}
                </p>
              )}
              {speakers.length > 0 && (
                <div className="mt-3">
                  <SpeakerAvatarStack speakers={speakers} />
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link
                  href={`/events/${event.id}`}
                  className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand hover:text-white"
                >
                  View Details →
                </Link>
                <AddToCalendar
                  event={{
                    title: event.title,
                    description: event.description,
                    date: event.date,
                    time: event.time,
                    url: event.registrationLink,
                  }}
                  triggerClassName="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white"
                />
              </div>
            </div>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
