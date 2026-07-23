import Image from "next/image";
import Link from "next/link";
import { SVGProps } from "react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { HeroSlider } from "@/components/HeroSlider";

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5l8 7-8 7z" />
    </svg>
  );
}

function ChevronList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink/75">
          <ChevronIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-brand" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DiamondIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l5 10-5 10-5-10z" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <HeroSlider />

      {/* What is NAHCA */}
      <section className="border-t-4 border-brand bg-sand py-20">
        <Container>
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-widest text-brand">
              <DiamondIcon className="h-3 w-3" />
              About NAHCA
            </span>
            <h2 className="mt-3 font-heading text-4xl font-bold text-heading">What is NAHCA</h2>
            <p className="mt-5 text-ink/70">
              NAHCA offers a sacred space to connect with current and aspiring spiritual care-givers
              working in higher education, healthcare, corrections, military and community settings.
            </p>
            <p className="mt-4 text-ink/70">
              We hold deep value for the strength and beauty of being in community together — a space
              for learning, sharing, laughing, and empathizing about the intricacies, joys, and rough
              edges of this work and this time.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-7">
              <ChevronList
                items={[
                  "We are an endorsing body for Hindu candidates applying to become Board Certified Chaplains through APC and to become Certified Educator Candidates through ACPE",
                  "We offer endorsement and mentorship for Hindu spiritual care professionals in higher education",
                  "Our members work in higher education, healthcare, community, and military spaces",
                ]}
              />
            </div>

            <div className="rounded-xl bg-white p-7">
              <ChevronList
                items={[
                  "We are an accredited Field Education Site for Harvard & Yale Divinity School M.Div students",
                  "We cultivate important partnerships with professional chaplaincy and spiritual care organizations",
                  "We consult for hiring managers seeking to fill jobs in Hindu spiritual care",
                ]}
              />
            </div>

            <div className="flex flex-col rounded-xl bg-white p-7">
              <p className="text-sm leading-relaxed text-ink/75">
                Our unique professional development programs offer opportunities to
              </p>
              <div className="mt-3">
                <ChevronList items={["Network", "Share ideas and resources", "Learn and lead"]} />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink/75">
                Our newsletters keep you updated on what&apos;s current in the field as well as
                employment and educational opportunities
              </p>
              <div className="mt-6">
                <Button href="/membership" className="!px-5 !py-2">
                  Join Us!
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Why a Hindu Chaplain */}
      <section className="bg-white">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[320px]">
            <Image
              src="/brand/temple-home.jpg"
              alt="Temple spire at dawn"
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
            <span className="inline-flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-widest text-brand">
              <DiamondIcon className="h-3 w-3" />
              Why you need a Hindu chaplain
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-heading">
              What a Hindu chaplain brings to your organization
            </h2>
            <p className="mt-4 text-ink/70">
              NAHCA offers a sacred space to connect with current and aspiring spiritual care-givers in
              higher education, healthcare, corrections, military and community settings in order to
              learn and share how Hindu chaplains have approached their spiritual care-giving.
            </p>

            <div className="mt-8 flex flex-col gap-8">
              <div>
                <h3 className="font-heading text-xl font-medium text-heading">What is a Chaplain?</h3>
                <p className="mt-3 text-ink/75">
                  Chaplains are spiritual care-givers who accompany care recipients through life&apos;s
                  many contours including loss, joy, uncertainty, grief, relationships, social engagement
                  and our place in the world.
                </p>
              </div>

              <div>
                <h3 className="font-heading text-xl font-medium text-heading">What is a Hindu Chaplain, specifically?</h3>
                <p className="mt-3 text-ink/75">
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
          </div>
        </div>
      </section>

      {/* Donate CTA */}
      <section className="bg-forest py-16">
        <Container>
          <div className="flex flex-col items-center gap-5 text-center text-white">
            <h2 className="font-heading text-3xl font-medium italic">Support the Mission</h2>
            <p className="max-w-xl text-white/90">
              Your gift helps NAHCA equip and endorse Hindu chaplains serving communities across North
              America — in hospitals, universities, the military, and beyond.
            </p>
            <Button href="/donate">Donate Now</Button>
          </div>
        </Container>
      </section>

      {/* Contact + Newsletter */}
      <section className="bg-cream pb-16">
        <Container>
          <div className="grid gap-10 border-t border-ink/10 pt-16 sm:grid-cols-2">
            <div className="text-center sm:text-left">
              <h2 className="font-heading text-xl font-medium text-heading">NAHCA</h2>
              <p className="mt-3 text-sm text-ink/60">North American Hindu Chaplains Association.</p>
              <p className="mt-3 text-sm text-ink/60">
                <span className="font-semibold text-ink/80">Registered Public Charity:</span> 501(c)(3)
              </p>
            </div>

            <div className="text-center sm:text-left">
              <h2 className="font-heading text-xl font-medium text-heading">Get our monthly newsletter &amp; updates</h2>
              <form className="mt-4 flex max-w-sm gap-2 sm:mx-0 mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  className="w-full rounded-lg border border-ink/20 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
                />
                <Button variant="solid" className="!px-5 !py-2.5 whitespace-nowrap">
                  Sign Up
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
