import Link from "next/link";
import { auth } from "@/auth";
import { getEventAttendeeFilterOptions, getEventAttendees } from "@/lib/api";
import { formatDate } from "@/lib/formatDate";

const PAGE_SIZE = 20;

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "member", label: "Member" },
  { value: "general", label: "General user" },
  { value: "guest", label: "Guest" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Confirmed" },
  { value: "pending", label: "Pending (payment not completed)" },
  { value: "all", label: "All" },
];

function buildQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export default async function EventAttendeesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; eventCode?: string; status?: string; type?: string }>;
}) {
  const { page: pageParam, q, eventCode, status, type } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const filters = { q, eventCode, status, type };
  const hasFilters = Boolean(q || eventCode || status || type);

  const session = await auth();
  const token = session?.apiToken ?? "";
  const [data, eventOptions] = await Promise.all([
    getEventAttendees(token, { page, pageSize: PAGE_SIZE, ...filters }),
    getEventAttendeeFilterOptions(token),
  ]);
  const { attendees, total } = data;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const events = eventOptions.filter((o) => o.type === "Event");
  const webinars = eventOptions.filter((o) => o.type === "Webinar");
  const fieldClass = "rounded-lg border border-ink/20 bg-white px-3 py-1.5 text-sm focus:border-brand focus:outline-none";

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-medium text-heading">Event Attendees ({total})</h1>
          <p className="mt-1 text-sm text-black">
            Everyone who registered for an event or webinar — guests and account holders — in one list.
          </p>
        </div>
        {total > 0 && (
          <Link
            href={`/admin/event-attendees/export${buildQuery(filters)}`}
            className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/5"
          >
            Export as Excel
          </Link>
        )}
      </div>

      <form className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-ink/10 bg-white p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">Search</span>
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Name, email, phone or event"
            className={`${fieldClass} w-64`}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">Event or webinar</span>
          <select name="eventCode" defaultValue={eventCode ?? ""} className={`${fieldClass} max-w-xs`}>
            <option value="">All events and webinars</option>
            {events.length > 0 && (
              <optgroup label="Events">
                {events.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.title}
                  </option>
                ))}
              </optgroup>
            )}
            {webinars.length > 0 && (
              <optgroup label="Webinars">
                {webinars.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.title}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">Attendee type</span>
          <select name="type" defaultValue={type ?? ""} className={fieldClass}>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">Registration</span>
          <select name="status" defaultValue={status ?? ""} className={fieldClass}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">
          Search
        </button>
        {hasFilters && (
          <Link href="/admin/event-attendees" className="text-sm font-semibold text-black/60 hover:text-black">
            Clear filters
          </Link>
        )}
      </form>

      {attendees.length === 0 ? (
        <p className="mt-4 text-sm text-black">
          {hasFilters ? "No attendees match these filters." : "No one has registered for an event or webinar yet."}
        </p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand/40 text-xs uppercase tracking-wide text-black">
                <tr>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3">Attendee</th>
                  <th className="px-4 py-3">Event / Webinar</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {attendees.map((a) => (
                  <tr key={a.id} className="border-t border-ink/10 align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-black">{formatDate(a.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {a.name ?? "—"}
                      {a.email && <span className="block text-xs font-normal text-black/60">{a.email}</span>}
                    </td>
                    <td className="px-4 py-3 text-black">
                      {a.eventTitle}
                      {a.eventType && <span className="block text-xs text-black/60">{a.eventType}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-black">
                        {a.attendeeType}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-black">
                      {a.amountCents === null ? "—" : `$${(a.amountCents / 100).toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          a.status === "active" ? "bg-forest/10 text-forest" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {a.status === "active" ? "Confirmed" : "Pending"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/admin/event-attendees/${a.id}`}
                        className="text-sm font-semibold text-brand hover:text-brand-dark"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-black">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/admin/event-attendees${buildQuery({ ...filters, page: String(page - 1) })}`}
                  aria-disabled={page <= 1}
                  className={`rounded-lg border border-ink/20 px-3 py-1.5 font-medium ${
                    page <= 1 ? "pointer-events-none text-black/30" : "text-black transition-colors hover:border-brand"
                  }`}
                >
                  ← Previous
                </Link>
                <Link
                  href={`/admin/event-attendees${buildQuery({ ...filters, page: String(page + 1) })}`}
                  aria-disabled={page >= totalPages}
                  className={`rounded-lg border border-ink/20 px-3 py-1.5 font-medium ${
                    page >= totalPages ? "pointer-events-none text-black/30" : "text-black transition-colors hover:border-brand"
                  }`}
                >
                  Next →
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
