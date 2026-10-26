import { requireSuperAdminPage } from "@/lib/adminGuard";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSuperAdminPage();
  return children;
}
