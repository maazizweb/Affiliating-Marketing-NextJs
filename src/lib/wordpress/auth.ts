import "server-only";

/**
 * WordPress side of customer authentication.
 *
 * WooCommerce's REST API only knows API keys, not shoppers. Browser-safe login needs the
 * "JWT Authentication for WP REST API" plugin (or compatible): POST credentials to the token
 * endpoint server-side, keep the token in an httpOnly cookie, and validate it on every request.
 */
const BASE = process.env.WOOCOMMERCE_STORE_URL?.replace(/\/+$/, "");

export class AuthError extends Error {}

function endpoint(path: string) {
  if (!BASE) throw new AuthError("WOOCOMMERCE_STORE_URL is not configured.");
  return `${BASE}/wp-json/${path}`;
}

export async function requestToken(username: string, password: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(endpoint("jwt-auth/v1/token"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
  } catch {
    throw new AuthError("Could not reach the store. Please try again.");
  }
  if (res.status === 404) throw new AuthError("Login is not available: the JWT authentication plugin is not installed.");
  if (!res.ok) throw new AuthError("Invalid email or password.");
  const { token } = (await res.json()) as { token?: string };
  if (!token) throw new AuthError("Login failed.");
  return token;
}

/** Validates the token with WordPress and returns the user id (== WooCommerce customer id), or null. */
export async function getUserIdFromToken(token: string): Promise<number | null> {
  try {
    const res = await fetch(endpoint("wp/v2/users/me?_fields=id"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return ((await res.json()) as { id: number }).id;
  } catch {
    return null;
  }
}
