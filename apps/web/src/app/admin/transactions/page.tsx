import Link from "next/link";
import { auth } from "@/auth";
import { getAllTransactions } from "@/lib/api";
import { formatDate } from "@/lib/formatDate";
import { PAYMENT_STATUS_STYLES } from "@/lib/membershipLabels";

const PAGE_SIZE = 20;

const TYPE_OPTIONS = [
  { value: "membership", label: "Membership" },
  { value: "event", label: "Events & webinars" },
  { value: "product", label: "Store" },
  { value: "donation", label: "Donations" },
];
const STATUS_OPTIONS = ["succeeded", "pending", "failed", "refunded"];

function buildQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; type?: string; status?: string; from?: string; to?: string }>;
}) {
  const { page: pageParam, q, type, status, from, to } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const filters = { q, type, status, from, to };
  const hasFilters = Boolean(q || type || status || from || to);

  const session = await auth();
  const data = session?.apiToken
    ? await getAllTransactions(session.apiToken, { page, pageSize: PAGE_SIZE, ...filters })
    : null;
  const transactions = data?.transactions ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fieldClass = "rounded-lg border border-ink/20 bg-white px-3 py-1.5 text-sm focus:border-brand focus:outline-none";

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-medium text-heading">Transactions ({total})</h1>
          <p className="mt-1 text-sm text-black">
            Every payment made on the site — memberships, events and webinars, store purchases and donations — and who paid for what.
          </p>
        </div>
        {total > 0 && (
          <Link
            href={`/admin/transactions/export${buildQuery(filters)}`}
            className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/5"
          >
            Export as Excel
          </Link>
        )}
      </div>

      {data && (
        <p className="mt-4 text-sm text-black">
          Received (successful payments{hasFilters ? " matching these filters" : ""}):{" "}
          <span className="font-semibold text-ink">{money(data.succeededCents)}</span> across {data.succeededCount}{" "}
          payment{data.succeededCount === 1 ? "" : "s"}
        </p>
      )}

      <form className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-ink/10 bg-white p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">Name or email</span>
          <input type="text" name="q" defaultValue={q ?? ""} placeholder="Search" className={fieldClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">Type</span>
          <select name="type" defaultValue={type ?? ""} className={fieldClass}>
            <option value="">All</option>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">Status</span>
          <select name="status" defaultValue={status ?? ""} className={fieldClass}>
            <option value="">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">From</span>
          <input type="date" name="from" defaultValue={from ?? ""} className={fieldClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-black">To</span>
          <input type="date" name="to" defaultValue={to ?? ""} className={fieldClass} />
        </label>
        <button type="submit" className="rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">
          Search
        </button>
        {hasFilters && (
          <Link href="/admin/transactions" className="text-sm font-semibold text-black/60 hover:text-black">
            Clear filters
          </Link>
        )}
      </form>

      {transactions.length === 0 ? (
        <p className="mt-4 text-sm text-black">
          {hasFilters ? "No transactions match these filters." : "No transactions yet."}
        </p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand/40 text-xs uppercase tracking-wide text-black">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Service / Event</th>
                  <th className="px-4 py-3">Paid by</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-t border-ink/10 align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-black">{formatDate(t.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-dark">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {t.service}
                      {t.couponCode && (
                        <span className="mt-0.5 block text-xs font-normal text-black/60">Coupon: {t.couponCode}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-black">
                      {t.name ?? "—"}
                      {t.email && <span className="block text-xs text-black/60">{t.email}</span>}
                      {!t.hasAccount && t.email && <span className="block text-xs text-black/40">Guest (no account)</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-black">{money(t.amountCents)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          PAYMENT_STATUS_STYLES[t.status] ?? "bg-ink/10 text-black"
                        }`}
                      >
                        {t.status}
                      </span>
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
                  href={`/admin/transactions${buildQuery({ ...filters, page: String(page - 1) })}`}
                  aria-disabled={page <= 1}
                  className={`rounded-lg border border-ink/20 px-3 py-1.5 font-medium ${
                    page <= 1 ? "pointer-events-none text-black/30" : "text-black transition-colors hover:border-brand"
                  }`}
                >
                  ← Previous
                </Link>
                <Link
                  href={`/admin/transactions${buildQuery({ ...filters, page: String(page + 1) })}`}
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
