import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
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
    <Container>
      <div className="max-w-2xl py-16">
        <Link
          href={`/admin/content/${config.key}`}
          className="text-sm font-semibold text-brand hover:text-brand-dark"
        >
          ← {config.label}
        </Link>
        <h1 className="mt-1 font-heading text-3xl font-medium text-heading">
          Edit {config.singularLabel}
        </h1>
        <div className="mt-8">
          <ContentForm
            config={config}
            action={updateContentItem.bind(null, config.key, id)}
            item={item}
          />
        </div>
      </div>
    </Container>
  );
}
