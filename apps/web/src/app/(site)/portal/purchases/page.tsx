import { auth } from "@/auth";
import { getMyPayments } from "@/lib/api";
import { PAYMENT_STATUS_STYLES } from "@/lib/membershipLabels";
import { paymentLabel } from "@/lib/paymentLabel";

export default async function PurchasesPage() {
  const session = await auth();
  const payments = session?.apiToken ? await getMyPayments(session.apiToken) : [];

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Purchases</h1>
      <p className="mt-2 text-ink/70">Your full membership and donation history.</p>

      {payments.length === 0 ? (
        <p className="mt-6 text-sm text-ink/60">You haven&apos;t made any purchases yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {payments.map((p) => (
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
    </div>
  );
}
