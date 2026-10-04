import "server-only";
import { WooCommerceError } from "./errors";

const BASE = process.env.WOOCOMMERCE_STORE_URL?.replace(/\/+$/, "");
const KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

type Params = Record<string, string | number | boolean | undefined>;

interface WooRequest {
  params?: Params;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Seconds. Omit (with no tags) for uncached, per-request data. */
  revalidate?: number;
  tags?: string[];
}

export interface WooResponse<T> {
  data: T;
  total: number;
  totalPages: number;
}

function config() {
  if (!BASE || !KEY || !SECRET) {
    throw new WooCommerceError(
      "WooCommerce is not configured. Set WOOCOMMERCE_STORE_URL, WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET.",
      500,
      "not_configured",
    );
  }
  return { base: BASE, key: KEY, secret: SECRET };
}

/**
 * The single place that talks HTTP to WooCommerce. Basic auth requires HTTPS on the store.
 * Everything else in the app goes through the typed services built on this.
 */
export async function wooRequest<T>(
  path: string,
  { params = {}, method = "GET", body, revalidate, tags }: WooRequest = {},
): Promise<WooResponse<T>> {
  const { base, key, secret } = config();
  const url = new URL(`${base}/wp-json/wc/v3${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }

  const cacheable = method === "GET" && (revalidate !== undefined || tags !== undefined);
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      ...(cacheable ? { next: { revalidate, tags } } : { cache: "no-store" as const }),
    });
  } catch (cause) {
    throw new WooCommerceError(
      `Could not reach WooCommerce: ${cause instanceof Error ? cause.message : "network error"}`,
      503,
      "network_error",
    );
  }

  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { code?: string; message?: string } | null;
    throw new WooCommerceError(err?.message ?? `WooCommerce responded ${res.status}`, res.status, err?.code);
  }

  return {
    data: (await res.json()) as T,
    total: Number(res.headers.get("x-wp-total") ?? 0),
    totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1),
  };
}

export const CACHE_SECONDS = 300;
