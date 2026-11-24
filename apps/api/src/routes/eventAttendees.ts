import { Router } from "express";
import type { Request } from "express";
import ExcelJS from "exceljs";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth, requirePermission } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { formatDate } from "../lib/formatDate";

// Admin — everyone who registered for any event or webinar, in one place.
// (The per-event attendee pages under Website Content stay as they were.)
export const eventAttendeesRouter = Router();

const DEFAULT_PAGE_SIZE = 20;

const PRIMARY_ROLE_LABELS: Record<string, string> = {
  chaplain: "Chaplain/Spiritual Caregiver",
  student: "Chaplaincy student",
};

interface EventSummary {
  title: string;
  type: "Event" | "Webinar";
  date: Date | null;
  time: string | null;
}

// Events and webinars by code, so each registration can be shown with the
// title of what it was for. Both tables are small.
async function loadEventIndex() {
  const [events, webinars] = await Promise.all([
    prisma.event.findMany({ select: { eventCode: true, title: true, date: true, time: true } }),
    prisma.webinar.findMany({ select: { eventCode: true, title: true, date: true, time: true } }),
  ]);
  const index = new Map<string, EventSummary>();
  for (const e of events) index.set(e.eventCode, { title: e.title, type: "Event", date: e.date, time: e.time });
  for (const w of webinars) index.set(w.eventCode, { title: w.title, type: "Webinar", date: w.date, time: w.time });
  return index;
}

// Whatever a registration needs from the account behind it, if it has one.
const registrationInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      profile: {
        select: {
          preferredPronouns: true,
          mailingAddress: true,
          addressStreet: true,
          addressState: true,
          addressCountry: true,
          addressPostalCode: true,
          phone: true,
          usesWhatsapp: true,
          whatsappContactOk: true,
          religiousTraditions: true,
          religiousTraditionOther: true,
          primaryRole: true,
          hearAboutUs: true,
          hearAboutUsOther: true,
        },
      },
      memberships: { where: { status: "active" as const }, select: { id: true }, take: 1 },
    },
  },
  payment: { include: { coupon: { select: { code: true } } } },
} satisfies Prisma.EventRegistrationInclude;

type RegistrationRow = Prisma.EventRegistrationGetPayload<{ include: typeof registrationInclude }>;

const asList = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);

// One flat description of an attendee, used by the list, the detail page and
// the export so they never disagree. A guest's answers live on the
// registration; an account holder's fall back to their member profile.
function describeAttendee(r: RegistrationRow, events: Map<string, EventSummary>) {
  const event = events.get(r.eventCode);
  const profile = r.user?.profile ?? null;

  const traditions = asList(r.religiousTraditions ?? profile?.religiousTraditions);
  const traditionOther = r.religiousTraditionOther ?? profile?.religiousTraditionOther ?? null;
  const address =
    r.mailingAddress ??
    ([profile?.addressStreet, profile?.addressState, profile?.addressCountry, profile?.addressPostalCode]
      .filter(Boolean)
      .join(", ") ||
      profile?.mailingAddress ||
      null);

  const role = r.primaryRole ?? profile?.primaryRole ?? null;
  const hearAbout = r.hearAboutUs ?? profile?.hearAboutUs ?? null;

  return {
    id: r.id,
    createdAt: r.createdAt,
    status: r.status,
    eventCode: r.eventCode,
    eventTitle: event?.title ?? r.eventCode,
    eventType: event?.type ?? null,
    eventDate: event?.date ?? null,
    eventTime: event?.time ?? null,
    name: r.user?.name ?? r.name ?? null,
    email: r.user?.email ?? r.email ?? null,
    // Guest = registered on the form with no account; Member = account with an
    // active membership; General user = account without one.
    attendeeType: r.user ? (r.user.memberships.length > 0 ? "Member" : "General user") : "Guest",
    pronouns: r.preferredPronouns ?? profile?.preferredPronouns ?? null,
    phone: r.phone ?? profile?.phone ?? null,
    mailingAddress: address,
    usesWhatsapp: r.usesWhatsapp ?? profile?.usesWhatsapp ?? null,
    whatsappContactOk: r.whatsappContactOk ?? profile?.whatsappContactOk ?? null,
    religiousTraditions: traditions,
    religiousTraditionOther: traditionOther,
    primaryRole: role,
    primaryRoleLabel: role ? (PRIMARY_ROLE_LABELS[role] ?? role) : null,
    employment: Array.isArray(r.employment) ? r.employment : [],
    hearAboutUs: hearAbout,
    hearAboutUsOther: r.hearAboutUsOther ?? profile?.hearAboutUsOther ?? null,
    amountCents: r.payment?.amountCents ?? null,
    paymentStatus: r.payment?.status ?? null,
    couponCode: r.payment?.coupon?.code ?? null,
    paymentRef: r.payment?.stripeRef ?? null,
  };
}

// Same filters for the list and the export, so a file always matches the
// screen it came from.
async function buildWhere(req: Request, events: Map<string, EventSummary>): Promise<Prisma.EventRegistrationWhereInput> {
  const str = (key: string) => (typeof req.query[key] === "string" ? (req.query[key] as string).trim() : "");
  const eventCode = str("eventCode");
  const status = str("status");
  const q = str("q");
  const type = str("type");

  const where: Prisma.EventRegistrationWhereInput = {};
  if (eventCode) where.eventCode = eventCode;
  // Only confirmed registrations are attendees by default; a "pending" one never
  // finished paying.
  if (status === "pending") where.status = "pending";
  else if (status !== "all") where.status = "active";

  // Same meaning as attendeeType in describeAttendee: Guest = no account,
  // Member = account with an active membership, General user = account without.
  const activeMembership = { memberships: { some: { status: "active" as const } } };
  if (type === "guest") where.userId = null;
  else if (type === "member") where.user = activeMembership;
  else if (type === "general") where.user = { NOT: activeMembership };

  if (q) {
    const codesByTitle = [...events.entries()]
      .filter(([, e]) => e.title.toLowerCase().includes(q.toLowerCase()))
      .map(([code]) => code);
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
      { user: { OR: [{ name: { contains: q } }, { email: { contains: q } }] } },
      ...(codesByTitle.length ? [{ eventCode: { in: codesByTitle } }] : []),
    ];
  }
  return where;
}

// The events and webinars to filter by.
eventAttendeesRouter.get(
  "/events",
  requireAuth,
  requirePermission("event_attendees"),
  asyncHandler(async (_req, res) => {
    const index = await loadEventIndex();
    const options = [...index.entries()]
      .map(([code, e]) => ({ code, title: e.title, type: e.type, date: e.date }))
      .sort((a, b) => a.title.localeCompare(b.title));
    res.json({ events: options });
  })
);

eventAttendeesRouter.get(
  "/",
  requireAuth,
  requirePermission("event_attendees"),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || DEFAULT_PAGE_SIZE));

    const events = await loadEventIndex();
    const where = await buildWhere(req, events);

    const [rows, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where,
        include: registrationInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.eventRegistration.count({ where }),
    ]);

    res.json({ attendees: rows.map((r) => describeAttendee(r, events)), total, page, pageSize });
  })
);

// Every attendee matching the current filters, with all of their details, as an
// .xlsx. Registered before "/:id" so "export" is never read as an id.
eventAttendeesRouter.get(
  "/export",
  requireAuth,
  requirePermission("event_attendees"),
  asyncHandler(async (req, res) => {
    const events = await loadEventIndex();
    const rows = await prisma.eventRegistration.findMany({
      where: await buildWhere(req, events),
      include: registrationInclude,
      orderBy: { createdAt: "desc" },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Event Attendees");
    sheet.columns = [
      { header: "Registered On", key: "registered", width: 14 },
      { header: "Registration Status", key: "status", width: 14 },
      { header: "Event / Webinar", key: "event", width: 40 },
      { header: "Type", key: "type", width: 10 },
      { header: "Event Code", key: "code", width: 14 },
      { header: "Event Date", key: "eventDate", width: 14 },
      { header: "Name", key: "name", width: 26 },
      { header: "Email", key: "email", width: 32 },
      { header: "Attendee Type", key: "attendeeType", width: 14 },
      { header: "Pronouns", key: "pronouns", width: 16 },
      { header: "Primary Role in Spiritual Care", key: "role", width: 30 },
      { header: "How Did You Hear About NAHCA?", key: "hearAbout", width: 36 },
      { header: "Phone", key: "phone", width: 18 },
      { header: "Mailing Address", key: "address", width: 36 },
      { header: "Uses WhatsApp", key: "whatsapp", width: 14 },
      { header: "OK To Contact On WhatsApp", key: "whatsappOk", width: 16 },
      { header: "Religious / Spiritual Traditions", key: "traditions", width: 32 },
      { header: "Amount Paid", key: "amount", width: 12 },
      { header: "Payment Status", key: "paymentStatus", width: 14 },
      { header: "Coupon Code", key: "coupon", width: 16 },
      { header: "Payment Reference", key: "ref", width: 34 },
    ];
    sheet.getRow(1).font = { bold: true };

    const yesNo = (value: boolean | null) => (value === true ? "Yes" : value === false ? "No" : "");
    for (const r of rows) {
      const a = describeAttendee(r, events);
      sheet.addRow({
        registered: formatDate(a.createdAt),
        status: a.status === "active" ? "Confirmed" : "Pending",
        event: a.eventTitle,
        type: a.eventType ?? "",
        code: a.eventCode,
        eventDate: a.eventDate ? formatDate(a.eventDate) : "",
        name: a.name ?? "",
        email: a.email ?? "",
        attendeeType: a.attendeeType,
        pronouns: a.pronouns ?? "",
        role: a.primaryRoleLabel ?? "",
        hearAbout: [a.hearAboutUs, a.hearAboutUsOther].filter(Boolean).join(" — "),
        phone: a.phone ?? "",
        address: a.mailingAddress ?? "",
        whatsapp: yesNo(a.usesWhatsapp),
        whatsappOk: yesNo(a.whatsappContactOk),
        traditions: [...a.religiousTraditions, a.religiousTraditionOther].filter(Boolean).join(", "),
        amount: a.amountCents === null ? "" : `$${(a.amountCents / 100).toFixed(2)}`,
        paymentStatus: a.paymentStatus ?? "",
        coupon: a.couponCode ?? "",
        ref: a.paymentRef ?? "",
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="Event Attendees.xlsx"`);
    res.send(Buffer.from(buffer));
  })
);

eventAttendeesRouter.get(
  "/:id",
  requireAuth,
  requirePermission("event_attendees"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const row = await prisma.eventRegistration.findUnique({ where: { id }, include: registrationInclude });
    if (!row) return res.status(404).json({ error: "Not found" });

    res.json({ attendee: describeAttendee(row, await loadEventIndex()) });
  })
);
