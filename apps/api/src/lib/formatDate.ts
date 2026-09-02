// Mirrors apps/web/src/lib/formatDate.ts — used for the handful of places
// on this side that generate a file for a human to read (the Donations and
// Attendees Excel exports) rather than an API response. Locale-independent
// so it always reads MM/DD/YYYY regardless of what locale the server (or
// whoever opens the file) happens to be running under, unlike a bare
// toDateString()/toLocaleDateString() call.
export function formatDate(value: Date | string | null | undefined, fallback = "—"): string {
  if (!value) return fallback;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}
