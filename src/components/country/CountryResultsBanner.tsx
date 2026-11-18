"use client";

import { useEffect } from "react";
import { getCountry } from "@/config/countries";
import { setSelectedCountry } from "@/lib/country/countryStore";
import { useCountryCode } from "@/lib/country/useCountry";

/**
 * Landing on a country-prefixed URL (/…/ae/dubai) selects that country for the site,
 * unless the visitor (or their profile) already chose one: an "auto" pick never overrides those.
 */
export function useUrlCountry(countryCode?: string | null) {
  useEffect(() => {
    if (countryCode) setSelectedCountry(countryCode, "auto");
  }, [countryCode]);
}

/**
 * Shown when the page's results are in another country than the site's selected one
 * (same banner as property search). `what` = "listings", "projects", "designers"…
 */
export function CountryResultsBanner({ countryCode, what, className = "" }: { countryCode?: string | null; what: string; className?: string }) {
  const portal = useCountryCode();
  if (!countryCode) return null;
  const results = getCountry(countryCode);
  if (results.code === portal) return null;
  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200 ${className}`}>
      <span>
        {results.flag} These {what} are in {results.name}. Prices are in {results.currency}.
      </span>
      <button
        type="button"
        onClick={() => setSelectedCountry(results.code, "manual")}
        className="rounded-full bg-sky-600 px-3 py-1 font-semibold text-white hover:bg-sky-700"
      >
        Switch site to {results.name}
      </button>
    </div>
  );
}
