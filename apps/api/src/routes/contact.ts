import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { sendEmail } from "../lib/mailer";

export const contactRouter = Router();

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(190),
  subject: z.string().trim().max(190).optional(),
  message: z.string().trim().min(1).max(5000),
  // Hidden field real visitors never fill in — bots do.
  website: z.string().optional(),
});

// Public "Contact Us" form: emails the message to the admin inbox, with the
// visitor as Reply-To so replying goes straight to them.
contactRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { name, email, subject, message, website } = parsed.data;

    // Pretend success so a bot gets no signal to adapt to.
    if (website) return res.status(201).json({ ok: true });

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (!adminEmail) {
      return res.status(503).json({ error: "Contact form is not available right now." });
    }

    await sendEmail({
      to: adminEmail,
      subject: `Website contact: ${subject || `message from ${name}`}`,
      body: [`From: ${name} <${email}>`, subject ? `Subject: ${subject}` : null, "", message]
        .filter((line) => line !== null)
        .join("\n"),
      replyTo: { email, name },
    });

    res.status(201).json({ ok: true });
  })
);
