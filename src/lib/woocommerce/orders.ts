import "server-only";
import type { WCAddress, WCOrder } from "@/types/woocommerce";
import { wooRequest } from "./client";
import { WooCommerceError } from "./errors";

export interface CreateOrderInput {
  customerId?: number;
  paymentMethod: string;
  paymentMethodTitle: string;
  billing: WCAddress;
  shipping: WCAddress;
  lineItems: { productId: number; variationId: number; quantity: number }[];
  shippingLine: { methodId: string; instanceId: string; title: string } | null;
  customerNote?: string;
}

/** Offline gateways need no redirect: the order is complete from the storefront's point of view. */
export const OFFLINE_GATEWAYS = ["cod", "bacs", "cheque"];
const OFFLINE_STATUS: Record<string, string> = { cod: "processing", bacs: "on-hold", cheque: "on-hold" };

export async function createOrder(input: CreateOrderInput): Promise<WCOrder> {
  const { data } = await wooRequest<WCOrder>("/orders", {
    method: "POST",
    body: {
      customer_id: input.customerId ?? 0,
      payment_method: input.paymentMethod,
      payment_method_title: input.paymentMethodTitle,
      set_paid: false,
      status: OFFLINE_STATUS[input.paymentMethod] ?? "pending",
      billing: input.billing,
      shipping: input.shipping,
      customer_note: input.customerNote,
      line_items: input.lineItems.map((l) => ({
        product_id: l.productId,
        variation_id: l.variationId || undefined,
        quantity: l.quantity,
      })),
      shipping_lines: input.shippingLine
        ? [
            {
              method_id: input.shippingLine.methodId,
              instance_id: input.shippingLine.instanceId,
              method_title: input.shippingLine.title,
            },
          ]
        : [],
    },
  });
  return data;
}

export async function getOrder(id: number): Promise<WCOrder> {
  const { data } = await wooRequest<WCOrder>(`/orders/${id}`);
  return data;
}

/** Order ids are guessable, so confirmation pages must also present the order key. */
export async function getOrderWithKey(id: number, key: string): Promise<WCOrder> {
  const order = await getOrder(id);
  if (order.order_key !== key) throw new WooCommerceError("Order not found", 404, "invalid_order_key");
  return order;
}

export async function getOrdersByCustomer(customerId: number): Promise<WCOrder[]> {
  const { data } = await wooRequest<WCOrder[]>("/orders", {
    params: { customer: customerId, per_page: 50, orderby: "date", order: "desc" },
  });
  return data;
}
