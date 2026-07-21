import { redirect } from "next/navigation";
import { auth } from "@/auth";

// NextAuth's signIn() always lands here right after a successful login —
// this just routes onward based on role, since signIn() itself needs a
// fixed redirectTo and can't know the role ahead of time.
export default async function PostLoginPage() {
  const session = await auth();
  redirect(session?.user?.role === "admin" ? "/admin" : "/portal");
}
