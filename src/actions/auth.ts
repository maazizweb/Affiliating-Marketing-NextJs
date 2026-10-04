"use server";

import { redirect } from "next/navigation";
import { clearSession, setSession } from "@/lib/auth/session";
import { createCustomer, WooCommerceError } from "@/lib/woocommerce";
import { AuthError, requestToken } from "@/lib/wordpress/auth";
import type { ActionState } from "@/types/storefront";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

/** Only same-site paths, to avoid open redirects. */
function safeNext(fd: FormData) {
  const next = text(fd, "next");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

export async function login(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const username = text(fd, "username");
  const password = String(fd.get("password") ?? "");
  if (!username || !password) return { error: "Enter your email and password." };

  try {
    await setSession(await requestToken(username, password));
  } catch (e) {
    if (e instanceof AuthError) return { error: e.message };
    throw e;
  }
  redirect(safeNext(fd));
}

export async function register(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = text(fd, "email");
  const password = String(fd.get("password") ?? "");
  const first_name = text(fd, "first_name");
  const last_name = text(fd, "last_name");

  if (!first_name || !last_name || !/^\S+@\S+\.\S+$/.test(email)) return { error: "Fill in your name and a valid email." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  try {
    await createCustomer({ email, password, first_name, last_name });
  } catch (e) {
    if (e instanceof WooCommerceError) {
      return { error: e.code === "registration-error-email-exists" ? "An account with this email already exists." : e.message };
    }
    throw e;
  }

  try {
    await setSession(await requestToken(email, password));
  } catch {
    redirect("/login"); // account exists; sign-in is unavailable (e.g. JWT plugin missing)
  }
  redirect("/account");
}

export async function logout() {
  await clearSession();
  redirect("/");
}
