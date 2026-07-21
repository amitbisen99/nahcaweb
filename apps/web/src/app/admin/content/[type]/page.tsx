import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { auth } from "@/auth";
import { CONTENT_TYPES, ContentTypeKey } from "@/lib/contentTypes";
import { listContent } from "@/lib/adminApi";
import { ContentRowActions } from "@/components/admin/ContentRowActions";

export default async function ContentListPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const config = CONTENT_TYPES[type as ContentTypeKey];
  if (!config) notFound();

  const session = await auth();
  const items = await listContent(config.key, session?.apiToken ?? "");

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

      <div className="mt-8 flex flex-col gap-3">
        {items.length === 0 && (
          <p className="text-sm text-ink/60">No {config.label.toLowerCase()} yet.</p>
        )}
        {items.map((item) => (
          <div
            key={String(item.id)}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white p-4"
          >
            <div>
              <p className="font-medium text-ink">{String(item[config.titleField])}</p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                  item.published ? "bg-forest/10 text-forest" : "bg-ink/10 text-ink/60"
                }`}
              >
                {item.published ? "Published" : "Draft"}
              </span>
            </div>
            <ContentRowActions type={config.key} item={item} config={config} />
          </div>
        ))}
      </div>
    </div>
  );
}
