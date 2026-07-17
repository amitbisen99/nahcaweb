"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const BANNER_PATHS = [
  "/what-is-hindu-chaplaincy",
  "/what-is-hindu-chaplaincy/code-of-ethics",
  "/what-is-hindu-chaplaincy/resources",
  "/what-is-hindu-chaplaincy/higher-education",
  "/what-is-hindu-chaplaincy/healthcare",
];

export function HeaderFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isBannerPage = pathname?.startsWith("/events/") || BANNER_PATHS.includes(pathname ?? "");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isBannerPage) return;

    function onScroll() {
      setScrolled(window.scrollY > 80);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isBannerPage, pathname]);

  const mode = isBannerPage && !scrolled ? "transparent" : "solid";

  return (
    <header
      data-mode={mode}
      className="group/header sticky top-0 z-50 border-b border-ink/10 bg-cream/95 backdrop-blur transition-colors data-[mode=transparent]:border-transparent data-[mode=transparent]:bg-transparent data-[mode=transparent]:backdrop-blur-none"
    >
      {children}
    </header>
  );
}
