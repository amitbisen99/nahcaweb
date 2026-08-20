import crypto from "crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { memberProfileSchema } from "../lib/memberProfile";
import { sendEmail, buildPasswordResetEmailBody } from "../lib/mailer";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

authRouter.post("/register", asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  const token = signToken(user.id, user.role);
  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}));

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: "This account has been deactivated. Contact NAHCA for help." });
  }

  const token = signToken(user.id, user.role);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}));

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.userId },
      include: { profile: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        profile: user.profile,
      },
    });
  })
);

// name/profile are both optional so this endpoint can be called to update
// just the questionnaire (see MemberProfileForm.tsx in the member portal)
// without also re-sending the name.
const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  profile: memberProfileSchema.optional(),
});

authRouter.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    if (parsed.data.name) {
      await prisma.user.update({ where: { id: req.auth!.userId }, data: { name: parsed.data.name } });
    }

    if (parsed.data.profile) {
      await prisma.memberProfile.upsert({
        where: { userId: req.auth!.userId },
        update: parsed.data.profile,
        create: { userId: req.auth!.userId, ...parsed.data.profile },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.auth!.userId },
      include: { profile: true },
    });
    res.json({
      user: { id: user!.id, email: user!.email, name: user!.name, role: user!.role, profile: user!.profile },
    });
  })
);

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

authRouter.post(
  "/change-password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    res.json({ ok: true });
  })
);

const RESET_TOKEN_EXPIRY_MINUTES = 60;

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// Deliberately confirms whether the email is registered — the client
// wants "no account found" surfaced to the user, not a generic response.
authRouter.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { email } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "No account found with that email address." });
    }

    // Invalidate any earlier still-valid tokens for this user so only the
    // newest link works, rather than leaving several live in parallel.
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60_000);
    await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });

    const resetUrl = `${process.env.WEB_ORIGIN}/reset-password?token=${token}`;
    const body = buildPasswordResetEmailBody({
      name: user.name,
      resetUrl,
      expiresInMinutes: RESET_TOKEN_EXPIRY_MINUTES,
    });
    await sendEmail({ to: user.email, subject: "Reset your NAHCA password", body });

    res.json({ ok: true });
  })
);

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

authRouter.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { token, password } = parsed.data;

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: "This reset link is invalid or has expired. Please request a new one." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
      // Any other outstanding tokens for this user are now moot.
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId, id: { not: resetToken.id }, usedAt: null },
      }),
    ]);

    res.json({ ok: true });
  })
);

// Exported for other routes that log a user straight in after creating
// their account outside the normal /register flow (see POST
// /institutions/claim).
export function signToken(userId: number, role: string) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
}
