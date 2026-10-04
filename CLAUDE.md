# Project guide (read this first)

## Working rules
- **Always use the Ponytail plugin / mode** on every task: lazy senior dev, minimal code, reuse before writing, stdlib/native before dependencies, no speculative abstractions. Mark deliberate shortcuts with `// ponytail:` comments. Stay in ponytail mode unless the user says "stop ponytail".
- Never print or commit secrets (`.env.local`, API keys, JWT key). Never use `NEXT_PUBLIC_*` for secrets.

## What this is
An **affiliate-marketing storefront**: a headless Next.js 16 site (App Router, TypeScript, Tailwind v4) that reads products from WordPress/WooCommerce. Products send visitors to Amazon via a **"Buy on Amazon" button**. Cart/checkout code exists but is unused by the affiliate product pages.

## Stack and flow
Next.js (Server Components) → `src/lib/woocommerce` + `src/lib/wordpress` (server-only) → WooCommerce REST API (`wc/v3`) → WordPress.
Components never call WooCommerce directly.

## Affiliate buttons
- Shown on **every** product (card in shop/category/search/home grids, and product page): `src/components/product/AffiliateButton.tsx`.
- Link = the product's **Product URL** if set (WordPress → Products → edit → Product data → *External/Affiliate product*), otherwise the **dummy link** `DUMMY_AFFILIATE_URL` in `src/utils/affiliate.ts` (currently `https://www.amazon.com/`). Replace the dummy before launch.
- Button text = the product's **Button text** field, else "Buy on Amazon".
- Links use `rel="sponsored nofollow noopener noreferrer"` and open in a new tab. An affiliate disclosure is in the footer and on product pages — keep it (Amazon Associates requires it). Check Amazon's rules before showing prices.

## Adding products (admin)
Do it in **WordPress admin → Products → Add New** (not in the frontend). Choose *External/Affiliate product*, paste the Amazon link, set button text, add image/category, Publish. It appears on the site within 5 minutes (cache), or instantly with the webhook below.

## Environment (`.env.local`, gitignored; template in `.env.example`)
`WOOCOMMERCE_STORE_URL` (HTTPS, no trailing slash), `WOOCOMMERCE_CONSUMER_KEY`, `WOOCOMMERCE_CONSUMER_SECRET`, optional `WOOCOMMERCE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME`.
Store: https://mediumspringgreen-wren-934001.hostingersite.com (Hostinger). Restart `npm run dev` after env changes.

## Caching
Catalog fetches revalidate every 5 min (`CACHE_SECONDS` in `src/lib/woocommerce/client.ts`); tags `products`, `product:<id>`, `categories`, `settings`. `/` and `/product/[slug]` are ISR. Instant refresh: WooCommerce webhooks (product created/updated/deleted) → `POST /api/revalidate`, signed with `WOOCOMMERCE_WEBHOOK_SECRET` (needs a public URL).

## Customer login (JWT)
Uses the WordPress plugin **JWT Authentication for WP REST API**. Needs `JWT_AUTH_SECRET_KEY` in `wp-config.php` (above "stop editing"). Token lives in an httpOnly cookie; user id is validated server-side via `/wp/v2/users/me`. If login succeeds but `users/me` returns 401, add the Authorization-header rewrite rules to `.htaccess` (see README). Login is **working** as of now.

## Layout
`src/app` routes · `src/actions` Server Actions (cart, checkout, auth) · `src/components` (ui, layout, product, cart, checkout, account) · `src/lib` (woocommerce, wordpress, auth, cart) · `src/types` · `src/utils`.

## Commands
`npm run dev` · `npm run build` · `npm start` · `npm run lint` · `npx tsc --noEmit` (run `npx next typegen` first if route types are stale).

## Notes / known gotchas
- `loading.tsx` only on shop and search (on 404-able routes it would return 200 before `notFound()`).
- Windows: no `pkill`/Python in the shell; use PowerShell `Stop-Process` and `node -e`.
- Unused-for-affiliate code (can be deleted if cart is never wanted): `ProductPurchase`, variation/quantity selectors, `AddToCartButton`, `src/actions/cart.ts`, `checkout.ts`, `src/lib/cart`, cart/checkout pages and the header Cart link.
