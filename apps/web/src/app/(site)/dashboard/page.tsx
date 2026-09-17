import Link from "next/link";
import { auth } from "@/auth";
import { getMyOrders } from "@/lib/store";
import { formatDate } from "@/lib/formatDate";

const ORDER_STATUS_STYLES: Record<string, string> = {
  active: "bg-forest/10 text-forest",
  pending: "bg-amber-100 text-amber-800",
};

export default async function DashboardOrdersPage() {
  const session = await auth();
  const token = session?.apiToken ?? "";
  const orders = await getMyOrders(token);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-heading text-3xl font-medium text-heading">My Orders</h1>
        <Link href="/store" className="text-sm font-semibold text-brand hover:text-brand-dark">
          Browse Store →
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-black">You haven&rsquo;t bought anything yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink/10 bg-white p-4"
            >
              <div>
                <p className="font-medium text-ink">{o.product.title}</p>
                <p className="text-sm text-black">{formatDate(o.createdAt)}</p>
                {o.status === "active" && (
                  <Link
                    href={`/store/${o.product.id}`}
                    className="text-sm font-semibold text-brand hover:text-brand-dark"
                  >
                    {o.product.type === "video" ? "Watch" : "Download"} →
                  </Link>
                )}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_STYLES[o.status] ?? "bg-ink/10 text-black"}`}
              >
                {o.status === "active" ? "Ready" : "Processing"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
