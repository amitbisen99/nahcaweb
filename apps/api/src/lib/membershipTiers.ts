export const TIER_LABELS: Record<string, string> = {
  regular: "Regular Membership",
  student: "Student Membership",
  institutional: "Institution-Sponsored Student Membership",
  conference: "Conference Membership",
};

// Term length used to compute Membership.endDate on activation.
export const TIER_TERM_MONTHS: Record<string, number> = {
  regular: 12,
  student: 24,
  institutional: 24,
  conference: 12,
};

const REGULAR_PRICE_CENTS = 7500; // $75 / 1 year
const STUDENT_PRICE_CENTS = 7500; // $75 / 2 years
const CONFERENCE_PRICE_CENTS = 7500; // $75 / 1 year
const INSTITUTIONAL_PRICE_PER_STUDENT_CENTS = 6000; // $60 / student
export const INSTITUTIONAL_MIN_STUDENTS = 5;

export function priceForTier(type: string, studentCount?: number): number {
  switch (type) {
    case "regular":
      return REGULAR_PRICE_CENTS;
    case "student":
      return STUDENT_PRICE_CENTS;
    case "conference":
      return CONFERENCE_PRICE_CENTS;
    case "institutional":
      return (studentCount as number) * INSTITUTIONAL_PRICE_PER_STUDENT_CENTS;
    default:
      throw new Error(`Unknown membership type: ${type}`);
  }
}
