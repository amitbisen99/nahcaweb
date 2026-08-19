import Link from "next/link";
import { auth } from "@/auth";
import { getAllDonations } from "@/lib/api";

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  succeeded: "bg-forest/10 text-forest",
  pending: "bg-brand/10 text-brand-dark",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-ink/10 text-black",
};

const PAGE_SIZE = 10;

function buildQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export default async function DonationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; email?: string; from?: string; to?: string }>;
}) {
  const { page: pageParam, email, from, to } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const session = await auth();
  const { donations, total } = session?.apiToken
    ? await getAllDonations(session.apiToken, { page, pageSize: PAGE_SIZE, email, from, to })
    : { donations: [], total: 0 };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filters = { email, from, to };

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Donations ({total})</h1>
      <p className="mt-1 text-sm text-black">Every donation received, searchable by donor email and date.</p>

      <form className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-ink/10 bg-white p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">Donor email</span>
          <input
            type="text"
            name="email"
            defaultValue={email ?? ""}
            placeholder="Search by email"
            className="rounded-lg border border-ink/20 px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">From</span>
          <input
            type="date"
            name="from"
            defaultValue={from ?? ""}
            className="rounded-lg border border-ink/20 px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">To</span>
          <input
            type="date"
            name="to"
            defaultValue={to ?? ""}
            className="rounded-lg border border-ink/20 px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Search
        </button>
        {(email || from || to) && (
          <Link href="/admin/donations" className="text-sm font-semibold text-black/60 hover:text-black">
            Clear filters
          </Link>
        )}
      </form>

      {donations.length === 0 ? (
        <p className="mt-4 text-sm text-black">
          {email || from || to ? "No donations match these filters." : "No donations have been received yet."}
        </p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand/40 text-xs uppercase tracking-wide text-black">
                <tr>
                  <th className="px-4 py-3">Donor</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Recurring</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} className="border-t border-ink/10">
                    <td className="px-4 py-3 font-medium text-ink">{d.donorName}</td>
                    <td className="px-4 py-3 text-black">{d.donorEmail}</td>
                    <td className="px-4 py-3 text-black">{d.purpose || "—"}</td>
                    <td className="px-4 py-3 text-black">${(d.amountCents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-black">{d.recurring ? "Monthly" : "One-time"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          PAYMENT_STATUS_STYLES[d.payment?.status ?? ""] ?? "bg-ink/10 text-black"
                        }`}
                      >
                        {d.payment?.status ?? "unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-black">{new Date(d.createdAt).toDateString()}</td>
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
                  href={`/admin/donations${buildQuery({ ...filters, page: String(page - 1) })}`}
                  aria-disabled={page <= 1}
                  className={`rounded-lg border border-ink/20 px-3 py-1.5 font-medium ${
                    page <= 1
                      ? "pointer-events-none text-black/30"
                      : "text-black transition-colors hover:border-brand"
                  }`}
                >
                  ← Previous
                </Link>
                <Link
                  href={`/admin/donations${buildQuery({ ...filters, page: String(page + 1) })}`}
                  aria-disabled={page >= totalPages}
                  className={`rounded-lg border border-ink/20 px-3 py-1.5 font-medium ${
                    page >= totalPages
                      ? "pointer-events-none text-black/30"
                      : "text-black transition-colors hover:border-brand"
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
