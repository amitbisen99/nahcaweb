import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { ResourceLinks, ResourcePlayer } from "@/components/ResourceList";
import { getResource } from "@/lib/cms";
import { formatDate } from "@/lib/formatDate";

// One resource in full — its whole rich-text description, player and links.
export default async function ResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resourceId = Number(id);
  if (!Number.isInteger(resourceId)) notFound();

  const item = await getResource(resourceId);
  if (!item) notFound();

  return (
    <Container>
      <div className="mx-auto max-w-3xl py-12">
        <Link href="/resources" className="text-sm font-semibold text-brand hover:text-brand-dark">
          ← Back to Resources
        </Link>
        {item.publishedDate && <p className="mt-4 text-xs text-black">{formatDate(item.publishedDate)}</p>}
        <h1 className="mt-2 font-heading text-3xl font-medium text-heading">{item.title}</h1>
        {item.description && (
          <div
            className="mt-4 text-base leading-relaxed text-black [&_a]:text-brand [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
        )}
        <ResourcePlayer item={item} />
        <ResourceLinks item={item} />
      </div>
    </Container>
  );
}
