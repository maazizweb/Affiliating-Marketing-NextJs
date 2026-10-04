import type { WCProduct } from "@/types/woocommerce";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, currency }: { products: WCProduct[]; currency: string }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} currency={currency} priority={i < 4} />
        </li>
      ))}
    </ul>
  );
}
