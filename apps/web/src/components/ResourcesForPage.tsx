import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";
import { ResourceList } from "@/components/ResourceList";
import { getResources } from "@/lib/cms";
import { RESOURCE_PAGES } from "@/lib/resourceSections";

// A "Resources for ..." page: its banner and intro, then every published resource
// an admin placed on it.
export async function ResourcesForPage({ slug }: { slug: string }) {
  const page = RESOURCE_PAGES.find((p) => p.slug === slug);
  if (!page) return null;

  const items = await getResources({ page: page.slug });

  return (
    <>
      <EventBanner title={page.title} image={page.image} />
      <Container>
        <div className="py-16">
          <p className="text-black">{page.description}</p>
          <ResourceList items={items} emptyText="Resources for this page will be added here soon — check back." />
        </div>
      </Container>
    </>
  );
}
