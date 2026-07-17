"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Container } from "./Container";
import { Button } from "./Button";
import type { CmsEvent } from "@/lib/cms";

const SLIDE_INTERVAL_MS = 6500;
const SLIDE_COUNT = 3;

export function HeroSlider({ events }: { events: CmsEvent[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setActive((prev) => (prev + 1) % SLIDE_COUNT), SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
    // Restarting on `active` too means any manual navigation (dots) gives a fresh
    // interval, instead of the next scheduled auto-tick firing right after a click.
  }, [paused, active]);

  function slideClasses(index: number) {
    return `absolute inset-0 flex max-w-2xl flex-col justify-center gap-6 transition-opacity duration-700 ${
      active === index ? "opacity-100" : "pointer-events-none opacity-0"
    }`;
  }

  return (
    <section
      className="relative isolate overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Image src="/brand/hero-temple.jpg" alt="" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/75 to-forest/40" />

      <Container>
        <div className="relative min-h-[560px] py-24 text-white">
          {/* Slide 1 — Mission */}
          <div className={slideClasses(0)}>
            <span className="font-heading text-sm font-semibold uppercase tracking-widest text-white/70">
              Our Mission
            </span>
            <h1 className="font-heading text-4xl font-medium italic leading-tight sm:text-5xl lg:text-6xl">
              North American Hindu Chaplains Association
            </h1>
            <p className="text-base leading-relaxed text-white/85 sm:text-lg">
              We offer a sacred space to connect with current and aspiring spiritual care-givers in
              higher education, healthcare, corrections, military and community settings in order to
              learn how Hindu chaplains have approached their spiritual care-giving.
            </p>
            <div className="pt-2">
              <Button href="/membership">Become a Member</Button>
            </div>
          </div>

          {/* Slide 2 — Upcoming Events */}
          <div className={slideClasses(1)}>
            <span className="font-heading text-sm font-semibold uppercase tracking-widest text-white/70">
              What&apos;s Happening
            </span>
            <h2 className="font-heading text-4xl font-medium italic leading-tight sm:text-5xl">
              Upcoming Events
            </h2>

            {events.length > 0 ? (
              <div className="flex flex-col gap-3">
                {events.slice(0, 2).map((event) => (
                  <div key={event.id} className="rounded-lg border border-white/20 bg-white/10 p-4">
                    <p className="text-sm text-white/60">{event.date}</p>
                    <p className="mt-1 font-heading font-medium">{event.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base leading-relaxed text-white/85 sm:text-lg">
                Stay tuned for events in Fall 2026.
              </p>
            )}

            <div className="pt-2">
              <Button href="/events" variant="ghost" className="!border-white !text-white hover:!bg-white hover:!text-brand">
                View All Events
              </Button>
            </div>
          </div>

          {/* Slide 3 — Community Support */}
          <div className={slideClasses(2)}>
            <span className="font-heading text-sm font-semibold uppercase tracking-widest text-white/70">
              Get Involved
            </span>
            <h2 className="font-heading text-4xl font-medium italic leading-tight sm:text-5xl">
              Community Support
            </h2>
            <p className="text-base leading-relaxed text-white/85 sm:text-lg">
              NAHCA&apos;s community connects chaplains, students, and supporters through Sangha
              gatherings, mentorship, and shared resources — because spiritual care is never done alone.
            </p>
            <div className="pt-2">
              <Button
                href="/what-is-hindu-chaplaincy/community"
                variant="ghost"
                className="!border-white !text-white hover:!bg-white hover:!text-brand"
              >
                Visit Our Community
              </Button>
            </div>
          </div>

          {/* Dots */}
          <div className="absolute inset-x-0 bottom-4 flex gap-2">
            {Array.from({ length: SLIDE_COUNT }).map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={active === index}
                onClick={() => setActive(index)}
                className={`h-2 rounded-full transition-all ${
                  active === index ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
