import { formatPrice, toNumber } from "@/utils/format";

export function ProductPrice({
  price,
  regularPrice,
  onSale,
  currency,
  prefix,
  className = "",
}: {
  price: string;
  regularPrice: string;
  onSale: boolean;
  currency: string;
  prefix?: string;
  className?: string;
}) {
  if (price === "") return null;
  const showSale = onSale && toNumber(regularPrice) > toNumber(price);
  return (
    <p className={`flex items-baseline gap-2 ${className}`}>
      {prefix && <span className="text-sm text-neutral-500">{prefix}</span>}
      <span className={showSale ? "font-semibold text-red-700" : "font-semibold"}>{formatPrice(price, currency)}</span>
      {showSale && (
        <>
          <s className="text-sm text-neutral-500">
            <span className="sr-only">Regular price </span>
            {formatPrice(regularPrice, currency)}
          </s>
        </>
      )}
    </p>
  );
}
