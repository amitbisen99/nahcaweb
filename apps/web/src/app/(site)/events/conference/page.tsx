import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";

export default function ConferencePage() {
  return (
    <>
      <EventBanner title="NAHCA Conference" image="/events/mysore-green-hotel.jpg" />
      <Container>
        <div className="py-16">
          <p className="text-black">
            NAHCA&apos;s conference brings together Hindu chaplains, spiritual care professionals,
            and students from across North America for a shared program of learning, professional
            development, and community.
          </p>
          <p className="mt-6 text-sm text-black">
            Dates, registration, and the full program will be published here soon.
          </p>
        </div>
      </Container>
    </>
  );
}
