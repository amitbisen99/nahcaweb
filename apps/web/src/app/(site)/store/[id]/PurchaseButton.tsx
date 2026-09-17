"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { purchaseProduct, PurchaseState } from "./actions";

const initialState: PurchaseState = {};

export function PurchaseButton({ productId, priceCents }: { productId: number; priceCents: number }) {
  const action = purchaseProduct.bind(null, productId);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Button type="submit" variant="solid" disabled={isPending}>
        {isPending ? "Redirecting to checkout…" : `Buy for $${(priceCents / 100).toFixed(2)}`}
      </Button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <p className="text-xs text-black/60">All digital product sales are final — no refunds.</p>
    </form>
  );
}
