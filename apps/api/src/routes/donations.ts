import { Router } from "express";
import { z } from "zod";
import ExcelJS from "exceljs";
import { prisma } from "../prisma";
import { stripe } from "../lib/stripe";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { paymentsBypassed } from "../lib/paymentsBypass";
import { activatePayment } from "../lib/paymentActivation";
import { formatDate } from "../lib/formatDate";
import type { Request } from "express";

export const donationsRouter = Router();

const donationSchema = z.object({
  donorName: z.string().min(1),
  donorEmail: z.string().email(),
  amountCents: z.number().int().min(100),
  purpose: z.string().optional(),
  address: z.string().optional(),
  // No longer sent by the donation form (the "monthly recurring" option was
  // removed) — still accepted here for backward compat, always false now.
  recurring: z.boolean().default(false),
});

donationsRouter.post("/", asyncHandler(async (req, res) => {
  const parsed = donationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { donorName, donorEmail, amountCents, purpose, address, recurring } = parsed.data;

  const donation = await prisma.donation.create({
    data: { donorName, donorEmail, amountCents, purpose, address, recurring },
  });

  const payment = await prisma.payment.create({
    data: {
      donationId: donation.id,
      type: "donation",
      amountCents,
      status: "pending",
    },
  });

  if (paymentsBypassed()) {
    await activatePayment(payment.id, `bypass-${Date.now()}`);
    return res.status(201).json({ checkoutUrl: `${process.env.WEB_ORIGIN}/donate?status=success` });
  }

  const session = await stripe.checkout.sessions.create({
    mode: recurring ? "subscription" : "payment",
    payment_method_types: ["card"],
    customer_email: donorEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: purpose ? `Donation — ${purpose}` : "Donation to NAHCA",
          },
          unit_amount: amountCents,
          ...(recurring ? { recurring: { interval: "month" as const } } : {}),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.WEB_ORIGIN}/donate?status=success`,
    cancel_url: `${process.env.WEB_ORIGIN}/donate?status=cancelled`,
    metadata: {
      paymentId: String(payment.id),
      donationId: String(donation.id),
    },
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { stripeRef: session.id },
  });

  res.status(201).json({ checkoutUrl: session.url });
}));

const DEFAULT_PAGE_SIZE = 10;

// Shared by the list and export routes below so the export always matches
// whatever the admin currently has filtered to on screen.
function buildDonationsWhere(req: Request): { donorEmail?: { contains: string }; createdAt?: { gte?: Date; lte?: Date } } {
  const email = typeof req.query.email === "string" ? req.query.email.trim() : "";
  const from = typeof req.query.from === "string" ? req.query.from : "";
  const to = typeof req.query.to === "string" ? req.query.to : "";

  const where: { donorEmail?: { contains: string }; createdAt?: { gte?: Date; lte?: Date } } = {};
  if (email) where.donorEmail = { contains: email };
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

// Admin donation list — every completed/pending/failed donation, searchable
// by donor email and by a createdAt date range. Donations were always
// stored correctly (see POST / above); this was just never surfaced
// anywhere in the admin panel.
donationsRouter.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || DEFAULT_PAGE_SIZE));
    const where = buildDonationsWhere(req);

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        include: { payment: { select: { status: true, stripeRef: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.donation.count({ where }),
    ]);

    res.json({ donations, total, page, pageSize });
  })
);

// Admin — export the (optionally filtered) donation list as an .xlsx file.
// Same email/from/to filters as the list above, unpaginated — an export is
// expected to cover every matching donation, not just the current page.
// Registered before "/:id" below so "export" is never matched as a numeric
// id there (Express matches routes in registration order).
donationsRouter.get(
  "/export",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const where = buildDonationsWhere(req);

    const donations = await prisma.donation.findMany({
      where,
      include: { payment: { select: { status: true, stripeRef: true } } },
      orderBy: { createdAt: "desc" },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Donations");
    sheet.columns = [
      { header: "Donor", key: "donor", width: 28 },
      { header: "Email", key: "email", width: 32 },
      { header: "Purpose", key: "purpose", width: 24 },
      { header: "Amount", key: "amount", width: 14 },
      { header: "Address", key: "address", width: 32 },
      { header: "Status", key: "status", width: 14 },
      { header: "Date", key: "date", width: 16 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const d of donations) {
      sheet.addRow({
        donor: d.donorName,
        email: d.donorEmail,
        purpose: d.purpose || "—",
        amount: `$${(d.amountCents / 100).toFixed(2)}`,
        address: d.address || "—",
        status: d.payment?.status ?? "unknown",
        date: formatDate(d.createdAt),
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="Donations.xlsx"`);
    res.send(Buffer.from(buffer));
  })
);

// Admin — single donation, full detail (including purpose/address/recurring,
// which the list table above no longer shows) for the "View" screen.
donationsRouter.get(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const donation = await prisma.donation.findUnique({
      where: { id },
      include: { payment: { select: { status: true, stripeRef: true } } },
    });
    if (!donation) return res.status(404).json({ error: "Not found" });

    res.json({ donation });
  })
);
