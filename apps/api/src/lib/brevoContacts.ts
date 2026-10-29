import { brevoConfigured } from "./mailer";

// Brevo Contacts API — plain REST calls, same approach as mailer.ts's
// transactional email. API reference: https://developers.brevo.com/reference/createcontact
const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";

// Three contact lists in the Brevo account, one per kind of person. Read from
// the environment on every call (list IDs belong to a Brevo account, so they
// change whenever the account does). BREVO_LIST_ID_7 is set aside for future
// use and deliberately not referenced here.
//
//   members     (list 4) — people with an active paid/sponsored membership
//   newsletter  (list 5) — footer "monthly newsletter" sign-ups
//   general     (list 6) — free accounts with no active membership
//
// Someone can be on more than one at once (a member who also subscribes via
// the footer is on members + newsletter).
type BrevoList = "members" | "newsletter" | "general";

const LIST_ENV_VARS: Record<BrevoList, string> = {
  members: "BREVO_LIST_ID_4",
  newsletter: "BREVO_LIST_ID_5",
  general: "BREVO_LIST_ID_6",
};

function listIdFor(list: BrevoList): number | undefined {
  const raw = process.env[LIST_ENV_VARS[list]];
  const id = raw ? Number(raw) : NaN;
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

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

// Adds a contact to one list, or updates them if they already exist.
// Best-effort — logs and swallows failures so a Brevo hiccup can never fail
// the signup/activation flow that triggered it.
async function addToList(list: BrevoList, email: string, name?: string) {
  const listId = listIdFor(list);
  if (!brevoConfigured || !listId) {
    console.log(`[brevo] Not configured — skipping ${list} list sync for ${email}`);
    return;
  }

  const { firstName, lastName } = name ? splitName(name) : {};
  const attributes: Record<string, unknown> = {};
  if (firstName) attributes.FIRSTNAME = firstName;
  if (lastName) attributes.LASTNAME = lastName;

  try {
    const res = await fetch(BREVO_CONTACTS_URL, {
      method: "POST",
      headers: brevoHeaders(),
      body: JSON.stringify({ email, attributes, listIds: [listId], updateEnabled: true }),
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      console.error(`[brevo] Failed to add/update contact ${email} on the ${list} list (${res.status}): ${errorBody}`);
    }
  } catch (err) {
    console.error(`[brevo] Failed to add/update contact ${email} on the ${list} list:`, err);
  }
}

// Takes a contact off one list (doesn't delete them from Brevo entirely).
// Best-effort, same reasoning as above — and Brevo answering that the contact
// isn't on the list (or doesn't exist) is an expected no-op, not a failure.
async function removeFromList(list: BrevoList, email: string) {
  const listId = listIdFor(list);
  if (!brevoConfigured || !listId) {
    console.log(`[brevo] Not configured — skipping ${list} list removal for ${email}`);
    return;
  }

  try {
    const res = await fetch(`${BREVO_CONTACTS_URL}/lists/${listId}/contacts/remove`, {
      method: "POST",
      headers: brevoHeaders(),
      body: JSON.stringify({ emails: [email] }),
    });

    if (!res.ok && res.status !== 400 && res.status !== 404) {
      const errorBody = await res.text().catch(() => "");
      console.warn(`[brevo] Could not remove ${email} from the ${list} list (${res.status}): ${errorBody}`);
    }
  } catch (err) {
    console.error(`[brevo] Failed to remove contact ${email} from the ${list} list:`, err);
  }
}

// A free account was just created — goes on the general users list.
export async function syncGeneralUserToBrevo(email: string, name?: string) {
  await addToList("general", email, name);
}

// Someone subscribed through the footer form — goes on the newsletter list
// (and stays wherever else they already are).
export async function syncNewsletterSubscriberToBrevo(email: string) {
  await addToList("newsletter", email);
}

// A membership just became active — they're a member now, so they move from
// the general users list (if they were on it) to the members list.
export async function syncMemberToBrevo(email: string, name?: string) {
  await addToList("members", email, name);
  await removeFromList("general", email);
}

// Their last active membership ended — back to being a general user.
export async function syncFormerMemberToBrevo(email: string, name?: string) {
  await removeFromList("members", email);
  await addToList("general", email, name);
}
