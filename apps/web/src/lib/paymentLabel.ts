import { ApiPayment } from "./api";
import { TIER_LABELS } from "./membershipLabels";

export function paymentLabel(payment: ApiPayment): string {
  if (payment.type === "membership" && payment.membership) {
    // The institution's own billing payment (groupId null) funds a batch of
    // codes, not a personal membership — label it as sponsorship rather than
    // reusing the student-facing "Institution-Sponsored Student Membership"
    // wording, which only applies once a student actually claims a code.
    if (payment.membership.type === "institutional" && payment.membership.groupId === null) {
      return "Institutional Sponsorship";
    }
    return TIER_LABELS[payment.membership.type] ?? "Membership";
  }
  if (payment.type === "donation") {
    return payment.donation?.purpose ? `Donation — ${payment.donation.purpose}` : "Donation";
  }
  if (payment.type === "conference") return "Conference Fee";
  if (payment.type === "endorsement") return "Endorsement Fee";
  return "Purchase";
}
