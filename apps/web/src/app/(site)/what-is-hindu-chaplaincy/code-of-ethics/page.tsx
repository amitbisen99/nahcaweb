import { SVGProps } from "react";
import { EventBanner } from "@/components/EventBanner";
import { Container } from "@/components/Container";

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const COMMITMENTS = [
  {
    title: "Welcome everyone",
    description:
      "Welcome everyone with the inclusive nature of our Dharma, no matter their gender, ability, sexual orientation, race, language, culture, political persuasion, appearance, age, socio-economic status, nationality, or anything else.",
  },
  {
    title: "Respect diversity",
    description:
      "Respect the inherent diversity of Hindu thought, practice, experience, and culture, by valuing logical, earnest, and respectful discussions.",
  },
  {
    title: "Participate mindfully",
    description:
      "Participate by practicing śravaṇa (listening) and manana (reflection) before sharing.",
  },
];

export default function CodeOfEthicsPage() {
  return (
    <>
      <EventBanner title="Code of Ethics" image="/chaplaincy/code-ethics.jpg" />

      <section className="bg-white py-16">
        <Container>
          <div className="max-w-2xl">
            <span className="font-heading text-xs font-semibold uppercase tracking-widest text-brand">
              North American Hindu Chaplains Association
            </span>
            <p className="mt-5 text-ink/70">
              NAHCA seeks to support and encourage the professional and voluntary pursuits of
              chaplaincy and pastoral care inspired and informed by Hindu spiritual teachings and
              practices per the needs of contemporary society.
            </p>
            <p className="mt-4 text-ink/70">
              This form of care is based on the framework of the{" "}
              <em className="not-italic font-semibold text-heading">hitaiṣin</em>: the unbiased
              friend focused on a person&apos;s holistic wellbeing. Upholding this wellbeing
              extends into involvement with professional development opportunities offered by
              NAHCA.
            </p>

            <h2 className="mt-10 font-heading text-2xl font-medium text-heading">
              By participating in this space, we ask for your commitment to:
            </h2>

            <div className="mt-6 flex flex-col gap-4">
              {COMMITMENTS.map((item) => (
                <div
                  key={item.title}
                  className="flex gap-4 rounded-xl border border-ink/10 bg-sand/30 p-6"
                >
                  <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-forest text-white">
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-medium text-heading">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/70">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-10 text-ink/70">
              Your commitment to abide by and maintain the integrity of these principles will
              support NAHCA&apos;s intention to maintain a safe space during this program.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
