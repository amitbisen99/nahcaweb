import { Container } from "@/components/Container";
import { PortalSidebar } from "@/components/PortalSidebar";
import { auth } from "@/auth";
import { getMySponsorship } from "@/lib/institutions";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const sponsorship = session?.apiToken ? await getMySponsorship(session.apiToken) : null;

  return (
    <Container>
      <div className="flex flex-col gap-8 py-12 lg:flex-row lg:items-start lg:gap-10">
        <aside className="lg:w-64 lg:flex-none">
          <PortalSidebar isInstitution={Boolean(sponsorship)} />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Container>
  );
}
