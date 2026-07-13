import Link from "next/link";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink/10 bg-sand">
      <Container>
        <div className="flex flex-col gap-4 py-8 text-sm text-ink/60 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} North American Hindu Chaplains Association. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/newsletters" className="font-semibold text-brand hover:text-brand-dark">
              Sign up for our newsletter
            </Link>
            <Link href="/contact" className="font-semibold text-brand hover:text-brand-dark">
              Contact Us
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
