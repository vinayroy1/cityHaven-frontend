import { DEFAULT_COUNTRY, isCountryCode, type CountryCode } from "@/config/countries";

/**
 * One URL rule for every directory (projects, interiors, construction, pandits, stays, flatmates):
 * India has no country segment (existing, indexed URLs stay as they are); every other country is
 * prefixed with its lowercase ISO code.
 *
 *   /interior-designers/mumbai/andheri        /interior-designers/ae/dubai/jvc
 *   /interior-designers/mumbai/<slug>         /interior-designers/ae/dubai/<slug>
 */

/** URL slug for a city / locality name: "New Delhi" -> "new-delhi". */
export const placeSlug = (name?: string | null) =>
  (name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** "ae" for a non-India country, null for India / unknown. */
export function countrySegment(countryCode?: string | null): string | null {
  const code = (countryCode || DEFAULT_COUNTRY).toUpperCase();
  return isCountryCode(code) && code !== DEFAULT_COUNTRY ? code.toLowerCase() : null;
}

/** Splits a leading non-India country code off the path segments (a lone segment is never a country). */
export function splitCountry(segments: string[]): { country: CountryCode | null; rest: string[] } {
  const first = segments[0]?.toUpperCase();
  if (segments.length > 1 && first && first.length === 2 && isCountryCode(first) && first !== DEFAULT_COUNTRY) {
    return { country: first, rest: segments.slice(1) };
  }
  return { country: null, rest: segments };
}

/** /base[/cc]/city[/locality]; just /base without a city. */
export function listingPath(base: string, city?: string | null, locality?: string | null, countryCode?: string | null): string {
  const parts = [placeSlug(city), city ? placeSlug(locality) : ""].filter(Boolean);
  if (!parts.length) return base;
  const cc = countrySegment(countryCode);
  return `${base}/${cc ? `${cc}/` : ""}${parts.join("/")}`;
}

/** /base[/cc]/city/slug (directories whose profile URLs carry the city). */
export function cityDetailPath(base: string, city: string | null | undefined, slug: string, countryCode?: string | null): string {
  const cc = countrySegment(countryCode);
  return `${base}/${cc ? `${cc}/` : ""}${placeSlug(city) || "india"}/${slug}`;
}

/** /base[/cc]/slug (listings whose slug already contains the place). */
export function flatDetailPath(base: string, slug: string, countryCode?: string | null): string {
  const cc = countrySegment(countryCode);
  return `${base}/${cc ? `${cc}/` : ""}${slug}`;
}

/** Title-case a URL slug when no better name is known: "new-delhi" -> "New Delhi". */
export const titleFromSlug = (slug: string) =>
  decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
