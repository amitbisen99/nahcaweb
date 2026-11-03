import { Router } from "express";
import type { Request } from "express";
import ExcelJS from "exceljs";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth, requirePermission } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { findEventOrWebinarByCode } from "../lib/eventCodes";
import { formatDate } from "../lib/formatDate";

export const paymentsRouter = Router();

// The event/webinar an event payment was for. Several payments often share a
// code, so each is looked up once.
async function resolveEvents(codes: (string | null | undefined)[]) {
  const unique = [...new Set(codes.filter((code): code is string => Boolean(code)))];
  const found = await Promise.all(unique.map(async (code) => [code, await findEventOrWebinarByCode(code)] as const));
  const events = new Map<string, { title: string; type: "event" | "webinar" }>();
  for (const [code, info] of found) if (info) events.set(code, { title: info.title, type: info.type });
  return events;
}

paymentsRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId }, select: { email: true } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Event and webinar payments hang off the registration rather than the
    // user, so match on that — by account, or by the email used on the
    // guest form (the same rule the "Your Events and Webinars" page uses).
    const payments = await prisma.payment.findMany({
      where: {
        OR: [
          { userId: req.auth!.userId },
          { eventRegistration: { OR: [{ userId: req.auth!.userId }, { email: user.email }] } },
        ],
      },
      include: {
        membership: true,
        donation: true,
        eventRegistration: { select: { eventCode: true } },
        productOrder: { include: { product: { select: { id: true, title: true, type: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const events = await resolveEvents(payments.map((p) => p.eventRegistration?.eventCode));
    res.json({
      payments: payments.map(({ eventRegistration, ...payment }) => ({
        ...payment,
        event: (eventRegistration && events.get(eventRegistration.eventCode)) || null,
      })),
    });
  })
);

// ---------------------------------------------------------------------------
// Admin — every transaction on the site, whoever made it.
// ---------------------------------------------------------------------------

const MEMBERSHIP_LABELS: Record<string, string> = {
  regular: "Regular Membership",
  student: "Student Membership",
  institutional: "Institutional Membership",
  conference: "Conference Membership",
};

const PAYMENT_TYPES = ["membership", "donation", "conference", "endorsement", "event", "product"] as const;
const PAYMENT_STATUSES = ["pending", "succeeded", "failed", "refunded"] as const;

const DEFAULT_PAGE_SIZE = 20;

// Shared by the list and the export so the file always matches the filters on
// screen.
function buildTransactionsWhere(req: Request): Prisma.PaymentWhereInput {
  const str = (key: string) => (typeof req.query[key] === "string" ? (req.query[key] as string).trim() : "");
  const type = str("type");
  const status = str("status");
  const q = str("q");
  const from = str("from");
  const to = str("to");

  const where: Prisma.PaymentWhereInput = {};
  if ((PAYMENT_TYPES as readonly string[]).includes(type)) where.type = type as (typeof PAYMENT_TYPES)[number];
  if ((PAYMENT_STATUSES as readonly string[]).includes(status)) where.status = status as (typeof PAYMENT_STATUSES)[number];

  if (q) {
    where.OR = [
      { user: { OR: [{ name: { contains: q } }, { email: { contains: q } }] } },
      { eventRegistration: { OR: [{ name: { contains: q } }, { email: { contains: q } }] } },
      { donation: { OR: [{ donorName: { contains: q } }, { donorEmail: { contains: q } }] } },
    ];
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) {
      // Inclusive of the whole "to" day, not just midnight.
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = toDate;
    }
  }
  return where;
}

const transactionInclude = {
  user: { select: { name: true, email: true } },
  membership: { select: { type: true, groupId: true } },
  donation: { select: { donorName: true, donorEmail: true, purpose: true } },
  eventRegistration: { select: { eventCode: true, name: true, email: true, user: { select: { name: true, email: true } } } },
  productOrder: { select: { product: { select: { title: true } } } },
  coupon: { select: { code: true } },
} satisfies Prisma.PaymentInclude;

type TransactionPayment = Prisma.PaymentGetPayload<{ include: typeof transactionInclude }>;

function describeTransaction(payment: TransactionPayment, events: Map<string, { title: string; type: "event" | "webinar" }>) {
  const registration = payment.eventRegistration;
  const event = registration ? events.get(registration.eventCode) : undefined;

  let category = "Payment";
  let service = "—";
  switch (payment.type) {
    case "membership":
      category = "Membership";
      service = payment.membership
        ? payment.membership.type === "institutional" && payment.membership.groupId === null
          ? "Institutional Sponsorship"
          : (MEMBERSHIP_LABELS[payment.membership.type] ?? "Membership")
        : "Membership";
      break;
    case "event":
      category = event?.type === "webinar" ? "Webinar" : "Event";
      service = event?.title ?? registration?.eventCode ?? "—";
      break;
    case "product":
      category = "Store";
      service = payment.productOrder?.product.title ?? "Store purchase";
      break;
    case "donation":
      category = "Donation";
      service = payment.donation?.purpose || "General donation";
      break;
    case "conference":
      category = "Conference";
      service = "Conference fee";
      break;
    case "endorsement":
      category = "Endorsement";
      service = "Endorsement fee";
      break;
  }

  // Who paid: their account if they have one, otherwise the name and email
  // they typed on the guest form or the donation form.
  const person =
    payment.user ??
    registration?.user ??
    (registration ? { name: registration.name, email: registration.email } : null) ??
    (payment.donation ? { name: payment.donation.donorName, email: payment.donation.donorEmail } : null);

  return {
    id: payment.id,
    createdAt: payment.createdAt,
    category,
    service,
    name: person?.name ?? null,
    email: person?.email ?? null,
    hasAccount: Boolean(payment.user ?? registration?.user),
    amountCents: payment.amountCents,
    status: payment.status,
    couponCode: payment.coupon?.code ?? null,
    stripeRef: payment.stripeRef,
  };
}

paymentsRouter.get(
  "/",
  requireAuth,
  requirePermission("transactions"),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || DEFAULT_PAGE_SIZE));
    const where = buildTransactionsWhere(req);

    const [payments, total, succeeded] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: transactionInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.payment.count({ where }),
      // What actually came in across everything matching, not just this page.
      prisma.payment.aggregate({ where: { ...where, status: "succeeded" }, _sum: { amountCents: true }, _count: true }),
    ]);

    const events = await resolveEvents(payments.map((p) => p.eventRegistration?.eventCode));
    res.json({
      transactions: payments.map((p) => describeTransaction(p, events)),
      total,
      page,
      pageSize,
      succeededCount: succeeded._count,
      succeededCents: succeeded._sum.amountCents ?? 0,
    });
  })
);

// Registered before anything with an :id, so "export" is never read as one.
paymentsRouter.get(
  "/export",
  requireAuth,
  requirePermission("transactions"),
  asyncHandler(async (req, res) => {
    const payments = await prisma.payment.findMany({
      where: buildTransactionsWhere(req),
      include: transactionInclude,
      orderBy: { createdAt: "desc" },
    });
    const events = await resolveEvents(payments.map((p) => p.eventRegistration?.eventCode));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Transactions");
    sheet.columns = [
      { header: "Date", key: "date", width: 14 },
      { header: "Type", key: "category", width: 14 },
      { header: "Service / Event", key: "service", width: 40 },
      { header: "Name", key: "name", width: 26 },
      { header: "Email", key: "email", width: 32 },
      { header: "Amount", key: "amount", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Coupon", key: "coupon", width: 16 },
      { header: "Reference", key: "ref", width: 34 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const payment of payments) {
      const t = describeTransaction(payment, events);
      sheet.addRow({
        date: formatDate(t.createdAt),
        category: t.category,
        service: t.service,
        name: t.name ?? "—",
        email: t.email ?? "—",
        amount: `$${(t.amountCents / 100).toFixed(2)}`,
        status: t.status,
        coupon: t.couponCode ?? "—",
        ref: t.stripeRef ?? "—",
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="Transactions.xlsx"`);
    res.send(Buffer.from(buffer));
  })
);
