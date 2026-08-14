import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Hero } from "@/components/Hero";
import { TrustStrip } from "@/components/TrustStrip";
import { WhatIsNahcaCards } from "@/components/WhatIsNahcaCards";
import { UpcomingEventsSnippet } from "@/components/UpcomingEventsSnippet";
import { VideoThumbnail } from "@/components/VideoThumbnail";
import { Reveal } from "@/components/Reveal";
import { NewsletterSignupForm } from "@/components/NewsletterSignupForm";
import { ChevronIcon } from "@/components/icons";
import { auth } from "@/auth";
import { getUpcomingEvents } from "@/lib/cms";

export default async function Home() {
  const session = await auth();
  const upcomingEvents = await getUpcomingEvents(2, session?.apiToken);

  return (
    <>
      <Hero />
      <TrustStrip />

      {/* What is NAHCA */}
      <section className="border-t-4 border-brand bg-white py-20">
        <Container>
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div>
                <h2 className="font-heading text-4xl font-bold text-heading">What is NAHCA</h2>
                <p className="mt-5 text-black">
                  NAHCA offers a sacred space to connect with current and aspiring spiritual care-givers
                  working in higher education, healthcare, corrections, military and community settings.
                </p>
                <p className="mt-4 text-black">
                  We hold deep value for the strength and beauty of being in community together — a space
                  for learning, sharing, laughing, and empathizing about the intricacies, joys, and rough
                  edges of this work and this time.
                </p>
              </div>

              <UpcomingEventsSnippet events={upcomingEvents} />
            </div>
          </Reveal>

          <WhatIsNahcaCards />
        </Container>
      </section>

      {/* Why a Hindu Chaplain */}
      <section>
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[420px] overflow-hidden lg:min-h-[560px]">
            <VideoThumbnail
              image="/brand/PriyaAmareshthumb.jpeg"
              alt="Priya Amaresh"
              caption={{
                name: "Priya Amaresh",
                text: "Appointed in 2022, Priya is honored to serve as the Hindu chaplain at Duke University. Her experience has been extraordinary, as it offers a constant learning opportunity to delve into the vastness of Hindu religion and culture.",
              }}
            />
          </div>

          <Reveal className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
            <h2 className="font-heading text-3xl font-bold text-heading">
              What a Hindu chaplain brings to your organization
            </h2>
            <p className="mt-4 text-black">
              NAHCA offers a sacred space to connect with current and aspiring spiritual care-givers in
              higher education, healthcare, corrections, military and community settings in order to
              learn and share how Hindu chaplains have approached their spiritual care-giving.
            </p>

            <div className="mt-8 flex flex-col gap-8">
              <div>
                <h3 className="font-heading text-xl font-medium text-heading">What is a Chaplain?</h3>
                <p className="mt-3 text-black">
                  Chaplains are spiritual care-givers who accompany care recipients through life&apos;s
                  many contours including loss, joy, uncertainty, grief, relationships, social engagement
                  and our place in the world.
                </p>
              </div>

              <div>
                <h3 className="font-heading text-xl font-medium text-heading">What is a Hindu Chaplain, specifically?</h3>
                <p className="mt-3 text-black">
                  Hindu chaplains engage with and support all people regardless of their social identities
                  and orientations. Hindu chaplains create open-hearted spaces of listening, respect and
                  compassion. They ground their work using established professional guidelines and
                  insights from their own Dharmic spiritual traditions.
                </p>
              </div>

              <Link
                href="/what-is-hindu-chaplaincy/community"
                className="inline-flex w-fit items-center gap-2 font-semibold text-brand hover:text-brand-dark"
              >
                Visit our community support forum
                <ChevronIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Donate CTA */}
      <section className="bg-navy py-16">
        <Container>
          <Reveal className="flex flex-col items-center gap-5 text-center text-white">
            <h2 className="font-heading text-3xl font-medium">Support the Mission</h2>
            <p className="max-w-2xl text-center text-white/90">
              Your gift helps NAHCA equip and endorse Hindu chaplains serving communities across North
              America — in hospitals, universities, the military, and beyond.
            </p>
            <Button href="/donate">Donate Now</Button>
          </Reveal>
        </Container>
      </section>

      {/* Contact + Newsletter */}
      <section className="bg-white pb-16">
        <Container>
          <Reveal className="grid gap-10 border-t border-black/10 pt-16 sm:grid-cols-2">
            <div className="text-center sm:text-left">
              <h2 className="font-heading text-xl font-medium text-heading">NAHCA</h2>
              <p className="mt-3 text-center text-sm text-black sm:text-left">North American Hindu Chaplains Association.</p>
              <p className="mt-3 text-center text-sm text-black sm:text-left">
                <span className="font-semibold text-black">Registered Public Charity:</span> 501(c)(3)
              </p>
            </div>

            <div className="text-center sm:text-left">
              <h2 className="font-heading text-xl font-medium text-heading">Get our monthly newsletter &amp; updates</h2>
              <NewsletterSignupForm />
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
