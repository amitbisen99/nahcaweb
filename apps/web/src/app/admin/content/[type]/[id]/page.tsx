import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { CONTENT_TYPES, ContentTypeKey } from "@/lib/contentTypes";
import { getContentItem } from "@/lib/adminApi";
import { updateContentItem } from "../../actions";
import { ContentForm } from "@/components/admin/ContentForm";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  const config = CONTENT_TYPES[type as ContentTypeKey];
  if (!config) notFound();

  const session = await auth();
  const item = await getContentItem(config.key, id, session?.apiToken ?? "");
  if (!item) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href={`/admin/content/${config.key}`}
        className="text-sm font-semibold text-brand hover:text-brand-dark"
      >
        ← {config.label}
      </Link>
      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">
        Edit {config.singularLabel}
      </h1>

      {(config.key === "events" || config.key === "webinars") && typeof item.eventCode === "string" && (
        <div className="mt-4 inline-block rounded-lg border border-ink/10 bg-sand/30 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-black/60">Event Code</span>
          <p className="mt-0.5 font-mono text-lg font-semibold text-heading">{item.eventCode}</p>
          <p className="mt-0.5 text-xs text-black/50">Use this code to scope a coupon to this {config.singularLabel.toLowerCase()}.</p>
        </div>
      )}

      <div className="mt-8">
        <ContentForm
          config={config}
          action={updateContentItem.bind(null, config.key, id)}
          item={item}
        />
      </div>
    </div>
  );
}
