import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";
import { ResourceList } from "@/components/ResourceList";
import { getResources } from "@/lib/cms";
import { RESOURCE_SECTIONS } from "@/lib/resourceSections";

// One section of the Resource Library: every published resource carrying this
// tag, however many other tags it also has.
export default async function ResourceSectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const section = RESOURCE_SECTIONS.find((s) => s.slug === slug);
  if (!section) notFound();

  const items = await getResources({ tag: section.slug });

  return (
    <>
      <EventBanner title={section.title} image="/chaplaincy/colorful-palm-leaf-books.jpg" />
      <section className="bg-white py-16">
        <Container>
          <Link href="/resources" className="text-sm font-semibold text-brand hover:text-brand-dark">
            ← Back to Resources
          </Link>
          <ResourceList items={items} />
        </Container>
      </section>
    </>
  );
}
