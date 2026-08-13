import { RedeemForm } from "./RedeemForm";

export default function RedeemCodePage() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Redeem Institution Code</h1>
      <p className="mt-2 text-black">
        If your employer or school has sponsored NAHCA memberships, enter your claim code below to add a new
        membership period to your account — no payment needed.
      </p>

      <RedeemForm />
    </div>
  );
}
