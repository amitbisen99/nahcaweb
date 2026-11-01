import crypto from "crypto";
import { prisma } from "../prisma";

// Same unambiguous alphabet used for institution claim codes (no 0/O,
// 1/I/L) — these get read aloud/typed by hand too (an admin copying it
// into the coupon form's Event Code field).
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function randomSuffix(length: number): string {
  return Array.from({ length }, () => CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)]).join("");
}

// Generates a unique code for a newly-created Event or Webinar, shown on
// its admin detail page and used to scope a Coupon to that specific item
// (see Coupon.eventCode). Checked against BOTH tables — a coupon looking
// up an event code doesn't know ahead of time which one it belongs to, so
// codes must be unique across both, not just within their own table.
export async function createEventCode(prefix: "EVT" | "WEB", attempt = 0): Promise<string> {
  const code = `${prefix}-${randomSuffix(6)}`;

  const [existingEvent, existingWebinar] = await Promise.all([
    prisma.event.findUnique({ where: { eventCode: code } }),
    prisma.webinar.findUnique({ where: { eventCode: code } }),
  ]);

  if (existingEvent || existingWebinar) {
    if (attempt >= 5) throw new Error("Failed to generate a unique event code after 5 attempts");
    return createEventCode(prefix, attempt + 1);
  }

  return code;
}

// Used by the coupon routes to confirm an admin-entered event code
// actually refers to a real Event or Webinar before saving.
export async function eventCodeExists(code: string): Promise<boolean> {
  const [event, webinar] = await Promise.all([
    prisma.event.findUnique({ where: { eventCode: code }, select: { id: true } }),
    prisma.webinar.findUnique({ where: { eventCode: code }, select: { id: true } }),
  ]);
  return Boolean(event || webinar);
}

export interface EventOrWebinarSummary {
  id: number;
  type: "event" | "webinar";
  title: string;
  // Events always have a date; a webinar's is optional, so this can be null.
  date: Date | null;
  time: string | null;
  priceCents: number | null;
  published: boolean;
}

// Used by the event-registration flow to resolve an event code into the
// details it actually needs (title/date for the confirmation message,
// price for the Stripe line item) without the caller having to know or
// care whether it's an Event or a Webinar.
export async function findEventOrWebinarByCode(code: string): Promise<EventOrWebinarSummary | null> {
  const [event, webinar] = await Promise.all([
    prisma.event.findUnique({ where: { eventCode: code } }),
    prisma.webinar.findUnique({ where: { eventCode: code } }),
  ]);

  if (event) {
    return {
      id: event.id,
      type: "event",
      title: event.title,
      date: event.date,
      time: event.time,
      priceCents: event.priceCents,
      published: event.published,
    };
  }
  if (webinar) {
    return {
      id: webinar.id,
      type: "webinar",
      title: webinar.title,
      date: webinar.date,
      time: webinar.time,
      priceCents: webinar.priceCents,
      published: webinar.published,
    };
  }
  return null;
}

export interface EventOrWebinarEmailDetails extends EventOrWebinarSummary {
  description: string | null;
  // The webinar's Zoom/YouTube link — always null for an event.
  joinLink: string | null;
}

export async function findEventDetailsByCode(code: string): Promise<EventOrWebinarEmailDetails | null> {
  const summary = await findEventOrWebinarByCode(code);
  if (!summary) return null;

  if (summary.type === "event") {
    const event = await prisma.event.findUnique({ where: { id: summary.id }, select: { description: true } });
    return { ...summary, description: event?.description ?? null, joinLink: null };
  }

  const webinar = await prisma.webinar.findUnique({
    where: { id: summary.id },
    select: { description: true, zoomOrYoutubeLink: true },
  });
  return { ...summary, description: webinar?.description ?? null, joinLink: webinar?.zoomOrYoutubeLink ?? null };
}

// The event/webinar's own page on the website, for links in emails.
export function eventPageUrl(type: "event" | "webinar", id: number): string | null {
  const origin = process.env.WEB_ORIGIN?.replace(/\/$/, "");
  if (!origin) return null;
  return type === "webinar" ? `${origin}/events/webinars/${id}` : `${origin}/events/${id}`;
}
