/** Subset of WooCommerce REST API v3 response shapes used by the storefront. */

export interface WCImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WCCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  count: number;
  image: WCImage | null;
}

export interface WCTag {
  id: number;
  name: string;
  slug: string;
}

export interface WCProductAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export type WCStockStatus = "instock" | "outofstock" | "onbackorder";

export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: "simple" | "variable" | "grouped" | "external" | (string & {});
  status: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  stock_status: WCStockStatus;
  manage_stock: boolean;
  stock_quantity: number | null;
  backorders_allowed: boolean;
  average_rating: string;
  rating_count: number;
  categories: Pick<WCCategory, "id" | "name" | "slug">[];
  tags: WCTag[];
  images: WCImage[];
  attributes: WCProductAttribute[];
  variations: number[];
  external_url?: string;
  button_text?: string;
}

export interface WCVariationAttribute {
  id: number;
  name: string;
  /** Empty string means "any value". */
  option: string;
}

export interface WCVariation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  stock_status: WCStockStatus;
  manage_stock: boolean | "parent";
  stock_quantity: number | null;
  backorders_allowed: boolean;
  image: WCImage | null;
  attributes: WCVariationAttribute[];
}

export interface WCAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface WCOrderLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  subtotal: string;
  total: string;
  sku: string;
}

export interface WCOrder {
  id: number;
  order_key: string;
  number: string;
  status: string;
  currency: string;
  date_created: string;
  total: string;
  total_tax: string;
  shipping_total: string;
  discount_total: string;
  payment_method: string;
  payment_method_title: string;
  payment_url: string;
  customer_id: number;
  billing: WCAddress;
  shipping: WCAddress;
  line_items: WCOrderLineItem[];
  shipping_lines: { id: number; method_title: string; total: string }[];
}

export interface WCCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  billing: WCAddress;
  shipping: WCAddress;
}

export interface WCShippingZone {
  id: number;
  name: string;
}

export interface WCShippingZoneLocation {
  code: string;
  type: "postcode" | "state" | "country" | "continent";
}

export interface WCShippingMethod {
  id: number;
  instance_id: number;
  title: string;
  enabled: boolean;
  method_id: string;
  settings: Record<string, { value: string }>;
}

export interface WCPaymentGateway {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface WCCountry {
  code: string;
  name: string;
}

export interface WCCurrency {
  code: string;
  name: string;
  symbol: string;
}
