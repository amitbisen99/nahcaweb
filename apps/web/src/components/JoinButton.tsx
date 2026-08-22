"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { inputClass } from "@/components/MemberProfileFormFields";
import { quickJoinEvent } from "@/app/(site)/events/actions";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Webinars have no scheduled date and get their own wording; Events keep
// the "held on" clause. Mirrors buildEventRegistrationReceiptBody on the
// API side — keep both in sync.
function confirmationMessage(type: "event" | "webinar", eventTitle: string, eventDate: string | null): string {
  if (type === "webinar") {
    return `You successfully registered for the webinar '${eventTitle}'.`;
  }
  return `You registered for this event '${eventTitle}'${eventDate ? ` held on ${formatDate(eventDate)}` : ""}.`;
}

interface AppliedCoupon {
  code: string;
  discountType: "percent" | "fixed_amount" | "complimentary";
  discountValue: number;
}

function discountedPriceCents(baseCents: number, coupon: AppliedCoupon | null): number {
  if (!coupon) return baseCents;
  if (coupon.discountType === "complimentary") return 0;
  if (coupon.discountType === "fixed_amount") return Math.max(0, baseCents - coupon.discountValue);
  return Math.max(0, Math.round(baseCents * (1 - coupon.discountValue / 100)));
}

// Not logged in -> off to the registration/payment form. Already a member,
// free event/webinar -> one click, instant, no payment. Already a member,
// paid -> a small "have a coupon?" popup (price, optional code, Skip) since
// they don't need to re-fill the whole guest form for that.
export function JoinButton({
  eventCode,
  eventTitle,
  eventDate,
  priceCents,
  isLoggedIn,
  type,
  size = "md",
}: {
  eventCode: string;
  eventTitle: string;
  eventDate: string | null;
  priceCents: number | null;
  isLoggedIn: boolean;
  type: "event" | "webinar";
  size?: "sm" | "md";
}) {
  const baseCents = priceCents ?? 0;

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  function closeCouponModal() {
    setShowCouponModal(false);
    setCouponInput("");
    setCouponError(null);
    setAppliedCoupon(null);
    setError(null);
  }

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponChecking(true);
    setCouponError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), eventCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAppliedCoupon(null);
        setCouponError(data.error ?? "This coupon code isn't valid.");
        return;
      }

      setAppliedCoupon(data.coupon);
    } catch {
      setAppliedCoupon(null);
      setCouponError("Couldn't check that code right now — please try again.");
    } finally {
      setCouponChecking(false);
    }
  }

  async function submitJoin(couponCode?: string) {
    setPending(true);
    setError(null);
    const result = await quickJoinEvent(eventCode, couponCode);

    if (result.error) {
      setPending(false);
      setError(result.error);
      return;
    }

    if (result.checkoutUrl) {
      // Leave `pending` true — the page is about to navigate away.
      window.location.href = result.checkoutUrl;
      return;
    }

    setPending(false);
    setShowCouponModal(false);
    setJoined(true);
  }

  function handleJoinClick() {
    if (baseCents > 0) {
      setShowCouponModal(true);
      return;
    }
    submitJoin();
  }

  if (joined) {
    return (
      <p className="max-w-sm rounded-lg border border-forest/30 bg-forest/5 px-4 py-3 text-sm font-medium text-forest break-words">
        {confirmationMessage(type, eventTitle, eventDate)}
      </p>
    );
  }

  if (!isLoggedIn) {
    return (
      <Button href={`/events/join/${eventCode}`} variant="solid" size={size}>
        Join
      </Button>
    );
  }

  const finalPriceCents = discountedPriceCents(baseCents, appliedCoupon);

  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" variant="solid" size={size} onClick={handleJoinClick} disabled={pending}>
        {pending ? "Joining…" : "Join"}
      </Button>
      {error && !showCouponModal && <p className="max-w-sm text-sm text-red-600 break-words">{error}</p>}

      {showCouponModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => !pending && closeCouponModal()}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-lg font-medium text-heading">Have a coupon code?</h2>
            <p className="mt-1 text-sm text-black">
              {eventTitle} —{" "}
              {appliedCoupon && (
                <span className="text-black/50 line-through">${(baseCents / 100).toFixed(0)} </span>
              )}
              <span className="font-semibold text-heading">${(finalPriceCents / 100).toFixed(0)}</span>
            </p>

            <div className="mt-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-lg border border-forest/30 bg-forest/5 px-3 py-2">
                  <span className="text-sm font-medium text-forest">&ldquo;{appliedCoupon.code}&rdquo; applied</span>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    className="text-xs font-semibold text-black/60 hover:text-black"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter code"
                    className={`flex-1 uppercase ${inputClass()}`}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponChecking || !couponInput.trim()}
                    className="rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium text-black transition-colors hover:border-brand disabled:opacity-50"
                  >
                    {couponChecking ? "Checking…" : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="mt-1 text-xs text-red-600">{couponError}</p>}
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => submitJoin()}
                disabled={pending}
                className="text-sm font-semibold text-black/60 hover:text-black disabled:opacity-50"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => submitJoin(appliedCoupon?.code)}
                disabled={pending}
                className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
              >
                {pending ? "Redirecting to checkout…" : `Continue to Payment — $${(finalPriceCents / 100).toFixed(0)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
