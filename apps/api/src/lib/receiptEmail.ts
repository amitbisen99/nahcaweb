// Dynamic tags an admin can use when composing a Receipt Email (see
// routes/eventRegistrations.ts's POST /:eventCode/send-receipt-email).
// Deliberately just these two for now — {{event_date}}/{{event_time}}
// were considered but dropped since Webinars have no date/time at all,
// which would have made those tags behave inconsistently between the two
// content types.
export interface ReceiptEmailTagValues {
  name: string;
  event_name: string;
}

const TAG_PATTERN = /\{\{\s*(name|event_name)\s*\}\}/g;

function substitute(template: string, values: ReceiptEmailTagValues, escape: (raw: string) => string): string {
  return template.replace(TAG_PATTERN, (_match, key: keyof ReceiptEmailTagValues) => escape(values[key] ?? ""));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// For the HTML body — recipient names come from user input (a guest typed
// their own name, or it's a member's account name), so they must be
// escaped before landing inside htmlContent to avoid breaking the markup.
export function substituteTagsHtml(template: string, values: ReceiptEmailTagValues): string {
  return substitute(template, values, escapeHtml);
}

// For the subject line and the plain-text fallback body — neither is HTML,
// so the raw value is used as-is.
export function substituteTagsPlain(template: string, values: ReceiptEmailTagValues): string {
  return substitute(template, values, (raw) => raw);
}

// Best-effort HTML -> plain text, for the textContent fallback Brevo sends
// alongside htmlContent (some mail clients still prefer/require it). Not a
// full HTML parser — just enough to turn the RichTextField's contentEditable
// output (plain formatting: bold/italic/underline/lists/links, no nested
// block structure) into readable plain text.
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<(br|\/p|\/div|\/li)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
