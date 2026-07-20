import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { stripe } from "../lib/stripe";
import { asyncHandler } from "../lib/asyncHandler";
import { paymentsBypassed } from "../lib/paymentsBypass";
import { activatePayment } from "../lib/paymentActivation";

export const donationsRouter = Router();

const donationSchema = z.object({
  donorName: z.string().min(1),
  donorEmail: z.string().email(),
  amountCents: z.number().int().min(100),
  purpose: z.string().optional(),
  recurring: z.boolean().default(false),
});

donationsRouter.post("/", asyncHandler(async (req, res) => {
  const parsed = donationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { donorName, donorEmail, amountCents, purpose, recurring } = parsed.data;

  const donation = await prisma.donation.create({
    data: { donorName, donorEmail, amountCents, purpose, recurring },
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
