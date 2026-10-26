import { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma";

// Records every successful add/edit/delete an admin makes, for the Activity
// Log page. Hooked in once (see index.ts) rather than in each route, so a new
// admin route is logged automatically: any mutating request that passed an
// admin guard gets an entry, named by SPECIAL_RULES below when there's a more
// specific wording than the generic "Added/Edited/Deleted <thing>".

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

type Body = Record<string, unknown>;

interface Rule {
  method: string;
  pattern: RegExp;
  // null = deliberately not logged.
  action: (body: Body) => string | null;
  // The route is open to any signed-in user (not behind an admin guard), so
  // it's only logged when the person doing it happens to be an admin.
  anyAdmin?: boolean;
}

const flag = (value: unknown, yes: string, no: string) => (value ? yes : no);

const SPECIAL_RULES: Rule[] = [
  // Uploads are just a step inside a larger add/edit, which is logged itself.
  { method: "POST", pattern: /^\/uploads$/, action: () => null },
  { method: "POST", pattern: /^\/products\/admin\/upload$/, action: () => null },

  { method: "PATCH", pattern: /^\/products\/admin\/:id$/, action: (b) => {
      const keys = Object.keys(b);
      return keys.length === 1 && keys[0] === "published"
        ? flag(b.published, "Published product", "Unpublished product")
        : "Edited product";
    } },
  { method: "POST", pattern: /^\/forum\/admin\/topics\/:id\/approve$/, action: () => "Approved forum topic" },
  { method: "POST", pattern: /^\/forum\/admin\/topics\/:id\/reject$/, action: () => "Rejected forum topic" },
  { method: "PATCH", pattern: /^\/forum\/admin\/topics\/:id$/, action: (b) =>
      b.pinned !== undefined
        ? flag(b.pinned, "Pinned forum topic", "Unpinned forum topic")
        : flag(b.locked, "Locked forum topic", "Unlocked forum topic") },
  { method: "DELETE", pattern: /^\/forum\/admin\/topics\/:id$/, action: () => "Deleted forum topic" },
  { method: "DELETE", pattern: /^\/forum\/admin\/replies\/:id$/, action: () => "Deleted forum reply" },
  { method: "POST", pattern: /^\/forum\/topics$/, action: () => "Added forum topic", anyAdmin: true },
  { method: "POST", pattern: /^\/forum\/topics\/:id\/replies$/, action: () => "Added forum reply", anyAdmin: true },
  { method: "POST", pattern: /^\/event-registrations\/:eventCode\/send-receipt-email$/, action: () => "Sent receipt email to event attendees" },

  { method: "POST", pattern: /^\/admin-users$/, action: () => "Created admin user" },
  { method: "PATCH", pattern: /^\/admin-users\/:id$/, action: () => "Edited admin user" },
  { method: "POST", pattern: /^\/admin-users\/:id\/reset-password$/, action: () => "Reset an admin user's password" },
  { method: "DELETE", pattern: /^\/admin-users\/:id$/, action: () => "Deleted admin user" },
];

// First path segment -> the thing being changed, for the generic wording.
const NOUNS: Record<string, string> = {
  coupons: "coupon",
  "membership-plans": "membership plan",
  memberships: "member",
  products: "product",
  forum: "forum item",
  events: "event",
  webinars: "webinar",
  "conference-videos": "conference video",
  articles: "article",
  newsletters: "newsletter",
  board: "board member",
  "event-registrations": "event registration",
  donations: "donation",
};

const VERBS: Record<string, string> = { POST: "Added", PUT: "Edited", PATCH: "Edited", DELETE: "Deleted" };

function genericAction(method: string, pattern: string): string {
  const first = pattern.split("/").filter(Boolean)[0] ?? "";
  return `${VERBS[method] ?? method} ${NOUNS[first] ?? first.replace(/-/g, " ")}`.trim();
}

// "#5 "Spring sale"" — enough to tell which record without a lookup. Only
// ever reads a few harmless identifying fields, never the whole body (which
// can hold passwords).
function describeTarget(req: Request): string | null {
  const body = (req.body ?? {}) as Body;
  const id = req.params.id ?? req.params.type ?? req.params.eventCode;
  const name = [body.title, body.name, body.code, body.email].find((v) => typeof v === "string" && v.trim());
  const parts = [id ? `#${id}` : null, name ? `"${String(name).trim()}"` : null].filter(Boolean);
  return parts.length ? parts.join(" ").slice(0, 500) : null;
}

async function recordActivity(req: Request): Promise<void> {
  const pattern = `${req.baseUrl}${req.route?.path ?? ""}`.replace(/\/$/, "") || "/";
  const rule = SPECIAL_RULES.find((r) => r.method === req.method && r.pattern.test(pattern));
  const body = (req.body ?? {}) as Body;

  let action: string | null;
  if (rule) {
    action = rule.action(body);
  } else if (req.admin) {
    action = genericAction(req.method, pattern);
  } else {
    return;
  }
  if (!action) return;

  let actor = req.admin;
  if (!actor) {
    if (!rule?.anyAdmin || req.auth?.role !== "admin") return;
    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      select: { id: true, name: true, email: true },
    });
    if (!user) return;
    actor = { id: user.id, name: user.name, email: user.email, isSuperAdmin: false, permissions: [] };
  }

  await prisma.activityLog.create({
    data: {
      adminId: actor.id,
      adminName: actor.name,
      adminEmail: actor.email,
      action,
      details: describeTarget(req),
    },
  });
}

export function activityLogger(req: Request, res: Response, next: NextFunction) {
  if (MUTATING_METHODS.has(req.method)) {
    res.on("finish", () => {
      if (res.statusCode >= 400) return;
      recordActivity(req).catch((err) => console.error("Activity log write failed:", err));
    });
  }
  next();
}
