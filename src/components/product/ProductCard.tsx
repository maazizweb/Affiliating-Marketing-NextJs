import Image from "next/image";
import Link from "next/link";
import type { WCProduct } from "@/types/woocommerce";
import { AffiliateButton } from "./AffiliateButton";
import { ProductPrice } from "./ProductPrice";
import { ProductRating } from "./ProductRating";

export function ProductCard({
  product,
  currency,
  priority = false,
}: {
  product: WCProduct;
  currency: string;
  priority?: boolean;
}) {
  const image = product.images[0];
  const soldOut = product.stock_status === "outofstock";
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            priority={priority}
            className="object-cover transition-opacity group-hover:opacity-90"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">No image</div>
        )}
        {(soldOut || product.on_sale) && (
          <span
            className={`absolute left-2 top-2 rounded px-2 py-0.5 text-xs font-medium text-white ${soldOut ? "bg-neutral-700" : "bg-red-700"}`}
          >
            {soldOut ? "Sold out" : "Sale"}
          </span>
        )}
      </div>
      <h3 className="mt-3 text-sm font-medium">
        {/* The stretched link makes the whole card clickable while keeping a single focus target. */}
        <Link href={`/product/${product.slug}`} className="after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-neutral-900">
          {product.name}
        </Link>
      </h3>
      <ProductRating average={product.average_rating} count={product.rating_count} />
      <ProductPrice
        className="mt-1 text-sm"
        price={product.price}
        regularPrice={product.regular_price}
        onSale={product.on_sale}
        currency={currency}
        prefix={product.type === "variable" ? "From" : undefined}
      />
      {/* relative z-10 lifts the button above the card's stretched link so it stays separately clickable */}
      <AffiliateButton product={product} className="relative z-10 mt-3 w-full" />
    </article>
  );
}
