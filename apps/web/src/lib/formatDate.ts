// Every plain-text date shown anywhere on the site should read MM/DD/YYYY,
// consistently, regardless of the visitor's own browser/OS locale — a bare
// toDateString()/toLocaleDateString() call is locale-dependent and isn't
// guaranteed to render that way (e.g. toDateString() always reads like
// "Tue Sep 01 2026"). This is the one place that formatting lives so every
// admin table, portal page, and public page agrees.
//
// Editable date *inputs* are handled separately by DateField, which needs
// its own typed-and-formatted text field rather than a plain string
// formatter — this is for display only.
export function formatDate(value: string | Date | null | undefined, fallback = "—"): string {
  if (!value) return fallback;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

// Same as formatDate but with a 12-hour clock time appended — for the
// handful of places (e.g. the Receipt Email send log) that show a
// timestamp rather than just a date.
export function formatDateTime(value: string | Date | null | undefined, fallback = "—"): string {
  if (!value) return fallback;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  const hours24 = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${formatDate(d, fallback)}, ${hours12}:${minutes} ${ampm}`;
}
