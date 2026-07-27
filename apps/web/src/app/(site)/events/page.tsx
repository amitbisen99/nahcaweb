import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";
import { EventCards } from "@/components/EventCards";
import { EventPhotoSlider } from "@/components/EventPhotoSlider";
import { EventTestimonialSlider } from "@/components/EventTestimonialSlider";
import { Reveal } from "@/components/Reveal";
import { auth } from "@/auth";
import { getUpcomingEvents } from "@/lib/cms";

export default async function EventsPage() {
  const session = await auth();
  const events = await getUpcomingEvents(50, session?.apiToken);

  return (
    <>
      <EventBanner title="Events" image="/events/mysore-green-hotel.jpg" />

      <div className="bg-white py-12">
        <Container>
          <EventPhotoSlider />
        </Container>
      </div>

      <div className="bg-white">
      <Container>
        <div className="py-16">
          <p className="mt-2 text-black">
            Annual Conference, Monthly Q&amp;A, Webinars, Sangha, and Members-Only Meetings.
          </p>

          {events.length > 0 ? (
            <EventCards events={events} />
          ) : (
            <p className="mt-8 text-sm text-black">
              No events published yet — once events are added in the CMS, they&apos;ll appear here automatically.
            </p>
          )}
        </div>
      </Container>
      </div>

      <div className="bg-sand/30 py-16">
        <Container>
          <Reveal className="text-center">
            <span className="font-heading text-xs font-semibold uppercase tracking-widest text-brand">
              Feedback
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-heading">
              What People Are Saying
            </h2>
          </Reveal>
          <div className="mt-10">
            <EventTestimonialSlider />
          </div>
        </Container>
      </div>
    </>
  );
}
