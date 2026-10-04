import { getCategories } from "@/lib/woocommerce";

export interface NavLink {
  label: string;
  href: string;
}

/** Nav is non-critical: if the catalog is down, log it and still render the shell (pages surface the real error). */
export async function getNavLinks(): Promise<NavLink[]> {
  const links: NavLink[] = [{ label: "Shop", href: "/shop" }];
  try {
    const categories = await getCategories();
    links.push(
      ...categories.filter((c) => c.parent === 0).slice(0, 6).map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
    );
  } catch (error) {
    console.error("Navigation: failed to load categories", error);
  }
  return links;
}
