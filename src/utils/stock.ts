import type { WCProduct, WCVariation } from "@/types/woocommerce";

export const MAX_LINE_QUANTITY = 99;

type StockInfo = Pick<WCProduct, "stock_status" | "manage_stock" | "stock_quantity" | "backorders_allowed">;

/** Highest quantity that can be bought, or null when unlimited. Variations may defer to the parent product. */
export function maxPurchasable(item: StockInfo | WCVariation, parent?: StockInfo): number | null {
  const source = "manage_stock" in item && item.manage_stock === "parent" && parent ? parent : item;
  if (source.manage_stock === true && source.stock_quantity !== null && !source.backorders_allowed) {
    return Math.max(source.stock_quantity, 0);
  }
  return null;
}
