import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";

export default function ConferencePage() {
  return (
    <>
      <EventBanner title="NAHCA Conference" image="/brand/temple-home.jpg" />
      <Container>
        <div className="max-w-2xl py-16">
          <p className="text-ink/70">
            NAHCA&apos;s conference brings together Hindu chaplains, spiritual care professionals,
            and students from across North America for a shared program of learning, professional
            development, and community.
          </p>
          <p className="mt-6 text-sm text-ink/50">
            Dates, registration, and the full program will be published here soon.
          </p>
        </div>
      </Container>
    </>
  );
}
