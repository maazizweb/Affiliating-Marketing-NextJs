"use server";

import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { readCart, writeCart } from "@/lib/cart/cookie";
import { priceLine } from "@/lib/cart/summary";
import {
  createOrder,
  getPaymentGateways,
  getShippingOptions,
  OFFLINE_GATEWAYS,
  WooCommerceError,
} from "@/lib/woocommerce";
import type { ActionState, ShippingOption } from "@/types/storefront";
import type { WCAddress } from "@/types/woocommerce";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const COUNTRY = /^[A-Z]{2}$/;

/** Called from the checkout form when the destination country changes. */
export async function fetchShippingOptions(country: string): Promise<ShippingOption[]> {
  if (!COUNTRY.test(country)) return [];
  return getShippingOptions(country);
}

function readAddress(fd: FormData, prefix: "billing" | "shipping"): WCAddress {
  const f = (k: string) => text(fd, `${prefix}_${k}`);
  return {
    first_name: f("first_name"),
    last_name: f("last_name"),
    address_1: f("address_1"),
    address_2: f("address_2"),
    city: f("city"),
    state: f("state"),
    postcode: f("postcode"),
    country: f("country"),
    ...(prefix === "billing" ? { email: f("email"), phone: f("phone") } : {}),
  };
}

function addressError(a: WCAddress): string | null {
  if (!a.first_name || !a.last_name || !a.address_1 || !a.city || !a.postcode) return "Please complete all required address fields.";
  if (!COUNTRY.test(a.country)) return "Please choose a country.";
  return null;
}

export async function placeOrder(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const lines = await readCart();
  if (lines.length === 0) return { error: "Your cart is empty." };

  const billing = readAddress(fd, "billing");
  const shipping = fd.get("shipToDifferent") === "on" ? readAddress(fd, "shipping") : { ...billing };
  delete shipping.email;
  delete shipping.phone;

  const problem = addressError(billing) ?? addressError(shipping);
  if (problem) return { error: problem };
  if (!/^\S+@\S+\.\S+$/.test(billing.email ?? "")) return { error: "Please enter a valid email address." };

  let orderId: number;
  let key: string;
  let paymentUrl: string | null = null;
  try {
    // Re-validate everything server-side: stock, variations and prices come from WooCommerce, not the browser.
    const checks = await Promise.all(lines.map(priceLine));
    const bad = checks.find((c) => !c.ok);
    if (bad && !bad.ok) return { error: bad.error };

    const [gateways, shippingOptions] = await Promise.all([getPaymentGateways(), getShippingOptions(shipping.country)]);
    const gateway = gateways.find((g) => g.id === text(fd, "paymentMethod"));
    if (!gateway) return { error: "Please choose a payment method." };

    const method = shippingOptions.find((o) => o.id === text(fd, "shippingMethod"));
    if (shippingOptions.length > 0 && !method) return { error: "Please choose a shipping method." };

    const order = await createOrder({
      customerId: (await getSessionUserId()) ?? undefined,
      paymentMethod: gateway.id,
      paymentMethodTitle: gateway.title,
      billing,
      shipping,
      lineItems: lines,
      shippingLine: method
        ? { methodId: method.id.split(":")[0], instanceId: method.id.split(":")[1], title: method.title }
        : null,
      customerNote: text(fd, "note") || undefined,
    });
    orderId = order.id;
    key = order.order_key;
    if (!OFFLINE_GATEWAYS.includes(gateway.id)) paymentUrl = order.payment_url;
  } catch (e) {
    if (e instanceof WooCommerceError) {
      return { error: `We couldn't place your order: ${e.message}` };
    }
    throw e;
  }

  await writeCart([]);
  // Online gateways (Stripe, PayPal, …) complete payment on WooCommerce's hosted pay-for-order page.
  redirect(paymentUrl ?? `/order/${orderId}?key=${encodeURIComponent(key)}`);
}
