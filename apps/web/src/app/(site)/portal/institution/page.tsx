import { auth } from "@/auth";
import { getMySponsorship } from "@/lib/institutions";
import { InstitutionCodeList } from "@/components/InstitutionCodeList";
import { formatDate } from "@/lib/formatDate";

export default async function InstitutionDashboardPage() {
  const session = await auth();
  const sponsorship = session?.apiToken ? await getMySponsorship(session.apiToken) : null;

  if (!sponsorship) {
    return (
      <div>
        <h1 className="font-heading text-3xl font-medium text-heading">Institution Dashboard</h1>
        <p className="mt-4 text-sm text-black">You don&rsquo;t have an active institutional sponsorship.</p>
      </div>
    );
  }

  const claimedCount = sponsorship.codes.filter((c) => c.claimedAt).length;

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Institution Dashboard</h1>
      <p className="mt-2 text-black">
        {sponsorship.seatCount} seats sponsored · {claimedCount} claimed · {sponsorship.seatCount - claimedCount}{" "}
        remaining
      </p>
      <p className="mt-1 text-sm text-black">
        Sponsorship period: {formatDate(sponsorship.startDate)} –{" "}
        {formatDate(sponsorship.endDate)}
      </p>

      <div className="mt-6">
        <h2 className="font-heading text-lg font-medium text-heading">Claim Codes</h2>
        <p className="mt-1 text-sm text-black">
          Share one code per student. New students register at{" "}
          <span className="font-mono">/membership/claim</span>; existing members can redeem a code from their own
          portal.
        </p>
        <div className="mt-4">
          <InstitutionCodeList codes={sponsorship.codes} />
        </div>
      </div>
    </div>
  );
}
