import { redirect } from "next/navigation";
import { auth } from "@/auth";

// NextAuth's signIn() always lands here right after a successful login —
// this just routes onward based on role, since signIn() itself needs a
// fixed redirectTo and can't know the role ahead of time. A "general user"
// (free forum-only account, no Membership ever) has no portal to land on —
// send them to the forum instead, which is the whole reason they signed up.
export default async function PostLoginPage() {
  const session = await auth();
  if (session?.user?.role === "admin") redirect("/admin");
  redirect(session?.user?.hasMembership ? "/portal" : "/forum");
}
