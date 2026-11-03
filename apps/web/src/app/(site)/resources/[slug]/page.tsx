import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";
import { getResources } from "@/lib/cms";
import { getResourceEmbed } from "@/lib/resourceEmbed";
import { RESOURCE_SECTIONS } from "@/lib/resourceSections";

const LINK_CLASS = "mt-4 inline-block text-sm font-semibold text-brand hover:text-brand-dark";

export default async function ResourceListPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const section = RESOURCE_SECTIONS.find((s) => s.slug === slug && s.apiPath);
  if (!section?.apiPath) notFound();

  const items = await getResources(section.apiPath);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <>
      <EventBanner title={section.title} image="/chaplaincy/colorful-palm-leaf-books.jpg" />
      <section className="bg-white py-16">
        <Container>
          <Link href="/resources" className="text-sm font-semibold text-brand hover:text-brand-dark">
            ← Back to Resources
          </Link>

          {items.length === 0 ? (
            <p className="mt-8 text-sm text-black">Nothing has been added here yet — check back soon.</p>
          ) : (
            <div className="mt-8 flex flex-col gap-5">
              {items.map((item) => {
                const embed =
                  section.slug === "podcasts" || section.slug === "videos" ? getResourceEmbed(item) : null;
                return (
                  <article key={item.id} className="rounded-xl border border-ink/10 bg-white p-6">
                    <h2 className="font-heading text-lg font-medium text-heading">{item.title}</h2>
                    {item.description && (
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-black">{item.description}</p>
                    )}

                    {embed && (
                      <div
                        className={`mt-4 overflow-hidden rounded-lg ${embed.height ? "" : "aspect-video"}`}
                        style={embed.height ? { height: embed.height } : undefined}
                      >
                        <iframe
                          src={embed.src}
                          title={item.title}
                          loading="lazy"
                          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full border-0"
                        />
                      </div>
                    )}

                    {section.slug === "academic-papers" && item.fileUrl && (
                      <a href={`${apiUrl}${item.fileUrl}`} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                        View PDF →
                      </a>
                    )}
                    {section.slug === "websites" && item.linkUrl && (
                      <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                        Visit website →
                      </a>
                    )}
                    {(section.slug === "podcasts" || section.slug === "videos") && item.linkUrl && (
                      <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                        {embed ? "Open in a new tab →" : section.slug === "podcasts" ? "Listen →" : "Watch →"}
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
