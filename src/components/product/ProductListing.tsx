import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";
import type { ProductList } from "@/lib/woocommerce";
import { ProductGrid } from "./ProductGrid";

const SORTS = [
  { label: "Newest", orderby: "date", order: "desc" },
  { label: "Price: low to high", orderby: "price", order: "asc" },
  { label: "Price: high to low", orderby: "price", order: "desc" },
  { label: "Top rated", orderby: "rating", order: "desc" },
] as const;

export type ListingSort = (typeof SORTS)[number];

/** Resolves ?sort=<index> to a validated sort (invalid input falls back to newest). */
export function parseSort(sort: string | undefined): ListingSort {
  return SORTS[Number(sort)] ?? SORTS[0];
}

/** Shared by shop, category and search pages. All state lives in the URL. */
export function ProductListing({
  list,
  currency,
  page,
  sort,
  basePath,
  query = {},
  emptyMessage = "No products found.",
}: {
  list: ProductList;
  currency: string;
  page: number;
  sort: ListingSort;
  basePath: string;
  query?: Record<string, string>;
  emptyMessage?: string;
}) {
  const href = (p: number, sortIndex = SORTS.indexOf(sort)) => {
    const params = new URLSearchParams({ ...query, sort: String(sortIndex), page: String(p) });
    return `${basePath}?${params}`;
  };

  if (list.products.length === 0) return <p className="py-12 text-center text-neutral-600">{emptyMessage}</p>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-neutral-600">{list.total} products</p>
        <nav aria-label="Sort products" className="flex flex-wrap gap-x-4 gap-y-1">
          {SORTS.map((s, i) => (
            <Link
              key={s.label}
              href={href(1, i)}
              aria-current={s === sort ? "true" : undefined}
              className={s === sort ? "font-semibold underline" : "text-neutral-600 hover:underline"}
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
      <ProductGrid products={list.products} currency={currency} />
      <Pagination page={page} totalPages={list.totalPages} href={(p) => href(p)} />
    </div>
  );
}
