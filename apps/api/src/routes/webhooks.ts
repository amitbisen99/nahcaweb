import { Router } from "express";
import Stripe from "stripe";
import { prisma } from "../prisma";
import { stripe } from "../lib/stripe";
import { buildDonationReceiptBody, buildMembershipReceiptBody, sendReceiptEmail } from "../lib/mailer";
import { TIER_LABELS, TIER_TERM_MONTHS } from "./memberships";
import { asyncHandler } from "../lib/asyncHandler";

export const webhooksRouter = Router();

// Mounted with express.raw() in index.ts — Stripe signature verification needs the raw body.
webhooksRouter.post("/stripe", asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${(err as Error).message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentId = Number(session.metadata?.paymentId);
    if (paymentId) {
      await handlePaymentSucceeded(paymentId, session.id);
    }
  }

  res.json({ received: true });
}));

async function handlePaymentSucceeded(paymentId: number, stripeRef: string) {
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "succeeded", stripeRef },
    include: { donation: true, membership: { include: { user: true } } },
  });

  if (payment.donation) {
    const body = buildDonationReceiptBody({
      donorName: payment.donation.donorName,
      amountCents: payment.amountCents,
      purpose: payment.donation.purpose,
      paymentRef: stripeRef,
      date: new Date(),
    });

    await prisma.receipt.create({
      data: { paymentId: payment.id, emailBody: body },
    });

    await sendReceiptEmail({
      to: payment.donation.donorEmail,
      subject: "Your donation receipt — NAHCA",
      body,
    });
  }

  if (payment.membership) {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + TIER_TERM_MONTHS[payment.membership.type]);

    await prisma.membership.update({
      where: { id: payment.membership.id },
      data: { status: "active", startDate, endDate },
    });

    const body = buildMembershipReceiptBody({
      memberName: payment.membership.user.name,
      tierLabel: TIER_LABELS[payment.membership.type],
      amountCents: payment.amountCents,
      paymentRef: stripeRef,
      startDate,
      endDate,
    });

    await prisma.receipt.create({
      data: { paymentId: payment.id, emailBody: body },
    });

    await sendReceiptEmail({
      to: payment.membership.user.email,
      subject: "Your NAHCA membership is active",
      body,
    });
  }
}
