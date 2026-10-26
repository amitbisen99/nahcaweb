import { requireAdminArea } from "@/lib/adminGuard";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAdminArea("donations");
  return children;
}
