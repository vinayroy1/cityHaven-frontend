import { DEFAULT_COUNTRY, getCountry, isCountryCode, type CountryCode } from "@/config/countries";

/**
 * Portal-wide selected country.
 *
 * Priority: manual choice > saved profile > browser/IP location > India.
 * Stored in a cookie (readable by the server later) and mirrored in memory; client components
 * read it through useCountry(). India is the server snapshot, so Indian visitors see no change at all.
 */

const COOKIE = "awasio_country";
const SOURCE_COOKIE = "awasio_country_src"; // "manual" | "profile" | "auto"
export const EVENT = "awasio-country-change";
const ONE_YEAR = 60 * 60 * 24 * 365;

export type CountrySource = "manual" | "profile" | "auto";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

let current: CountryCode | null = null;

export function getSelectedCountry(): CountryCode {
  if (current) return current;
  const v = readCookie(COOKIE)?.toUpperCase();
  current = isCountryCode(v) ? v : DEFAULT_COUNTRY;
  return current;
}

export function getCountrySource(): CountrySource | null {
  const v = readCookie(SOURCE_COOKIE);
  return v === "manual" || v === "profile" || v === "auto" ? v : null;
}

/** Has the visitor (or their profile) already decided? Auto-detection must not override that. */
export function hasCountryDecision(): boolean {
  const s = getCountrySource();
  return s === "manual" || s === "profile";
}

const RANK: Record<CountrySource, number> = { auto: 1, profile: 2, manual: 3 };

/**
 * Set the portal country. Lower-priority sources never override higher ones
 * (auto-detect can't undo a manual pick). Returns true when the country changed.
 */
export function setSelectedCountry(code: string, source: CountrySource): boolean {
  if (typeof document === "undefined" || !isCountryCode(code?.toUpperCase())) return false;
  const next = code.toUpperCase() as CountryCode;
  const prevSource = getCountrySource();
  if (prevSource && RANK[source] < RANK[prevSource]) return false;

  const prev = getSelectedCountry();
  writeCookie(COOKIE, next);
  writeCookie(SOURCE_COOKIE, source);
  current = next;
  if (prev !== next) {
    // The saved home city belongs to the old country — drop it so pages fall back to the new capital.
    try {
      localStorage.removeItem("awasio.home.city");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
  }
  return prev !== next;
}

// Re-export hooks from the client-only module so existing imports continue to work in Client Components
export { useCountry, useCountryCode } from "./useCountry";
