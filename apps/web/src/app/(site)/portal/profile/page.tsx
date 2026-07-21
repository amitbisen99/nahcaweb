import { auth } from "@/auth";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth();

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">View/Update Profile</h1>
      <p className="mt-2 text-ink/70">Keep your account details up to date.</p>

      <ProfileForm name={session?.user?.name ?? ""} email={session?.user?.email ?? ""} />
    </div>
  );
}
