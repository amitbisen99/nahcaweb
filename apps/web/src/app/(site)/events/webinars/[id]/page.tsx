import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { getOpenWebinar } from "@/lib/cms";

export default async function WebinarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const webinar = await getOpenWebinar(id);
  if (!webinar) notFound();

  return (
    <div className="bg-white">
      <Container>
        <div className="py-16">
          <Link href="/events/webinars" className="text-sm font-semibold text-brand hover:text-brand-dark">
            ← All Webinars
          </Link>

          <div className="mt-6 max-w-2xl">
            {webinar.speakerInfo && <p className="text-sm text-ink/50">{webinar.speakerInfo}</p>}
            <h1 className="mt-1 font-heading text-3xl font-medium text-heading">{webinar.title}</h1>
            <p className="mt-2 text-sm font-semibold text-ink">
              {webinar.priceCents ? `$${(webinar.priceCents / 100).toFixed(2)}` : "Free"}
            </p>

            {webinar.description && (
              <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-ink/80">
                {webinar.description}
              </p>
            )}

            {webinar.zoomOrYoutubeLink && (
              <Button href={webinar.zoomOrYoutubeLink} className="mt-8">
                Join →
              </Button>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
