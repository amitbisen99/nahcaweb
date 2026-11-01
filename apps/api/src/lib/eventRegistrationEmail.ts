import { buildCalendarEntry } from "./calendarLinks";
import type { EmailAttachment } from "./mailer";

// The "you're registered" email sent when someone joins an event or webinar —
// a guest, a general user or a member alike (see activatePayment and
// POST /event-registrations/quick-join). Carries the details people need:
// date and time, the webinar's own link (webinars only), a link to the
// event/webinar page on the site, and Add to Calendar links plus an .ics file.

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Event/webinar dates are a bare calendar day (midnight UTC from the admin's
// date picker), so format in UTC — the server's own timezone could show the
// previous day.
function formatDay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function buildEventRegistrationEmail(opts: {
  attendeeName: string;
  type: "event" | "webinar";
  title: string;
  date: Date | null;
  time: string | null;
  // The event/webinar's own page on the website.
  pageUrl: string | null;
  // The webinar's Zoom/YouTube link — webinars only, never an event.
  joinLink: string | null;
  description?: string | null;
  // Stable per event/webinar, so re-adding the .ics doesn't duplicate it.
  calendarUid: string;
}) {
  const isWebinar = opts.type === "webinar";
  const kindLabel = isWebinar ? "Webinar" : "Event";
  const org = process.env.ORG_NAME ?? "";
  const dayLabel = opts.date ? formatDay(opts.date) : null;
  const joinLink = isWebinar ? opts.joinLink : null;

  const confirmation = isWebinar
    ? `You successfully registered for the webinar '${opts.title}'.`
    : `You registered for this event '${opts.title}'${dayLabel ? ` held on ${dayLabel}` : ""}.`;

  const calendar = opts.date
    ? buildCalendarEntry({
        uid: opts.calendarUid,
        title: opts.title,
        description: opts.description,
        date: opts.date,
        time: opts.time,
        url: joinLink ?? opts.pageUrl,
      })
    : null;

  const attachments: EmailAttachment[] = calendar
    ? [{ name: "event.ics", content: Buffer.from(calendar.ics, "utf8").toString("base64") }]
    : [];

  const body = [
    org,
    ``,
    `Dear ${opts.attendeeName},`,
    ``,
    confirmation,
    ``,
    `${kindLabel}: ${opts.title}`,
    ...(opts.pageUrl ? [`Details: ${opts.pageUrl}`] : []),
    ...(dayLabel ? [`Date: ${dayLabel}`] : []),
    ...(opts.time ? [`Time: ${opts.time}`] : []),
    ...(joinLink ? [`Webinar link: ${joinLink}`] : []),
    ...(calendar
      ? [
          ``,
          `Add to calendar:`,
          `Google Calendar: ${calendar.googleUrl}`,
          `Outlook.com: ${calendar.outlookUrl}`,
          `(A calendar file for Apple Calendar and Outlook is attached.)`,
        ]
      : []),
  ].join("\n");

  const rows: string[] = [];
  if (dayLabel) rows.push(`<tr><td style="padding:2px 12px 2px 0;color:#555;">Date</td><td>${escapeHtml(dayLabel)}</td></tr>`);
  if (opts.time) rows.push(`<tr><td style="padding:2px 12px 2px 0;color:#555;">Time</td><td>${escapeHtml(opts.time)}</td></tr>`);
  if (joinLink) {
    rows.push(
      `<tr><td style="padding:2px 12px 2px 0;color:#555;">Webinar link</td><td><a href="${escapeHtml(joinLink)}">${escapeHtml(joinLink)}</a></td></tr>`
    );
  }

  const titleHtml = opts.pageUrl
    ? `<a href="${escapeHtml(opts.pageUrl)}" style="color:#9a2a4a;text-decoration:underline;">${escapeHtml(opts.title)}</a>`
    : escapeHtml(opts.title);

  const html = [
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#222;max-width:560px;">`,
    `<p style="margin:0 0 12px;font-weight:bold;">${escapeHtml(org)}</p>`,
    `<p style="margin:0 0 12px;">Dear ${escapeHtml(opts.attendeeName)},</p>`,
    `<p style="margin:0 0 16px;">${isWebinar ? `You successfully registered for the webinar` : `You registered for this event`} <strong>${titleHtml}</strong>${
      !isWebinar && dayLabel ? ` held on ${escapeHtml(dayLabel)}` : ""
    }.</p>`,
    rows.length ? `<table style="border-collapse:collapse;margin:0 0 16px;">${rows.join("")}</table>` : "",
    calendar
      ? [
          `<p style="margin:0 0 6px;font-weight:bold;">Add to calendar</p>`,
          `<p style="margin:0 0 4px;">`,
          `<a href="${escapeHtml(calendar.googleUrl)}" style="color:#9a2a4a;">Google Calendar</a> &nbsp;|&nbsp; `,
          `<a href="${escapeHtml(calendar.outlookUrl)}" style="color:#9a2a4a;">Outlook.com</a>`,
          `</p>`,
          `<p style="margin:0;color:#555;font-size:13px;">A calendar file for Apple Calendar and Outlook is attached.</p>`,
        ].join("")
      : "",
    `</div>`,
  ].join("");

  return {
    subject: `You're registered — ${opts.title}`,
    body,
    html,
    attachments,
  };
}
