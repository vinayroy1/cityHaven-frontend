import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listingPath } from "@/lib/seo/countryPath";
import { searchRedirect } from "@/app/propertySearch/searchRedirect";

/**
 * Redirects that depend on the query string live here, so the pages themselves never read
 * searchParams and stay cacheable (ISR + Cloudflare). Both are real 308s that keep other params.
 *
 * 1. Old directory links (/interior-designers?city=Kochi&locality=Vyttila) move to the path URL
 *    (/interior-designers/kochi/vyttila). A wrong country for the city is fixed by the page itself.
 * 2. Property search (/buy, /rent, …) with old location params (?city=, ?locality=) or an alias in
 *    the path (/buy/gurgaon?priceMax=…) moves to the canonical URL with its filters kept.
 */
const SECTIONS = new Set(["/interior-designers", "/stays", "/agents"]);
const SEARCH_INTENTS = new Set(["buy", "rent", "pg", "commercial", "plot", "coworking-space"]);

const clean = (v: string | null) => {
  const t = v?.trim().slice(0, 80) ?? "";
  return t && /^[\p{L}\p{N} .'&-]+$/u.test(t) ? t : "";
};

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (SECTIONS.has(pathname)) {
    const city = clean(searchParams.get("city"));
    if (!city || city === "All Cities") return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = listingPath(pathname, city, clean(searchParams.get("locality")) || null);
    url.searchParams.delete("city");
    url.searchParams.delete("locality");
    return NextResponse.redirect(url, 308);
  }

  // Property search: only URLs with a real query string (not Next's own _rsc key) need this.
  const query = new URLSearchParams(searchParams);
  query.delete("_rsc");
  if (![...query.keys()].length) return NextResponse.next();
  const [intentSlug, ...segments] = pathname.split("/").filter(Boolean).map(decodeURIComponent);
  if (!intentSlug || !SEARCH_INTENTS.has(intentSlug.toLowerCase())) return NextResponse.next();
  let target: string | null = null;
  try {
    target = searchRedirect(intentSlug, segments, query);
  } catch {
    return NextResponse.next();
  }
  if (!target) return NextResponse.next();
  return NextResponse.redirect(new URL(target, request.url), 308);
}

export const config = {
  matcher: [
    "/interior-designers",
    "/stays",
    "/agents",
    "/(buy|rent|pg|commercial|plot|coworking-space)",
    "/(buy|rent|pg|commercial|plot|coworking-space)/:path*",
  ],
};
