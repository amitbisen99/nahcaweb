import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getContentItem, getCouponUsages } from "@/lib/adminApi";
import type { AdminCoupon } from "@/lib/adminApi";
import { Button } from "@/components/Button";
import { formatDate, formatDateTime } from "@/lib/formatDate";

const SCOPE_LABELS: Record<string, string> = {
  regular: "Regular Membership",
  student: "Student Membership",
  institutional: "Institution-Sponsored Membership",
  nahca_programmes: "Nahca Programmes (a specific Event/Webinar)",
};

function formatDiscount(coupon: AdminCoupon): string {
  if (coupon.discountType === "complimentary") return "Complimentary (free)";
  if (coupon.discountType === "fixed_amount") return `$${(coupon.discountValue / 100).toFixed(2)} off`;
  return `${coupon.discountValue}% off`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-black">{label}</p>
      <div className="mt-0.5 text-sm text-ink">{children}</div>
    </div>
  );
}

export default async function CouponDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!Number.isInteger(Number(id))) notFound();

  const session = await auth();
  const token = session?.apiToken ?? "";
  const [coupon, { usages, programme }] = await Promise.all([
    getContentItem("coupons", id, token) as Promise<AdminCoupon | null>,
    getCouponUsages(id, token),
  ]);
  if (!coupon) notFound();

  const isProgramme = coupon.appliesTo?.includes("nahca_programmes");

  return (
    <div className="max-w-4xl">
      <Link href="/admin/coupons" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Coupons
      </Link>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-3xl font-medium text-heading">{coupon.name}</h1>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              coupon.published ? "bg-forest/10 text-forest" : "bg-ink/10 text-black"
            }`}
          >
            {coupon.published ? "Published" : "Draft"}
          </span>
        </div>
        <Button href={`/admin/coupons/${coupon.id}/edit`}>Edit Coupon</Button>
      </div>

      <div className="mt-8 rounded-xl border border-ink/10 bg-white p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Coupon code">
            <span className="font-mono">{coupon.code}</span>
          </Field>
          <Field label="Discount">{formatDiscount(coupon)}</Field>
          <Field label="Applies to">
            {coupon.appliesTo && coupon.appliesTo.length > 0
              ? coupon.appliesTo.map((s) => SCOPE_LABELS[s] ?? s).join(", ")
              : "Everything"}
          </Field>
          {isProgramme && (
            <Field label="Event / Webinar">
              {programme ? `${programme.title} (${programme.type === "webinar" ? "Webinar" : "Event"}) · ` : ""}
              <span className="font-mono">{coupon.eventCode}</span>
            </Field>
          )}
          <Field label="Valid from">{formatDate(coupon.validFrom, "No start date")}</Field>
          <Field label="Valid till">{formatDate(coupon.validTill, "No end date")}</Field>
          <Field label="Used">
            {coupon.usedCount}
            {coupon.maxUses ? ` of ${coupon.maxUses}` : " (no limit)"}
          </Field>
          <Field label="Created">{formatDateTime(coupon.createdAt)}</Field>
        </div>
      </div>

      <h2 className="mt-10 font-heading text-xl font-medium text-heading">Who used this coupon</h2>
      <p className="mt-1 text-sm text-black">
        Everyone whose payment went through with this coupon, newest first.
      </p>

      {usages.length === 0 ? (
        <p className="mt-4 text-sm text-black">Nobody has used this coupon yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/5 text-black">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Used for</th>
                <th className="px-4 py-3 font-medium">Amount paid</th>
                <th className="px-4 py-3 font-medium">Date &amp; time</th>
              </tr>
            </thead>
            <tbody>
              {usages.map((u) => (
                <tr key={u.paymentId} className="border-b border-ink/10 last:border-0">
                  <td className="px-4 py-3 text-ink">{u.name}</td>
                  <td className="px-4 py-3 text-black">{u.email}</td>
                  <td className="px-4 py-3 text-black">{u.usedFor}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-black">${(u.amountCents / 100).toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-black">{formatDateTime(u.usedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
