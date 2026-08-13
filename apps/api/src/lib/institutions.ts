import crypto from "crypto";
import { prisma } from "../prisma";
import { buildInstitutionCodesEmailBody, sendAdminNotification, sendEmail } from "./mailer";

// Unambiguous alphabet — no 0/O, 1/I/L — codes get read aloud/typed by hand.
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function randomCode(): string {
  const raw = Array.from({ length: 10 }, () => CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)]).join("");
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 10)}`;
}

// Generates `count` single-use claim codes for a sponsorship and returns the
// code strings. Collisions against the whole alphabet space (31^10) are
// astronomically unlikely, but this still retries the whole batch on the
// off chance the unique constraint trips.
export async function createCodeBatch(sponsorshipId: number, count: number, attempt = 0): Promise<string[]> {
  const codes = new Set<string>();
  while (codes.size < count) codes.add(randomCode());

  try {
    await prisma.institutionClaimCode.createMany({
      data: Array.from(codes, (code) => ({ sponsorshipId, code })),
    });
    return Array.from(codes);
  } catch (err) {
    if (attempt >= 3) throw err;
    return createCodeBatch(sponsorshipId, count, attempt + 1);
  }
}

// Called from the Stripe webhook when a subscription's 24-month renewal
// invoice pays successfully (billing_reason: "subscription_cycle", never
// the initial "subscription_create" invoice, which activatePayment already
// handles). Extends the sponsorship and the institution's own membership by
// another 24 months and issues a fresh batch of claim codes. No-ops if the
// subscription isn't one of ours (shouldn't happen, but webhooks can in
// theory deliver events for unrelated Stripe activity on the same account).
export async function renewInstitutionSponsorship(stripeSubscriptionId: string, invoiceId: string) {
  const sponsorship = await prisma.institutionSponsorship.findFirst({
    where: { stripeSubscriptionId },
    include: { user: true },
  });
  if (!sponsorship) return;

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 24);

  await prisma.institutionSponsorship.update({
    where: { id: sponsorship.id },
    data: { startDate, endDate },
  });

  // The institution's own paying membership — groupId is null for that row
  // only (sponsored students always have groupId set), so this can only
  // ever match the one record.
  await prisma.membership.updateMany({
    where: { userId: sponsorship.userId, type: "institutional", groupId: null },
    data: { status: "active", startDate, endDate },
  });

  const codes = await createCodeBatch(sponsorship.id, sponsorship.seatCount);

  const body = buildInstitutionCodesEmailBody({
    institutionName: sponsorship.user.name,
    seatCount: sponsorship.seatCount,
    codes,
    startDate,
    endDate,
    isRenewal: true,
  });

  await sendEmail({
    to: sponsorship.user.email,
    subject: "Your NAHCA institutional sponsorship has renewed — new claim codes",
    body,
  });

  await sendAdminNotification(
    `Institutional sponsorship renewed — ${sponsorship.user.name}`,
    [
      `${sponsorship.user.name} (${sponsorship.user.email}) renewed their institutional sponsorship for ${sponsorship.seatCount} seat(s).`,
      `New period: ${startDate.toDateString()} – ${endDate.toDateString()}`,
      `Invoice: ${invoiceId}`,
    ].join("\n")
  );
}
