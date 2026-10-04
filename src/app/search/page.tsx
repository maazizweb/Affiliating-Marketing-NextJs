import type { Metadata } from "next";
import { ProductListing, parseSort } from "@/components/product/ProductListing";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getCurrency, getProducts } from "@/lib/woocommerce";
import { first, pageFrom } from "@/utils/params";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false }, // internal search results shouldn't be indexed
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = first(sp.q)?.trim() ?? "";
  const page = pageFrom(sp.page);
  const sort = parseSort(first(sp.sort));

  const [list, currency] = q
    ? await Promise.all([getProducts({ search: q, page, orderby: sort.orderby, order: sort.order }), getCurrency()])
    : [null, null];

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <h1 className="mb-6 mt-4 text-3xl font-bold tracking-tight">{q ? `Results for “${q}”` : "Search"}</h1>
      {list && currency ? (
        <ProductListing
          list={list}
          currency={currency.code}
          page={page}
          sort={sort}
          basePath="/search"
          query={{ q }}
          emptyMessage={`No products match “${q}”.`}
        />
      ) : (
        <p className="text-neutral-600">Enter a search term in the box above.</p>
      )}
    </Container>
  );
}
