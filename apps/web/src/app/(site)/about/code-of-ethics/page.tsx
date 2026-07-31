import Image from "next/image";
import { EventBanner } from "@/components/EventBanner";
import { Container } from "@/components/Container";
import { ArticleLayout } from "@/components/ArticleKit";

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
      <EventBanner title="NAHCA Code of Ethics" image="/brand/temple-home.jpg" />

      <section className="bg-white py-16">
        <Container>
          <ArticleLayout>
            <p className="text-black">
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

            <div id="commitments" className="mt-14 scroll-mt-28">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-heading text-lg font-medium text-heading">
                  By participating in this space, we ask for your commitment to:
                </h2>
                <Image src="/brand/logo.png" alt="" width={36} height={36} className="flex-none" />
              </div>

              <div className="mt-6">
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
            </div>

            <p className="mt-8 text-black">
              Your commitment to abide by and maintain the integrity of these principles will
              support NAHCA&apos;s intention to maintain a safe space during our programming.
            </p>
          </ArticleLayout>
        </Container>
      </section>
    </>
  );
}
