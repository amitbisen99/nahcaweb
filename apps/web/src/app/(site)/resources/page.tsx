import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";
import { RESOURCE_SECTIONS } from "@/lib/resourceSections";

export default function ResourcesPage() {
  return (
    <>
      <EventBanner title="Resources" image="/chaplaincy/colorful-palm-leaf-books.jpg" />
      <section className="bg-white py-20">
        <Container>
          <p className="max-w-3xl text-black">
            Papers, websites, podcasts, videos, articles and newsletters on Hindu spiritual care and
            chaplaincy, gathered by NAHCA. Choose a category to browse.
          </p>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {RESOURCE_SECTIONS.map((section) => (
              <div
                key={section.slug}
                className="flex flex-col rounded-xl border border-ink/10 p-7 transition-colors hover:border-brand/40"
              >
                <h2 className="font-heading text-xl font-medium text-heading">{section.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-black">{section.description}</p>
                <div className="mt-6">
                  <Button href={section.href} size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
