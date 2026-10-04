import "server-only";
import type { CartLine, CartSummary, PricedCartLine } from "@/types/storefront";
import { getCurrency, getProduct, getVariation, WooCommerceError } from "@/lib/woocommerce";
import { roundMoney, toNumber } from "@/utils/format";
import { MAX_LINE_QUANTITY, maxPurchasable } from "@/utils/stock";
import { readCart } from "./cookie";

export type LineCheck = { ok: true; line: PricedCartLine } | { ok: false; error: string };

/**
 * Prices one cart line from live WooCommerce data and validates it
 * (exists, purchasable, in stock, valid variation). The single source of truth for
 * add-to-cart, cart display and checkout.
 */
export async function priceLine({ productId, variationId, quantity }: CartLine): Promise<LineCheck> {
  try {
    const product = await getProduct(productId);
    const isVariable = product.type === "variable";

    if (product.type !== "simple" && !isVariable) return { ok: false, error: `"${product.name}" can't be added to the cart.` };
    if (isVariable && !product.variations.includes(variationId)) {
      return { ok: false, error: `Please choose a valid option for "${product.name}".` };
    }
    if (!isVariable && variationId !== 0) return { ok: false, error: "Invalid product option." };

    const variation = isVariable ? await getVariation(productId, variationId) : null;
    const item = variation ?? product;
    if (!item.purchasable || item.stock_status === "outofstock") {
      return { ok: false, error: `"${product.name}" is out of stock.` };
    }

    const max = maxPurchasable(item, product);
    if (max !== null && quantity > max) {
      return { ok: false, error: `Only ${max} of "${product.name}" left in stock.` };
    }

    const unitPrice = toNumber(item.price);
    return {
      ok: true,
      line: {
        productId,
        variationId,
        quantity,
        name: product.name,
        slug: product.slug,
        image: variation?.image?.src ?? product.images[0]?.src ?? null,
        variationLabel: variation?.attributes.map((a) => a.option).filter(Boolean).join(" / ") || null,
        unitPrice,
        lineTotal: roundMoney(unitPrice * quantity),
        stockStatus: item.stock_status,
        maxQuantity: Math.min(max ?? MAX_LINE_QUANTITY, MAX_LINE_QUANTITY),
      },
    };
  } catch (e) {
    if (e instanceof WooCommerceError && e.isNotFound) return { ok: false, error: "A product in your cart is no longer available." };
    throw e;
  }
}

/** Cart contents with live prices. Unavailable lines are returned separately so the UI can say so. */
export async function getCartSummary(): Promise<CartSummary & { unavailable: string[] }> {
  const [stored, currency] = await Promise.all([readCart(), getCurrency()]);
  const checks = await Promise.all(stored.map(priceLine));
  const lines = checks.flatMap((c) => (c.ok ? [c.line] : []));
  const unavailable = checks.flatMap((c) => (c.ok ? [] : [c.error]));
  const subtotal = roundMoney(lines.reduce((sum, l) => sum + l.lineTotal, 0));
  return {
    lines,
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal,
    // Shipping and taxes are calculated by WooCommerce when the order is created.
    total: subtotal,
    currency: currency.code,
    unavailable,
  };
}
