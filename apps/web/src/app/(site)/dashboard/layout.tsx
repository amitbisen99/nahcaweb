import { Container } from "@/components/Container";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { signOut } from "@/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container>
      <div className="flex flex-col gap-8 py-12 lg:flex-row lg:items-start lg:gap-10">
        <aside className="flex flex-col gap-3 lg:w-64 lg:flex-none">
          <DashboardSidebar />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
            className="rounded-xl border border-ink/10 bg-white px-4 py-2.5"
          >
            <button type="submit" className="text-sm font-medium text-black hover:text-brand">
              Sign out
            </button>
          </form>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Container>
  );
}
