import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";
import { Button } from "@/components/Button";

const NEWSLETTER_SIGNUP_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdr7m0ZSOW9jf2Ms5E7SLeY-9D66Hb-WKsMDhtbwwBkW7BuWw/viewform";
const REGISTER_URL = "https://pro.software4nonprofits.com/secure/cause_pdetails/MjI0NDcw";
const MEMBERSHIP_RENEWAL_URL = "https://www.hinduchaplains.com/membership.html";

export default function SanghaPage() {
  return (
    <>
      <EventBanner title="NAHCA Sangha" image="/brand/temple-home.jpg" />

      <section className="bg-white">
        <Container>
          <div className="max-w-2xl py-16">
            <p className="text-ink/70">
              Namaste! Thank you for your interest in NAHCA professional development
              programming. Spring 2026 programming has ended; we will post programming for
              Fall 2026 beginning in August.
            </p>
            <p className="mt-4 text-ink/70">
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

            <h2 className="mt-10 font-heading text-2xl font-medium text-heading">
              Join Our Monthly NAHCA Sangha
            </h2>
            <p className="mt-4 text-ink/70">
              We are pleased to announce the NAHCA Sangha, a monthly gathering specifically
              designed for Hindu chaplains and Hindu chaplaincy students. This supportive
              professional space is dedicated to addressing contemporary challenges in
              spiritual caregiving and enhancing our approaches to providing care.
            </p>
            <p className="mt-4 text-ink/70">
              Each meeting will feature monthly prompts to guide free-flowing, meaningful
              conversations; the hour will fly by!
            </p>
            <p className="mt-4 text-ink/70">
              The gatherings will be convened by Priya Amaresh, Hindu Chaplain at Duke
              University and NAHCA Board Co-PR Chair, and Asha Shipman, Director of Hindu Life
              at Yale University and NAHCA Board Chair.
            </p>
            <p className="mt-4 text-ink/70">
              After registering, participants will receive a virtual meeting link.
            </p>

            <div className="mt-6">
              <Button href={REGISTER_URL}>Register Here</Button>
            </div>

            <h3 className="mt-10 font-heading text-xl font-medium text-heading">
              Registration Details
            </h3>

            <div className="mt-4">
              <h4 className="font-semibold text-heading">NAHCA Members</h4>
              <p className="mt-2 text-ink/70">
                Free access. Email{" "}
                <a href="mailto:NAHCA108@gmail.com" className="font-semibold text-heading hover:text-heading/70">
                  NAHCA108@gmail.com
                </a>{" "}
                with the subject line &ldquo;2024 NAHCA Circle&rdquo; to request your free code.
                Code will change for next iteration.
              </p>
              <p className="mt-2 text-ink/70">
                <a
                  href={MEMBERSHIP_RENEWAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand hover:text-brand-dark"
                >
                  Renew your membership here
                </a>
              </p>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-heading">Non Members</h4>
              <p className="mt-2 text-ink/70">
                The first two meetings are complimentary. For subsequent meetings, a suggested
                donation of $10 per meeting is appreciated. Email{" "}
                <a href="mailto:NAHCA108@gmail.com" className="font-semibold text-heading hover:text-heading/70">
                  NAHCA108@gmail.com
                </a>{" "}
                to request a discount code or a need-based fee waiver.
              </p>
            </div>

            <p className="mt-10 text-ink/70">
              Whether you are seeking to combat burnout, explore self-care, create meaningful
              spaces, or gather with like-minded professionals, our NAHCA Sangha offers an
              invaluable opportunity for growth and community support. We warmly welcome you to
              join us in these enriching sessions.
            </p>
            <p className="mt-4 text-sm text-ink/60">
              For further information and registration, please contact us at{" "}
              <a href="mailto:NAHCA108@gmail.com" className="font-semibold text-heading hover:text-heading/70">
                NAHCA108@gmail.com
              </a>
              .
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
