import { Router } from "express";
import Stripe from "stripe";
import { stripe } from "../lib/stripe";
import { activatePayment } from "../lib/paymentActivation";
import { renewInstitutionSponsorship } from "../lib/institutions";
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
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      await activatePayment(paymentId, session.id, subscriptionId);
    }
  }

  // Institutional sponsorships renew automatically every 24 months (see
  // memberships.ts's subscription-mode checkout). Stripe re-charges the
  // subscription and fires this event on success — "subscription_create" is
  // the very first invoice, already handled above via
  // checkout.session.completed, so only "subscription_cycle" (an actual
  // renewal) needs handling here.
  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId =
      typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
    if (invoice.billing_reason === "subscription_cycle" && subscriptionId) {
      await renewInstitutionSponsorship(subscriptionId, invoice.id);
    }
  }

  res.json({ received: true });
}));
