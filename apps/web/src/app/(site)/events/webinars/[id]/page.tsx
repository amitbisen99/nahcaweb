import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { SpeakerCards } from "@/components/SpeakerCards";
import { auth } from "@/auth";
import { getOpenWebinar, formatEventFee } from "@/lib/cms";

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

          <div className="mt-6">
            {webinar.featuredImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- uploaded file from an arbitrary host, not in next.config.js image patterns
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${webinar.featuredImageUrl}`}
                alt=""
                className="mb-6 aspect-[2/1] w-full max-w-[600px] rounded-xl border border-ink/10 object-cover"
              />
            )}

            {webinar.access === "members_only" && (
              <span className="mb-2 inline-block w-fit rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-dark">
                Members Only
              </span>
            )}
            <h1 className="font-heading text-3xl font-medium text-heading">{webinar.title}</h1>
            {formatEventFee(webinar.priceCents) && (
              <p className="mt-1 text-sm font-semibold text-brand-dark">{formatEventFee(webinar.priceCents)}</p>
            )}

            {webinar.description && (
              <div
                className="mt-6 text-base leading-relaxed text-black [&_a]:text-brand [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: webinar.description }}
              />
            )}

            {webinar.speakers && webinar.speakers.length > 0 && (
              <SpeakerCards speakers={webinar.speakers} />
            )}

            {webinar.speakerInfo && (
              <div
                className="mt-6 text-sm leading-relaxed text-black [&_a]:text-brand [&_a]:underline"
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
