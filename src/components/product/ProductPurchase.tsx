"use client";

import { useState } from "react";
import type { VariationOption } from "@/types/storefront";
import { findVariation, stockLabel } from "@/utils/product";
import { MAX_LINE_QUANTITY } from "@/utils/stock";
import { AddToCartButton } from "./AddToCartButton";
import { ProductPrice } from "./ProductPrice";
import { ProductQuantitySelector } from "./ProductQuantitySelector";
import { ProductVariationSelector } from "./ProductVariationSelector";

interface Props {
  productId: number;
  currency: string;
  price: { price: string; regularPrice: string; onSale: boolean };
  stock: { status: "instock" | "outofstock" | "onbackorder"; purchasable: boolean; maxQuantity: number | null };
  attributes: { name: string; options: string[] }[];
  variations: VariationOption[];
}

/** The only interactive part of the product page: option selection, quantity and add-to-cart. */
export function ProductPurchase({ productId, currency, price, stock, attributes, variations }: Props) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const isVariable = variations.length > 0;
  const allChosen = attributes.every((a) => selected[a.name]);
  const variation = isVariable && allChosen ? findVariation(variations, selected) : undefined;

  const current = variation
    ? {
        price: variation.price,
        regularPrice: variation.regularPrice,
        onSale: variation.onSale,
        available: variation.inStock && variation.purchasable,
        max: variation.maxQuantity,
        status: variation.inStock ? ("instock" as const) : ("outofstock" as const),
      }
    : {
        ...price,
        available: stock.status !== "outofstock" && stock.purchasable,
        max: stock.maxQuantity,
        status: stock.status,
      };

  const needsSelection = isVariable && !variation;
  const message = !isVariable || variation
    ? stockLabel(current.status, current.max)
    : allChosen
      ? "This combination is unavailable."
      : "Choose your options.";
  const maxQty = Math.min(current.max ?? MAX_LINE_QUANTITY, MAX_LINE_QUANTITY);
  const canBuy = !needsSelection && current.available && maxQty >= 1;

  return (
    <div className="space-y-5">
      <ProductPrice
        className="text-2xl"
        price={current.price}
        regularPrice={current.regularPrice}
        onSale={current.onSale}
        currency={currency}
        prefix={needsSelection ? "From" : undefined}
      />
      {isVariable && (
        <ProductVariationSelector
          attributes={attributes}
          selected={selected}
          onChange={(name, option) => {
            setSelected((s) => ({ ...s, [name]: option }));
            setQuantity(1);
          }}
        />
      )}
      <p aria-live="polite" className={`text-sm ${canBuy ? "text-green-700" : "text-neutral-600"}`}>
        {message}
      </p>
      <div className="flex flex-wrap items-start gap-4">
        <ProductQuantitySelector
          value={Math.min(quantity, maxQty)}
          onChange={setQuantity}
          max={Math.max(maxQty, 1)}
          disabled={!canBuy}
        />
        <AddToCartButton
          productId={productId}
          variationId={variation?.id ?? 0}
          quantity={Math.min(quantity, maxQty)}
          disabled={!canBuy}
          label={current.available || needsSelection ? "Add to cart" : "Out of stock"}
        />
      </div>
    </div>
  );
}
