"use client";

import { useActionState, useRef, useState } from "react";
import { fetchShippingOptions, placeOrder } from "@/actions/checkout";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Input";
import type { ActionState, PricedCartLine, ShippingOption } from "@/types/storefront";
import type { WCAddress, WCCountry } from "@/types/woocommerce";
import { formatPrice } from "@/utils/format";
import { AddressFields } from "./AddressFields";

interface Props {
  countries: WCCountry[];
  gateways: { id: string; title: string; description: string }[];
  lines: PricedCartLine[];
  subtotal: number;
  currency: string;
  defaults: { billing?: Partial<WCAddress>; shipping?: Partial<WCAddress> };
  initialShipping: ShippingOption[];
}

export function CheckoutForm({ countries, gateways, lines, subtotal, currency, defaults, initialShipping }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(placeOrder, {});
  const [shipToDifferent, setShipToDifferent] = useState(false);
  const [billingCountry, setBillingCountry] = useState(defaults.billing?.country ?? "");
  const [shippingCountry, setShippingCountry] = useState(defaults.shipping?.country ?? "");
  const [options, setOptions] = useState(initialShipping);
  const [selected, setSelected] = useState(initialShipping[0]?.id ?? "");
  const [shippingError, setShippingError] = useState<string | null>(null);
  const latest = useRef(0);

  const destination = shipToDifferent ? shippingCountry : billingCountry;
  const money = (n: number) => formatPrice(n, currency);
  const shippingCost = options.find((o) => o.id === selected)?.cost ?? 0;

  async function loadShipping(country: string) {
    const request = ++latest.current;
    setShippingError(null);
    try {
      const next = await fetchShippingOptions(country);
      if (request !== latest.current) return; // a newer country change superseded this one
      setOptions(next);
      setSelected(next[0]?.id ?? "");
    } catch {
      if (request !== latest.current) return;
      setOptions([]);
      setShippingError("We couldn't load shipping methods. Please try again.");
    }
  }

  const changeBilling = (country: string) => {
    setBillingCountry(country);
    if (!shipToDifferent) void loadShipping(country);
  };
  const changeShipping = (country: string) => {
    setShippingCountry(country);
    void loadShipping(country);
  };
  const toggleShipToDifferent = (on: boolean) => {
    setShipToDifferent(on);
    const country = on ? shippingCountry : billingCountry;
    if (country) void loadShipping(country);
  };

  const fieldset = "space-y-4 rounded-lg border border-neutral-200 p-5";
  const legend = "px-1 text-lg font-semibold";

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-6">
        <fieldset className={fieldset}>
          <legend className={legend}>Customer &amp; billing</legend>
          <AddressFields prefix="billing" countries={countries} defaults={defaults.billing} onCountryChange={changeBilling} withContact />
        </fieldset>

        <fieldset className={fieldset}>
          <legend className={legend}>Shipping address</legend>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="shipToDifferent" checked={shipToDifferent} onChange={(e) => toggleShipToDifferent(e.target.checked)} />
            Ship to a different address
          </label>
          {shipToDifferent && (
            <AddressFields prefix="shipping" countries={countries} defaults={defaults.shipping} onCountryChange={changeShipping} />
          )}
        </fieldset>

        <fieldset className={fieldset}>
          <legend className={legend}>Shipping method</legend>
          {!destination && <p className="text-sm text-neutral-600">Choose a country to see shipping methods.</p>}
          {shippingError && <p role="alert" className="text-sm text-red-700">{shippingError}</p>}
          {destination && !shippingError && options.length === 0 && (
            <p className="text-sm text-neutral-600">No shipping is required or available for this destination.</p>
          )}
          {options.map((o) => (
            <label key={o.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <input type="radio" name="shippingMethod" value={o.id} checked={selected === o.id} onChange={() => setSelected(o.id)} />
                {o.title}
              </span>
              <span>{o.cost === null ? "Calculated at order" : o.cost === 0 ? "Free" : money(o.cost)}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className={fieldset}>
          <legend className={legend}>Payment</legend>
          {gateways.length === 0 && <p className="text-sm text-red-700">No payment methods are available right now.</p>}
          {gateways.map((g, i) => (
            <label key={g.id} className="flex items-start gap-2 text-sm">
              <input type="radio" name="paymentMethod" value={g.id} defaultChecked={i === 0} required className="mt-1" />
              <span>
                <span className="font-medium">{g.title}</span>
                {g.description && <span className="block text-neutral-600">{g.description.replace(/<[^>]*>/g, "")}</span>}
              </span>
            </label>
          ))}
        </fieldset>

        <div>
          <label htmlFor="note" className="mb-1 block text-sm font-medium text-neutral-700">
            Order notes (optional)
          </label>
          <textarea id="note" name="note" rows={3} className={inputClass} />
        </div>
      </div>

      <aside className="h-fit space-y-4 rounded-lg bg-neutral-50 p-6">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <ul className="divide-y divide-neutral-200 text-sm">
          {lines.map((l) => (
            <li key={`${l.productId}-${l.variationId}`} className="flex justify-between gap-3 py-2">
              <span>
                {l.name}
                {l.variationLabel && <span className="text-neutral-500"> ({l.variationLabel})</span>} × {l.quantity}
              </span>
              <span>{money(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd>{options.length ? money(shippingCost) : "—"}</dd></div>
          <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold">
            <dt>Estimated total</dt><dd>{money(subtotal + shippingCost)}</dd>
          </div>
        </dl>
        <p className="text-xs text-neutral-500">Taxes and the final total are calculated by the store when the order is placed.</p>
        <div aria-live="polite">{state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}</div>
        <Button type="submit" disabled={pending || gateways.length === 0} className="w-full">
          {pending ? "Placing order…" : "Place order"}
        </Button>
      </aside>
    </form>
  );
}
