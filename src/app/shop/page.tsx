import type { Metadata } from "next";
import { ProductListing, parseSort } from "@/components/product/ProductListing";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getCurrency, getProducts } from "@/lib/woocommerce";
import { first, pageFrom } from "@/utils/params";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse all products.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const sp = await searchParams;
  const page = pageFrom(sp.page);
  const sort = parseSort(first(sp.sort));
  const [list, currency] = await Promise.all([
    getProducts({ page, orderby: sort.orderby, order: sort.order }),
    getCurrency(),
  ]);

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <h1 className="mb-6 mt-4 text-3xl font-bold tracking-tight">Shop</h1>
      <ProductListing list={list} currency={currency.code} page={page} sort={sort} basePath="/shop" />
    </Container>
  );
}
