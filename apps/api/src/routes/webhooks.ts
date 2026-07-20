import { Router } from "express";
import Stripe from "stripe";
import { stripe } from "../lib/stripe";
import { activatePayment } from "../lib/paymentActivation";
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
      await activatePayment(paymentId, session.id);
    }
  }

  res.json({ received: true });
}));
