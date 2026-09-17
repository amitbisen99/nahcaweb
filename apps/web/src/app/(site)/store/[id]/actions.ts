"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";

export interface PurchaseState {
  error?: string;
}

// A "use server" function bound to <form action={...}> must never throw on
// a real failure — every error path here returns { error } instead. The one
// intentional throw is redirect()'s own internal signal on success, which
// must propagate — here that's a redirect straight to Stripe's own
// checkout URL (redirect() supports absolute external URLs), same as every
// other paid flow in this app hands off to Stripe.
// Both trailing params are required by useActionState's call signature but
// unused here (this action takes no form input, just triggers checkout).
export async function purchaseProduct(
  productId: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: PurchaseState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData
): Promise<PurchaseState> {
  const session = await auth();
  if (!session?.apiToken) {
    return { error: "You're not signed in — please sign in and try again." };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/products/${productId}/purchase`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.apiToken}` },
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    console.error(`purchaseProduct ${productId}: request failed:`, err);
    return { error: "Couldn't reach the server. Please try again." };
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = typeof data?.error === "string" ? data.error : "Couldn't start checkout. Please try again.";
    return { error: message };
  }

  redirect(data.checkoutUrl);
}
