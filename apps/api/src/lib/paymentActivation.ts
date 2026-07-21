import { prisma } from "../prisma";
import { buildDonationReceiptBody, buildMembershipReceiptBody, sendReceiptEmail } from "./mailer";
import { TIER_LABELS, TIER_TERM_MONTHS, getMembershipPlan } from "./membershipTiers";

// Shared by the Stripe webhook (real payments) and the payments-bypass paths
// (demo/staging without Stripe configured) — marks a Payment succeeded and
// activates whatever it's attached to (a Donation receipt or a Membership).
export async function activatePayment(paymentId: number, stripeRef: string) {
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

    const plan = await getMembershipPlan(payment.membership.type);

    const body = buildMembershipReceiptBody({
      memberName: payment.membership.user.name,
      tierLabel: plan?.name ?? TIER_LABELS[payment.membership.type],
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

  return payment;
}
