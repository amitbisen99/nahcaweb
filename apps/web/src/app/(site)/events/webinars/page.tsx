import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";
import { WebinarCards } from "@/components/WebinarCards";
import { auth } from "@/auth";
import { getOpenWebinars } from "@/lib/cms";

export default async function WebinarsPage() {
  const session = await auth();
  const webinars = await getOpenWebinars(session?.apiToken);

  return (
    <>
      <EventBanner title="Upcoming Webinars" image="/brand/temple-home.jpg" />
      <Container>
        <div className="py-16">
          <p className="text-black">
            NAHCA offers webinars on topics relevant to Hindu chaplaincy — from professional
            development and endorsement pathways to specific spiritual care practices across
            healthcare, higher education, and community settings.
          </p>

          {webinars.length > 0 ? (
            <WebinarCards webinars={webinars} />
          ) : (
            <p className="mt-8 text-sm text-black">
              No webinars published yet — upcoming webinar dates and registration links will
              appear here.
            </p>
          )}
        </div>
      </Container>
    </>
  );
}
