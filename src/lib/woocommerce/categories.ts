import "server-only";
import { cache } from "react";
import type { WCCategory } from "@/types/woocommerce";
import { CACHE_SECONDS, wooRequest } from "./client";

export const getCategories = cache(async (): Promise<WCCategory[]> => {
  const { data } = await wooRequest<WCCategory[]>("/products/categories", {
    params: { per_page: 100, hide_empty: true, orderby: "name" },
    revalidate: CACHE_SECONDS * 2,
    tags: ["categories"],
  });
  // "Uncategorized" is WooCommerce's default bucket, not useful as navigation.
  return data.filter((c) => c.slug !== "uncategorized");
});

/** Returns null when the category does not exist. */
export const getCategoryBySlug = cache(async (slug: string): Promise<WCCategory | null> => {
  const { data } = await wooRequest<WCCategory[]>("/products/categories", {
    params: { slug },
    revalidate: CACHE_SECONDS * 2,
    tags: ["categories"],
  });
  return data[0] ?? null;
});
