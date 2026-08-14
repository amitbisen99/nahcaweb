import { brevoConfigured } from "./mailer";

// Brevo Contacts API — plain REST calls, same approach as mailer.ts's
// transactional email. API reference: https://developers.brevo.com/reference/createcontact
const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";

const newsletterListId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : undefined;

function brevoHeaders() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "api-key": process.env.BREVO_API_KEY as string,
  };
}

function splitName(name: string): { firstName?: string; lastName?: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  const [firstName, ...rest] = parts;
  return { firstName, lastName: rest.join(" ") || undefined };
}

// Adds a contact to the configured newsletter list, or updates them if they
// already exist. Best-effort — logs and swallows failures so a Brevo hiccup
// can never fail the signup/activation flow that triggered it.
//
// `isMember` implements the "List + Tagging" design: pass true when this
// call comes from an actual membership activating, so the IS_MEMBER contact
// attribute can be used to segment members from newsletter-only subscribers
// within the one list. Omit it entirely (e.g. from the plain footer signup)
// rather than passing false — omitting means the attribute isn't sent at
// all, so an existing member's IS_MEMBER=true tag is never overwritten by a
// later, unrelated newsletter signup from the same email.
export async function addOrUpdateBrevoContact(email: string, opts: { name?: string; isMember?: boolean } = {}) {
  if (!brevoConfigured || !newsletterListId) {
    console.log(`[brevo] Not configured — skipping contact sync for ${email}`);
    return;
  }

  const { firstName, lastName } = opts.name ? splitName(opts.name) : {};
  const attributes: Record<string, unknown> = {};
  if (firstName) attributes.FIRSTNAME = firstName;
  if (lastName) attributes.LASTNAME = lastName;
  if (opts.isMember !== undefined) attributes.IS_MEMBER = opts.isMember;

  try {
    const res = await fetch(BREVO_CONTACTS_URL, {
      method: "POST",
      headers: brevoHeaders(),
      body: JSON.stringify({
        email,
        attributes,
        listIds: [newsletterListId],
        updateEnabled: true,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      console.error(`[brevo] Failed to add/update contact ${email} (${res.status}): ${errorBody}`);
    }
  } catch (err) {
    console.error(`[brevo] Failed to add/update contact ${email}:`, err);
  }
}

// Unsubscribes a contact from the newsletter list (doesn't delete the
// contact from Brevo entirely). Used when a member is deactivated by an
// admin, or their last active membership expires. Best-effort, same
// reasoning as above — and a "contact not on this list" response from
// Brevo is an expected no-op here, not a real failure.
export async function removeBrevoContactFromList(email: string) {
  if (!brevoConfigured || !newsletterListId) {
    console.log(`[brevo] Not configured — skipping list removal for ${email}`);
    return;
  }

  try {
    const res = await fetch(`${BREVO_CONTACTS_URL}/lists/${newsletterListId}/contacts/remove`, {
      method: "POST",
      headers: brevoHeaders(),
      body: JSON.stringify({ emails: [email] }),
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      console.warn(`[brevo] Could not remove ${email} from list (${res.status}): ${errorBody}`);
    }
  } catch (err) {
    console.error(`[brevo] Failed to remove contact ${email} from list:`, err);
  }
}
