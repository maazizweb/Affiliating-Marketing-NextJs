# Headless WooCommerce Storefront

Next.js 16 (App Router, TypeScript, Tailwind CSS v4) in front of WordPress + WooCommerce.

```
Next.js (Server Components / Server Actions)
  → src/lib/woocommerce + src/lib/wordpress   (server-only service layer)
    → WooCommerce REST API (wc/v3) · WordPress REST API
```

Components never make HTTP calls to WooCommerce; they call typed service functions (`getProducts`, `getProductBySlug`, `createOrder`, …).

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

| Variable | Purpose |
| --- | --- |
| `WOOCOMMERCE_STORE_URL` | Store base URL, e.g. `https://shop.example.com` (**HTTPS required** – keys use Basic auth) |
| `WOOCOMMERCE_CONSUMER_KEY` / `_SECRET` | WooCommerce → Settings → Advanced → REST API → *Read/Write* key |
| `WOOCOMMERCE_WEBHOOK_SECRET` | Optional; secret for the cache-invalidation webhook |
| `NEXT_PUBLIC_SITE_URL` / `_NAME` | Public, non-secret: canonical URLs, Open Graph, JSON-LD |

The WooCommerce credentials are only read in `src/lib/woocommerce/client.ts`, which imports `server-only`: importing it from a Client Component fails the build. They are never `NEXT_PUBLIC_*`.

The store must be reachable when you run `next build` (the home page is prerendered).
Product images are served from the store host (allowed automatically in `next.config.ts`).

## Authentication architecture

WooCommerce's REST API authenticates *API clients* (consumer key/secret), not shoppers, so it has no browser-safe customer login. The design used here:

1. Install a JWT plugin on WordPress, e.g. **JWT Authentication for WP REST API**, and set `JWT_AUTH_SECRET_KEY` in `wp-config.php`.
2. `login` (Server Action) posts the credentials to `/wp-json/jwt-auth/v1/token` **from the server** and stores the token in an **httpOnly, SameSite=Lax, Secure (prod)** cookie. The browser JavaScript never sees it.
3. On each request the token is validated against WordPress (`/wp/v2/users/me`); that verified user id (= WooCommerce customer id) is the *only* source of the customer id used for orders and account data. Client input is never trusted for it.
4. Registration calls `POST /customers` using the server-side API keys, then signs the user in.

Not included (add for production): login rate-limiting / brute-force protection (e.g. on the WordPress side), password reset, email verification.

## Cart

WooCommerce's REST API has no cart, so the cart is an httpOnly cookie holding only `{productId, variationId, quantity}` (`src/lib/cart`). **Prices are never stored or trusted from the client** — every cart view and checkout re-prices lines from WooCommerce and re-validates stock/variations (`priceLine`). A separate plain `cart_count` cookie feeds the header badge so reading the cart doesn't make every page dynamic.

## Checkout

`placeOrder` (Server Action) re-validates the cart, shipping method and payment gateway, then creates the order via the API (WooCommerce computes tax/shipping/totals).

- Offline gateways (COD, BACS, cheque) → redirect to `/order/[id]?key=…` confirmation. The confirmation page requires the order key, since order ids are guessable.
- Any other gateway (Stripe, PayPal, …) → redirect to WooCommerce's hosted pay-for-order page (`payment_url`). Gateway plugins handle the payment there.
- Shipping zones are matched by country only (`getShippingOptions`).

## Caching

- Catalog fetches use `fetch` revalidation (5 min) with tags: `products`, `product:<id>`, `categories`, `settings`.
- `/` and `/product/[slug]` are ISR (`revalidate = 300`, generated on first request).
- Orders, customers, cart and auth are never cached.
- **Instant invalidation:** in WooCommerce → Settings → Advanced → Webhooks, create webhooks for *Product created/updated/deleted* and *Product category …* → `https://<your-site>/api/revalidate`, secret = `WOOCOMMERCE_WEBHOOK_SECRET`. Signatures are verified (HMAC-SHA256).

## Structure

```
src/
├── app/            routes, metadata, loading/error/not-found
├── actions/        Server Actions: cart, checkout, auth
├── components/     ui/ · layout/ · product/ · cart/ · checkout/ · account/
├── lib/
│   ├── woocommerce/  client + products, categories, orders, customers, settings
│   ├── wordpress/    JWT auth endpoints
│   ├── auth/         session cookie
│   └── cart/         cart cookie + pricing/validation
├── types/          WooCommerce + storefront types
└── utils/
```

Client Components are limited to: gallery, variation/quantity selectors, add-to-cart, checkout form, auth forms, modal, cart badge.
`loading.tsx` is used only on routes that can't 404 (shop, search); on others it would stream a 200 before `notFound()`.

## Known limits

- Cart/order totals before checkout are display-only; WooCommerce is authoritative. Product `price` is shown as stored (tax display follows your store's price settings only at order time).
- Grouped/external products are listed but can't be added to cart.
- Product descriptions are admin-authored HTML rendered as-is.
- No automated tests; verified with `tsc`, `eslint`, `next build`, and a smoke run against a mock WooCommerce API (not a real store).

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run lint`
