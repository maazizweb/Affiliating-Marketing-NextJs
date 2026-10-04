import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { requireCustomerId } from "@/lib/auth/session";
import { getCustomer, getOrdersByCustomer } from "@/lib/woocommerce";
import { formatDate, formatPrice } from "@/utils/format";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountPage() {
  const id = await requireCustomerId();
  const [customer, orders] = await Promise.all([getCustomer(id), getOrdersByCustomer(id)]);

  return (
    <Container className="py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My account</h1>
          <p className="mt-1 text-neutral-600">
            {customer.first_name} {customer.last_name} · {customer.email}
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="secondary">Log out</Button>
        </form>
      </div>

      <h2 className="mb-4 text-xl font-semibold">Order history</h2>
      {orders.length === 0 ? (
        <p className="text-neutral-600">
          No orders yet. <Link href="/shop" className="underline">Start shopping</Link>
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Your orders</caption>
            <thead className="border-b border-neutral-200 text-neutral-500">
              <tr>
                <th scope="col" className="py-2 pr-4 font-medium">Order</th>
                <th scope="col" className="py-2 pr-4 font-medium">Date</th>
                <th scope="col" className="py-2 pr-4 font-medium">Status</th>
                <th scope="col" className="py-2 pr-4 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="py-3 pr-4">
                    <Link href={`/order/${o.id}?key=${encodeURIComponent(o.order_key)}`} className="underline">
                      #{o.number}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{formatDate(o.date_created)}</td>
                  <td className="py-3 pr-4 capitalize">{o.status.replace("-", " ")}</td>
                  <td className="py-3 pr-4">{formatPrice(o.total, o.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}
