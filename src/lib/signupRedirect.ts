"use client";

import { useEffect, useRef } from "react";
import { APP_CONFIG } from "@/constants/app-config";

/** Query flag a listing page reads after signup / login to show the contact without another tap. */
export const AUTO_REVEAL_PARAM = "autoReveal";

const withAutoReveal = (path: string) => `${path}${path.includes("?") ? "&" : "?"}${AUTO_REVEAL_PARAM}=1`;

/**
 * Where "View contact" sends a visitor without a valid session. Most of them are new, so they land on the
 * signup form; it has an "Already have an account? Log in" switch for returning users.
 * `autoReveal`: the listing page opens the contact by itself when they come back (see useAutoRevealOnReturn).
 */
export const signupRedirectPath = (returnTo: string, opts: { autoReveal?: boolean } = {}) =>
  `/login?mode=signup&redirect=${encodeURIComponent(opts.autoReveal ? withAutoReveal(returnTo || "/") : returnTo || "/")}`;

/**
 * Runs `reveal` once when the page was opened with ?autoReveal=1 by a signed-in visitor, then drops the flag
 * from the address bar so a refresh or shared link doesn't repeat it. `onlyOnPath` limits it to the listing's
 * own page, so cards for other listings on the same page never fire.
 */
export function useAutoRevealOnReturn(reveal: () => unknown, opts: { onlyOnPath?: string; enabled?: boolean } = {}) {
  const done = useRef(false);
  const revealRef = useRef(reveal);
  useEffect(() => {
    revealRef.current = reveal;
  });
  const { onlyOnPath, enabled = true } = opts;

  useEffect(() => {
    if (done.current || !enabled || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get(AUTO_REVEAL_PARAM) !== "1") return;
    if (onlyOnPath && url.pathname !== onlyOnPath) return;
    if (!window.localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY)) return;
    done.current = true;
    url.searchParams.delete(AUTO_REVEAL_PARAM);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    void revealRef.current();
  }, [onlyOnPath, enabled]);
}
