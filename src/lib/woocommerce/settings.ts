import "server-only";
import { cache } from "react";
import type {
  WCCountry,
  WCCurrency,
  WCPaymentGateway,
  WCShippingMethod,
  WCShippingZone,
  WCShippingZoneLocation,
} from "@/types/woocommerce";
import type { ShippingOption } from "@/types/storefront";
import { wooRequest } from "./client";

const HOUR = 3600;

export const getCurrency = cache(async (): Promise<WCCurrency> => {
  const { data } = await wooRequest<WCCurrency>("/data/currencies/current", {
    revalidate: HOUR,
    tags: ["settings"],
  });
  return data;
});

export const getCountries = cache(async (): Promise<WCCountry[]> => {
  const { data } = await wooRequest<WCCountry[]>("/data/countries", {
    params: { _fields: "code,name" },
    revalidate: HOUR * 24,
    tags: ["settings"],
  });
  return data;
});

export async function getPaymentGateways(): Promise<WCPaymentGateway[]> {
  const { data } = await wooRequest<WCPaymentGateway[]>("/payment_gateways", {
    revalidate: HOUR,
    tags: ["settings"],
  });
  return data.filter((g) => g.enabled);
}

/**
 * Enabled shipping methods for a destination country: the first zone whose
 * locations match, otherwise the "Rest of the world" zone (id 0).
 * ponytail: matches zones by country only; state/postcode zones need extending.
 */
export async function getShippingOptions(country: string): Promise<ShippingOption[]> {
  const opts = { revalidate: HOUR, tags: ["settings"] };
  const { data: zones } = await wooRequest<WCShippingZone[]>("/shipping/zones", opts);

  let zoneId = 0;
  for (const zone of zones) {
    if (zone.id === 0) continue;
    const { data: locations } = await wooRequest<WCShippingZoneLocation[]>(
      `/shipping/zones/${zone.id}/locations`,
      opts,
    );
    if (locations.some((l) => l.type === "country" && l.code === country)) {
      zoneId = zone.id;
      break;
    }
  }

  const { data: methods } = await wooRequest<WCShippingMethod[]>(`/shipping/zones/${zoneId}/methods`, opts);
  return methods
    .filter((m) => m.enabled)
    .map((m) => {
      const cost = parseFloat(m.settings.cost?.value ?? "");
      return {
        id: `${m.method_id}:${m.instance_id}`,
        title: m.title,
        cost: m.method_id === "free_shipping" ? 0 : Number.isFinite(cost) ? cost : null,
      };
    });
}
