// Brevo (formerly Sendinblue) transactional email — plain REST call, no SDK
// needed. API reference: https://developers.brevo.com/reference/sendtransacemail
const BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email";

export const brevoConfigured =
  Boolean(process.env.BREVO_API_KEY) && !process.env.BREVO_API_KEY?.includes("placeholder");

export async function sendEmail(opts: {
  to: string;
  subject: string;
  body: string;
}) {
  if (!brevoConfigured) {
    // eslint-disable-next-line no-console
    console.log(`[mailer] Brevo not configured — skipping email to ${opts.to}: "${opts.subject}"`);
    return;
  }

  const res = await fetch(BREVO_SEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": process.env.BREVO_API_KEY as string,
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_FROM_EMAIL,
        name: process.env.BREVO_FROM_NAME ?? process.env.ORG_NAME,
      },
      to: [{ email: opts.to }],
      subject: opts.subject,
      textContent: opts.body,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`Brevo send failed (${res.status}): ${errorBody}`);
  }
}

// Best-effort internal notification — never throws, so a Brevo hiccup here
// can't fail whatever already-succeeded flow triggered it. No-ops if
// ADMIN_NOTIFICATION_EMAIL isn't set.
export async function sendAdminNotification(subject: string, body: string) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return;
  try {
    await sendEmail({ to: adminEmail, subject, body });
  } catch (err) {
    console.error(`Failed to send admin notification "${subject}":`, err);
  }
}

export function buildDonationReceiptBody(opts: {
  donorName: string;
  amountCents: number;
  purpose: string | null;
  paymentRef: string;
  date: Date;
}) {
  const amount = (opts.amountCents / 100).toFixed(2);
  return [
    `${process.env.ORG_NAME}`,
    `Tax ID (EIN): ${process.env.ORG_EIN}`,
    ``,
    `Dear ${opts.donorName},`,
    ``,
    `Thank you for your generous donation of $${amount}${opts.purpose ? ` for "${opts.purpose}"` : ""}.`,
    `Date: ${opts.date.toDateString()}`,
    `Payment reference: ${opts.paymentRef}`,
    ``,
    `This letter serves as your official receipt. No goods or services were provided in exchange for this contribution.`,
  ].join("\n");
}

export function buildMembershipReceiptBody(opts: {
  memberName: string;
  tierLabel: string;
  amountCents: number;
  paymentRef: string;
  startDate: Date;
  endDate: Date;
}) {
  const amount = (opts.amountCents / 100).toFixed(2);
  return [
    `${process.env.ORG_NAME}`,
    ``,
    `Dear ${opts.memberName},`,
    ``,
    `Thank you for joining NAHCA! Your ${opts.tierLabel} ($${amount}) is now active.`,
    `Membership period: ${opts.startDate.toDateString()} – ${opts.endDate.toDateString()}`,
    `Payment reference: ${opts.paymentRef}`,
    ``,
    `You can view your membership status any time from the Member Portal.`,
  ].join("\n");
}

// Internal heads-up sent to ADMIN_NOTIFICATION_EMAIL alongside the donor's
// own receipt — lets staff notice new donations without checking Stripe.
export function buildDonationAdminNotificationBody(opts: {
  donorName: string;
  donorEmail: string;
  amountCents: number;
  purpose: string | null;
  recurring: boolean;
  paymentRef: string;
  date: Date;
}) {
  const amount = (opts.amountCents / 100).toFixed(2);
  return [
    `New donation — NAHCA`,
    ``,
    `${opts.donorName} (${opts.donorEmail}) just donated $${amount}${opts.purpose ? ` for "${opts.purpose}"` : ""}${opts.recurring ? " (monthly recurring)" : ""}.`,
    `Date: ${opts.date.toDateString()}`,
    `Payment reference: ${opts.paymentRef}`,
  ].join("\n");
}

// Sent to the institution itself whenever a batch of claim codes is ready —
// both the first batch (initial sponsorship activation) and every 24-month
// renewal batch (see webhooks.ts's invoice.paid handling).
export function buildInstitutionCodesEmailBody(opts: {
  institutionName: string;
  seatCount: number;
  codes: string[];
  startDate: Date;
  endDate: Date;
  isRenewal: boolean;
}) {
  return [
    `${process.env.ORG_NAME}`,
    ``,
    `Dear ${opts.institutionName},`,
    ``,
    opts.isRenewal
      ? `Your institutional sponsorship has renewed for another term. Here is your fresh batch of ${opts.seatCount} claim code(s) — share one per student.`
      : `Thank you for sponsoring ${opts.seatCount} student membership(s) with NAHCA! Here are your claim codes — share one per student.`,
    `Sponsorship period: ${opts.startDate.toDateString()} – ${opts.endDate.toDateString()}`,
    ``,
    `Codes:`,
    ...opts.codes.map((c) => `  ${c}`),
    ``,
    `New students can register with a code at ${process.env.WEB_ORIGIN}/membership/claim`,
    `Students who are already NAHCA members can redeem a code from their Member Portal.`,
    `You can see which codes have been claimed any time from your own Member Portal dashboard.`,
  ].join("\n");
}

// Sent to a student the moment they successfully claim/redeem a sponsorship code.
export function buildInstitutionClaimReceiptBody(opts: {
  memberName: string;
  startDate: Date;
  endDate: Date;
}) {
  return [
    `${process.env.ORG_NAME}`,
    ``,
    `Dear ${opts.memberName},`,
    ``,
    `Your institution-sponsored NAHCA membership is now active — no payment needed on your end.`,
    `Membership period: ${opts.startDate.toDateString()} – ${opts.endDate.toDateString()}`,
    ``,
    `You can view your membership status any time from the Member Portal.`,
  ].join("\n");
}

// Sent once an event/webinar registration is confirmed — a guest's paid or
// free registration (via activatePayment), or an existing member's
// quick-join. `eventDate` is only set for Events (Webinars have no
// scheduled date), so the "held on" clause is conditional.
export function buildEventRegistrationReceiptBody(opts: {
  attendeeName: string;
  eventTitle: string;
  eventDate: Date | null;
}) {
  return [
    `${process.env.ORG_NAME}`,
    ``,
    `Dear ${opts.attendeeName},`,
    ``,
    `You registered for this event (${opts.eventTitle})${
      opts.eventDate ? ` held on ${opts.eventDate.toDateString()}` : ""
    }.`,
  ].join("\n");
}

// Sent on POST /auth/forgot-password with a single-use, expiring link to
// /reset-password?token=... — see routes/auth.ts for token generation.
export function buildPasswordResetEmailBody(opts: { name: string; resetUrl: string; expiresInMinutes: number }) {
  return [
    `${process.env.ORG_NAME}`,
    ``,
    `Dear ${opts.name},`,
    ``,
    `We received a request to reset your NAHCA account password. Click the link below to set a new one:`,
    ``,
    opts.resetUrl,
    ``,
    `This link expires in ${opts.expiresInMinutes} minutes and can only be used once.`,
    `If you didn't request this, you can safely ignore this email — your password won't be changed.`,
  ].join("\n");
}

// Internal heads-up sent to ADMIN_NOTIFICATION_EMAIL alongside the member's
// own receipt — lets staff notice new signups without checking the admin
// dashboard.
export function buildMembershipAdminNotificationBody(opts: {
  memberName: string;
  memberEmail: string;
  tierLabel: string;
  amountCents: number;
  paymentRef: string;
  startDate: Date;
  endDate: Date;
}) {
  const amount = (opts.amountCents / 100).toFixed(2);
  return [
    `New membership purchase — NAHCA`,
    ``,
    `${opts.memberName} (${opts.memberEmail}) just purchased a ${opts.tierLabel} membership for $${amount}.`,
    `Membership period: ${opts.startDate.toDateString()} – ${opts.endDate.toDateString()}`,
    `Payment reference: ${opts.paymentRef}`,
    ``,
    `View this member in the admin dashboard: ${process.env.WEB_ORIGIN}/admin/members`,
  ].join("\n");
}
