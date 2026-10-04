"use server";

import { readCart, sameLine, writeCart } from "@/lib/cart/cookie";
import { priceLine } from "@/lib/cart/summary";
import { WooCommerceError } from "@/lib/woocommerce";
import { MAX_LINE_QUANTITY } from "@/utils/stock";
import type { ActionState, CartLine } from "@/types/storefront";

function lineFrom(fd: FormData): CartLine | null {
  const productId = Number(fd.get("productId"));
  const variationId = Number(fd.get("variationId") ?? 0);
  const quantity = Number(fd.get("quantity") ?? 1);
  if (![productId, variationId, quantity].every(Number.isInteger) || productId <= 0 || variationId < 0) return null;
  return { productId, variationId, quantity: Math.min(quantity, MAX_LINE_QUANTITY) };
}

export async function addToCart(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const input = lineFrom(fd);
  if (!input || input.quantity < 1) return { error: "Invalid product or quantity." };

  const cart = await readCart();
  const existing = cart.find((l) => sameLine(l, input));
  const next = { ...input, quantity: input.quantity + (existing?.quantity ?? 0) };

  try {
    const check = await priceLine(next);
    if (!check.ok) return { error: check.error };
  } catch (e) {
    if (e instanceof WooCommerceError) return { error: "We couldn't reach the store. Please try again." };
    throw e;
  }

  await writeCart(existing ? cart.map((l) => (sameLine(l, input) ? next : l)) : [...cart, next]);
  return { ok: true };
}

/** Sets a line's quantity (0 removes it), clamped to what's in stock. */
export async function updateCartLine(fd: FormData) {
  const input = lineFrom(fd);
  if (!input) return;
  const cart = await readCart();

  if (input.quantity <= 0) return writeCart(cart.filter((l) => !sameLine(l, input)));

  const check = await priceLine({ ...input, quantity: 1 });
  if (!check.ok) return;
  const quantity = Math.min(input.quantity, check.line.maxQuantity ?? MAX_LINE_QUANTITY);
  await writeCart(cart.map((l) => (sameLine(l, input) ? { ...l, quantity } : l)));
}

export async function removeCartLine(fd: FormData) {
  const input = lineFrom(fd);
  if (!input) return;
  await writeCart((await readCart()).filter((l) => !sameLine(l, input)));
}

export async function clearCart() {
  await writeCart([]);
}
