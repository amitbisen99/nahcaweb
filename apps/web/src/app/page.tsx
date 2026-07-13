import Image from "next/image";
import { ComponentType, SVGProps } from "react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

const OBJECTIVES = [
  "Collate resources for Hindu chaplains and chaplains who support Hindus",
  "Develop guidelines around accreditation and endorsement in partnership with recognized bodies",
  "Provide opportunities for professional development and currency with standard best practices",
  "Raise awareness of the necessity for well-trained spiritual care providers in the holistic care and development of each and every individual",
];

function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function WelcomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  );
}

const RESOURCE_CARDS: { title: string; body: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  {
    title: "Who We Are",
    body: "Chaplains are spiritual care providers who accompany care recipients through life's many contours including loss, joy, uncertainty, grief, relationships, social engagement and our place in the world.",
    Icon: UsersIcon,
  },
  {
    title: "What We Do",
    body: "Hindu chaplains create open-hearted spaces of listening, respect and compassion. They ground their work using established professional guidelines and insights from their own Dharmic spiritual traditions.",
    Icon: HeartIcon,
  },
  {
    title: "Inviting You",
    body: "Hindu chaplains engage with and support all people regardless of their social identities and orientations. Whoever you are, we invite you to connect and learn about Hindu spiritual care-giving.",
    Icon: WelcomeIcon,
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <Image src="/brand/hero-temple.jpg" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/75 to-forest/40" />

        <Container>
          <div className="relative flex min-h-[540px] max-w-2xl flex-col justify-center gap-6 py-24 text-white">
            <h1 className="font-heading text-4xl font-medium italic leading-tight sm:text-5xl lg:text-6xl">
              North American Hindu Chaplains Association
            </h1>
            <p className="text-base leading-relaxed text-white/85 sm:text-lg">
              We offer a sacred space to connect with current and aspiring spiritual care-givers in
              higher education, healthcare, corrections, military and community settings in order to
              learn how Hindu chaplains have approached their spiritual care-giving.
            </p>
            <div className="pt-2">
              <Button href="/membership">Become a Member</Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Tagline */}
      <section className="bg-cream py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-medium text-ink">Spiritual care in the 21st century</h2>
            <p className="mt-4 text-ink/60">
              A collaboration between Professionals and Volunteers that provide spiritual and pastoral
              care informed by Hindu teachings and practices.
            </p>
          </div>
        </Container>
      </section>

      {/* History & Objectives */}
      <section className="bg-white py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <h2 className="font-heading text-3xl font-medium text-ink">Hindu Chaplaincy</h2>
              <div className="mt-6 overflow-hidden rounded-lg">
                <Image
                  src="/brand/lotus-field.jpg"
                  alt="Lotus field at sunrise"
                  width={480}
                  height={360}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
            <div className="text-ink/75">
              <p>
                With its beginnings in the informal gatherings convened in Princeton, Yale, and Georgetown
                Universities, the North American Hindu Chaplains Association was officially formed in 2020
                to support professional and volunteer spiritual care providers who are informed by Hindu
                teachings and practices.
              </p>
              <p className="mt-4 font-semibold text-ink">Our objectives are to:</p>
              <ul className="mt-3 flex flex-col gap-3">
                {OBJECTIVES.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Chaplaincy Resources */}
      <section className="relative overflow-hidden bg-forest py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.05),transparent_45%)]" />
        <Container>
          <div className="relative">
            <h2 className="text-center font-heading text-3xl font-medium text-white">Chaplaincy Resources</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-white/70">
              Three ways to understand the work of a Hindu chaplain — and how you might join in.
            </p>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {RESOURCE_CARDS.map(({ title, body, Icon }) => (
                <div
                  key={title}
                  className="group rounded-xl bg-white p-7 shadow-xl shadow-black/10 transition-transform duration-200 hover:-translate-y-1.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-heading text-lg font-medium text-ink">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Contact + Newsletter */}
      <section className="bg-cream pb-16">
        <Container>
          <div className="grid gap-10 border-t border-ink/10 pt-16 sm:grid-cols-2">
            <div className="text-center sm:text-left">
              <h2 className="font-heading text-xl font-medium text-ink">NAHCA</h2>
              <p className="mt-3 text-sm text-ink/60">North American Hindu Chaplains Association.</p>
              <p className="mt-3 text-sm text-ink/60">
                <span className="font-semibold text-ink/80">Registered Public Charity:</span> 501(c)(3)
              </p>
            </div>

            <div className="text-center sm:text-left">
              <h2 className="font-heading text-xl font-medium text-ink">Get our monthly newsletter &amp; updates</h2>
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
