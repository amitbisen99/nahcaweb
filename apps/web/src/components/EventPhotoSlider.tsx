"use client";

import Image from "next/image";
import { SVGProps, useEffect, useState } from "react";

const SLIDE_INTERVAL_MS = 4500;

const PHOTOS = [
  { src: "/events/mysore-green-hotel.jpg", alt: "NAHCA event venue" },
  { src: "/chaplaincy/puja.jpg", alt: "Puja ceremony at a NAHCA gathering" },
  { src: "/brand/temple-home.jpg", alt: "Temple setting from a NAHCA event" },
  { src: "/brand/hero-temple.jpg", alt: "Community gathering at a NAHCA event" },
];

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function EventPhotoSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setActive((prev) => (prev + 1) % PHOTOS.length), SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, active]);

  function goTo(index: number) {
    setActive((index + PHOTOS.length) % PHOTOS.length);
  }

  return (
    <div
      className="mx-auto max-w-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative isolate aspect-[16/9] overflow-hidden rounded-2xl shadow-lg">
        {PHOTOS.map((photo, index) => (
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className={`object-cover transition-opacity duration-700 ${
              active === index ? "opacity-100" : "opacity-0"
            }`}
            priority={index === 0}
            loading={index === 0 ? undefined : "eager"}
          />
        ))}

        <button
          type="button"
          aria-label="Previous photo"
          onClick={() => goTo(active - 1)}
          className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-heading shadow transition-colors hover:bg-white"
        >
          <ChevronIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next photo"
          onClick={() => goTo(active + 1)}
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-heading shadow transition-colors hover:bg-white"
        >
          <ChevronIcon className="h-5 w-5 rotate-180" />
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {PHOTOS.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            aria-label={`Go to photo ${index + 1}`}
            aria-current={active === index}
            onClick={() => goTo(index)}
            className={`h-2 rounded-full transition-all ${
              active === index ? "w-8 bg-brand" : "w-2 bg-ink/20 hover:bg-ink/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
