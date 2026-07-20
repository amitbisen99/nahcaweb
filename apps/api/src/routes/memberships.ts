import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma";
import { stripe } from "../lib/stripe";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { INSTITUTIONAL_MIN_STUDENTS, TIER_LABELS, priceForTier } from "../lib/membershipTiers";
import { paymentsBypassed } from "../lib/paymentsBypass";
import { activatePayment } from "../lib/paymentActivation";

export const membershipsRouter = Router();

// TODO(phase 2b): recurring billing (auto-renewal), coupon redemption, and
// per-student assignment for institution-sponsored groups (Membership.groupId).

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

    if (paymentsBypassed()) {
      await activatePayment(payment.id, `bypass-${Date.now()}`);
      return res.status(201).json({ checkoutUrl: `${process.env.WEB_ORIGIN}/membership?status=success` });
    }

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
