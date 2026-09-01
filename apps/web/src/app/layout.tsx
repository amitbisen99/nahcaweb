import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-body",
  // "latin-ext" (accented Central/Eastern European characters) is never
  // actually used anywhere on this English-language site — including it
  // just adds a second preloaded font file that the browser flags as
  // unused on every page ("preloaded with link preload was not used
  // within a few seconds"). Drop it if the site ever needs non-English
  // content that requires those characters.
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
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
