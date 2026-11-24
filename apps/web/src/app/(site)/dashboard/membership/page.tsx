import Link from "next/link";

export default function DashboardBecomeMemberPage() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Become a Member</h1>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4">
        <div>
          <p className="font-medium text-ink">Become a NAHCA member</p>
          <p className="text-sm text-black">
            Join to unlock the member portal, conference videos, member-only events and discounts. It&rsquo;s added to
            your existing account.
          </p>
        </div>
        <Link
          href="/membership"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Become a Member
        </Link>
      </div>
    </div>
  );
}
