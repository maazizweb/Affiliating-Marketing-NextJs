import Link from "next/link";
import type { NavLink } from "./navLinks";

export function Navigation({ links }: { links: NavLink[] }) {
  return (
    <nav aria-label="Main" className="hidden md:block">
      <ul className="flex items-center gap-6 text-sm font-medium text-neutral-700">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-neutral-900 hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
