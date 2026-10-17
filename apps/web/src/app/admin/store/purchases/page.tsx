import Link from "next/link";
import { auth } from "@/auth";
import { listAdminProductOrders } from "@/lib/adminStore";
import { formatDateTime } from "@/lib/formatDate";
import { PAYMENT_STATUS_STYLES } from "@/lib/membershipLabels";

const PAGE_SIZE = 10;

export default async function StorePurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const session = await auth();
  const { orders, total } = session?.apiToken
    ? await listAdminProductOrders(session.apiToken, { page, pageSize: PAGE_SIZE })
    : { orders: [], total: 0 };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <Link href="/admin/store" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Store
      </Link>
      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">Purchases ({total})</h1>
      <p className="mt-1 text-sm text-black">
        Every Store purchase, newest first. A &ldquo;Pending&rdquo; payment is a checkout that was started but not
        completed.
      </p>

      {orders.length === 0 ? (
        <p className="mt-4 text-sm text-black">No purchases yet.</p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand/40 text-xs uppercase tracking-wide text-black">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Date &amp; Time</th>
                  <th className="px-4 py-3">Payment Ref</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const status = o.payment?.status ?? "pending";
                  return (
                    <tr key={o.id} className="border-t border-ink/10 align-top">
                      <td className="px-4 py-3 text-black">#{o.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{o.buyer.name}</p>
                        <p className="text-black">{o.buyer.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/store/${o.product.id}`} className="font-medium text-ink hover:text-brand">
                          {o.product.title}
                        </Link>
                        <p className="text-xs capitalize text-black/60">{o.product.type}</p>
                      </td>
                      <td className="px-4 py-3 text-black">
                        {o.payment ? `$${(o.payment.amountCents / 100).toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${PAYMENT_STATUS_STYLES[status] ?? "bg-ink/10 text-black"}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-black">{formatDateTime(o.createdAt)}</td>
                      <td className="max-w-[10rem] px-4 py-3 text-xs text-black/60">
                        <span className="block truncate" title={o.payment?.stripeRef ?? ""}>
                          {o.payment?.stripeRef ?? "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
                  href={`/admin/store/purchases?page=${page - 1}`}
                  aria-disabled={page <= 1}
                  className={`rounded-lg border border-ink/20 px-3 py-1.5 font-medium ${
                    page <= 1 ? "pointer-events-none text-black/30" : "text-black transition-colors hover:border-brand"
                  }`}
                >
                  ← Previous
                </Link>
                <Link
                  href={`/admin/store/purchases?page=${page + 1}`}
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
