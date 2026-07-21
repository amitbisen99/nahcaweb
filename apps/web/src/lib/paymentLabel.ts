import { ApiPayment } from "./api";
import { TIER_LABELS } from "./membershipLabels";

export function paymentLabel(payment: ApiPayment): string {
  if (payment.type === "membership" && payment.membership) {
    return TIER_LABELS[payment.membership.type] ?? "Membership";
  }
  if (payment.type === "donation") {
    return payment.donation?.purpose ? `Donation — ${payment.donation.purpose}` : "Donation";
  }
  if (payment.type === "conference") return "Conference Fee";
  if (payment.type === "endorsement") return "Endorsement Fee";
  return "Purchase";
}
