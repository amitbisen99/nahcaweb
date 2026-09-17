import { auth } from "@/auth";
import { HeaderChrome } from "./HeaderChrome";

export async function Header() {
  const session = await auth();
  const portalHref = session?.user?.role === "admin" ? "/admin" : "/portal";

  return <HeaderChrome portalHref={portalHref} isAdmin={session?.user?.role === "admin"} />;
}
