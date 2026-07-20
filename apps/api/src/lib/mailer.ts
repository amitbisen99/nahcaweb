import sgMail from "@sendgrid/mail";

const sendGridConfigured = Boolean(process.env.SENDGRID_API_KEY) && !process.env.SENDGRID_API_KEY?.includes("placeholder");

if (sendGridConfigured) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
}

export async function sendReceiptEmail(opts: {
  to: string;
  subject: string;
  body: string;
}) {
  if (!sendGridConfigured) {
    // eslint-disable-next-line no-console
    console.log(`[mailer] SendGrid not configured — skipping email to ${opts.to}: "${opts.subject}"`);
    return;
  }

  await sgMail.send({
    to: opts.to,
    from: process.env.SENDGRID_FROM_EMAIL as string,
    subject: opts.subject,
    text: opts.body,
  });
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
