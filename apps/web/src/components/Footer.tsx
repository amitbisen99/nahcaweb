import Link from "next/link";
import { Container } from "./Container";
import { FOOTER_LINKS } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink/10 bg-sand">
      <Container>
        <div className="flex flex-col gap-4 py-8 text-sm text-black sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p>&copy; {new Date().getFullYear()} North American Hindu Chaplains Association. All rights reserved.</p>
            <p>
              <span className="font-semibold">Registered Public Charity:</span> 501(c)(3)
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="font-semibold text-brand hover:text-brand-dark">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
