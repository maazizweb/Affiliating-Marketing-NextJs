import type { WCProduct } from "@/types/woocommerce";

/**
 * Placeholder used until a product has a real affiliate link.
 * ponytail: dummy link — in WordPress set the product's "Product URL" (External/Affiliate product) to your Amazon link.
 */
export const DUMMY_AFFILIATE_URL = "https://www.amazon.com/";

export function affiliateUrl(product: WCProduct): string {
  return product.external_url || DUMMY_AFFILIATE_URL;
}
