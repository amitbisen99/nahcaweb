import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { formatDate } from "./formatDate";

// Kept as its own asset in the API package (not read from apps/web/public)
// so this doesn't depend on the web app's file layout at runtime — the two
// are deployed from the same monorepo checkout today, but there's no
// reason a PDF generated here should reach across into a sibling app's
// static assets to do it.
const LOGO_PATH = path.join(__dirname, "..", "..", "assets", "nahca-horizontal-logo.png");
const LOGO_ASPECT_RATIO = 443 / 2000; // the source PNG's own height/width

// The organization's registered mailing address for the letterhead — not
// modeled as env vars like ORG_NAME/ORG_EIN (nothing else needs it), but
// literal here so it's one obvious place to update if it ever changes.
const ORG_ADDRESS_LINES = ["26 Dutton Place Way", "Glastonbury, CT 06033"];

// Generates the IRS-compliant tax-deductible donation receipt letter as a
// PDF, attached to the donor's own receipt email in paymentActivation.ts.
// Content, wording, and signatories are exactly as specified by the client
// — this is a compliance document, not just a nice-to-have, so nothing
// here should be reworded without an explicit request.
export function buildDonationTaxReceiptPdf(opts: {
  donorName: string;
  donorAddress: string | null;
  amountCents: number;
  date: Date;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 72 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const amount = (opts.amountCents / 100).toFixed(2);
    const dateStr = formatDate(opts.date);
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // Logo, centered, at the top of the page. Positioned with explicit x/y
    // (rather than letting it flow inline), so the cursor is moved past it
    // by hand afterward instead of relying on pdfkit's auto-advance, which
    // isn't guaranteed once x/y are given explicitly.
    const logoWidth = 260;
    const logoHeight = logoWidth * LOGO_ASPECT_RATIO;
    if (fs.existsSync(LOGO_PATH)) {
      doc.image(LOGO_PATH, doc.page.margins.left + (pageWidth - logoWidth) / 2, doc.y, {
        width: logoWidth,
        height: logoHeight,
      });
      doc.y += logoHeight + 24;
    }

    // Letterhead — org name/address/EIN, centered under the logo.
    doc.font("Helvetica-Bold").fontSize(11).text("North American Hindu Chaplains Association, Inc.", {
      align: "center",
    });
    doc.font("Helvetica").fontSize(10);
    for (const line of ORG_ADDRESS_LINES) {
      doc.text(line, { align: "center" });
    }
    // Hardcoded per explicit client instruction (same reasoning as the
    // plain-text receipt in mailer.ts) rather than ORG_EIN, which was found
    // set to a placeholder in at least one environment.
    doc.text("EIN 85-1311694", { align: "center" });

    doc.moveDown(2);
    doc.fontSize(11).text(dateStr);

    doc.moveDown(1.5);
    doc.text(opts.donorName);
    if (opts.donorAddress?.trim()) {
      // A free-text address may itself contain line breaks (the donation
      // form's field is a textarea) — preserve them rather than collapsing
      // to one line.
      for (const line of opts.donorAddress.split("\n")) {
        if (line.trim()) doc.text(line.trim());
      }
    }

    doc.moveDown(1.5);
    doc.text(`Namaste ${opts.donorName},`);
    doc.moveDown(1);
    doc.text(
      `Thank you for your generous gift of $${amount} to North American Hindu Chaplains Association, Inc. made on ${dateStr}.`,
      { align: "left" }
    );
    doc.moveDown(0.5);
    doc.text(
      "Your support supports our mission to offer mentoring, networking and professional development opportunities for current and aspiring Hindu spiritual caregivers in North America."
    );
    doc.moveDown(0.5);
    doc.text(
      "North American Hindu Chaplains Association Incorporated is a registered 501(c)(3) tax-exempt public charity under the Internal Revenue Code. No goods or services were provided in exchange for this contribution aside from the intangible spiritual or emotional satisfaction of supporting our mission. Therefore, your contribution is tax-deductible to the full extent permitted by law."
    );

    doc.moveDown(2);
    doc.text("With deep gratitude,");
    doc.moveDown(2);
    doc.text("Dr. Shama Mehta, NAHCA Chair");
    doc.text("Mr. Sanjay Mathur, NAHCA Vice Chair and Treasurer");
    doc.text("North American Hindu Chaplains Association");

    doc.end();
  });
}
