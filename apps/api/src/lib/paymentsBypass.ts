// Demo/staging escape hatch for when Stripe test keys aren't set up yet.
// Explicit opt-in only — never bypass payments just because a key looks unset,
// so a misconfigured production deploy can't accidentally start granting free
// memberships/donations.
export function paymentsBypassed(): boolean {
  return process.env.PAYMENTS_BYPASS === "true";
}
