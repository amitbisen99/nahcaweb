import Image from "next/image";
import { EventBanner } from "@/components/EventBanner";
import { Container } from "@/components/Container";

function OmIcon({ className }: { className?: string }) {
  return (
    <span className={`leading-none ${className ?? ""}`} aria-hidden="true">
      ॐ
    </span>
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
      <EventBanner title="Code of Ethics" image="/brand/temple-home.jpg" />

      <section className="bg-white py-16">
        <Container>
          <div>
            <span className="font-heading text-xs font-semibold uppercase tracking-widest text-brand">
              North American Hindu Chaplains Association
            </span>
            <p className="mt-5 text-black">
              NAHCA seeks to support and encourage the professional and voluntary pursuits of
              chaplaincy and pastoral care inspired and informed by Hindu spiritual teachings and
              practices per the needs of contemporary society.
            </p>
            <p className="mt-4 text-black">
              This form of care is based on the framework of the{" "}
              <em className="not-italic font-semibold text-heading">hitaiṣin</em>: the unbiased
              friend focused on a person&apos;s holistic wellbeing. Upholding this wellbeing
              extends into involvement with professional development opportunities offered by
              NAHCA.
            </p>

            <div className="mt-10 flex items-center justify-between gap-3">
              <h2 className="font-heading text-2xl font-medium text-heading">
                By participating in this space, we ask for your commitment to:
              </h2>
              <Image src="/brand/logo.png" alt="" width={36} height={36} className="flex-none" />
            </div>

            <div className="mt-6 rounded-xl border border-ink/10 bg-sand/30">
              {COMMITMENTS.map((item) => (
                <div key={item.title} className="flex gap-4 p-6">
                  <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-forest text-white">
                    <OmIcon className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-medium text-heading">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-black">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-10 text-black">
              Your commitment to abide by and maintain the integrity of these principles will
              support NAHCA&apos;s intention to maintain a safe space during our programming.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
