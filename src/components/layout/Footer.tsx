import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SITE_NAME } from "@/utils/format";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50">
      <Container className="flex flex-col gap-4 py-8 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
        <nav aria-label="Footer">
          <ul className="flex gap-4">
            <li><Link href="/shop" className="hover:underline">Shop</Link></li>
            <li><Link href="/account" className="hover:underline">Account</Link></li>
            <li><Link href="/cart" className="hover:underline">Cart</Link></li>
          </ul>
        </nav>
      </Container>
      <Container className="pb-8 text-xs text-neutral-500">
        <p>Affiliate disclosure: some links on this site are affiliate links. We may earn a commission on qualifying purchases at no extra cost to you.</p>
      </Container>
    </footer>
  );
}
