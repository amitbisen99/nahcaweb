import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { prisma } from "../prisma";
import { addOrUpdateBrevoContact } from "../lib/brevoContacts";

export const newsletterRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
});

newsletterRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { email } = parsed.data;

    // Local record purely so admins have a record of footer signups without
    // needing to log into Brevo — Brevo (below) is the actual mailing list.
    // Upsert since re-submitting the same email isn't an error case.
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    // isMember intentionally omitted — see addOrUpdateBrevoContact's doc
    // comment on why that matters if this email already belongs to a member.
    await addOrUpdateBrevoContact(email);

    res.status(201).json({ ok: true });
  })
);
