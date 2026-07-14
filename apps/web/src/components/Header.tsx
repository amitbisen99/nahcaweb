import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Container } from "./Container";
import { Button } from "./Button";
import { MobileNav } from "./MobileNav";
import { NAV } from "@/lib/nav";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/95 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/brand/logo.png" alt="NAHCA logo" width={40} height={40} priority />
            <span className="font-heading text-lg font-semibold text-ink">NAHCA</span>
          </Link>

          <nav className="hidden flex-1 lg:block">
            <ul className="flex items-center justify-center gap-6 xl:gap-8">
              {NAV.map((item) => {
                const href =
                  item.label === "Member Portal" && session?.user?.role === "admin" ? "/admin" : item.href;

                return (
                  <li key={item.label} className="group relative">
                    <Link
                      href={href}
                      className="relative block py-2 text-sm font-medium text-ink/75 transition-colors hover:text-brand"
                    >
                      {item.label}
                      <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-brand transition-transform group-hover:scale-x-100" />
                    </Link>

                    {item.children && (
                      <div className="invisible absolute left-0 top-full z-10 min-w-56 rounded-lg border border-ink/10 bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            target={child.external ? "_blank" : undefined}
                            rel={child.external ? "noopener noreferrer" : undefined}
                            className="block rounded-md px-3 py-2 text-sm text-ink/70 hover:bg-sand hover:text-brand"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {session?.user && (
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
                className="hidden sm:block"
              >
                <button type="submit" className="text-sm font-medium text-ink/40 hover:text-brand">
                  Sign out
                </button>
              </form>
            )}

            <Button href="/donate" className="!bg-[#FF9933] !px-5 !py-2 hover:!bg-[#e6851f]">
              Donate
            </Button>

            <MobileNav
              isAdmin={session?.user?.role === "admin"}
              isLoggedIn={!!session?.user}
              signOutAction={async () => {
                "use server";
                await signOut();
              }}
            />
          </div>
        </div>
      </Container>
    </header>
  );
}
