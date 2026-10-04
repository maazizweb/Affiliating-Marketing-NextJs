import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getSessionUserId } from "@/lib/auth/session";
import { getCartSummary } from "@/lib/cart/summary";
import { getCountries, getCustomer, getPaymentGateways, getShippingOptions } from "@/lib/woocommerce";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const cart = await getCartSummary();
  if (cart.lines.length === 0) {
    return (
      <Container className="py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <ButtonLink href="/shop" className="mt-6">Continue shopping</ButtonLink>
      </Container>
    );
  }

  const userId = await getSessionUserId();
  const [countries, gateways, customer] = await Promise.all([
    getCountries(),
    getPaymentGateways(),
    userId ? getCustomer(userId) : null,
  ]);
  const defaults = { billing: customer?.billing, shipping: customer?.shipping };
  const initialCountry = customer?.billing.country;
  const initialShipping = initialCountry ? await getShippingOptions(initialCountry) : [];

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      {!customer && (
        <p className="mb-6 mt-2 text-sm text-neutral-600">
          Have an account?{" "}
          <Link href="/login?next=/checkout" className="underline">Log in</Link> to prefill your details. Guest checkout is also available.
        </p>
      )}
      {cart.unavailable.length > 0 && (
        <div role="alert" className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {cart.unavailable.join(" ")} Review your <Link href="/cart" className="underline">cart</Link> before continuing.
        </div>
      )}
      <CheckoutForm
        countries={countries}
        gateways={gateways.map((g) => ({ id: g.id, title: g.title, description: g.description }))}
        lines={cart.lines}
        subtotal={cart.subtotal}
        currency={cart.currency}
        defaults={defaults}
        initialShipping={initialShipping}
      />
    </Container>
  );
}
