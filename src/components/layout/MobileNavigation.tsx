import Link from "next/link";
import { SearchForm } from "./SearchForm";
import type { NavLink } from "./navLinks";

/** CSS-only disclosure (<details>) — no client JS needed. */
export function MobileNavigation({ links }: { links: NavLink[] }) {
  return (
    <details className="group relative md:hidden">
      <summary className="cursor-pointer list-none rounded-md px-3 py-2 text-sm font-medium hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-neutral-900">
        <span className="group-open:hidden">Menu</span>
        <span className="hidden group-open:inline">Close</span>
      </summary>
      <div className="absolute left-0 top-full z-30 mt-2 w-64 rounded-lg border border-neutral-200 bg-white p-4 shadow-lg">
        <SearchForm />
        <ul className="mt-4 space-y-1">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="block rounded-md px-2 py-2 text-sm hover:bg-neutral-100">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
