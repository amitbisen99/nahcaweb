"use client";

import Link from "next/link";
import { useState } from "react";
import type { CmsEvent } from "@/lib/cms";
import { formatDate } from "@/lib/formatDate";
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

// monthLabel/dayLabel below feed the card's decorative calendar-badge icon
// (month abbreviation stacked over the day number) — that's a graphic, not
// a text date, so it's intentionally left in its own short format rather
// than switched to the site-wide MM/DD/YYYY used for actual date text.
function monthLabel(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short" }).toUpperCase();
}

function dayLabel(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { day: "numeric" });
}

export function EventCards({ events }: { events: CmsEvent[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <RevealGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event, index) => {
        const imageSrc = event.featuredImageUrl
          ? `${process.env.NEXT_PUBLIC_API_URL}${event.featuredImageUrl}`
          : CARD_IMAGES[index % CARD_IMAGES.length];
        const speakers = event.speakers ?? [];
        const isOpen = openIndex === index;

        return (
          <RevealItem
            key={event.id}
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            aria-label={`${event.title} — tap for details`}
            onClick={() => setOpenIndex((cur) => (cur === index ? null : index))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpenIndex((cur) => (cur === index ? null : index));
              }
            }}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border border-black/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- may be an uploaded file from an arbitrary host, not in next.config.js image patterns */}
            <img
              src={imageSrc}
              alt={event.title}
              className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOpen ? "scale-105" : ""}`}
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
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent transition-opacity duration-300 group-hover:opacity-0 ${isOpen ? "opacity-0" : "opacity-100"}`}
            />
            <div
              className={`absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6 transition-opacity duration-300 group-hover:opacity-0 ${isOpen ? "opacity-0" : "opacity-100"}`}
            >
              <h3 className="font-heading text-lg font-semibold text-white">{event.title}</h3>
              {speakers.length > 0 && <SpeakerAvatarStack speakers={speakers} />}
            </div>

            {/* Mobile-only tap hint — hover already communicates affordance on desktop */}
            {!isOpen && (
              <span className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-lg leading-none text-white backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-0 lg:hidden">
                +
              </span>
            )}

            {/* Hover (desktop) / tap (mobile) state: date/time + excerpt + actions */}
            <div
              className={`absolute inset-0 flex flex-col justify-center overflow-hidden bg-navy/95 p-6 transition-opacity duration-300 group-hover:opacity-100 ${isOpen ? "opacity-100" : "opacity-0"}`}
            >
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
              <div
                className="mt-4 flex flex-wrap items-center gap-4"
                onClick={(e) => e.stopPropagation()}
              >
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
