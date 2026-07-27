"use client";

import {
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// Plain scroll-position + CSS-transition based (not framer-motion / not
// IntersectionObserver). Both alternatives were tried and silently failed in
// this project's automated preview environment: IntersectionObserver
// callbacks never fired, and framer-motion's animate/whileInView (which
// applies styles via a requestAnimationFrame-driven loop) never wrote to the
// DOM even though its internal React state updated correctly. Plain
// scroll/resize listeners plus a CSS `transition` — the same mechanism
// already used for every hover/tap state elsewhere on this site — animate
// reliably in every environment this was tested in.
function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;

    function check() {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80 && rect.bottom > 0) {
        setInView(true);
      }
    }

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [inView]);

  return { ref, inView };
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

const RevealGroupContext = createContext(false);

export function RevealGroup({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { ref, inView } = useScrollReveal<HTMLDivElement>();

  return (
    <RevealGroupContext.Provider value={inView}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </RevealGroupContext.Provider>
  );
}

export function RevealItem({
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  const inView = useContext(RevealGroupContext);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
