import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserIdFromToken } from "@/lib/wordpress/auth";
import { getCustomer } from "@/lib/woocommerce";

const COOKIE = "wp_token";
const WEEK = 60 * 60 * 24 * 7;

export async function setSession(token: string) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: WEEK,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

/** The verified customer id, taken from the token — never from client input. */
export const getSessionUserId = cache(async (): Promise<number | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? getUserIdFromToken(token) : null;
});

export async function getCurrentCustomer() {
  const id = await getSessionUserId();
  return id ? getCustomer(id) : null;
}

export async function requireCustomerId(): Promise<number> {
  const id = await getSessionUserId();
  if (!id) redirect("/login");
  return id;
}
