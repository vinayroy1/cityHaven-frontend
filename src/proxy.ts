import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listingPath } from "@/lib/seo/countryPath";

/**
 * Old query-string directory links (/interior-designers?city=Kochi&locality=Vyttila) move to the
 * path URL (/interior-designers/kochi/vyttila) with a real 308. The pages redirect too, but a section
 * with loading.tsx has already started streaming by then, so the browser only gets a meta refresh.
 * Other query parameters are kept; a wrong country for the city is fixed by the page itself.
 */
const SECTIONS = new Set(["/interior-designers", "/stays", "/agents"]);

const clean = (v: string | null) => {
  const t = v?.trim().slice(0, 80) ?? "";
  return t && /^[\p{L}\p{N} .'&-]+$/u.test(t) ? t : "";
};

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (!SECTIONS.has(pathname)) return NextResponse.next();
  const city = clean(searchParams.get("city"));
  if (!city || city === "All Cities") return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = listingPath(pathname, city, clean(searchParams.get("locality")) || null);
  url.searchParams.delete("city");
  url.searchParams.delete("locality");
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/interior-designers", "/stays", "/agents"],
};
