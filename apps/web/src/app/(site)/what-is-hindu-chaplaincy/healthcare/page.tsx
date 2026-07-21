import { SVGProps } from "react";
import { EventBanner } from "@/components/EventBanner";
import { Container } from "@/components/Container";

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5l8 7-8 7z" />
    </svg>
  );
}

const SPIRITUAL_ASSESSMENT_AREAS = [
  "Sources of spiritual strength and support",
  "Existential concerns such as lack of meaning, questions about one's own existence, and questions of meaning and suffering",
  "Concerns about relationship to God, the Holy, or deity, such as anger or abandonment",
  "Struggles related to loss of faith, community of faith, or spiritual practices",
  "Cultural norms and preferences that impact belief systems and spiritual practices",
  "Hopes, values and fears, meaning, and purpose",
  "Concerns about quality of life",
  "Concerns or fear of death and dying and beliefs about afterlife",
  "Spiritual practices",
  "Concerns about relationships",
  "Life completion tasks, grief, and bereavement",
];

export default function HealthcarePage() {
  return (
    <>
      <EventBanner title="Healthcare" image="/chaplaincy/lotus-flower-candle-holder.webp" />

      <section className="bg-white py-16">
        <Container>
          <div className="max-w-2xl">
            <p className="text-ink/70">
              Healthcare chaplaincy seeks to address spiritual suffering that can be a result of
              a health crisis experienced by an individual or their loved one. A crisis caused by
              a serious illness, death and other stressful situations can challenge a
              person&apos;s entire belief system and view of life.
            </p>
            <p className="mt-4 text-ink/70">
              These experiences can alter our sense of connection with ourselves as well as
              others. Serious illness can also trigger thoughts about our own mortality.
            </p>
            <p className="mt-4 text-ink/70">
              The professional chaplain is the spiritual care specialist, conducting the
              assessment and addressing the spiritual aspects of the care plan. Screening is
              designed to evaluate the presence or absence of spiritual needs and spiritual
              distress.
            </p>

            <h2 className="mt-10 font-heading text-2xl font-medium text-heading">
              The Spiritual Assessment
            </h2>
            <p className="mt-3 text-ink/70">
              The spiritual assessment explores spiritual concerns including, but not limited to:
            </p>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {SPIRITUAL_ASSESSMENT_AREAS.map((area) => (
                <li key={area} className="flex gap-2 text-sm leading-relaxed text-ink/75">
                  <ChevronIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-brand" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-heading text-2xl font-medium text-heading">Endorsements</h2>
            <p className="mt-3 text-ink/70">
              NAHCA is pleased to be the endorsing body for Hindu candidates applying to become
              Board Certified Chaplains through the Association of Professional Chaplains (APC)
              and to become Certified Educator Candidates through the Association for Clinical
              Pastoral Education (ACPE).
            </p>

            <div className="mt-8 rounded-xl border border-ink/10 bg-sand/30 p-6">
              <h3 className="font-heading text-lg font-medium text-heading">
                NAHCA Healthcare Forum
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                NAHCA members are invited to join the NAHCA Healthcare Forum, facilitated by Ms.
                Shama Mehta — a space to share experiences and best practices within healthcare
                chaplaincy.
              </p>
              <p className="mt-3 text-sm text-ink/60">
                To join, email{" "}
                <a
                  href="mailto:NAHCA108@gmail.com"
                  className="font-semibold text-heading hover:text-heading/70"
                >
                  NAHCA108@gmail.com
                </a>{" "}
                with the header &ldquo;NAHCA Healthcare Forum&rdquo;.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
