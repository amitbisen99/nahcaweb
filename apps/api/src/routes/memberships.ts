import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma";
import { stripe } from "../lib/stripe";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";

export const membershipsRouter = Router();

// TODO(phase 2b): recurring billing (auto-renewal), coupon redemption, and
// per-student assignment for institution-sponsored groups (Membership.groupId).

const TIER_LABELS: Record<string, string> = {
  regular: "Regular Membership",
  student: "Student Membership",
  institutional: "Institution-Sponsored Student Membership",
  conference: "Conference Membership",
};

// Term length used to compute Membership.endDate on activation.
const TIER_TERM_MONTHS: Record<string, number> = {
  regular: 12,
  student: 24,
  institutional: 24,
  conference: 12, // placeholder — confirm actual Conference membership term/price
};

const REGULAR_PRICE_CENTS = 7500; // $75 / 1 year
const STUDENT_PRICE_CENTS = 7500; // $75 / 2 years
const CONFERENCE_PRICE_CENTS = 7500; // placeholder — confirm actual price
const INSTITUTIONAL_PRICE_PER_STUDENT_CENTS = 6000; // $60 / student
const INSTITUTIONAL_MIN_STUDENTS = 5;

const membershipSignupSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    type: z.enum(["regular", "student", "institutional", "conference"]),
    studentCount: z.number().int().min(INSTITUTIONAL_MIN_STUDENTS).optional(),
  })
  .refine((data) => data.type !== "institutional" || data.studentCount !== undefined, {
    message: `studentCount (minimum ${INSTITUTIONAL_MIN_STUDENTS}) is required for institutional memberships`,
    path: ["studentCount"],
  });

function priceForTier(type: string, studentCount?: number): number {
  switch (type) {
    case "regular":
      return REGULAR_PRICE_CENTS;
    case "student":
      return STUDENT_PRICE_CENTS;
    case "conference":
      return CONFERENCE_PRICE_CENTS;
    case "institutional":
      return (studentCount as number) * INSTITUTIONAL_PRICE_PER_STUDENT_CENTS;
    default:
      throw new Error(`Unknown membership type: ${type}`);
  }
}

membershipsRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const parsed = membershipSignupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { name, email, password, type, studentCount } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Email already registered — please log in to add a membership." });
    }

    const priceCents = priceForTier(type, studentCount);
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({ data: { email, passwordHash, name } });

    const membership = await prisma.membership.create({
      data: { userId: user.id, type, status: "pending", priceCents },
    });

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        membershipId: membership.id,
        type: "membership",
        amountCents: priceCents,
        status: "pending",
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `NAHCA Membership — ${TIER_LABELS[type]}` },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.WEB_ORIGIN}/membership?status=success`,
      cancel_url: `${process.env.WEB_ORIGIN}/membership?status=cancelled`,
      metadata: {
        paymentId: String(payment.id),
        membershipId: String(membership.id),
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeRef: session.id },
    });

    res.status(201).json({ checkoutUrl: session.url });
  })
);

membershipsRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const memberships = await prisma.membership.findMany({
      where: { userId: req.auth!.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ memberships });
  })
);

membershipsRouter.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const memberships = await prisma.membership.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ memberships });
  })
);

export { TIER_TERM_MONTHS, TIER_LABELS };
