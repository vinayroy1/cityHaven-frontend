"use client";

import { useCallback, useState } from "react";
import { signupRedirectPath } from "@/lib/signupRedirect";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { APP_CONFIG } from "@/constants/app-config";
import { apiFetch } from "@/lib/api/query";

export type GatedContact = { phone: string | null; whatsapp: string | null; email: string | null };

function errorText(e: unknown): { message: string; unauthorized: boolean } {
  const raw = e instanceof Error ? e.message : String(e ?? "");
  try {
    const j = JSON.parse(raw) as { message?: string };
    return { message: j.message || "", unauthorized: /unauthori[sz]ed|log in|invalid token|expired/i.test(j.message || "") };
  } catch {
    return { message: "", unauthorized: /401|unauthori[sz]ed/i.test(raw) };
  }
}

/**
 * Contact details behind login, same rule as property / flatmate / interior / project contacts.
 * Public APIs only say whether a contact exists; `reveal()` POSTs to the listing's login-only reveal endpoint.
 * Logged-out (or expired) visitors are sent to signup (signupRedirectPath), which links to login.
 */
/** `returnTo`: where to come back after signup (the listing itself); defaults to the current page. */
export function useGatedContact(revealUrl: string | null, what = "the contact number", returnTo?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const [contact, setContact] = useState<GatedContact | null>(null);
  const [loading, setLoading] = useState(false);

  const toLogin = useCallback(() => {
    toast.info(`Sign up free to view ${what}`);
    // A given returnTo is the listing's own page: it opens the contact by itself on return.
    router.push(returnTo ? signupRedirectPath(returnTo, { autoReveal: true }) : signupRedirectPath(pathname || "/"));
  }, [router, pathname, what, returnTo]);

  const reveal = useCallback(async (): Promise<GatedContact | null> => {
    if (contact) return contact;
    if (!revealUrl) return null;
    const token = typeof window !== "undefined" ? window.localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null;
    if (!token) {
      toLogin();
      return null;
    }
    setLoading(true);
    try {
      const d = await apiFetch<Partial<GatedContact>>({ url: revealUrl, init: { method: "POST" } });
      const next: GatedContact = { phone: d.phone || null, whatsapp: d.whatsapp || d.phone || null, email: d.email || null };
      setContact(next);
      return next;
    } catch (e) {
      const { message, unauthorized } = errorText(e);
      if (unauthorized) toLogin();
      else toast.error(message || "Couldn't load the contact. Please send an enquiry instead.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [contact, revealUrl, toLogin]);

  return { contact, reveal, loading };
}

/** Open a tel: / wa.me link after an async reveal (popup blockers may refuse window.open after an await). */
export function openContactLink(href: string, newTab = false) {
  if (newTab) {
    const w = window.open(href, "_blank", "noopener,noreferrer");
    if (w) return;
  }
  window.location.href = href;
}
