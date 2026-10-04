import "server-only";
import { cache } from "react";
import type { WCProduct, WCVariation } from "@/types/woocommerce";
import { CACHE_SECONDS, wooRequest } from "./client";

export interface ProductQuery {
  page?: number;
  perPage?: number;
  search?: string;
  category?: number;
  orderby?: "date" | "price" | "popularity" | "rating" | "title";
  order?: "asc" | "desc";
  featured?: boolean;
  onSale?: boolean;
  include?: number[];
}

export interface ProductList {
  products: WCProduct[];
  total: number;
  totalPages: number;
}

export async function getProducts(q: ProductQuery = {}): Promise<ProductList> {
  const { data, total, totalPages } = await wooRequest<WCProduct[]>("/products", {
    params: {
      status: "publish",
      page: q.page ?? 1,
      per_page: q.perPage ?? 12,
      search: q.search,
      category: q.category,
      orderby: q.orderby,
      order: q.order,
      featured: q.featured,
      on_sale: q.onSale,
      include: q.include?.join(","),
    },
    revalidate: CACHE_SECONDS,
    tags: ["products"],
  });
  return { products: data, total, totalPages };
}

export const getProduct = cache(async (id: number): Promise<WCProduct> => {
  const { data } = await wooRequest<WCProduct>(`/products/${id}`, {
    revalidate: CACHE_SECONDS,
    tags: ["products", `product:${id}`],
  });
  return data;
});

/** Returns null when no published product has this slug. */
export const getProductBySlug = cache(async (slug: string): Promise<WCProduct | null> => {
  const { data } = await wooRequest<WCProduct[]>("/products", {
    params: { slug, status: "publish" },
    revalidate: CACHE_SECONDS,
    tags: ["products"],
  });
  return data[0] ?? null;
});

export function getProductsByCategory(categoryId: number, q: Omit<ProductQuery, "category"> = {}) {
  return getProducts({ ...q, category: categoryId });
}

export const getVariations = cache(async (productId: number): Promise<WCVariation[]> => {
  const { data } = await wooRequest<WCVariation[]>(`/products/${productId}/variations`, {
    params: { per_page: 100 },
    revalidate: CACHE_SECONDS,
    tags: ["products", `product:${productId}`],
  });
  return data;
});

export const getVariation = cache(async (productId: number, variationId: number): Promise<WCVariation> => {
  const { data } = await wooRequest<WCVariation>(`/products/${productId}/variations/${variationId}`, {
    revalidate: CACHE_SECONDS,
    tags: ["products", `product:${productId}`],
  });
  return data;
});
