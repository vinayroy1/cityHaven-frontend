"use client";

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import { getAuthToken } from "@/lib/auth/assistedSession";

const noop = () => () => {};

/**
 * Link into a listing flow that needs an account. Logged out: straight to login / signup with a redirect
 * back to the flow (no flash of the dashboard first). Logged in: directly to the flow.
 */
export function ListingCtaLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const loggedIn = useSyncExternalStore(noop, () => !!getAuthToken(), () => false);
  const target = loggedIn || !href.startsWith("/dashboard") ? href : `/login?redirect=${encodeURIComponent(href)}`;
  return (
    <Link href={target} className={className} rel="nofollow">
      {children}
    </Link>
  );
}
