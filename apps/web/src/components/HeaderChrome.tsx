"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SVGProps, useEffect, useState } from "react";
import { Container } from "./Container";
import { Button } from "./Button";
import { MobileNav } from "./MobileNav";
import { NAV } from "@/lib/nav";

function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function HeaderChrome({
  portalHref,
  isAdmin,
  isLoggedIn,
  signOutAction,
}: {
  portalHref: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Close any open dropdown whenever the route actually changes — covers
  // clicks, keyboard activation, and browser back/forward navigation.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenMenu(null);
  }

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const transparent = !scrolled;
  const logoSize = transparent ? 80 : 48;

  // Event/webinar detail pages have no banner image behind the transparent
  // (pre-scroll) header — white nav text would be invisible against the
  // plain white page background, so use black there instead. Once scrolled,
  // the header goes solid white same as every other page.
  const noBannerDetailPage = /^\/events\/\d+$/.test(pathname) || /^\/events\/webinars\/\d+$/.test(pathname);
  const navOnLight = transparent && noBannerDetailPage;

  const chromeTextColor = transparent ? (navOnLight ? "text-black" : "text-white") : "text-black";

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        transparent ? "bg-transparent" : "border-b border-ink/10 bg-white"
      }`}
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/brand/logo.png"
              alt="NAHCA logo"
              width={logoSize}
              height={logoSize}
              priority
              className="transition-[width,height] duration-300"
            />
            <span className={`font-heading text-lg font-semibold transition-colors duration-300 ${chromeTextColor}`}>
              NAHCA
            </span>
          </Link>

          <nav className="hidden flex-1 lg:block">
            <ul className="flex items-center justify-center gap-6 xl:gap-8">
              {NAV.filter((item) => item.label !== "Member Portal").map((item) => (
                <li
                  key={item.label}
                  className="group relative"
                  onMouseEnter={() => item.children && setOpenMenu(item.label)}
                  onMouseLeave={() => setOpenMenu((cur) => (cur === item.label ? null : cur))}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setOpenMenu((cur) => (cur === item.label ? null : cur));
                    }
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpenMenu(null)}
                    onFocus={() => item.children && setOpenMenu(item.label)}
                    className={`relative block py-2 text-sm font-medium transition-colors duration-300 ${
                      transparent
                        ? navOnLight
                          ? "text-black hover:text-black/70"
                          : "text-white hover:text-white/80"
                        : "text-brand hover:text-brand-dark"
                    }`}
                  >
                    {item.label}
                    <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-brand transition-transform group-hover:scale-x-100" />
                  </Link>

                  {item.children && openMenu === item.label && (
                    <div className="absolute left-0 top-full z-10 min-w-56 rounded-lg border border-ink/10 bg-white p-2 shadow-lg">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setOpenMenu(null)}
                          target={child.external ? "_blank" : undefined}
                          rel={child.external ? "noopener noreferrer" : undefined}
                          className="block rounded-md px-3 py-2 text-sm text-black hover:bg-sand hover:text-brand"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <form action={signOutAction} className="hidden sm:block">
                <button
                  type="submit"
                  className={`text-sm font-medium transition-colors duration-300 hover:text-brand ${chromeTextColor}`}
                >
                  Sign out
                </button>
              </form>
            )}

            <Link
              href={portalHref}
              aria-label="Member Portal"
              title="Member Portal"
              className={`hidden h-9 w-9 items-center justify-center rounded-full transition-colors duration-300 hover:text-brand lg:flex ${chromeTextColor}`}
            >
              <UserIcon className="h-5 w-5" />
            </Link>

            <Button href="/donate" className="!px-5 !py-2">
              Donate
            </Button>

            <MobileNav
              isAdmin={isAdmin}
              isLoggedIn={isLoggedIn}
              signOutAction={signOutAction}
              transparent={transparent && !navOnLight}
            />
          </div>
        </div>
      </Container>
    </header>
  );
}
