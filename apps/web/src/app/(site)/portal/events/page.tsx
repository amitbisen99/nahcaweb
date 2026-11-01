import Link from "next/link";
import { auth } from "@/auth";
import { getMyEventRegistrations, type ApiMyEventRegistration } from "@/lib/api";
import { MyEventCard } from "@/components/MyEventCard";

const TABS = [
  { label: "All", value: undefined },
  { label: "Events", value: "event" },
  { label: "Webinars", value: "webinar" },
] as const;

// Event dates are stored as a bare date (midnight UTC), so compare as
// YYYY-MM-DD — an event happening today still counts as upcoming.
function isPast(item: ApiMyEventRegistration, today: string): boolean {
  return item.date !== null && item.date.slice(0, 10) < today;
}

export default async function MyEventsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const filter = type === "event" || type === "webinar" ? type : undefined;

  const session = await auth();
  const all = session?.apiToken ? await getMyEventRegistrations(session.apiToken) : [];
  const items = filter ? all.filter((i) => i.type === filter) : all;

  const today = new Date().toISOString().slice(0, 10);
  // Soonest first; a webinar with no date yet goes last among the upcoming.
  const upcoming = items
    .filter((i) => !isPast(i, today))
    .sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"));
  const past = items.filter((i) => isPast(i, today)).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Events &amp; Webinars</h1>
      <p className="mt-2 text-black">Everything you&apos;ve registered for.</p>

      <div className="mt-6 flex gap-2">
        {TABS.map((tab) => {
          const active = tab.value === filter;
          return (
            <Link
              key={tab.label}
              href={tab.value ? `/portal/events?type=${tab.value}` : "/portal/events"}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active ? "bg-brand text-white" : "border border-ink/15 text-black hover:border-brand hover:text-brand"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-black">
          {filter
            ? `You haven't registered for any ${filter === "event" ? "events" : "webinars"} yet.`
            : "You haven't registered for any events or webinars yet."}{" "}
          <Link href="/events" className="font-semibold text-brand hover:text-brand-dark">
            Browse events →
          </Link>
        </p>
      ) : (
        <>
          <section className="mt-8">
            <h2 className="font-heading text-xl font-medium text-heading">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-black">Nothing coming up.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {upcoming.map((item) => (
                  <MyEventCard key={item.registrationId} item={item} />
                ))}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section className="mt-10">
              <h2 className="font-heading text-xl font-medium text-heading">Past</h2>
              <div className="mt-4 flex flex-col gap-3">
                {past.map((item) => (
                  <MyEventCard key={item.registrationId} item={item} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
