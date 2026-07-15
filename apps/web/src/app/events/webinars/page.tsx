import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";

export default function WebinarsPage() {
  return (
    <>
      <EventBanner title="Upcoming Webinars" image="/brand/temple-home.jpg" />
      <Container>
        <div className="max-w-2xl py-16">
          <p className="text-ink/70">
            NAHCA offers webinars on topics relevant to Hindu chaplaincy — from professional
            development and endorsement pathways to specific spiritual care practices across
            healthcare, higher education, and community settings.
          </p>
          <p className="mt-6 text-sm text-ink/50">
            Upcoming webinar dates and registration links will be published here soon.
          </p>
        </div>
      </Container>
    </>
  );
}
