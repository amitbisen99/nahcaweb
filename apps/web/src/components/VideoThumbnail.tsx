"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const YOUTUBE_ID = "Qtl1nN1QSS4";

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-6 w-6">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function VideoThumbnail({
  image,
  alt,
  caption,
}: {
  image: string;
  alt: string;
  caption?: { name: string; text: string };
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <div className="relative h-full w-full">
        <Image src={image} alt={alt} fill className="object-cover" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Play video"
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
        >
          <span className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-white bg-transparent text-white shadow-lg transition-transform hover:scale-105">
            <PlayIcon className="h-12 w-12 translate-x-1" />
          </span>
        </button>

        {caption && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-navy/30 px-5 py-4">
            <p className="font-heading text-base font-semibold text-white">{caption.name}</p>
            <p className="mt-1 text-sm leading-relaxed text-white/85">{caption.text}</p>
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="relative aspect-video w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close video"
              className="absolute -top-10 right-0 text-white hover:text-white/70"
            >
              <CloseIcon />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1`}
              title="NAHCA video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
