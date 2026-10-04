"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addToCart } from "@/actions/cart";
import { CartSync } from "@/components/cart/CartBadge";
import { Button } from "@/components/ui/Button";
import type { ActionState } from "@/types/storefront";

export function AddToCartButton({
  productId,
  variationId,
  quantity,
  disabled,
  label = "Add to cart",
}: {
  productId: number;
  variationId: number;
  quantity: number;
  disabled?: boolean;
  label?: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addToCart, {});
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="variationId" value={variationId} />
      <input type="hidden" name="quantity" value={quantity} />
      <Button type="submit" disabled={disabled || pending} className="w-full sm:w-auto">
        {pending ? "Adding…" : label}
      </Button>
      <div aria-live="polite" className="text-sm">
        {state.error && <p className="text-red-700">{state.error}</p>}
        {state.ok && (
          <p className="text-green-700">
            Added to cart.{" "}
            <Link href="/cart" className="underline">
              View cart
            </Link>
          </p>
        )}
      </div>
      <CartSync token={state} />
    </form>
  );
}
