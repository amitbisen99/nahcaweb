import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-body",
  // "latin-ext" (accented Central/Eastern European characters) is never
  // actually used anywhere on this English-language site — including it
  // just adds preloaded font files the browser flags as unused. Drop it
  // if the site ever needs non-English content that requires those
  // characters.
  subsets: ["latin"],
  // Open Sans ships as a variable font on Google Fonts — requesting a
  // fixed array of weights (400/500/600/700) makes next/font generate a
  // *separate* static file per weight/style combination (8 files here),
  // every one of them preloaded from the root layout regardless of which
  // weights a given page's text actually uses. That mismatch is exactly
  // what triggered the recurring "preloaded ... was not used" warning —
  // trimming the subset only ever addressed half of it. "variable"
  // collapses this to one file per style (2 total) that covers the whole
  // weight range, so every weight class already used across the site
  // (font-medium/semibold/bold, etc.) keeps working with no CSS changes.
  weight: "variable",
  style: ["normal", "italic"],
  // Belt-and-suspenders: even the 2 remaining files could still go
  // "unused" on a page with zero italic text (a plain admin data table,
  // say). Preloading is a load-order optimization, not a correctness
  // requirement — skip it and let the browser fetch the font when the
  // stylesheet actually references it, which never produces this warning.
  preload: false,
});

export const metadata: Metadata = {
  title: "NAHCA — North American Hindu Chaplains Association",
  description: "Supporting professional and volunteer Hindu chaplaincy across North America.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSans.variable} h-full antialiased`}>
      <body className="min-h-full font-body text-ink">{children}</body>
    </html>
  );
}
