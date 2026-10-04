import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AffiliateButton } from "@/components/product/AffiliateButton";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInformation, ProductInformationHeader } from "@/components/product/ProductInformation";
import { ProductJsonLd } from "@/components/product/ProductJsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getCurrency, getProductBySlug } from "@/lib/woocommerce";
import { stripHtml } from "@/utils/format";

// Static + ISR: regenerated at most every 5 minutes, or on demand via the /api/revalidate webhook.
export const revalidate = 300;

// No pages are built ahead of time; each product is generated on first request, then cached (ISR).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Product not found" };
  const description = stripHtml(product.short_description || product.description).slice(0, 160);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/product/${product.slug}`,
      images: product.images.slice(0, 1).map((i) => ({ url: i.src, alt: i.alt || product.name })),
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const currency = await getCurrency();
  const primaryCategory = product.categories[0];

  return (
    <Container className="py-8">
      <ProductJsonLd product={product} currency={currency.code} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...(primaryCategory ? [{ label: primaryCategory.name, href: `/category/${primaryCategory.slug}` }] : []),
          { label: product.name },
        ]}
      />
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images} name={product.name} />
        <div className="space-y-6">
          <ProductInformationHeader product={product} />
          <div className="space-y-4">
            <ProductPrice
              className="text-2xl"
              price={product.price}
              regularPrice={product.regular_price}
              onSale={product.on_sale}
              currency={currency.code}
            />
            <AffiliateButton product={product} className="w-full px-6 py-3 text-base sm:w-auto" />
            <p className="text-xs text-neutral-500">
              We may earn a commission if you buy through this link, at no extra cost to you. Price and availability may
              change on the seller&apos;s site.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-12 max-w-3xl">
        <ProductInformation product={product} />
      </div>
    </Container>
  );
}
