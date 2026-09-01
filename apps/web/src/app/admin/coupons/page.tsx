import { auth } from "@/auth";
import { listContent } from "@/lib/adminApi";
import type { AdminCoupon } from "@/lib/adminApi";
import { Button } from "@/components/Button";
import { CouponRowActions } from "@/components/admin/CouponRowActions";
import { formatDate } from "@/lib/formatDate";

function formatDiscount(coupon: AdminCoupon): string {
  if (coupon.discountType === "complimentary") return "Free";
  if (coupon.discountType === "fixed_amount") return `$${(coupon.discountValue / 100).toFixed(2)} off`;
  return `${coupon.discountValue}% off`;
}

export default async function CouponsPage() {
  const session = await auth();
  const coupons = (await listContent("coupons", session?.apiToken ?? "")) as unknown as AdminCoupon[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-medium text-heading">Coupons</h1>
          <p className="mt-2 text-sm text-black">Manage discount and complimentary coupon codes.</p>
        </div>
        <Button href="/admin/coupons/new">+ New Coupon</Button>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {coupons.length === 0 && <p className="text-sm text-black">No coupons yet.</p>}
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-ink">{coupon.name}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    coupon.published ? "bg-forest/10 text-forest" : "bg-ink/10 text-black"
                  }`}
                >
                  {coupon.published ? "Published" : "Draft"}
                </span>
              </div>
              <p className="mt-1 text-sm text-black">
                <span className="font-mono">{coupon.code}</span> · {formatDiscount(coupon)} ·{" "}
                {coupon.usedCount}
                {coupon.maxUses ? ` / ${coupon.maxUses}` : ""} used · {formatDate(coupon.validFrom)} –{" "}
                {formatDate(coupon.validTill)}
              </p>
            </div>
            <CouponRowActions id={coupon.id} name={coupon.name} />
          </div>
        ))}
      </div>
    </div>
  );
}
