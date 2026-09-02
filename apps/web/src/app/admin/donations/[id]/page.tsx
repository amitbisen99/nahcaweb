import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getDonation } from "@/lib/api";
import { formatDate } from "@/lib/formatDate";

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  succeeded: "bg-forest/10 text-forest",
  pending: "bg-brand/10 text-brand-dark",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-ink/10 text-black",
};

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-sm font-medium text-black">{label}</p>
      <p className="mt-0.5 whitespace-pre-line text-sm text-ink">{value?.trim() ? value : "—"}</p>
    </div>
  );
}

// The list table hides Purpose and Address (and drops Recurring entirely)
// to keep the row compact — this page is where all of it actually lives.
export default async function DonationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const donationId = Number(id);
  if (!Number.isInteger(donationId)) notFound();

  const session = await auth();
  const donation = session?.apiToken ? await getDonation(donationId, session.apiToken) : null;
  if (!donation) notFound();

  const status = donation.payment?.status ?? "unknown";

  return (
    <div>
      <Link href="/admin/donations" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Donations
      </Link>

      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">{donation.donorName}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
            PAYMENT_STATUS_STYLES[status] ?? "bg-ink/10 text-black"
          }`}
        >
          {status}
        </span>
        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-dark">
          ${(donation.amountCents / 100).toFixed(2)}
        </span>
        {donation.recurring && (
          <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-black">
            Monthly (legacy — recurring is no longer offered on the form)
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-6 rounded-xl border border-ink/10 bg-white p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Donor name" value={donation.donorName} />
          <Field label="Email" value={donation.donorEmail} />
          <Field label="Amount" value={`$${(donation.amountCents / 100).toFixed(2)}`} />
          <Field label="Date" value={formatDate(donation.createdAt)} />
        </div>
        <Field label="Purpose / Dedication" value={donation.purpose} />
        <Field label="Address" value={donation.address} />
        {donation.payment?.stripeRef && <Field label="Stripe reference" value={donation.payment.stripeRef} />}
      </div>
    </div>
  );
}
