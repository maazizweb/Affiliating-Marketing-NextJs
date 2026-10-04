import type { VariationOption } from "@/types/storefront";
import type { WCProduct, WCVariation } from "@/types/woocommerce";
import { maxPurchasable } from "./stock";

/** Variation option values are slugs ("dark-blue") while product attribute options are names ("Dark Blue"). */
export function normalizeOption(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function toVariationOptions(variations: WCVariation[], product: WCProduct): VariationOption[] {
  return variations.map((v) => ({
    id: v.id,
    sku: v.sku,
    attributes: v.attributes.map((a) => ({ name: a.name, option: a.option })),
    price: v.price,
    regularPrice: v.regular_price,
    salePrice: v.sale_price,
    onSale: v.on_sale,
    inStock: v.stock_status !== "outofstock",
    purchasable: v.purchasable,
    maxQuantity: maxPurchasable(v, product),
  }));
}

export function findVariation(
  variations: VariationOption[],
  selected: Record<string, string>,
): VariationOption | undefined {
  return variations.find((v) =>
    v.attributes.every((a) => a.option === "" || normalizeOption(selected[a.name] ?? "") === normalizeOption(a.option)),
  );
}

/** Attributes the shopper must pick to resolve a variation. */
export function variationAttributes(product: WCProduct) {
  return product.attributes.filter((a) => a.variation).map((a) => ({ name: a.name, options: a.options }));
}

export function stockLabel(status: WCProduct["stock_status"], max: number | null): string {
  if (status === "outofstock") return "Out of stock";
  if (status === "onbackorder") return "Available on backorder";
  return max !== null && max <= 5 ? `Only ${max} left` : "In stock";
}
