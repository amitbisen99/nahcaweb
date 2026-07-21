import { notFound } from "next/navigation";
import Link from "next/link";
import { CONTENT_TYPES, ContentTypeKey } from "@/lib/contentTypes";
import { createContentItem } from "../../actions";
import { ContentForm } from "@/components/admin/ContentForm";

export default async function NewContentPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const config = CONTENT_TYPES[type as ContentTypeKey];
  if (!config) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href={`/admin/content/${config.key}`}
        className="text-sm font-semibold text-brand hover:text-brand-dark"
      >
        ← {config.label}
      </Link>
      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">
        New {config.singularLabel}
      </h1>
      <div className="mt-8">
        <ContentForm config={config} action={createContentItem.bind(null, config.key)} />
      </div>
    </div>
  );
}
