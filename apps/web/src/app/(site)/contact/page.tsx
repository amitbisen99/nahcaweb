import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { ContactForm } from "@/components/ContactForm";
import { EventBanner } from "@/components/EventBanner";

const CONTACT_EMAIL = "nahca108@gmail.com";

export default function ContactPage() {
  return (
    <>
      <EventBanner title="Contact Us" image="/brand/temple-home.jpg" />
      <section className="bg-white py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <h2 className="font-heading text-2xl font-medium text-heading">Get in Touch</h2>
              <p className="mt-4 text-black">
                Questions about membership, events, or Hindu chaplaincy? Send us a message and a member of
                the NAHCA team will reply.
              </p>
              <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-brand">Email</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="mt-1 inline-block text-black hover:text-brand">
                {CONTACT_EMAIL}
              </a>

              <div className="mt-10 rounded-xl bg-brand/5 p-6">
                <h3 className="font-heading text-lg font-medium text-heading">We Need Your Support Today!</h3>
                <p className="mt-2 text-sm text-black">
                  NAHCA is a volunteer-led non-profit. Your gift helps us train and support Hindu chaplains.
                </p>
                <Button href="/donate" variant="solid" className="mt-4">
                  Donate
                </Button>
              </div>
            </div>

            <div>
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
