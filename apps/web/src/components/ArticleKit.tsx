"use client";

import { ReactNode, useEffect, useState } from "react";

export interface TocItem {
  id: string;
  label: string;
}

export function ArticleLayout({ toc, children }: { toc?: TocItem[]; children: ReactNode }) {
  if (!toc || toc.length === 0) {
    return <div className="min-w-0">{children}</div>;
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_220px]">
      <div className="min-w-0">{children}</div>
      <TableOfContents items={toc} />
    </div>
  );
}

function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    // Position-based scrollspy (not a fixed-size IntersectionObserver window):
    // the active section is the last one whose heading has scrolled above the
    // threshold line. This stays correct even when a section (e.g. the last
    // one on a short page) is too short to ever fill a fixed observer margin.
    const THRESHOLD_PX = 120;

    function updateActive() {
      // At the bottom of the page, always activate the last item — a short
      // final section may never scroll its heading past THRESHOLD_PX if
      // there isn't enough content below it to scroll that far.
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        const last = items[items.length - 1]?.id;
        if (last) setActiveId(last);
        return;
      }

      let current = items[0]?.id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= THRESHOLD_PX) {
          current = item.id;
        }
      }
      if (current) setActiveId(current);
    }

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [items]);

  return (
    <nav className="hidden lg:block" aria-label="On this page">
      <div className="sticky top-28">
        <p className="text-xs font-semibold uppercase tracking-widest text-black/50">On This Page</p>
        <ul className="mt-4 flex flex-col gap-1 border-l-2 border-ink/10">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`-ml-[2px] block border-l-2 py-1.5 pl-4 text-sm transition-colors ${
                  activeId === item.id
                    ? "border-brand font-semibold text-brand"
                    : "border-transparent text-black/60 hover:text-black"
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export function SectionHeading({
  id,
  icon,
  children,
}: {
  id: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <h2
      id={id}
      className="mt-14 flex scroll-mt-28 items-center gap-3 font-heading text-2xl font-medium text-heading"
    >
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand text-white">
        {icon}
      </span>
      {children}
    </h2>
  );
}

export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-10 border-l-4 border-brand py-6 pl-6 pr-4 font-heading text-xl leading-snug text-heading sm:text-2xl">
      {children}
    </blockquote>
  );
}
