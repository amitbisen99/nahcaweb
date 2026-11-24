import Link from "next/link";
import { auth } from "@/auth";
import {
  getMyEventRegistrations,
  getMyMemberships,
  getMyPayments,
  getProgrammeCoupons,
  ApiProgrammeCoupon,
} from "@/lib/api";
import { MyEventCard } from "@/components/MyEventCard";
import { TIER_LABELS, PAYMENT_STATUS_STYLES } from "@/lib/membershipLabels";
import { paymentLabel } from "@/lib/paymentLabel";
import { formatDate } from "@/lib/formatDate";

interface Reminder {
  text: string;
  href?: string;
  tone: "info" | "warning";
}

const REMINDER_STYLES: Record<Reminder["tone"], string> = {
  info: "border-brand/20 bg-brand/5",
  warning: "border-amber-300 bg-amber-50",
};

function buildReminders(memberships: Awaited<ReturnType<typeof getMyMemberships>>): Reminder[] {
  const reminders: Reminder[] = [];
  const active = memberships.find((m) => m.status === "active");
  const pending = memberships.find((m) => m.status === "pending");
  const expired = memberships.find((m) => m.status === "expired");

  if (memberships.length === 0) {
    reminders.push({
      text: "You don't have a membership yet. Join to unlock member benefits.",
      href: "/membership",
      tone: "info",
    });
  } else if (pending && !active) {
    reminders.push({
      text: `Your ${TIER_LABELS[pending.type] ?? pending.type} payment is pending.`,
      tone: "warning",
    });
  }

  if (active?.endDate) {
    const daysLeft = Math.ceil((new Date(active.endDate).getTime() - Date.now()) / 86_400_000);
    if (daysLeft >= 0 && daysLeft <= 30) {
      reminders.push({
        text: `Your membership expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} (${formatDate(active.endDate)}). Renew soon to keep your benefits.`,
        href: "/membership",
        tone: "warning",
      });
    }
  } else if (expired) {
    reminders.push({
      text: "Your membership has expired. Renew to restore access to member benefits.",
      href: "/membership",
      tone: "warning",
    });
  }

  return reminders;
}

// One reminder per currently-usable event/webinar coupon — shown to every
// member (general and sponsored alike, since both land on this same
// dashboard). Links to the event/webinar's own detail page rather than the
// guest join form — a member doesn't need to re-fill that, they can just
// use the Join button there, which prompts for a coupon code itself.
function buildCouponReminders(coupons: ApiProgrammeCoupon[]): Reminder[] {
  return coupons.map((c) => ({
    text: `You have received a coupon for the ${c.type === "webinar" ? "Webinar" : "Event"} '${c.eventTitle}'. The coupon code is - ${c.code}`,
    href: c.type === "webinar" ? `/events/webinars/${c.id}` : `/events/${c.id}`,
    tone: "info",
  }));
}

export default async function PortalDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ membership?: string }>;
}) {
  const { membership: membershipStatus } = await searchParams;
  const session = await auth();
  const token = session?.apiToken ?? "";
  const [memberships, payments, programmeCoupons, eventRegistrationsOrNull] = await Promise.all([
    getMyMemberships(token),
    getMyPayments(token),
    getProgrammeCoupons(token),
    getMyEventRegistrations(token),
  ]);
  const eventRegistrations = eventRegistrationsOrNull ?? [];
  const recentPurchases = payments.slice(0, 5);
  // The next few confirmed events/webinars — dated ones that haven't passed yet, soonest first.
  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = eventRegistrations
    .filter((r) => r.status === "active" && r.date !== null && r.date.slice(0, 10) >= today)
    .sort((a, b) => (a.date as string).localeCompare(b.date as string))
    .slice(0, 3);
  const reminders = [...buildReminders(memberships), ...buildCouponReminders(programmeCoupons)];
  // Set only for a sponsored student's active membership (see the groupId
  // convention on ApiMembership) — they never have a Payment, so the
  // "Recent Purchases" empty state below shouldn't read as "not a member".
  const sponsoringInstitutionName = memberships.find((m) => m.status === "active")?.sponsoringInstitutionName;

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Dashboard</h1>
      <p className="mt-2 text-black">Welcome, {session?.user?.name}.</p>
      {membershipStatus === "success" && (
        <p className="mt-4 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-800">
          Thank you for joining NAHCA! Your membership will show as active here as soon as your payment is confirmed —
          this usually takes a few seconds, so refresh the page if you don&apos;t see it yet. A confirmation email is on its way.
        </p>
      )}
      {sponsoringInstitutionName && (
        <p className="mt-1 text-sm text-black">Your membership is sponsored by {sponsoringInstitutionName}.</p>
      )}

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-medium text-heading">Recent Purchases</h2>
          {payments.length > 0 && (
            <Link href="/portal/purchases" className="text-sm font-semibold text-brand hover:text-brand-dark">
              View all →
            </Link>
          )}
        </div>

        {recentPurchases.length === 0 ? (
          <p className="mt-3 text-sm text-black">No purchase yet.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {recentPurchases.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink/10 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-ink">{paymentLabel(p)}</p>
                  <p className="text-sm text-black">{formatDate(p.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink">${(p.amountCents / 100).toFixed(2)}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${PAYMENT_STATUS_STYLES[p.status] ?? "bg-ink/10 text-black"}`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-medium text-heading">Your Events and Webinars</h2>
          {eventRegistrations.length > 0 && (
            <Link href="/portal/events" className="text-sm font-semibold text-brand hover:text-brand-dark">
              View all →
            </Link>
          )}
        </div>

        {upcomingEvents.length === 0 ? (
          <p className="mt-3 text-sm text-black">No upcoming events or webinars.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {upcomingEvents.map((item) => (
              <MyEventCard key={item.registrationId} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl font-medium text-heading">Reminders</h2>

        {reminders.length === 0 ? (
          <p className="mt-3 text-sm text-black">You&apos;re all caught up — no reminders right now.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {reminders.map((r, i) => (
              <div key={i} className={`rounded-xl border p-4 text-sm text-black ${REMINDER_STYLES[r.tone]}`}>
                {r.text}
                {r.href && (
                  <Link href={r.href} className="ml-2 font-semibold text-brand hover:text-brand-dark">
                    Take action →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
