import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";
import { Button } from "@/components/Button";

const NEWSLETTER_SIGNUP_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdr7m0ZSOW9jf2Ms5E7SLeY-9D66Hb-WKsMDhtbwwBkW7BuWw/viewform";

export default function MonthlyQAPage() {
  return (
    <>
      <EventBanner title="NAHCA Monthly Q&A" image="/brand/temple-home.jpg" />

      <section className="bg-white">
        <Container>
          <div className="max-w-2xl py-16">
            <p className="text-ink/70">
              Namaste! Thank you for your interest in NAHCA professional development
              programming. Spring 2026 programming has ended; we will post programming for
              Fall 2026 beginning in August.
            </p>
            <p className="mt-6 text-ink/70">
              Sign up for our newsletter to get timely updates.{" "}
              <a
                href={NEWSLETTER_SIGNUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand hover:text-brand-dark"
              >
                Sign up here
              </a>
              .
            </p>
          </div>

          <div className="max-w-md pb-20">
            <h2 className="font-heading text-2xl font-medium text-ink">Join Our Mailing List</h2>
            <form className="mt-6 flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  placeholder="First name"
                  autoComplete="given-name"
                  className="w-full rounded-lg border border-ink/20 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Last name"
                  autoComplete="family-name"
                  className="w-full rounded-lg border border-ink/20 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
                />
              </div>
              <input
                type="email"
                required
                placeholder="Email address"
                autoComplete="email"
                className="w-full rounded-lg border border-ink/20 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
              />
              <input
                type="text"
                required
                placeholder="Zip code"
                autoComplete="postal-code"
                className="w-full rounded-lg border border-ink/20 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
              />
              <Button type="submit" className="mt-2 self-start">
                Join Mailing List
              </Button>
            </form>
          </div>
        </Container>
      </section>
    </>
  );
}
