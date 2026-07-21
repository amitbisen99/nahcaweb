export const TIER_LABELS: Record<string, string> = {
  regular: "Regular Membership",
  student: "Student Membership",
  institutional: "Institution-Sponsored Student Membership",
  conference: "Conference Membership",
};

export const MEMBERSHIP_STATUS_STYLES: Record<string, string> = {
  active: "bg-forest/10 text-forest",
  pending: "bg-brand/10 text-brand-dark",
  expired: "bg-ink/10 text-ink/60",
};

export const PAYMENT_STATUS_STYLES: Record<string, string> = {
  succeeded: "bg-forest/10 text-forest",
  pending: "bg-brand/10 text-brand-dark",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-ink/10 text-ink/60",
};
