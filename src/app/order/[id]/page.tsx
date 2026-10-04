import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getOrderWithKey, WooCommerceError } from "@/lib/woocommerce";
import type { WCAddress } from "@/types/woocommerce";
import { formatDate, formatPrice } from "@/utils/format";
import { first } from "@/utils/params";

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };

function Address({ title, a }: { title: string; a: WCAddress }) {
  return (
    <div>
      <h2 className="mb-2 font-semibold">{title}</h2>
      <address className="text-sm not-italic text-neutral-700">
        {a.first_name} {a.last_name}
        <br />
        {a.address_1} {a.address_2}
        <br />
        {a.city} {a.state} {a.postcode}
        <br />
        {a.country}
      </address>
    </div>
  );
}

export default async function OrderPage({ params, searchParams }: PageProps<"/order/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const key = first(sp.key);
  const orderId = Number(id);
  if (!key || !Number.isInteger(orderId)) notFound();

  let order;
  try {
    order = await getOrderWithKey(orderId, key);
  } catch (e) {
    if (e instanceof WooCommerceError && e.isNotFound) notFound();
    throw e;
  }
  const money = (v: string) => formatPrice(v, order.currency);

  return (
    <Container className="max-w-3xl py-10">
      <h1 className="text-3xl font-bold tracking-tight">Thank you for your order!</h1>
      <p className="mt-2 text-neutral-600">
        Order <strong>#{order.number}</strong> · {formatDate(order.date_created)} · <span className="capitalize">{order.status.replace("-", " ")}</span>
      </p>
      <p className="mt-1 text-sm text-neutral-600">A confirmation has been sent to {order.billing.email}.</p>

      <table className="mt-8 w-full text-sm">
        <caption className="sr-only">Items in your order</caption>
        <tbody className="divide-y divide-neutral-200 border-y border-neutral-200">
          {order.line_items.map((l) => (
            <tr key={l.id}>
              <td className="py-3">{l.name} × {l.quantity}</td>
              <td className="py-3 text-right">{money(l.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {order.shipping_lines.map((s) => (
            <tr key={s.id}>
              <td className="pt-3 text-neutral-600">{s.method_title}</td>
              <td className="pt-3 text-right">{money(s.total)}</td>
            </tr>
          ))}
          {Number(order.total_tax) > 0 && (
            <tr>
              <td className="pt-2 text-neutral-600">Tax</td>
              <td className="pt-2 text-right">{money(order.total_tax)}</td>
            </tr>
          )}
          <tr className="font-semibold">
            <td className="pt-3">Total ({order.payment_method_title})</td>
            <td className="pt-3 text-right">{money(order.total)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Address title="Billing address" a={order.billing} />
        <Address title="Shipping address" a={order.shipping} />
      </div>
      <ButtonLink href="/shop" className="mt-10">Continue shopping</ButtonLink>
    </Container>
  );
}
