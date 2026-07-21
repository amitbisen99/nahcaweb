import Link from "next/link";

export default function PortalResourcesPage() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Resources</h1>
      <p className="mt-2 text-ink/70">Materials to support your work as a Hindu chaplain.</p>

      <div className="mt-6 rounded-xl border border-ink/10 bg-white p-6">
        <p className="text-sm text-ink/70">
          Browse our public resource library while member-exclusive downloads are being added here.
        </p>
        <Link
          href="/what-is-hindu-chaplaincy/resources"
          className="mt-3 inline-block text-sm font-semibold text-brand hover:text-brand-dark"
        >
          Visit Useful Resources →
        </Link>
      </div>
    </div>
  );
}
