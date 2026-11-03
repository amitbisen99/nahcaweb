import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/Button";
import { auth } from "@/auth";
import { CONTENT_TYPES, ContentTypeKey, contentListPath, isResourceOnlyType } from "@/lib/contentTypes";
import { listContent } from "@/lib/adminApi";
import { ContentList } from "@/components/admin/ContentList";

export default async function ContentListPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const config = CONTENT_TYPES[type as ContentTypeKey];
  if (!config) notFound();
  if (isResourceOnlyType(config.key)) redirect(contentListPath(config.key));

  const session = await auth();
  const items = await listContent(config.key, session?.apiToken ?? "");
  // Events come back from the API sorted by event date (soonest first) —
  // fine for the public site, but admins want to see whatever they just
  // added at the top instead of hunting for it by date. id is a reliable
  // stand-in for creation order (auto-increment).
  if (config.key === "events") {
    items.sort((a, b) => Number(b.id) - Number(a.id));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/content" className="text-sm font-semibold text-brand hover:text-brand-dark">
            ← All Content
          </Link>
          <h1 className="mt-1 font-heading text-3xl font-medium text-heading">{config.label}</h1>
        </div>
        <Button href={`/admin/content/${config.key}/new`}>+ New {config.singularLabel}</Button>
      </div>

      <div className="mt-8">
        <ContentList config={config} items={items} />
      </div>
    </div>
  );
}
