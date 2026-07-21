import { auth } from "@/auth";
import { listMembershipPlans } from "@/lib/adminApi";
import { MembershipPlanRowActions } from "@/components/admin/MembershipPlanRowActions";

export default async function MembershipPlansPage() {
  const session = await auth();
  const plans = await listMembershipPlans(session?.apiToken ?? "");

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Membership Plans</h1>
      <p className="mt-2 text-sm text-ink/60">
        View and update the content and pricing for each membership plan.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {plans.length === 0 && <p className="text-sm text-ink/60">No membership plans found.</p>}
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white p-4"
          >
            <div>
              <p className="font-medium text-ink">{plan.name}</p>
              <p className="mt-1 text-sm text-ink/60">
                {plan.type === "institutional"
                  ? `$${((plan.pricePerStudentCents ?? 0) / 100).toFixed(2)} ${plan.term}`
                  : `$${(plan.priceCents / 100).toFixed(2)} ${plan.term}`}
              </p>
            </div>
            <MembershipPlanRowActions plan={plan} />
          </div>
        ))}
      </div>
    </div>
  );
}
