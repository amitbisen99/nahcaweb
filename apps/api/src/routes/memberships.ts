import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma";
import { stripe } from "../lib/stripe";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { INSTITUTIONAL_MIN_STUDENTS, getMembershipPlan } from "../lib/membershipTiers";
import { paymentsBypassed } from "../lib/paymentsBypass";
import { activatePayment } from "../lib/paymentActivation";
import { applyCouponDiscount, findValidCoupon, isCouponError } from "../lib/coupons";
import { memberProfileSchema } from "../lib/memberProfile";
import { addOrUpdateBrevoContact, removeBrevoContactFromList } from "../lib/brevoContacts";

export const membershipsRouter = Router();

// TODO(phase 2b): recurring billing (auto-renewal) and per-student assignment
// for institution-sponsored groups (Membership.groupId).

const membershipSignupSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    type: z.enum(["regular", "student", "institutional", "conference"]),
    studentCount: z.number().int().min(1).optional(),
    couponCode: z.string().optional(),
    profile: memberProfileSchema.optional(),
  })
  .refine((data) => data.type !== "institutional" || data.studentCount !== undefined, {
    message: "studentCount is required for institutional memberships",
    path: ["studentCount"],
  });

membershipsRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const parsed = membershipSignupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { name, email, password, type, studentCount, couponCode, profile } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Email already registered — please log in to add a membership." });
    }

    const plan = await getMembershipPlan(type);
    if (!plan) return res.status(400).json({ error: "Unknown membership type" });

    if (type === "institutional") {
      const minStudents = plan.minStudents ?? INSTITUTIONAL_MIN_STUDENTS;
      if ((studentCount as number) < minStudents) {
        return res.status(400).json({
          error: { message: `studentCount must be at least ${minStudents} for institutional memberships` },
        });
      }
    }

    const basePriceCents =
      type === "institutional" ? (studentCount as number) * (plan.pricePerStudentCents ?? 0) : plan.priceCents;

    let couponId: number | null = null;
    let priceCents = basePriceCents;
    if (couponCode) {
      const result = await findValidCoupon(couponCode, { planType: type });
      if (isCouponError(result)) return res.status(result.status).json({ error: result.message });
      couponId = result.id;
      priceCents = applyCouponDiscount(basePriceCents, result);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({ data: { email, passwordHash, name } });

    if (profile) {
      await prisma.memberProfile.create({ data: { userId: user.id, ...profile } });
    }

    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        type,
        status: "pending",
        priceCents,
        studentCount: type === "institutional" ? studentCount : undefined,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        membershipId: membership.id,
        couponId,
        type: "membership",
        amountCents: priceCents,
        status: "pending",
      },
    });

    if (paymentsBypassed()) {
      await activatePayment(payment.id, `bypass-${Date.now()}`);
      return res.status(201).json({ checkoutUrl: `${process.env.WEB_ORIGIN}/membership?status=success` });
    }

    if (priceCents === 0) {
      await activatePayment(payment.id, `comp-${Date.now()}`);
      return res.status(201).json({ checkoutUrl: `${process.env.WEB_ORIGIN}/membership?status=success` });
    }

    // Institutional sponsorship is a recurring 24-month subscription (renews
    // itself in Stripe; see webhooks.ts's invoice.paid handling for how a
    // renewal issues a fresh batch of claim codes). Everything else is a
    // one-time payment, same as before.
    const isInstitutional = type === "institutional";
    const session = await stripe.checkout.sessions.create({
      mode: isInstitutional ? "subscription" : "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `NAHCA Membership — ${plan.name}` },
            unit_amount: priceCents,
            ...(isInstitutional ? { recurring: { interval: "month" as const, interval_count: 24 } } : {}),
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

    // Resolve which institution sponsored each sponsored-student membership
    // (groupId set — see the Membership.groupId convention on the Prisma
    // schema) so the portal dashboard can say "sponsored by X" instead of
    // showing a misleading "no purchases" empty state — sponsored students
    // never carry a Payment, since they never go through activatePayment.
    const groupIds = [...new Set(memberships.map((m) => m.groupId).filter((id): id is string => id !== null))];
    const sponsorships = groupIds.length
      ? await prisma.institutionSponsorship.findMany({
          where: { id: { in: groupIds.map(Number) } },
          include: { user: { select: { name: true } } },
        })
      : [];
    const sponsorNameById = new Map(sponsorships.map((s) => [String(s.id), s.user.name]));

    const membershipsWithSponsor = memberships.map((m) => ({
      ...m,
      sponsoringInstitutionName: m.groupId ? (sponsorNameById.get(m.groupId) ?? null) : null,
    }));

    res.json({ memberships: membershipsWithSponsor });
  })
);

const DEFAULT_PAGE_SIZE = 10;

membershipsRouter.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || DEFAULT_PAGE_SIZE));
    const statusFilter = ["active", "expired", "pending"].includes(req.query.status as string)
      ? (req.query.status as "active" | "expired" | "pending")
      : undefined;
    const where = statusFilter ? { status: statusFilter } : {};

    const [memberships, total] = await Promise.all([
      prisma.membership.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true, isActive: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.membership.count({ where }),
    ]);

    res.json({ memberships, total, page, pageSize });
  })
);

// Single-membership detail for the admin "view member" page — includes the
// full MemberProfile questionnaire captured at signup. View-only: admins
// can see this data and toggle the member's active status (see PATCH
// /:id/active below), but cannot edit the questionnaire itself — only the
// member can, from their own /portal/profile.
membershipsRouter.get(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid membership id" });

    const membership = await prisma.membership.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true,
            // Only ever populated for the institution's own membership row
            // (groupId is null there) — a sponsored student's row has no
            // sponsorship of their own to show.
            institutionSponsorship: {
              include: {
                codes: {
                  orderBy: { createdAt: "desc" },
                  include: { claimedByUser: { select: { id: true, name: true, email: true } } },
                },
              },
            },
          },
        },
      },
    });
    if (!membership) return res.status(404).json({ error: "Membership not found" });

    // A sponsored student's row has groupId set to their sponsorship's id
    // (see the Membership.groupId convention noted on the Prisma schema) —
    // look up that sponsorship's owner so the admin view can show which
    // institution sponsored them.
    let sponsoringInstitution: { id: number; name: string; email: string } | null = null;
    if (membership.groupId) {
      const sponsorship = await prisma.institutionSponsorship.findUnique({
        where: { id: Number(membership.groupId) },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      if (sponsorship) sponsoringInstitution = sponsorship.user;
    }

    res.json({ membership: { ...membership, sponsoringInstitution } });
  })
);

const setActiveSchema = z.object({
  isActive: z.boolean(),
});

// Blocks/unblocks the member's ability to log in (see User.isActive and the
// check in POST /auth/login) without deleting their account or history.
membershipsRouter.patch(
  "/:id/active",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid membership id" });

    const parsed = setActiveSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const membership = await prisma.membership.findUnique({ where: { id } });
    if (!membership) return res.status(404).json({ error: "Membership not found" });

    if (membership.userId === req.auth!.userId) {
      return res.status(400).json({ error: "You cannot deactivate your own account." });
    }

    await prisma.user.update({
      where: { id: membership.userId },
      data: { isActive: parsed.data.isActive },
    });

    const updated = await prisma.membership.findUnique({
      where: { id },
      include: { user: { include: { profile: true } } },
    });

    // Keep the Brevo newsletter list's member tag in sync with the login
    // gate — skipped for an institutional sponsor's own row, who was never
    // added as a member in the first place (see paymentActivation.ts).
    if (updated && !(updated.type === "institutional" && !updated.groupId)) {
      if (parsed.data.isActive) {
        await addOrUpdateBrevoContact(updated.user.email, { name: updated.user.name, isMember: true });
      } else {
        await removeBrevoContactFromList(updated.user.email);
      }
    }

    res.json({ membership: updated });
  })
);
