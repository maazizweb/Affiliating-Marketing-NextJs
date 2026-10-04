import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getCategories, getCurrency, getProducts } from "@/lib/woocommerce";
import { SITE_NAME } from "@/utils/format";

export const revalidate = 300;

export default async function HomePage() {
  const [featured, latest, categories, currency] = await Promise.all([
    getProducts({ featured: true, perPage: 4 }),
    getProducts({ perPage: 8 }),
    getCategories(),
    getCurrency(),
  ]);

  return (
    <>
      <section className="bg-neutral-100">
        <Container className="py-16 sm:py-24">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Welcome to {SITE_NAME}</h1>
          <p className="mt-4 max-w-xl text-lg text-neutral-600">Discover our latest products, curated for you.</p>
          <ButtonLink href="/shop" className="mt-8">
            Shop now
          </ButtonLink>
        </Container>
      </section>

      {categories.length > 0 && (
        <Container className="mt-12">
          <h2 className="text-xl font-semibold">Shop by category</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/category/${c.slug}`}
                  className="block rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      )}

      {featured.products.length > 0 && (
        <Container className="mt-12">
          <h2 className="mb-6 text-xl font-semibold">Featured</h2>
          <ProductGrid products={featured.products} currency={currency.code} />
        </Container>
      )}

      <Container className="mt-12">
        <h2 className="mb-6 text-xl font-semibold">New arrivals</h2>
        <ProductGrid products={latest.products} currency={currency.code} />
      </Container>
    </>
  );
}
