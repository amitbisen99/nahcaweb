import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";

export default function MembersOnlyPage() {
  return (
    <>
      <EventBanner title="Members-Only Meetings" image="/brand/temple-home.jpg" />
      <Container>
        <div className="max-w-2xl py-16">
          <p className="text-ink/70">
            These private meetings are reserved for active NAHCA members — a space to discuss
            membership matters, organizational updates, and topics specific to our community of
            Hindu chaplains.
          </p>
          <p className="mt-6 text-sm text-ink/50">
            Sign in to your{" "}
            <a href="/portal" className="font-semibold text-brand hover:text-brand-dark">
              Member Portal
            </a>{" "}
            for meeting details, or become a member to join.
          </p>
        </div>
      </Container>
    </>
  );
}
