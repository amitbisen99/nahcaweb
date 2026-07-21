import { Container } from "@/components/Container";
import { PortalSidebar } from "@/components/PortalSidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container>
      <div className="flex flex-col gap-8 py-12 lg:flex-row lg:items-start lg:gap-10">
        <aside className="lg:w-64 lg:flex-none">
          <PortalSidebar />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Container>
  );
}
