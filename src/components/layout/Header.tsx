import Link from "next/link";
import { CartBadge } from "@/components/cart/CartBadge";
import { Container } from "@/components/ui/Container";
import { SITE_NAME } from "@/utils/format";
import { MobileNavigation } from "./MobileNavigation";
import { Navigation } from "./Navigation";
import { SearchForm } from "./SearchForm";
import { getNavLinks } from "./navLinks";

export async function Header() {
  const links = await getNavLinks();
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center gap-4">
        <MobileNavigation links={links} />
        <Link href="/" className="text-lg font-bold tracking-tight">
          {SITE_NAME}
        </Link>
        <Navigation links={links} />
        <div className="ml-auto flex items-center gap-2">
          <SearchForm className="hidden w-56 md:block" />
          <Link href="/account" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-neutral-100">
            Account
          </Link>
          <Link href="/cart" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-neutral-100">
            Cart
            <CartBadge />
          </Link>
        </div>
      </Container>
    </header>
  );
}
