import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getMembershipDetail } from "@/lib/adminApi";
import { MemberProfileForm } from "@/components/admin/MemberProfileForm";

const TIER_LABELS: Record<string, string> = {
  regular: "Regular",
  student: "Student",
  institutional: "Institutional",
  conference: "Conference",
};

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const membershipId = Number(id);
  if (!Number.isInteger(membershipId)) notFound();

  const session = await auth();
  const membership = session?.apiToken ? await getMembershipDetail(membershipId, session.apiToken) : null;
  if (!membership) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/members" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Members
      </Link>
      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">{membership.user.name}</h1>
      <p className="mt-1 text-sm text-black">
        {membership.user.email} · {TIER_LABELS[membership.type] ?? membership.type} membership
      </p>

      <div className="mt-8">
        <MemberProfileForm membership={membership} />
      </div>
    </div>
  );
}
