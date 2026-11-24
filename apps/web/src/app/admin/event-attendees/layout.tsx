import { requireAdminArea } from "@/lib/adminGuard";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAdminArea("event_attendees");
  return children;
}
