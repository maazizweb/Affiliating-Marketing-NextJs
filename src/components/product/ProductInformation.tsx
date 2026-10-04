import Link from "next/link";
import type { WCProduct } from "@/types/woocommerce";
import { ProductRating } from "./ProductRating";

/** Descriptions are admin-authored HTML from WooCommerce; they are rendered as-is. */
export function ProductInformationHeader({ product }: { product: WCProduct }) {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>
      <ProductRating average={product.average_rating} count={product.rating_count} />
      {product.short_description && (
        <div className="prose-sm text-neutral-700" dangerouslySetInnerHTML={{ __html: product.short_description }} />
      )}
    </div>
  );
}

export function ProductInformation({ product }: { product: WCProduct }) {
  const visibleAttributes = product.attributes.filter((a) => a.visible && a.options.length > 0);
  return (
    <div className="space-y-8">
      <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
        {product.sku && (
          <>
            <dt className="text-neutral-500">SKU</dt>
            <dd>{product.sku}</dd>
          </>
        )}
        {product.categories.length > 0 && (
          <>
            <dt className="text-neutral-500">Categories</dt>
            <dd className="flex flex-wrap gap-x-2">
              {product.categories.map((c) => (
                <Link key={c.id} href={`/category/${c.slug}`} className="underline hover:no-underline">
                  {c.name}
                </Link>
              ))}
            </dd>
          </>
        )}
        {product.tags.length > 0 && (
          <>
            <dt className="text-neutral-500">Tags</dt>
            <dd>{product.tags.map((t) => t.name).join(", ")}</dd>
          </>
        )}
        {visibleAttributes.map((a) => (
          <div key={a.id || a.name} className="contents">
            <dt className="text-neutral-500">{a.name}</dt>
            <dd>{a.options.join(", ")}</dd>
          </div>
        ))}
      </dl>
      {product.description && (
        <section aria-labelledby="description-heading">
          <h2 id="description-heading" className="mb-3 text-lg font-semibold">
            Description
          </h2>
          <div className="space-y-3 text-neutral-700 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: product.description }} />
        </section>
      )}
    </div>
  );
}
