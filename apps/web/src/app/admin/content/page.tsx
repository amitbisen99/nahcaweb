import Link from "next/link";
import { auth } from "@/auth";
import { CONTENT_TYPES } from "@/lib/contentTypes";
import { listContent } from "@/lib/adminApi";

// Resources have their own page (one form for everything in the library), so
// they're not one of these.
const HUB_TYPES = Object.values(CONTENT_TYPES);

export default async function ContentHubPage() {
  const session = await auth();
  const token = session?.apiToken ?? "";

  const counts = await Promise.all(
    HUB_TYPES.map(async (config) => {
      const items = await listContent(config.key, token);
      return { key: config.key, label: config.label, count: items.length };
    })
  );

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Website Content</h1>
      <p className="mt-2 text-black">
        Manage events, webinars, resources, board members, and organizational partners shown on the
        public site.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/content/resources"
          className="rounded-xl border border-ink/10 bg-white p-6 transition-colors hover:border-brand/40"
        >
          <h2 className="font-heading text-lg font-medium text-heading">Resources</h2>
          <p className="mt-1 text-sm text-black">Papers, websites, podcasts, videos, articles, newsletters</p>
        </Link>
        {counts.map((c) => (
          <Link
            key={c.key}
            href={`/admin/content/${c.key}`}
            className="rounded-xl border border-ink/10 bg-white p-6 transition-colors hover:border-brand/40"
          >
            <h2 className="font-heading text-lg font-medium text-heading">{c.label}</h2>
            <p className="mt-1 text-sm text-black">
              {c.count} item{c.count === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
