import { EventBanner } from "@/components/EventBanner";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { ArticleLayout, PullQuote, SectionHeading } from "@/components/ArticleKit";
import { ChevronIcon, CompassIcon, ListChecksIcon, CoinIcon, FlagIcon } from "@/components/icons";

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "requirements", label: "Eligibility" },
  { id: "cost", label: "Endorsement Fees" },
  { id: "get-started", label: "Get Started" },
];

const APC_BCC_DEADLINE_URL =
  "https://www.apchaplains.org/bcci-site/becoming-certified/current-certification-interview-calendar/";

const REQUIREMENTS = [
  "Be a current active member of NAHCA",
  "Submit an autobiography (can be the same as the one being submitted to APC)",
  "Submit Professional Competency Essay Section 1: Integration of Theory and Practice (one being submitted to APC)",
  "Pay the endorsement fee",
  "Interview with the endorsement committee",
];

export default function EndorsementPage() {
  return (
    <>
      <EventBanner title="Endorsement" image="/chaplaincy/code-ethics.jpg" />

      <section className="bg-white py-16">
        <Container>
          <ArticleLayout toc={TOC}>
            <SectionHeading id="overview" icon={<CompassIcon className="h-4 w-4" />}>
              Overview
            </SectionHeading>
            <p className="mt-3 text-black">
              NAHCA is pleased to be an official, recognized endorser for professional chaplains
              applying for Board Certification through the Association of Professional Chaplains
              (APC).
            </p>

            <SectionHeading id="requirements" icon={<ListChecksIcon className="h-4 w-4" />}>
              Eligibility
            </SectionHeading>
            <p className="mt-3 text-black">
              To become eligible for endorsement by NAHCA, please review the following
              requirements carefully:
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {REQUIREMENTS.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed text-black">
                  <ChevronIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-xl border-2 border-brand p-6">
              <p className="text-sm leading-relaxed text-black">
                Note: NAHCA requires that a potential endorsement candidate submit the required
                materials at least 30 days before the{" "}
                <a
                  href={APC_BCC_DEADLINE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-heading hover:text-heading/70"
                >
                  APC BCC Application Deadline
                </a>
                . Shorter notices will not be accepted.
              </p>
            </div>

            <SectionHeading id="cost" icon={<CoinIcon className="h-4 w-4" />}>
              Endorsement Fees
            </SectionHeading>
            <p className="mt-3 text-black">
              Our endorsement fees are $75.00 for the endorsement + processing fees.
            </p>

            <SectionHeading id="get-started" icon={<FlagIcon className="h-4 w-4" />}>
              Get Started
            </SectionHeading>
            <div className="mt-6 flex flex-col gap-4 rounded-xl border-2 border-brand p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-black">If you are not yet a member, please join today.</p>
              <Button href="/membership" className="shrink-0">
                Join Today
              </Button>
            </div>

            <PullQuote>Thank you for choosing NAHCA to be your endorser!</PullQuote>
          </ArticleLayout>
        </Container>
      </section>
    </>
  );
}
