export interface CalendarEventInput {
  title: string;
  description?: string | null;
  date: string;
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
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function utcStamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
    d.getUTCMinutes()
  )}${pad(d.getUTCSeconds())}Z`;
}

function parseTimeString(time: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match) return null;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour += 12;
  return { hour, minute: Number(match[2]) };
}

export function buildCalendarLinks(event: CalendarEventInput) {
  const base = new Date(event.date);
  const y = base.getUTCFullYear();
  const m = base.getUTCMonth();
  const day = base.getUTCDate();

  const details = [event.description ? plainText(event.description) : null, event.url]
    .filter(Boolean)
    .join("\n\n");

  let googleDates: string;
  let icsStart: string;
  let icsEnd: string;
  let allDay = false;

  const parsedTime = event.time ? parseTimeString(event.time) : null;

  if (parsedTime) {
    const { hour: hh, minute: mm } = parsedTime;
    const start = `${y}${pad(m + 1)}${pad(day)}T${pad(hh)}${pad(mm)}00`;
    const endDate = new Date(y, m, day, hh, mm);
    endDate.setHours(endDate.getHours() + 1);
    const end = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(
      endDate.getHours()
    )}${pad(endDate.getMinutes())}00`;
    googleDates = `${start}/${end}`;
    icsStart = start;
    icsEnd = end;
  } else {
    const next = new Date(Date.UTC(y, m, day + 1));
    const startDate = `${y}${pad(m + 1)}${pad(day)}`;
    const endDate = `${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`;
    googleDates = `${startDate}/${endDate}`;
    icsStart = startDate;
    icsEnd = endDate;
    allDay = true;
  }

  const googleUrl = new URL("https://calendar.google.com/calendar/render");
  googleUrl.searchParams.set("action", "TEMPLATE");
  googleUrl.searchParams.set("text", event.title);
  googleUrl.searchParams.set("dates", googleDates);
  if (details) googleUrl.searchParams.set("details", details);

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NAHCA//Events//EN",
    "BEGIN:VEVENT",
    `UID:nahca-event-${y}${pad(m + 1)}${pad(day)}-${Math.random().toString(36).slice(2, 8)}@nahca.org`,
    `DTSTAMP:${utcStamp(new Date())}`,
    allDay ? `DTSTART;VALUE=DATE:${icsStart}` : `DTSTART:${icsStart}`,
    allDay ? `DTEND;VALUE=DATE:${icsEnd}` : `DTEND:${icsEnd}`,
    `SUMMARY:${escapeICS(event.title)}`,
    details ? `DESCRIPTION:${escapeICS(details)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => line !== null);

  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsLines.join("\r\n"))}`;

  return { googleUrl: googleUrl.toString(), icsHref };
}
