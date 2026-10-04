import Image from "next/image";
import Link from "next/link";
import { removeCartLine, updateCartLine } from "@/actions/cart";
import { Button } from "@/components/ui/Button";
import type { PricedCartLine } from "@/types/storefront";
import { formatPrice } from "@/utils/format";

/** Plain forms + Server Actions: quantity changes work without any client JS. */
export function CartLineItem({ line, currency }: { line: PricedCartLine; currency: string }) {
  const ids = (
    <>
      <input type="hidden" name="productId" value={line.productId} />
      <input type="hidden" name="variationId" value={line.variationId} />
    </>
  );
  return (
    <li className="flex gap-4 py-5">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-neutral-100">
        {line.image && <Image src={line.image} alt="" fill sizes="96px" className="object-cover" />}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex justify-between gap-4">
          <div>
            <Link href={`/product/${line.slug}`} className="font-medium hover:underline">
              {line.name}
            </Link>
            {line.variationLabel && <p className="text-sm text-neutral-500">{line.variationLabel}</p>}
            <p className="text-sm text-neutral-600">{formatPrice(line.unitPrice, currency)} each</p>
          </div>
          <p className="font-medium">{formatPrice(line.lineTotal, currency)}</p>
        </div>
        <div className="flex items-center gap-3">
          <form action={updateCartLine} className="flex items-center gap-2">
            {ids}
            <label htmlFor={`qty-${line.productId}-${line.variationId}`} className="sr-only">
              Quantity for {line.name}
            </label>
            <input
              id={`qty-${line.productId}-${line.variationId}`}
              name="quantity"
              type="number"
              min={1}
              max={line.maxQuantity ?? undefined}
              defaultValue={line.quantity}
              className="h-9 w-16 rounded-md border border-neutral-300 px-2 text-sm"
            />
            <Button type="submit" variant="secondary" className="!py-1.5">
              Update
            </Button>
          </form>
          <form action={removeCartLine}>
            {ids}
            <Button type="submit" variant="ghost" className="!py-1.5 text-red-700">
              Remove
            </Button>
          </form>
        </div>
      </div>
    </li>
  );
}
