"use client";

import { useSyncExternalStore } from "react";
import { formatDate, formatDateTime } from "@/lib/formatDate";

const subscribe = () => () => {};

// A date plus the time of day, in the visitor's own timezone. The server
// doesn't know that timezone, so it renders just the date (which is the same
// to everyone, near enough) and the browser fills in the time once it loads.
export function LocalDateTime({ value }: { value: string }) {
  const inBrowser = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  return <time dateTime={value}>{inBrowser ? formatDateTime(value) : formatDate(value)}</time>;
}
