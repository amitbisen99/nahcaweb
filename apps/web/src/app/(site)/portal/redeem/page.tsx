import { auth } from "@/auth";
import { getMyMemberships } from "@/lib/api";
import { RedeemForm } from "./RedeemForm";

export default async function RedeemCodePage() {
  const session = await auth();
  const memberships = session?.apiToken ? await getMyMemberships(session.apiToken) : [];

  // The most recent sponsored membership on record, if any — used both to
  // show "your current membership" details and to decide whether renewal
  // is even allowed yet (see the matching check in POST /institutions/redeem).
  const currentSponsored = memberships
    .filter((m) => m.type === "institutional" && m.groupId !== null)
    .sort((a, b) => new Date(b.endDate ?? 0).getTime() - new Date(a.endDate ?? 0).getTime())[0];

  const stillActive = Boolean(currentSponsored?.endDate && new Date(currentSponsored.endDate) > new Date());

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Renew Your Membership</h1>
      <p className="mt-2 text-black">
        If your employer or school has sponsored your NAHCA membership, enter your renewal code below once your
        current sponsored period ends — no payment needed.
      </p>

      {currentSponsored && (
        <div className="mt-6 rounded-xl border border-ink/10 bg-white p-4">
          <h2 className="font-heading text-lg font-medium text-heading">Your Sponsored Membership</h2>
          <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm text-black sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="font-medium">Sponsored by:</dt>
              <dd>{currentSponsored.sponsoringInstitutionName ?? "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium">Status:</dt>
              <dd>{stillActive ? "Active" : "Ended"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium">Start date:</dt>
              <dd>{currentSponsored.startDate ? new Date(currentSponsored.startDate).toDateString() : "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium">End date:</dt>
              <dd>{currentSponsored.endDate ? new Date(currentSponsored.endDate).toDateString() : "—"}</dd>
            </div>
          </dl>
        </div>
      )}

      {stillActive ? (
        <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-black">
          You already have active membership. Use renewal code after membership expire.
        </p>
      ) : (
        <RedeemForm />
      )}
    </div>
  );
}
