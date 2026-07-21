import Link from "next/link";
import { auth, signOut } from "@/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-full">
      <aside className="flex w-64 flex-none flex-col bg-ink">
        <Link href="/admin" className="px-5 py-5 font-heading text-lg font-semibold text-white">
          NAHCA Admin
        </Link>

        <div className="flex-1 overflow-y-auto">
          <AdminSidebar />
        </div>

        <div className="border-t border-white/10 p-4">
          <p className="truncate text-xs text-white/50">{session?.user?.email}</p>
          <div className="mt-2 flex flex-col gap-2">
            <Link href="/" className="text-sm font-medium text-white/70 hover:text-white">
              ← Back to Website
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="text-sm font-medium text-white/70 hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto bg-sand/20">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">{children}</div>
      </div>
    </div>
  );
}
