import { EventBanner } from "@/components/EventBanner";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

const DEFINING_HINDU_CHAPLAINCY_PDF =
  "https://www.hinduchaplains.com/uploads/1/3/5/5/135595214/2021-02_defining_hindu_chaplaincy4website.docx.pdf";
const REQUISITE_QUALIFICATIONS_PDF =
  "https://www.hinduchaplains.com/uploads/1/3/5/5/135595214/hindu_chaplain_qualifications_rev3.pdf";

export default function WhatIsHinduChaplaincyPage() {
  return (
    <>
      <EventBanner title="What Is Hindu Chaplaincy?" image="/chaplaincy/IMG_0469.jpg" />

      <section className="bg-white py-16">
        <Container>
          <div className="max-w-2xl">
            <blockquote className="border-l-4 border-brand pl-5 text-ink/80 italic leading-relaxed">
              &ldquo;Hindu Chaplain&rdquo; as a designator of a category of employment refers to
              professional providers of spiritual and pastoral care from a Dharmic lens and is
              best expressed as a Hindu Spiritual Care Provider. They will have accreditation and
              professional training appropriate to the contexts of their care recipients (e.g.
              Higher Education, Healthcare, Military Corrections, etc.) Their role includes, but
              is not limited to, offering spiritual accompaniment by embodying the well-established
              tenets of the various Hindu Dharmas, encouraging a deepened understanding of the
              Dharmas and issues pertaining thereto — due to their familiarity with the history of
              the philosophy and praxis of a wide variety of Dharmic traditions — and, thus, can
              serve as a reliable interlocutor between the traditional sources and the requirements
              of contemporary society.
            </blockquote>

            <h2 className="mt-10 font-heading text-2xl font-medium text-heading">
              Credentials of a Hindu Spiritual Care Provider
            </h2>
            <p className="mt-4 text-ink/70">
              A Hindu Spiritual Care Provider will typically hold a graduate degree and then have
              specialized training in spiritual care either through the Clinical Pastoral
              Education programs or through academic certification in Hindu spiritual care.
              Specific requirements will vary by sector (e.g. Federal, healthcare and higher
              education). Most Hindu Spiritual Care Providers tend to deepen their knowledge of
              Hindu theory and practices as it becomes apparent which components are required
              given their context of employment. In terms of the USA, Hindu Spiritual Care
              Providers are generally employed under the rubric of Hindu Chaplain / Hindu
              Spiritual Care Provider / Director for Hindu Life, whether full- or part-time if
              professionally trained, or as Volunteer Hindu Chaplain / Hindu Spiritual Care
              Provider if not.
            </p>

            <p className="mt-8 text-ink/70">
              For specific details on the definitions, conceptualization and standards adopted by
              NAHCA, please refer to the documents below.
            </p>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-4 rounded-xl border-2 border-brand bg-sand/30 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-heading text-lg font-medium text-heading">
                    Defining Hindu Chaplaincy
                  </p>
                  <p className="mt-1 text-sm text-ink/60">
                    NAHCA&apos;s foundational paper on definitions and conceptualization.
                  </p>
                </div>
                <Button
                  href={DEFINING_HINDU_CHAPLAINCY_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  Read the PDF
                </Button>
              </div>

              <div className="flex flex-col gap-4 rounded-xl border-2 border-brand bg-sand/30 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-heading text-lg font-medium text-heading">
                    Hindu Chaplain: Requisite Qualifications
                  </p>
                  <p className="mt-1 text-sm text-ink/60">
                    NAHCA&apos;s standards for credentialing and professional training.
                  </p>
                </div>
                <Button
                  href={REQUISITE_QUALIFICATIONS_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  Read the PDF
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
