"use client";

import { useEffect, useState } from "react";
import { Container } from "./Container";
import { Button } from "./Button";

const SLIDE_INTERVAL_MS = 6500;
const SLIDE_COUNT = 2;

export function HeroSlider() {
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
    return `absolute inset-0 flex flex-col justify-center gap-6 transition-opacity duration-700 ${
      active === index ? "opacity-100" : "pointer-events-none opacity-0"
    }`;
  }

  return (
    <section
      className="relative isolate -mt-16 overflow-hidden lg:-mt-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/brand/hero-temple.jpg"
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-xs"
      >
        <source src="/brand/homevideo2.mp4" type="video/mp4" />
      </video>

      <Container>
        <div className="relative min-h-[560px] pb-24 pt-40 text-white lg:pt-44">
          {/* Slide 1 — Mission */}
          <div className={slideClasses(0)}>
            <h1 className="max-w-4xl text-[36px] font-heading font-bold leading-tight [text-shadow:1px_1px_#212121] sm:text-[48px] lg:text-[60px]">
              North American Hindu Chaplains Association
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-white/85 sm:text-lg">
              We offer a sacred space to connect with current and aspiring spiritual care-givers in
              higher education, healthcare, corrections, military and community settings in order to
              learn how Hindu chaplains have approached their spiritual care-giving.
            </p>
            <div className="pt-2">
              <Button href="/membership">Become a Member</Button>
            </div>
          </div>

          {/* Slide 2 — Community Support */}
          <div className={slideClasses(1)}>
            <h2 className="max-w-2xl text-[36px] font-heading font-bold leading-tight [text-shadow:1px_1px_#212121] sm:text-[48px]">
              Community Support
            </h2>
            <p className="max-w-3xl text-base leading-relaxed text-white/85 sm:text-lg">
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
