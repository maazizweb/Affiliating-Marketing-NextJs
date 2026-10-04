"use client";

import { useEffect, useSyncExternalStore } from "react";

const EVENT = "cart-change";

function readCount() {
  const match = document.cookie.match(/(?:^|; )cart_count=(\d+)/);
  return match ? Number(match[1]) : 0;
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

/** Item count from a plain cookie, so the header stays static (ISR-friendly) on every page. */
export function CartBadge() {
  const count = useSyncExternalStore(subscribe, readCount, () => 0);
  if (count === 0) return null;
  return (
    <span className="ml-1 rounded-full bg-neutral-900 px-1.5 py-0.5 text-xs text-white" aria-label={`${count} items`}>
      {count}
    </span>
  );
}

/** Render inside anything that mutates the cart so the badge refreshes. */
export function CartSync({ token }: { token: unknown }) {
  useEffect(() => {
    window.dispatchEvent(new Event(EVENT));
  }, [token]);
  return null;
}
