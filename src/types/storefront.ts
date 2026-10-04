import type { WCStockStatus } from "./woocommerce";

/** A cart line as persisted in the cookie. Only ids + quantity — never prices. */
export interface CartLine {
  productId: number;
  variationId: number;
  quantity: number;
}

/** A cart line priced from live WooCommerce data. */
export interface PricedCartLine extends CartLine {
  name: string;
  slug: string;
  image: string | null;
  variationLabel: string | null;
  unitPrice: number;
  lineTotal: number;
  stockStatus: WCStockStatus;
  maxQuantity: number | null;
}

export interface CartSummary {
  lines: PricedCartLine[];
  itemCount: number;
  subtotal: number;
  total: number;
  currency: string;
}

/** Trimmed variation shape sent to the client-side selector. */
export interface VariationOption {
  id: number;
  sku: string;
  attributes: { name: string; option: string }[];
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  inStock: boolean;
  purchasable: boolean;
  maxQuantity: number | null;
}

export interface ShippingOption {
  id: string; // `${method_id}:${instance_id}`
  title: string;
  cost: number | null;
}

export type ActionState = { error?: string; ok?: boolean };
