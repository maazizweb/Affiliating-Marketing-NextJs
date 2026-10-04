import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

/**
 * WooCommerce webhook receiver (WooCommerce → Settings → Advanced → Webhooks).
 * Create webhooks for product.created/updated/deleted and product_cat.* pointing here,
 * with WOOCOMMERCE_WEBHOOK_SECRET as the secret. The body is authenticated by HMAC-SHA256.
 */
export async function POST(request: Request) {
  const secret = process.env.WOOCOMMERCE_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "Webhook secret not configured" }, { status: 503 });

  const body = await request.text();
  const signature = request.headers.get("x-wc-webhook-signature") ?? "";
  const expected = createHmac("sha256", secret).update(body).digest("base64");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const topic = request.headers.get("x-wc-webhook-topic") ?? "";
  let id: number | undefined;
  try {
    id = (JSON.parse(body) as { id?: number }).id;
  } catch {
    // WooCommerce's initial "ping" is form-encoded; a valid signature is all it needs.
    return Response.json({ ok: true });
  }

  const tags = topic.startsWith("product_cat") ? ["categories"] : topic.startsWith("product") ? ["products", ...(id ? [`product:${id}`] : [])] : [];
  for (const tag of tags) revalidateTag(tag, "max");
  return Response.json({ ok: true, revalidated: tags });
}
