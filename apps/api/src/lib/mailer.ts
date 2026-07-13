import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function sendReceiptEmail(opts: {
  to: string;
  subject: string;
  body: string;
}) {
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
