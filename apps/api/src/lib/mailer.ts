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
