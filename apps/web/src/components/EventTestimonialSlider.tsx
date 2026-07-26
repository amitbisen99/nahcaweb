"use client";

import { useEffect, useState } from "react";

const SLIDE_INTERVAL_MS = 5500;

interface Testimonial {
  title: string;
  attribution: string;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    title: "Deeply Meaningful",
    attribution: "Attendee, Annual Conference",
    quote:
      "This was the first space I've found where my faith and my calling as a spiritual caregiver were held together, not separately. I left feeling seen.",
  },
  {
    title: "Practical & Grounded",
    attribution: "Attendee, Monthly Q&A",
    quote:
      "The Q&A gave me language and frameworks I could use with patients the very next day. Generous, practical, and grounded in real experience.",
  },
  {
    title: "A True Sangha",
    attribution: "Attendee, Sangha Gathering",
    quote:
      "I finally found colleagues who understand the specific challenges of Hindu chaplaincy. This community has become a genuine source of support.",
  },
  {
    title: "Thoughtful & Rigorous",
    attribution: "Attendee, Webinar Series",
    quote:
      "Every session is thoughtful, well-researched, and respectful of the diversity within Hindu practice. I recommend NAHCA's webinars to every colleague I train.",
  },
  {
    title: "Renewed My Purpose",
    attribution: "Attendee, Annual Conference",
    quote:
      "Between sessions and informal conversations, this conference renewed my sense of purpose in this work more than any training I've attended in years.",
  },
];

export function EventTestimonialSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setActive((prev) => (prev + 1) % TESTIMONIALS.length),
      SLIDE_INTERVAL_MS
    );
    return () => clearInterval(timer);
  }, [paused, active]);

  function goTo(index: number) {
    setActive((index + TESTIMONIALS.length) % TESTIMONIALS.length);
  }

  return (
    <div
      className="mx-auto max-w-3xl text-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[220px] sm:min-h-[180px]">
        {TESTIMONIALS.map((testimonial, index) => (
          <div
            key={testimonial.title}
            className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${
              active === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <h3 className="font-heading text-xl font-semibold text-heading">{testimonial.title}</h3>
            <p className="mt-4 text-lg leading-relaxed text-black">&ldquo;{testimonial.quote}&rdquo;</p>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-brand">
              {testimonial.attribution}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {TESTIMONIALS.map((testimonial, index) => (
          <button
            key={testimonial.title}
            type="button"
            aria-label={`Show testimonial ${index + 1}`}
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
