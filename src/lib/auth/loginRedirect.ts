/**
 * Keep the visitor's place across login / signup.
 *
 * `loginUrlForCurrentPage()` builds `/login?redirect=<current path>` so a session that expires on,
 * say, /dashboard/interior-profile comes back there after signing in or registering.
 * `safeRedirectPath()` only accepts same-site paths, so `?redirect=` can't be abused as an open redirect.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = "/"): string {
  if (!value) return fallback;
  const v = value.trim();
  // Same-site absolute path only: "/x" yes; "//evil.com", "/\\evil.com", "https://…" no.
  if (!v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return fallback;
  if (v === "/login" || v.startsWith("/login?") || v.startsWith("/signup")) return fallback;
  return v;
}

export function loginUrlForCurrentPage(): string {
  if (typeof window === "undefined") return "/login";
  const here = window.location.pathname + window.location.search;
  const target = safeRedirectPath(here, "");
  return target ? `/login?redirect=${encodeURIComponent(target)}` : "/login";
}
