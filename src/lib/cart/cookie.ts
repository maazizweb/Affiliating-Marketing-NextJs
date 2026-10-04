import "server-only";
import { cookies } from "next/headers";
import type { CartLine } from "@/types/storefront";

const CART = "cart";
/** Plain (non-httpOnly) item count so the header badge never forces pages dynamic. Not sensitive. */
export const COUNT_COOKIE = "cart_count";
const MONTH = 60 * 60 * 24 * 30;

function isLine(v: unknown): v is CartLine {
  const l = v as CartLine;
  return (
    !!l &&
    Number.isInteger(l.productId) &&
    Number.isInteger(l.variationId) &&
    Number.isInteger(l.quantity) &&
    l.quantity > 0
  );
}

export async function readCart(): Promise<CartLine[]> {
  const raw = (await cookies()).get(CART)?.value;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isLine) : [];
  } catch {
    return [];
  }
}

export async function writeCart(lines: CartLine[]) {
  const store = await cookies();
  const base = { path: "/", sameSite: "lax" as const, maxAge: MONTH, secure: process.env.NODE_ENV === "production" };
  store.set(CART, JSON.stringify(lines), { ...base, httpOnly: true });
  store.set(COUNT_COOKIE, String(lines.reduce((n, l) => n + l.quantity, 0)), base);
}

export function sameLine(a: CartLine, b: CartLine) {
  return a.productId === b.productId && a.variationId === b.variationId;
}
