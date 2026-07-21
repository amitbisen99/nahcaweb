import Link from "next/link";
import { auth } from "@/auth";
import { getMyMemberships, getMyPayments } from "@/lib/api";
import { TIER_LABELS, PAYMENT_STATUS_STYLES } from "@/lib/membershipLabels";
import { paymentLabel } from "@/lib/paymentLabel";

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
  } else if (pending) {
    reminders.push({
      text: `Your ${TIER_LABELS[pending.type] ?? pending.type} payment is pending.`,
      tone: "warning",
    });
  }

  if (active?.endDate) {
    const daysLeft = Math.ceil((new Date(active.endDate).getTime() - Date.now()) / 86_400_000);
    if (daysLeft >= 0 && daysLeft <= 30) {
      reminders.push({
        text: `Your membership expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} (${new Date(active.endDate).toDateString()}). Renew soon to keep your benefits.`,
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

export default async function PortalDashboardPage() {
  const session = await auth();
  const token = session?.apiToken ?? "";
  const [memberships, payments] = await Promise.all([getMyMemberships(token), getMyPayments(token)]);
  const recentPurchases = payments.slice(0, 5);
  const reminders = buildReminders(memberships);

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Dashboard</h1>
      <p className="mt-2 text-ink/70">Welcome, {session?.user?.name}.</p>

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
          <p className="mt-3 text-sm text-ink/60">
            No purchases yet. Visit the{" "}
            <Link href="/membership" className="font-semibold text-brand hover:text-brand-dark">
              Membership page
            </Link>{" "}
            to join.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {recentPurchases.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink/10 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-ink">{paymentLabel(p)}</p>
                  <p className="text-sm text-ink/60">{new Date(p.createdAt).toDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink">${(p.amountCents / 100).toFixed(2)}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${PAYMENT_STATUS_STYLES[p.status] ?? "bg-ink/10 text-ink/60"}`}
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
        <h2 className="font-heading text-xl font-medium text-heading">Reminders</h2>

        {reminders.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">You&apos;re all caught up — no reminders right now.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {reminders.map((r, i) => (
              <div key={i} className={`rounded-xl border p-4 text-sm text-ink/80 ${REMINDER_STYLES[r.tone]}`}>
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
