import { buttonClass } from "@/components/ui/Button";
import type { WCProduct } from "@/types/woocommerce";
import { affiliateUrl } from "@/utils/affiliate";

/**
 * Outbound affiliate link, shown on every product. Uses the product's External/Affiliate URL,
 * or a dummy link if none is set. `sponsored` tells search engines this is an affiliate link.
 */
export function AffiliateButton({ product, className = "" }: { product: WCProduct; className?: string }) {
  return (
    <a
      href={affiliateUrl(product)}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      className={buttonClass("cta", className)}
    >
      {product.button_text || "Buy on Amazon"}
    </a>
  );
}
