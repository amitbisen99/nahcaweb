import { auth } from "@/auth";
import { getMyProfile } from "@/lib/api";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.apiToken ? await getMyProfile(session.apiToken) : null;

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">View/Update Profile</h1>
      <p className="mt-2 text-black">Keep your account details up to date.</p>

      <ProfileForm
        name={user?.name ?? session?.user?.name ?? ""}
        email={user?.email ?? session?.user?.email ?? ""}
        profile={user?.profile ?? null}
      />
    </div>
  );
}
