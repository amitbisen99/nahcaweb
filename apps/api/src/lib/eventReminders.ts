import { prisma } from "../prisma";
import { buildEventReminderEmail, sendEmail } from "./mailer";

// Emails each registered attendee a reminder once their event or webinar is
// three days away. Runs daily (see index.ts) plus once at startup to catch up
// after any downtime — EventRegistration.reminderSentAt makes sure nobody gets
// it twice.
//
// Who gets one: paid-up/confirmed registrations (status "active") for a
// published event or webinar that has a date, once that date is within three
// days. Someone who registers *inside* those three days is skipped — they
// signed up moments ago and already have their confirmation email, so a
// reminder right behind it would only be noise.

const REMINDER_LEAD_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

interface ReminderTarget {
  eventCode: string;
  type: "event" | "webinar";
  title: string;
  date: Date;
  time: string | null;
  link: string | null;
}

async function loadUpcomingTargets(now: Date, horizon: Date): Promise<ReminderTarget[]> {
  const webOrigin = process.env.WEB_ORIGIN;

  const [events, webinars] = await Promise.all([
    prisma.event.findMany({
      where: { published: true, date: { gt: now, lte: horizon } },
      select: { id: true, eventCode: true, title: true, date: true, time: true },
    }),
    // A webinar without a date can't be counted back from, so it's never
    // matched here (null isn't in any range).
    prisma.webinar.findMany({
      where: { published: true, date: { gt: now, lte: horizon } },
      select: { id: true, eventCode: true, title: true, date: true, time: true, zoomOrYoutubeLink: true },
    }),
  ]);

  const targets: ReminderTarget[] = events.map((e) => ({
    eventCode: e.eventCode,
    type: "event",
    title: e.title,
    date: e.date,
    time: e.time,
    link: webOrigin ? `${webOrigin}/events/${e.id}` : null,
  }));

  for (const w of webinars) {
    if (!w.date) continue;
    targets.push({
      eventCode: w.eventCode,
      type: "webinar",
      title: w.title,
      date: w.date,
      time: w.time,
      link: w.zoomOrYoutubeLink || (webOrigin ? `${webOrigin}/events/webinars/${w.id}` : null),
    });
  }

  return targets;
}

export async function runEventReminders(now = new Date()): Promise<{ sent: number; failed: number }> {
  const horizon = new Date(now.getTime() + REMINDER_LEAD_DAYS * DAY_MS);
  const targets = await loadUpcomingTargets(now, horizon);

  let sent = 0;
  let failed = 0;

  for (const target of targets) {
    // The moment this event became "3 days away" — registrations made after
    // it are the ones skipped (see the note at the top).
    const reminderStart = new Date(target.date.getTime() - REMINDER_LEAD_DAYS * DAY_MS);

    const registrations = await prisma.eventRegistration.findMany({
      where: {
        eventCode: target.eventCode,
        status: "active",
        reminderSentAt: null,
        createdAt: { lte: reminderStart },
      },
      include: { user: { select: { name: true, email: true } } },
    });

    for (const registration of registrations) {
      // A guest registration carries its own name/email; a member's quick-join
      // only has the account.
      const email = registration.email ?? registration.user?.email;
      if (!email) continue;

      // Claim it before sending, so two overlapping runs can't both send.
      const claim = await prisma.eventRegistration.updateMany({
        where: { id: registration.id, reminderSentAt: null },
        data: { reminderSentAt: now },
      });
      if (claim.count === 0) continue;

      const { subject, body } = buildEventReminderEmail({
        attendeeName: registration.name ?? registration.user?.name ?? "Attendee",
        type: target.type,
        title: target.title,
        date: target.date,
        time: target.time,
        link: target.link,
      });

      try {
        await sendEmail({ to: email, subject, body });
        sent++;
      } catch (err) {
        // Let the next run try again (until the event passes).
        await prisma.eventRegistration.update({ where: { id: registration.id }, data: { reminderSentAt: null } });
        failed++;
        console.error(`[eventReminders] Couldn't email ${email} about "${target.title}":`, err);
      }
    }
  }

  if (sent > 0 || failed > 0) {
    console.log(`[eventReminders] Sent ${sent} reminder(s), ${failed} failed.`);
  }
  return { sent, failed };
}
