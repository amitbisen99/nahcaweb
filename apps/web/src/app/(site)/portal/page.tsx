import { Container } from "@/components/Container";
import { auth } from "@/auth";
import { getMyMemberships } from "@/lib/api";

const TIER_LABELS: Record<string, string> = {
  regular: "Regular Membership",
  student: "Student Membership",
  institutional: "Institution-Sponsored Student Membership",
  conference: "Conference Membership",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-forest/10 text-forest",
  pending: "bg-brand/10 text-brand-dark",
  expired: "bg-ink/10 text-ink/60",
};

export default async function PortalPage() {
  const session = await auth();
  const memberships = session?.apiToken ? await getMyMemberships(session.apiToken) : [];

  return (
    <Container>
      <div className="py-16">
        <h1 className="font-heading text-3xl font-medium text-heading">Member Portal</h1>
        <p className="mt-2 text-ink/70">Welcome, {session?.user?.name}.</p>

        <h2 className="mt-10 font-heading text-xl font-medium text-heading">Your Memberships</h2>

        {memberships.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">
            You don&apos;t have a membership yet. Visit the{" "}
            <a href="/membership" className="font-semibold text-brand hover:text-brand-dark">
              Membership page
            </a>{" "}
            to join.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {memberships.map((m) => (
              <div key={m.id} className="rounded-xl border border-ink/10 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-heading text-base font-medium text-heading">
                    {TIER_LABELS[m.type] ?? m.type}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[m.status] ?? "bg-ink/10 text-ink/60"}`}
                  >
                    {m.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink/60">
                  ${(m.priceCents / 100).toFixed(2)}
                  {m.startDate && m.endDate && (
                    <>
                      {" "}
                      · {new Date(m.startDate).toDateString()} – {new Date(m.endDate).toDateString()}
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}

        <p className="mt-10 text-sm text-ink/40">
          Payment history and members-only content will be built out in a follow-up phase.
        </p>
      </div>
    </Container>
  );
}
