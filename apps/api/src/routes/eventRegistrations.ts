import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { stripe } from "../lib/stripe";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { paymentsBypassed } from "../lib/paymentsBypass";
import { activatePayment } from "../lib/paymentActivation";
import { applyCouponDiscount, findValidCoupon, isCouponError } from "../lib/coupons";
import { findEventOrWebinarByCode } from "../lib/eventCodes";
import { employmentEntrySchema } from "../lib/memberProfile";
import { buildEventRegistrationReceiptBody, sendAdminNotification, sendEmail } from "../lib/mailer";
import { withDbRetry } from "../lib/dbRetry";

export const eventRegistrationsRouter = Router();

// Public — resolves an eventCode into the details the join page/form need
// (title, date, fee) without exposing anything but that. Used by both
// events/join/[code]/page.tsx and (indirectly, via param) EventJoinForm.
eventRegistrationsRouter.get(
  "/by-code/:code",
  asyncHandler(async (req, res) => {
    const eventInfo = await findEventOrWebinarByCode(req.params.code);
    if (!eventInfo || !eventInfo.published) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({ item: eventInfo });
  })
);

// Subset of the membership questionnaire — everything up through "How did
// you hear about NAHCA?" only, per explicit instruction. The later
// sections (care contexts, board cert, endorsement, org memberships)
// don't apply to a one-off event registration.
const eventProfileSchema = z.object({
  preferredPronouns: z.string().optional(),
  mailingAddress: z.string().optional(),
  phone: z.string().optional(),
  usesWhatsapp: z.boolean().optional(),
  whatsappContactOk: z.boolean().optional(),
  religiousTraditions: z.array(z.string()).optional(),
  religiousTraditionOther: z.string().optional(),
  primaryRole: z.enum(["chaplain", "student"]).optional(),
  employment: z.array(employmentEntrySchema).optional(),
  hearAboutUs: z.string().optional(),
  hearAboutUsOther: z.string().optional(),
});

// Shared by both the guest and member paid-join paths below.
function eventJoinSuccessUrl(eventCode: string): string {
  return `${process.env.WEB_ORIGIN}/events/join/${eventCode}?status=success`;
}

async function createEventCheckoutSession(opts: {
  eventCode: string;
  eventTitle: string;
  email: string;
  priceCents: number;
  paymentId: number;
}) {
  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: opts.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `NAHCA — ${opts.eventTitle}` },
          unit_amount: opts.priceCents,
        },
        quantity: 1,
      },
    ],
    success_url: eventJoinSuccessUrl(opts.eventCode),
    cancel_url: `${process.env.WEB_ORIGIN}/events/join/${opts.eventCode}?status=cancelled`,
    metadata: { paymentId: String(opts.paymentId) },
  });
}

// Guest registration — no login, no password (client's explicit
// requirement, same guest pattern as POST /donations). Applies an
// event-scoped coupon if given, then mirrors memberships.ts's
// priceCents === 0 handling exactly: free (or comped-to-$0) registrations
// activate immediately and skip Stripe; everything else gets a real
// Checkout session.
const joinSchema = z.object({
  eventCode: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  couponCode: z.string().optional(),
  profile: eventProfileSchema.optional(),
});

eventRegistrationsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = joinSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { eventCode, name, email, couponCode, profile } = parsed.data;

    const eventInfo = await findEventOrWebinarByCode(eventCode);
    if (!eventInfo || !eventInfo.published) {
      return res.status(404).json({ error: "Event not found" });
    }

    const basePriceCents = eventInfo.priceCents ?? 0;

    let couponId: number | null = null;
    let priceCents = basePriceCents;
    if (couponCode) {
      const result = await findValidCoupon(couponCode, { eventCode });
      if (isCouponError(result)) return res.status(result.status).json({ error: result.message });
      couponId = result.id;
      priceCents = applyCouponDiscount(basePriceCents, result);
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventCode,
        name,
        email,
        status: "pending",
        ...profile,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        eventRegistrationId: registration.id,
        couponId,
        type: "event",
        amountCents: priceCents,
        status: "pending",
      },
    });

    if (paymentsBypassed()) {
      await activatePayment(payment.id, `bypass-${Date.now()}`);
      return res.status(201).json({ checkoutUrl: eventJoinSuccessUrl(eventCode) });
    }

    if (priceCents === 0) {
      await activatePayment(payment.id, `comp-${Date.now()}`);
      return res.status(201).json({ checkoutUrl: eventJoinSuccessUrl(eventCode) });
    }

    const session = await createEventCheckoutSession({
      eventCode,
      eventTitle: eventInfo.title,
      email,
      priceCents,
      paymentId: payment.id,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeRef: session.id },
    });

    res.status(201).json({ checkoutUrl: session.url });
  })
);

// Existing logged-in member — no form to re-fill (we already have their
// account info), but they pay the same fee a guest would (client's
// explicit requirement — this used to be free for members, no longer is).
// A paid join accepts the same optional coupon a guest can enter (the
// client's "have a coupon?" popup on the Join button, see JoinButton.tsx —
// applied the same way findValidCoupon/applyCouponDiscount handle it for
// guests). Free events/webinars still join instantly with no payment step
// at all — no coupon prompt either, since there's nothing to discount.
// Idempotent: an already-active registration is returned as-is instead of
// charging again; an abandoned pending attempt is retried fresh.
const quickJoinSchema = z.object({
  eventCode: z.string().min(1),
  couponCode: z.string().optional(),
});

eventRegistrationsRouter.post(
  "/quick-join",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = quickJoinSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { eventCode, couponCode } = parsed.data;

    const eventInfo = await findEventOrWebinarByCode(eventCode);
    if (!eventInfo || !eventInfo.published) {
      return res.status(404).json({ error: "Event not found" });
    }

    const existing = await withDbRetry(() =>
      prisma.eventRegistration.findFirst({
        where: { eventCode, userId: req.auth!.userId, status: "active" },
      })
    );
    if (existing) return res.status(200).json({ registration: existing });

    const user = await withDbRetry(() => prisma.user.findUnique({ where: { id: req.auth!.userId } }));
    if (!user) return res.status(404).json({ error: "User not found" });

    const basePriceCents = eventInfo.priceCents ?? 0;

    if (basePriceCents === 0) {
      const registration = await prisma.eventRegistration.create({
        data: { eventCode, userId: user.id, status: "active" },
      });

      const body = buildEventRegistrationReceiptBody({
        attendeeName: user.name,
        eventTitle: eventInfo.title,
        eventDate: eventInfo.date,
        type: eventInfo.type,
      });
      await sendEmail({ to: user.email, subject: `You're registered — ${eventInfo.title}`, body });
      await sendAdminNotification(
        `New event registration — ${eventInfo.title}`,
        `${user.name} (${user.email}) joined "${eventInfo.title}" — existing member, no fee for this event.`
      );

      return res.status(201).json({ registration });
    }

    let couponId: number | null = null;
    let priceCents = basePriceCents;
    if (couponCode) {
      const result = await findValidCoupon(couponCode, { eventCode });
      if (isCouponError(result)) return res.status(result.status).json({ error: result.message });
      couponId = result.id;
      priceCents = applyCouponDiscount(basePriceCents, result);
    }

    const registration = await prisma.eventRegistration.create({
      data: { eventCode, userId: user.id, status: "pending" },
    });

    const payment = await prisma.payment.create({
      data: {
        eventRegistrationId: registration.id,
        couponId,
        type: "event",
        amountCents: priceCents,
        status: "pending",
      },
    });

    if (paymentsBypassed()) {
      await activatePayment(payment.id, `bypass-${Date.now()}`);
      return res.status(201).json({ checkoutUrl: eventJoinSuccessUrl(eventCode) });
    }

    if (priceCents === 0) {
      await activatePayment(payment.id, `comp-${Date.now()}`);
      return res.status(201).json({ checkoutUrl: eventJoinSuccessUrl(eventCode) });
    }

    const session = await createEventCheckoutSession({
      eventCode,
      eventTitle: eventInfo.title,
      email: user.email,
      priceCents,
      paymentId: payment.id,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeRef: session.id },
    });

    res.status(201).json({ checkoutUrl: session.url });
  })
);

// Admin — attendee list for one event/webinar, and single-attendee detail.

const DEFAULT_PAGE_SIZE = 10;

eventRegistrationsRouter.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const eventCode = typeof req.query.eventCode === "string" ? req.query.eventCode : "";
    if (!eventCode) return res.status(400).json({ error: "eventCode is required" });

    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || DEFAULT_PAGE_SIZE));

    const [registrations, total] = await withDbRetry(() =>
      Promise.all([
        prisma.eventRegistration.findMany({
          where: { eventCode },
          include: { user: { select: { id: true, name: true, email: true } }, payment: true },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.eventRegistration.count({ where: { eventCode } }),
      ])
    );

    res.json({ registrations, total, page, pageSize });
  })
);

eventRegistrationsRouter.get(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const registration = await withDbRetry(() =>
      prisma.eventRegistration.findUnique({
        where: { id },
        include: { user: { select: { id: true, name: true, email: true } }, payment: true },
      })
    );
    if (!registration) return res.status(404).json({ error: "Not found" });

    res.json({ registration });
  })
);
