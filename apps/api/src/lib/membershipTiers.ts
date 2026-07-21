import { MembershipType } from "@prisma/client";
import { prisma } from "../prisma";

// Static fallbacks — used only if a plan row is somehow missing (e.g. a
// fresh DB that hasn't been seeded yet). The admin-editable source of truth
// is the MembershipPlan table.
export const TIER_LABELS: Record<string, string> = {
  regular: "Regular Membership",
  student: "Student Membership",
  institutional: "Institution-Sponsored Student Membership",
  conference: "Conference Membership",
};

// Term length used to compute Membership.endDate on activation. Not
// admin-editable — changing a plan's billing duration is a structural
// change, not "content and price".
export const TIER_TERM_MONTHS: Record<string, number> = {
  regular: 12,
  student: 24,
  institutional: 24,
  conference: 12,
};

export const INSTITUTIONAL_MIN_STUDENTS = 5;

export function getMembershipPlan(type: MembershipType) {
  return prisma.membershipPlan.findUnique({ where: { type } });
}
