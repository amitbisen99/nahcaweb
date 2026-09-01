import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getMembershipDetail } from "@/lib/adminApi";
import { MemberProfileView } from "@/components/admin/MemberProfileView";
import { MemberActiveToggle } from "@/components/admin/MemberActiveToggle";
import { InstitutionCodeList } from "@/components/InstitutionCodeList";
import { formatDate } from "@/lib/formatDate";

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
        {membership.user.email} ·{" "}
        {membership.type === "institutional" && !membership.groupId
          ? "Institutional sponsor"
          : membership.type === "institutional" && membership.groupId && membership.sponsoringInstitution
            ? `Institutional membership by ${membership.sponsoringInstitution.name}`
            : `${TIER_LABELS[membership.type] ?? membership.type} membership`}
      </p>

      <div className="mt-6">
        <MemberActiveToggle membershipId={membership.id} initialActive={membership.user.isActive} />
      </div>

      {membership.type === "institutional" && !membership.groupId && membership.user.institutionSponsorship && (
        <div className="mt-8">
          <h2 className="font-heading text-lg font-medium text-heading">Institutional Sponsorship</h2>
          <p className="mt-1 text-sm text-black">
            {membership.user.institutionSponsorship.seatCount} seats · period{" "}
            {formatDate(membership.user.institutionSponsorship.startDate)} –{" "}
            {formatDate(membership.user.institutionSponsorship.endDate)}
          </p>
          <div className="mt-4">
            <InstitutionCodeList codes={membership.user.institutionSponsorship.codes} />
          </div>
        </div>
      )}

      <div className="mt-8">
        <MemberProfileView membership={membership} />
      </div>
    </div>
  );
}
