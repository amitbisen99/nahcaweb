import { auth } from "@/auth";
import { InviteLinkCard } from "./InviteLinkCard";

export default async function InvitePage() {
  const session = await auth();
  const webOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const referralLink = `${webOrigin}/membership?ref=${session?.user?.id ?? ""}`;

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Invite</h1>
      <p className="mt-2 text-ink/70">Share NAHCA with colleagues and friends who might want to join.</p>

      <InviteLinkCard referralLink={referralLink} />
    </div>
  );
}
