import type { Metadata } from "next";
import { clearCart } from "@/actions/cart";
import { CartSync } from "@/components/cart/CartBadge";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Modal } from "@/components/ui/Modal";
import { getCartSummary } from "@/lib/cart/summary";
import { formatPrice } from "@/utils/format";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default async function CartPage() {
  const cart = await getCartSummary();
  const money = (n: number) => formatPrice(n, cart.currency);

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Your cart</h1>
      <CartSync token={cart.itemCount} />

      {cart.unavailable.length > 0 && (
        <div role="alert" className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Some items need your attention:</p>
          <ul className="mt-1 list-disc pl-5">
            {cart.unavailable.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {cart.lines.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-neutral-600">Your cart is empty.</p>
          <ButtonLink href="/shop" className="mt-4">
            Continue shopping
          </ButtonLink>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
            {cart.lines.map((line) => (
              <CartLineItem key={`${line.productId}-${line.variationId}`} line={line} currency={cart.currency} />
            ))}
          </ul>
          <aside className="h-fit space-y-4 rounded-lg bg-neutral-50 p-6">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal ({cart.itemCount} items)</dt>
                <dd>{money(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd>{money(cart.total)}</dd>
              </div>
            </dl>
            <p className="text-xs text-neutral-500">Shipping and taxes are calculated at checkout.</p>
            <ButtonLink href="/checkout" className="w-full">
              Checkout
            </ButtonLink>
            <Modal triggerLabel="Clear cart" title="Clear your cart?">
              <form action={clearCart}>
                <p className="mb-4 text-sm text-neutral-600">All items will be removed.</p>
                <Button type="submit">Yes, clear cart</Button>
              </form>
            </Modal>
          </aside>
        </div>
      )}
    </Container>
  );
}
