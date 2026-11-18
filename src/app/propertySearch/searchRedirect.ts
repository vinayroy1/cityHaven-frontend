import {
  SEARCH_INTENT_SLUGS,
  buildSearchHref,
  fromSearchSlug,
  intentFromSearchSlug,
  parseSearchParams,
} from "@/components/search/searchQuery";
import { countrySegment, splitCountry } from "@/lib/seo/countryPath";

/**
 * Where a property-search URL must move to, or null when it is already canonical.
 * Pure (no Next APIs) so both src/proxy.ts (URLs with a query string) and the page (clean URLs)
 * use it; the page itself never reads the query string, which keeps it cacheable.
 */
export const CITY_ALIASES: Record<string, string> = { bangalore: "bengaluru", delhi: "new-delhi", gurgaon: "gurugram" };
const LEGACY_LOCATION_KEYS = ["city", "cityName", "locality", "localities", "loc", "intent"];

const locationPath = (segments: string[], country: string | null) =>
  [countrySegment(country), ...segments].filter(Boolean).join("/");

export function searchRedirect(intentSlug: string, rawSegments: string[], query: URLSearchParams): string | null {
  const { country, rest: segments } = splitCountry(rawSegments);
  const intent = intentFromSearchSlug(intentSlug);
  if (!intent) return null;
  const canonicalIntent = SEARCH_INTENT_SLUGS[intent];
  const citySlug = segments[0]?.toLowerCase();
  const canonicalCity = citySlug && CITY_ALIASES[citySlug];
  const carried = query.toString();
  const withQuery = (path: string, qs: string) => `${path}${qs ? `?${qs}` : ""}`;

  if (intentSlug !== canonicalIntent || canonicalCity) {
    const segs = canonicalCity ? [canonicalCity, ...segments.slice(1)] : segments;
    return withQuery(`/${canonicalIntent}${segs.length ? `/${locationPath(segs, country)}` : ""}`, carried);
  }

  if (!LEGACY_LOCATION_KEYS.some((key) => query.has(key))) return null;
  const urlParams = new URLSearchParams(query);
  if (segments[0] === "state" && segments[1]) {
    for (const key of LEGACY_LOCATION_KEYS) urlParams.delete(key);
    return withQuery(`/${canonicalIntent}/${locationPath(["state", segments[1]], country)}`, urlParams.toString());
  }
  const normalized = parseSearchParams(urlParams);
  normalized.intent = intent;
  const city = segments[0] ? fromSearchSlug(segments[0]) : undefined;
  const localities = segments.slice(1).map(fromSearchSlug).filter(Boolean).slice(0, 2);
  if (city) normalized.cityName = city;
  if (localities.length > 0) normalized.localities = localities.map((label) => ({ label, city }));
  return buildSearchHref(normalized, country);
}
