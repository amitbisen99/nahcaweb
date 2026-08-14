import { prisma } from "../prisma";
import {
  buildDonationAdminNotificationBody,
  buildDonationReceiptBody,
  buildInstitutionCodesEmailBody,
  buildMembershipAdminNotificationBody,
  buildMembershipReceiptBody,
  sendEmail,
} from "./mailer";
import { TIER_LABELS, TIER_TERM_MONTHS, getMembershipPlan } from "./membershipTiers";
import { redeemCoupon } from "./coupons";
import { createCodeBatch } from "./institutions";
import { addOrUpdateBrevoContact } from "./brevoContacts";

// Shared by the Stripe webhook (real payments) and the payments-bypass paths
// (demo/staging without Stripe configured) — marks a Payment succeeded and
// activates whatever it's attached to (a Donation receipt or a Membership).
// stripeSubscriptionId is only relevant for institutional memberships (a
// recurring subscription) — everything else is a one-time payment.
export async function activatePayment(paymentId: number, stripeRef: string, stripeSubscriptionId?: string) {
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
      data: { status: "active", startDate, endDate, stripeSubscriptionId },
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

    // Newsletter list sync — everyone EXCEPT an institutional sponsor, who
    // is a billing/admin contact rather than a chaplaincy member (see the
    // groupId convention below). Sponsored students get synced separately
    // from POST /institutions/claim or /redeem, since they never reach
    // activatePayment at all.
    if (payment.membership.type !== "institutional") {
      await addOrUpdateBrevoContact(payment.membership.user.email, {
        name: payment.membership.user.name,
        isMember: true,
      });
    }

    // Institutional-only: this is always the institution's own payment —
    // sponsored students never carry a Payment/go through activatePayment,
    // they're activated directly by POST /institutions/claim or /redeem.
    if (payment.membership.type === "institutional") {
      const seatCount = payment.membership.studentCount ?? 0;

      const sponsorship = await prisma.institutionSponsorship.upsert({
        where: { userId: payment.membership.userId },
        update: { seatCount, stripeSubscriptionId, startDate, endDate },
        create: {
          userId: payment.membership.userId,
          seatCount,
          stripeSubscriptionId,
          startDate,
          endDate,
        },
      });

      if (seatCount > 0) {
        const codes = await createCodeBatch(sponsorship.id, seatCount);

        const codesBody = buildInstitutionCodesEmailBody({
          institutionName: payment.membership.user.name,
          seatCount,
          codes,
          startDate,
          endDate,
          isRenewal: false,
        });

        await sendEmail({
          to: payment.membership.user.email,
          subject: "Your NAHCA institutional sponsorship — claim codes",
          body: codesBody,
        });
      }
    }
  }

  return payment;
}
