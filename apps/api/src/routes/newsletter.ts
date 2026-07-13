import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";

export const newsletterRouter = Router();

// TODO(phase 2): call the Mailchimp API (MAILCHIMP_API_KEY / MAILCHIMP_AUDIENCE_ID)
// to add the email to the NAHCA audience list. Same call should be reused from the
// membership signup flow's newsletter opt-in checkbox.

const signupSchema = z.object({
  email: z.string().email(),
});

newsletterRouter.post("/signup", asyncHandler(async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  res.status(501).json({ error: "Not implemented yet — see TODO in newsletter.ts" });
}));
