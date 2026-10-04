import type { WCProduct } from "@/types/woocommerce";
import { SITE_URL, stripHtml } from "@/utils/format";

/** schema.org Product structured data. `currency` is the store currency code. */
export function ProductJsonLd({ product, currency }: { product: WCProduct; currency: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: stripHtml(product.short_description || product.description),
    sku: product.sku || undefined,
    image: product.images.map((i) => i.src),
    url: `${SITE_URL}/product/${product.slug}`,
    ...(product.rating_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.average_rating,
        reviewCount: product.rating_count,
      },
    }),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: currency,
      availability:
        product.stock_status === "outofstock"
          ? "https://schema.org/OutOfStock"
          : product.stock_status === "onbackorder"
            ? "https://schema.org/BackOrder"
            : "https://schema.org/InStock",
      url: `${SITE_URL}/product/${product.slug}`,
    },
  };
  // "<" is escaped so product text can never terminate the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
