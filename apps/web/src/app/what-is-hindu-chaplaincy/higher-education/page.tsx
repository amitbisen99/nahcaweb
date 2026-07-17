import { EventBanner } from "@/components/EventBanner";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

const HIGHER_ED_ARTICLE_PDF =
  "https://www.hinduchaplains.com/uploads/1/3/5/5/135595214/shipman_hindu_chaplaincy_in_us_higher_education_2020.pdf";

export default function HigherEducationPage() {
  return (
    <>
      <EventBanner title="Higher Education" image="/chaplaincy/colorful-palm-leaf-books.jpg" />

      <section className="bg-white py-16">
        <Container>
          <div className="max-w-2xl">
            <p className="text-ink/70">
              Hindu Spiritual Care Providers in higher education settings serve to accompany
              students, staff, faculty, alumni and other members of the institution&apos;s
              community through the numerous points in life during which spiritual issues are
              encountered.
            </p>

            <blockquote className="mt-8 border-l-4 border-brand pl-5 text-ink/80 italic leading-relaxed">
              US campuses generally aspire to be microcosmic laboratories of social, intellectual
              and spiritual inquiry and practice. There is an increasing awareness among higher
              education professionals that to fully serve our students our institutions should
              include among their goals a firm commitment to supporting students&apos; religious,
              secular and spiritual identities. Spiritual support for Hindu students is in a
              nascent stage. The programming and support offered by a Hindu chaplain,
              particularly when it contextualizes and affirms the faith tradition, improves
              students&apos; sense of well-being and furthermore can insulate them from anxiety
              and depression. Moreover, as the world grows increasingly interconnected the
              ability to authentically connect with others from vastly different cultures and
              worldviews will be a fundamental precursor for success. Hindu chaplains can serve
              as role models for students on how to successfully navigate the pluralistic social
              environments that comprise our global community.
            </blockquote>
            <p className="mt-3 text-sm text-ink/60">
              — Excerpted from <em className="not-italic font-semibold">Hindu Chaplaincy in US Higher Education</em>,
              Asha Shipman, 2020
            </p>

            <div className="mt-8 flex flex-col gap-4 rounded-xl border-2 border-brand bg-sand/30 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-heading text-lg font-medium text-heading">
                  Hindu Chaplaincy in US Higher Education
                </p>
                <p className="mt-1 text-sm text-ink/60">
                  Read the full article — also available on our Resources page.
                </p>
              </div>
              <Button
                href={HIGHER_ED_ARTICLE_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                Read the PDF
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
