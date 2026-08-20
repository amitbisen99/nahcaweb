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
