// "Add to calendar" links and an .ics file for an event/webinar, for the
// registration email. Mirrors apps/web/src/lib/calendar.ts (the website's own
// Add to Calendar button) — keep the two in step.
//
// Events and webinars store a bare date (midnight UTC) and a free-text time
// like "3:00 PM" with no timezone, so a timed entry is written as a "floating"
// time: the recipient's own calendar shows it in their own timezone, as typed.

export interface CalendarEventInput {
  uid: string;
  title: string;
  description?: string | null;
  date: Date;
  time?: string | null;
  url?: string | null;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function plainText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

// RFC 5545 asks for lines of at most 75 octets, continued with CRLF + space.
function foldLine(line: string): string {
  const chunks: string[] = [];
  for (let i = 0; i < line.length; i += 73) chunks.push(line.slice(i, i + 73));
  return chunks.join("\r\n ");
}

function utcStamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
    d.getUTCMinutes()
  )}${pad(d.getUTCSeconds())}Z`;
}

function parseTime(time: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match) return null;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour += 12;
  return { hour, minute: Number(match[2]) };
}

export function buildCalendarEntry(event: CalendarEventInput) {
  const y = event.date.getUTCFullYear();
  const m = event.date.getUTCMonth();
  const day = event.date.getUTCDate();

  const details = [event.description ? plainText(event.description) : null, event.url].filter(Boolean).join("\n\n");

  const parsed = event.time ? parseTime(event.time) : null;

  // Compact form (20261103T103000) for Google/ICS, and dashed form for Outlook.
  let start: string;
  let end: string;
  let outlookStart: string;
  let outlookEnd: string;
  const allDay = !parsed;

  if (parsed) {
    const startMs = Date.UTC(y, m, day, parsed.hour, parsed.minute);
    const endMs = startMs + 60 * 60 * 1000;
    const fmt = (ms: number) => {
      const d = new Date(ms);
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
        d.getUTCMinutes()
      )}00`;
    };
    const dashed = (ms: number) => {
      const d = new Date(ms);
      return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(
        d.getUTCMinutes()
      )}:00`;
    };
    start = fmt(startMs);
    end = fmt(endMs);
    outlookStart = dashed(startMs);
    outlookEnd = dashed(endMs);
  } else {
    const next = new Date(Date.UTC(y, m, day + 1));
    start = `${y}${pad(m + 1)}${pad(day)}`;
    end = `${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`;
    outlookStart = `${y}-${pad(m + 1)}-${pad(day)}`;
    outlookEnd = `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
  }

  const google = new URL("https://calendar.google.com/calendar/render");
  google.searchParams.set("action", "TEMPLATE");
  google.searchParams.set("text", event.title);
  google.searchParams.set("dates", `${start}/${end}`);
  if (details) google.searchParams.set("details", details);

  const outlook = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
  outlook.searchParams.set("path", "/calendar/action/compose");
  outlook.searchParams.set("rru", "addevent");
  outlook.searchParams.set("subject", event.title);
  outlook.searchParams.set("startdt", outlookStart);
  outlook.searchParams.set("enddt", outlookEnd);
  if (allDay) outlook.searchParams.set("allday", "true");
  if (details) outlook.searchParams.set("body", details);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NAHCA//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}@nahca`,
    `DTSTAMP:${utcStamp(new Date())}`,
    allDay ? `DTSTART;VALUE=DATE:${start}` : `DTSTART:${start}`,
    allDay ? `DTEND;VALUE=DATE:${end}` : `DTEND:${end}`,
    `SUMMARY:${escapeICS(event.title)}`,
    ...(details ? [`DESCRIPTION:${escapeICS(details)}`] : []),
    ...(event.url ? [`URL:${event.url}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return {
    googleUrl: google.toString(),
    outlookUrl: outlook.toString(),
    ics: lines.map(foldLine).join("\r\n") + "\r\n",
  };
}
