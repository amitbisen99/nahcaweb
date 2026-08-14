import { prisma } from "../prisma";
import { removeBrevoContactFromList } from "./brevoContacts";

// Runs on a daily schedule (see index.ts) plus once at server startup.
// Nothing in this app previously flipped Membership.status to "expired" —
// endDate passing was never actually noticed anywhere, so the admin
// members list's "expired" filter had nothing to show. This sweep both
// fixes that and drives the Brevo-list-removal requirement: when a member
// is deactivated by an admin or their last active membership expires, they
// come off the newsletter list's member segment.
export async function runMembershipExpirySweep() {
  const now = new Date();

  const newlyExpired = await prisma.membership.findMany({
    where: { status: "active", endDate: { lt: now } },
    include: { user: true },
  });

  if (newlyExpired.length === 0) return;

  console.log(`[membershipExpirySweep] Found ${newlyExpired.length} newly-expired membership(s).`);

  for (const membership of newlyExpired) {
    await prisma.membership.update({
      where: { id: membership.id },
      data: { status: "expired" },
    });

    // A user can hold more than one Membership row over time (e.g. a
    // sponsored code claimed on top of an existing membership) — only pull
    // them off the Brevo list once none of their memberships are active.
    const stillHasActive = await prisma.membership.count({
      where: { userId: membership.userId, status: "active" },
    });

    if (stillHasActive === 0) {
      await removeBrevoContactFromList(membership.user.email);
    }
  }
}
