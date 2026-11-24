// One-off: puts everyone who already has a confirmed event or webinar
// registration onto the Brevo attendees list (BREVO_LIST_ID_7). New
// registrations are added automatically as they happen; this covers the ones
// from before that existed. Safe to run more than once — Brevo just updates a
// contact that's already on the list.
//
//   npm run brevo:backfill-attendees
import "dotenv/config";
import { prisma } from "../src/prisma";
import { syncEventAttendeeToBrevo } from "../src/lib/brevoContacts";

async function main() {
  const registrations = await prisma.eventRegistration.findMany({
    where: { status: "active" },
    select: { name: true, email: true, user: { select: { name: true, email: true } } },
  });

  // One entry per email address, however many events they registered for.
  const people = new Map<string, string>();
  for (const r of registrations) {
    const email = (r.user?.email ?? r.email)?.trim().toLowerCase();
    const name = r.user?.name ?? r.name ?? "";
    if (email && !people.has(email)) people.set(email, name);
  }

  console.log(`Adding ${people.size} attendee${people.size === 1 ? "" : "s"} to the Brevo attendees list...`);
  for (const [email, name] of people) {
    await syncEventAttendeeToBrevo(email, name);
  }
  console.log("Done. Any contact Brevo refused is logged above as [brevo] errors.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
