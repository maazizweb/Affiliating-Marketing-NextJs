/** Parses WooCommerce's decimal price strings ("19.99", ""). */
export function toNumber(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : parseFloat(value ?? "");
  return Number.isFinite(n) ? n : 0;
}

export function formatPrice(value: string | number, currency: string): string {
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(toNumber(value));
}

/** Rounds to cents to avoid float noise in line totals. */
export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/** WooCommerce descriptions are HTML; metadata and JSON-LD need plain text. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#?\w+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Store";
