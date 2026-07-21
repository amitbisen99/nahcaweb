import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getMembershipPlanByType } from "@/lib/adminApi";
import { MembershipPlanForm } from "@/components/admin/MembershipPlanForm";
import { updateMembershipPlan } from "../actions";

const VALID_TYPES = ["regular", "student", "institutional", "conference"];

export default async function EditMembershipPlanPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();

  const session = await auth();
  const plan = await getMembershipPlanByType(type, session?.apiToken ?? "");
  if (!plan) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/membership-plans" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Membership Plans
      </Link>
      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">Edit {plan.name}</h1>

      <div className="mt-8">
        <MembershipPlanForm plan={plan} action={updateMembershipPlan.bind(null, type)} />
      </div>
    </div>
  );
}
