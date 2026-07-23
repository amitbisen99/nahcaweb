import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { auth } from "@/auth";
import { getOpenWebinar } from "@/lib/cms";

export default async function WebinarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const webinar = await getOpenWebinar(id, session?.apiToken);
  if (!webinar) notFound();

  return (
    <div className="bg-white">
      <Container>
        <div className="py-16">
          <Link href="/events/webinars" className="text-sm font-semibold text-brand hover:text-brand-dark">
            ← All Webinars
          </Link>

          <div className="mt-6 max-w-2xl">
            {webinar.access === "members_only" && (
              <span className="mb-2 inline-block w-fit rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-dark">
                Members Only
              </span>
            )}
            <h1 className="font-heading text-3xl font-medium text-heading">{webinar.title}</h1>

            {webinar.description && (
              <div
                className="mt-6 text-base leading-relaxed text-ink/80 [&_a]:text-brand [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: webinar.description }}
              />
            )}

            {webinar.speakerInfo && (
              <div
                className="mt-6 border-t border-ink/10 pt-6 text-sm leading-relaxed text-ink/70 [&_a]:text-brand [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: webinar.speakerInfo }}
              />
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
