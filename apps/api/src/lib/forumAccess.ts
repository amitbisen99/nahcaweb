import { prisma } from "../prisma";

// Whether a user counts as a "member" for forum purposes: an active
// Membership record. This is deliberately separate from Role (admin/member
// on the User itself is just a login role, not a paid-membership flag) —
// a "general user" (free account, no active Membership) and a "member"
// (active Membership) can both have Role "member".
export async function isActiveMember(userId: number): Promise<boolean> {
  const membership = await prisma.membership.findFirst({
    where: { userId, status: "active" },
    select: { id: true },
  });
  return membership !== null;
}
