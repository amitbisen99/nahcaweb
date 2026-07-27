import Link from "next/link";
import type { CmsWebinar } from "@/lib/cms";
import { SpeakerAvatarStack } from "./SpeakerCards";
import { RevealGroup, RevealItem } from "./Reveal";

const CARD_IMAGES = [
  "/chaplaincy/puja.jpg",
  "/chaplaincy/colorful-palm-leaf-books.jpg",
  "/chaplaincy/lotus-flower-candle-holder.webp",
  "/brand/temple-home.jpg",
  "/brand/hero-temple.jpg",
];

const EXCERPT_LENGTH = 50;

function excerptOf(html: string, max = EXCERPT_LENGTH): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function WebinarCards({ webinars }: { webinars: CmsWebinar[] }) {
  return (
    <RevealGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {webinars.map((webinar, index) => {
        const imageSrc = webinar.featuredImageUrl
          ? `${process.env.NEXT_PUBLIC_API_URL}${webinar.featuredImageUrl}`
          : CARD_IMAGES[index % CARD_IMAGES.length];
        const speakers = webinar.speakers ?? [];

        return (
        <RevealItem
          key={webinar.id}
          className="group relative aspect-square overflow-hidden rounded-2xl border border-black/10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- may be an uploaded file from an arbitrary host, not in next.config.js image patterns */}
          <img
            src={imageSrc}
            alt={webinar.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {webinar.access === "members_only" && (
            <span className="absolute left-4 top-4 z-10 inline-block w-fit rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">
              Members Only
            </span>
          )}

          {/* Default state: title label over a bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-100 transition-opacity duration-300 group-hover:opacity-0" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6 transition-opacity duration-300 group-hover:opacity-0">
            <h3 className="font-heading text-lg font-semibold text-white">{webinar.title}</h3>
            {speakers.length > 0 && <SpeakerAvatarStack speakers={speakers} />}
          </div>

          {/* Hover state: short excerpt + Read more */}
          <div className="absolute inset-0 flex flex-col justify-center bg-navy/95 p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <h3 className="font-heading text-[20px] font-semibold text-white">{webinar.title}</h3>
            {webinar.description && (
              <p className="mt-2 text-[15px] leading-snug text-white/90">
                {excerptOf(webinar.description)}
              </p>
            )}
            {speakers.length > 0 && (
              <div className="mt-3">
                <SpeakerAvatarStack speakers={speakers} />
              </div>
            )}
            <Link
              href={`/events/webinars/${webinar.id}`}
              className="mt-3 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand hover:text-white"
            >
              Read more →
            </Link>
          </div>
        </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
