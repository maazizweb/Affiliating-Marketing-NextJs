import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing, parseSort } from "@/components/product/ProductListing";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getCategoryBySlug, getCurrency, getProductsByCategory } from "@/lib/woocommerce";
import { stripHtml } from "@/utils/format";
import { first, pageFrom } from "@/utils/params";

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  if (!category) return { title: "Category not found" };
  const description = stripHtml(category.description) || `Shop ${category.name}.`;
  return {
    title: category.name,
    description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      title: category.name,
      description,
      url: `/category/${category.slug}`,
      images: category.image ? [category.image.src] : undefined,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/category/[slug]">) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = pageFrom(sp.page);
  const sort = parseSort(first(sp.sort));
  const [list, currency] = await Promise.all([
    getProductsByCategory(category.id, { page, orderby: sort.orderby, order: sort.order }),
    getCurrency(),
  ]);

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: category.name }]} />
      <h1 className="mb-6 mt-4 text-3xl font-bold tracking-tight">{category.name}</h1>
      <ProductListing
        list={list}
        currency={currency.code}
        page={page}
        sort={sort}
        basePath={`/category/${category.slug}`}
        emptyMessage="No products in this category yet."
      />
    </Container>
  );
}
