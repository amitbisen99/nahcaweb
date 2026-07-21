import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";
import { Button } from "@/components/Button";

const MEETING_DATES = [
  { month: "Jan", day: "24", time: "3:00 PM ET" },
  { month: "Feb", day: "28", time: "3:00 PM ET" },
  { month: "Mar", day: "28", time: "3:00 PM ET" },
  { month: "Apr", day: "25", time: "3:00 PM ET" },
  { month: "May", day: "23", time: "3:00 PM ET" },
];

export default function MembersOnlyPage() {
  return (
    <>
      <EventBanner title="NAHCA Members-Only Meetings" image="/events/mysore-green-hotel.jpg" />

      <section className="bg-white">
        <Container>
          <div className="max-w-2xl py-16">
            <h2 className="font-heading text-2xl font-medium italic text-heading">
              Birds of a Feather, Let&apos;s Flock Together!
            </h2>

            <p className="mt-6 text-ink/70">
              Calling our NAHCA members! Every month, we&apos;re gathering for exclusive,
              members-only meetups where the heartfelt and the practical synchronize.
            </p>

            <p className="mt-4 text-ink/70">In this inviting virtual space, you will:</p>
            <ul className="mt-3 flex flex-col gap-2 text-ink/70">
              <li>
                Find genuine camaraderie, encouragement, and creative ideas for challenges you
                may be facing
              </li>
              <li>Recharge your energy to keep doing the soul-tending work you do</li>
            </ul>

            <p className="mt-4 text-ink/70">
              Bring your lunch, bring your favorite brew—chai, coffee, kombucha—it&apos;s your
              vibe! For this hour, let&apos;s laugh, learn, strategize, and uplift one another in
              a sacred circle informed by Hindu chaplaincy. Together, we will strengthen our
              community and our calling—one meeting at a time.
            </p>

            <h3 className="mt-10 font-heading text-xl font-medium text-heading">
              Upcoming Meetings
            </h3>
            <p className="mt-2 text-ink/70">
              This series of 5 monthly meetings will be held on the following Fridays. Dates and
              times will change for Fall 2026.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {MEETING_DATES.map((meeting) => (
                <div
                  key={meeting.month}
                  className="flex items-center gap-4 rounded-lg border border-ink/10 bg-sand/50 px-4 py-3"
                >
                  <div className="flex h-14 w-14 flex-none flex-col items-center justify-center rounded-lg bg-forest text-white">
                    <span className="text-[10px] font-semibold uppercase tracking-wide">
                      {meeting.month}
                    </span>
                    <span className="text-xl font-bold leading-none">{meeting.day}</span>
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold text-heading">Friday</p>
                    <p className="text-sm text-ink/60">{meeting.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-ink/70">
              The gatherings will be convened by Sanjay Mathur, Bindu Gupta, and Bindu Lanka,
              NAHCA Membership Committee.
            </p>
            <p className="mt-4 text-ink/70">
              When you register, you will receive a confirmation email from NAHCA with the Zoom
              link. Save that Zoom link in your calendar for easy access.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="mailto:NAHCA108@gmail.com">Register Here</Button>
              <Button href="/membership" variant="outline">
                Join or Renew Membership
              </Button>
            </div>

            <h3 className="mt-10 font-heading text-xl font-medium text-heading">
              Registration Details
            </h3>
            <div className="mt-4">
              <h4 className="font-semibold text-heading">NAHCA Members</h4>
              <p className="mt-2 text-ink/70">
                Free access. Email{" "}
                <a
                  href="mailto:NAHCA108@gmail.com"
                  className="font-semibold text-heading hover:text-heading/70"
                >
                  NAHCA108@gmail.com
                </a>{" "}
                with the subject line &ldquo;2025 NAHCA Meets&rdquo; to request the password.
                This password will change for Fall 2026.
              </p>
            </div>

            <p className="mt-10 text-sm text-ink/60">
              For further information and registration, please contact us at{" "}
              <a
                href="mailto:NAHCA108@gmail.com"
                className="font-semibold text-heading hover:text-heading/70"
              >
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
