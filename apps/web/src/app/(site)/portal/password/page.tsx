import { PasswordForm } from "./PasswordForm";

export default function ChangePasswordPage() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Change Password</h1>
      <p className="mt-2 text-ink/70">Update the password you use to sign in.</p>

      <PasswordForm />
    </div>
  );
}
