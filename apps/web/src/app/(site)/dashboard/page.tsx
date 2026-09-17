import Link from "next/link";
import { Container } from "@/components/Container";
import { auth } from "@/auth";
import { getMyOrders } from "@/lib/store";
import { getMyForumTopics } from "@/lib/forum";
import { formatDate } from "@/lib/formatDate";

const ORDER_STATUS_STYLES: Record<string, string> = {
  active: "bg-forest/10 text-forest",
  pending: "bg-amber-100 text-amber-800",
};

// The home base for a "general user" (a free account with no Membership —
// see auth.ts's hasMembership) — the equivalent of what /portal is for a
// member. Surfaces the two things such an account can actually do: buy
// from the Store and participate in the Forum.
export default async function DashboardPage() {
  const session = await auth();
  const token = session?.apiToken ?? "";

  const [orders, topics] = await Promise.all([getMyOrders(token), getMyForumTopics(token)]);

  return (
    <Container>
      <div className="py-12">
        <h1 className="font-heading text-3xl font-medium text-heading">Dashboard</h1>
        <p className="mt-1 text-sm text-black">Welcome, {session?.user?.name}.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-medium text-heading">My Orders</h2>
              <Link href="/store" className="text-sm font-semibold text-brand hover:text-brand-dark">
                Browse Store →
              </Link>
            </div>

            {orders.length === 0 ? (
              <p className="mt-3 text-sm text-black">You haven&rsquo;t bought anything yet.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {orders.map((o) => (
                  <div key={o.id} className="rounded-xl border border-ink/10 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-ink">{o.product.title}</p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_STYLES[o.status] ?? "bg-ink/10 text-black"}`}
                      >
                        {o.status === "active" ? "Ready" : "Processing"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-black/60">{formatDate(o.createdAt)}</p>
                    {o.status === "active" && (
                      <Link
                        href={`/store/${o.product.id}`}
                        className="mt-2 inline-block text-sm font-semibold text-brand hover:text-brand-dark"
                      >
                        {o.product.type === "video" ? "Watch" : "Download"} →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-medium text-heading">Forum</h2>
              <Link href="/forum" className="text-sm font-semibold text-brand hover:text-brand-dark">
                Browse Forum →
              </Link>
            </div>

            {topics.length === 0 ? (
              <p className="mt-3 text-sm text-black">
                You haven&rsquo;t posted any topics yet.{" "}
                <Link href="/forum/new" className="font-semibold text-brand hover:text-brand-dark">
                  Start one
                </Link>
                .
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {topics.slice(0, 5).map((t) => (
                  <Link
                    key={t.id}
                    href={`/forum/${t.id}`}
                    className="flex items-center justify-between gap-2 rounded-xl border border-ink/10 bg-white p-4 transition-colors hover:border-brand"
                  >
                    <p className="font-medium text-ink">{t.title}</p>
                    <span className="whitespace-nowrap text-xs text-black/60">{formatDate(t.createdAt)}</span>
                  </Link>
                ))}
                <Link href="/forum/my-topics" className="text-sm font-semibold text-brand hover:text-brand-dark">
                  See all my topics →
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </Container>
  );
}
