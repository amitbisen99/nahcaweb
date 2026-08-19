import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { memberProfileSchema } from "../lib/memberProfile";
import { TIER_TERM_MONTHS } from "../lib/membershipTiers";
import { buildInstitutionClaimReceiptBody, sendAdminNotification, sendEmail } from "../lib/mailer";
import { addOrUpdateBrevoContact } from "../lib/brevoContacts";
import { signToken } from "./auth";

export const institutionsRouter = Router();

// The institution's own dashboard — their sponsorship + the full code list
// (bare list: code, claimed/unclaimed, who claimed it and when).
institutionsRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const sponsorship = await prisma.institutionSponsorship.findUnique({
      where: { userId: req.auth!.userId },
      include: {
        codes: {
          orderBy: { createdAt: "desc" },
          include: { claimedByUser: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    if (!sponsorship) return res.status(404).json({ error: "No sponsorship found" });
    res.json({ sponsorship });
  })
);

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

type ClaimableCodeResult =
  | { error: { status: 404 | 400; message: string }; code?: undefined }
  | { code: NonNullable<Awaited<ReturnType<typeof prisma.institutionClaimCode.findUnique>>>; error?: undefined };

async function findClaimableCode(rawCode: string): Promise<ClaimableCodeResult> {
  const code = await prisma.institutionClaimCode.findUnique({ where: { code: normalizeCode(rawCode) } });
  if (!code) return { error: { status: 404, message: "Invalid claim code" } };
  if (code.claimedAt) return { error: { status: 400, message: "This code has already been used" } };
  return { code };
}

const INSTITUTIONAL_TERM_MONTHS = TIER_TERM_MONTHS.institutional;

function membershipTerm() {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + INSTITUTIONAL_TERM_MONTHS);
  return { startDate, endDate };
}

async function notifyClaim(memberName: string, memberEmail: string, startDate: Date, endDate: Date) {
  const body = buildInstitutionClaimReceiptBody({ memberName, startDate, endDate });
  await sendEmail({ to: memberEmail, subject: "Your NAHCA membership is active", body });
  await sendAdminNotification(
    `Institution code claimed — ${memberName}`,
    `${memberName} (${memberEmail}) claimed an institutional sponsorship code.\nMembership period: ${startDate.toDateString()} – ${endDate.toDateString()}`
  );
  // Sponsored students are real chaplaincy members (unlike the institution
  // itself, which is a billing contact — see paymentActivation.ts).
  await addOrUpdateBrevoContact(memberEmail, { name: memberName, isMember: true });
}

// New student registering with a code — no login required, no payment.
const claimSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  profile: memberProfileSchema.optional(),
});

institutionsRouter.post(
  "/claim",
  asyncHandler(async (req, res) => {
    const parsed = claimSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { code: rawCode, name, email, password, profile } = parsed.data;

    const found = await findClaimableCode(rawCode);
    if (!found.code) return res.status(found.error.status).json({ error: found.error.message });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Email already registered — please log in and redeem your code from the Member Portal instead." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash, name } });

    if (profile) {
      await prisma.memberProfile.create({ data: { userId: user.id, ...profile } });
    }

    const { startDate, endDate } = membershipTerm();

    await prisma.membership.create({
      data: {
        userId: user.id,
        type: "institutional",
        status: "active",
        priceCents: 0,
        startDate,
        endDate,
        groupId: String(found.code.sponsorshipId),
      },
    });

    await prisma.institutionClaimCode.update({
      where: { id: found.code.id },
      data: { claimedByUserId: user.id, claimedAt: new Date() },
    });

    await notifyClaim(name, email, startDate, endDate);

    const token = signToken(user.id, user.role);
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  })
);

// Existing member renewing their sponsored membership with a fresh code —
// only allowed once their current one has ended (see the check below).
// Adds a new Membership row rather than extending the old one, same
// pattern used everywhere else in the app for a member holding more than
// one Membership row over time.
const redeemSchema = z.object({
  code: z.string().min(1),
});

institutionsRouter.post(
  "/redeem",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = redeemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // This is a renewal, not an open-ended "add another membership" — only
    // allowed once the member's current sponsored membership has actually
    // ended. Checked against endDate directly rather than the cached
    // `status` field, since the daily expiry sweep (see
    // membershipExpirySweep.ts) can lag up to a day behind the real
    // calendar date.
    const currentSponsored = await prisma.membership.findFirst({
      where: { userId: user.id, type: "institutional", groupId: { not: null } },
      orderBy: { endDate: "desc" },
    });
    if (currentSponsored?.endDate && currentSponsored.endDate > new Date()) {
      return res.status(400).json({
        error: "You already have active membership. Use renewal code after membership expire",
      });
    }

    const found = await findClaimableCode(parsed.data.code);
    if (!found.code) return res.status(found.error.status).json({ error: found.error.message });

    const { startDate, endDate } = membershipTerm();

    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        type: "institutional",
        status: "active",
        priceCents: 0,
        startDate,
        endDate,
        groupId: String(found.code.sponsorshipId),
      },
    });

    await prisma.institutionClaimCode.update({
      where: { id: found.code.id },
      data: { claimedByUserId: user.id, claimedAt: new Date() },
    });

    await notifyClaim(user.name, user.email, startDate, endDate);

    res.status(201).json({ membership });
  })
);
