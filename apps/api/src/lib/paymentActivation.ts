import { prisma } from "../prisma";
import {
  buildDonationAdminNotificationBody,
  buildDonationReceiptBody,
  buildMembershipAdminNotificationBody,
  buildMembershipReceiptBody,
  sendEmail,
} from "./mailer";
import { TIER_LABELS, TIER_TERM_MONTHS, getMembershipPlan } from "./membershipTiers";
import { redeemCoupon } from "./coupons";

// Shared by the Stripe webhook (real payments) and the payments-bypass paths
// (demo/staging without Stripe configured) — marks a Payment succeeded and
// activates whatever it's attached to (a Donation receipt or a Membership).
export async function activatePayment(paymentId: number, stripeRef: string) {
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "succeeded", stripeRef },
    include: { donation: true, membership: { include: { user: true } } },
  });

  if (payment.couponId) {
    await redeemCoupon(payment.couponId);
  }

  if (payment.donation) {
    const donationDate = new Date();
    const body = buildDonationReceiptBody({
      donorName: payment.donation.donorName,
      amountCents: payment.amountCents,
      purpose: payment.donation.purpose,
      paymentRef: stripeRef,
      date: donationDate,
    });

    await prisma.receipt.create({
      data: { paymentId: payment.id, emailBody: body },
    });

    await sendEmail({
      to: payment.donation.donorEmail,
      subject: "Your donation receipt — NAHCA",
      body,
    });

    // Internal notification — best-effort, same reasoning as the membership
    // one below: shouldn't fail the donor's own receipt, which already sent.
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      try {
        const adminBody = buildDonationAdminNotificationBody({
          donorName: payment.donation.donorName,
          donorEmail: payment.donation.donorEmail,
          amountCents: payment.amountCents,
          purpose: payment.donation.purpose,
          recurring: payment.donation.recurring,
          paymentRef: stripeRef,
          date: donationDate,
        });

        await sendEmail({
          to: adminEmail,
          subject: `New donation — ${payment.donation.donorName}`,
          body: adminBody,
        });
      } catch (err) {
        console.error("Failed to send admin donation notification:", err);
      }
    }
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

    await sendEmail({
      to: payment.membership.user.email,
      subject: "Your NAHCA membership is active",
      body,
    });

    // Internal notification — best-effort. A hiccup here (bad address, Brevo
    // blip) shouldn't fail the member's own activation/receipt, which has
    // already succeeded by this point.
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      try {
        const adminBody = buildMembershipAdminNotificationBody({
          memberName: payment.membership.user.name,
          memberEmail: payment.membership.user.email,
          tierLabel: plan?.name ?? TIER_LABELS[payment.membership.type],
          amountCents: payment.amountCents,
          paymentRef: stripeRef,
          startDate,
          endDate,
        });

        await sendEmail({
          to: adminEmail,
          subject: `New membership purchase — ${payment.membership.user.name}`,
          body: adminBody,
        });
      } catch (err) {
        console.error("Failed to send admin membership-purchase notification:", err);
      }
    }
  }

  return payment;
}
