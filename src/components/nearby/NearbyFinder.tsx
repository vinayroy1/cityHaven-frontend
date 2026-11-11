"use client";
/**
 * City + locality pickers (same components as the property listing form: all cities, suggestions
 * on focus, infinite scroll). Picking a locality opens /nearby/{slug}.
 */
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { PropertyListingCitySelector } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector } from "@/components/propertyListing/PropertyListingLocalitySelector";
import { useCountryCode } from "@/lib/country/useCountry";
import { setSelectedCountry } from "@/lib/country/countryStore";
import { COUNTRY_LIST } from "@/config/countries";

export function NearbyFinder({
  defaultCity = "",
  variant = "light",
  stacked = false,
  bare = false,
  countryCode: propCountryCode,
}: {
  defaultCity?: string;
  variant?: "light" | "hero";
  /** Single column, no card chrome (for sidebars). */
  stacked?: boolean;
  /** Two columns on sm+, no card chrome (when the parent provides the card). */
  bare?: boolean;
  /** Optional override; defaults to active portal country. */
  countryCode?: string;
}) {
  const router = useRouter();
  const activeCountry = useCountryCode();
  // The page's country is the starting value; the dropdown below overrides it.
  const [chosen, setChosen] = useState<string | null>(null);
  const countryCode = chosen || propCountryCode || activeCountry || "IN";
  const [city, setCity] = useState(defaultCity);
  const [state, setState] = useState<string | undefined>(undefined);
  const [loc, setLoc] = useState<{ name: string; slug?: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const hero = variant === "hero";

  const go = () => {
    if (!city) return;
    // Suggestion slugs only match database slugs for India / South Asia; elsewhere resolve by name.
    const bySlug = loc?.slug && ["IN", "NP", "BD", "LK"].includes(countryCode);
    const target = loc?.name
      ? bySlug
        ? `/nearby/find?slug=${encodeURIComponent(loc.slug!)}`
        : `/nearby/find?locality=${encodeURIComponent(loc.name)}&city=${encodeURIComponent(city)}`
      : `/nearby/${cityPrefix(countryCode)}${cityUrlKey(city)}`;
    startTransition(() => router.push(target));
  };

  const changeCountry = (cc: string) => {
    setChosen(cc);
    setCity("");
    setState(undefined);
    setLoc(null);
    // Same choice as the header switcher; server-rendered parts (popular cards) follow along.
    setSelectedCountry(cc, "manual");
    router.refresh();
  };

  const countrySelect = (
    <div className="min-w-0">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Country</p>
      <div className="relative">
        <select
          aria-label="Country"
          value={countryCode}
          onChange={(e) => changeCountry(e.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-sm font-semibold text-slate-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {COUNTRY_LIST.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );

  const searchButton = (
    <button
      type="button"
      onClick={go}
      disabled={!city || pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 px-6 text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition hover:from-rose-700 hover:to-rose-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
      {loc?.name ? "Search" : city ? `Explore ${city}` : "Search"}
    </button>
  );

  return (
    <div
      className={
        bare
          ? "grid gap-2.5 p-1 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_minmax(0,3fr)_auto] sm:items-end sm:p-2"
          : stacked
          ? "grid gap-2.5"
          : `grid gap-2.5 rounded-2xl p-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_minmax(0,3fr)_auto] sm:items-end sm:p-4 ${
              hero
                ? "bg-white/95 shadow-xl shadow-rose-900/10 dark:bg-slate-900/95"
                : "border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            }`
      }
    >
      {countrySelect}
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">City</p>
        <PropertyListingCitySelector
          value={city}
          selectedState={state}
          countryCode={countryCode}
          placeholder="Select city"
          onChange={(c) => {
            setCity(c.name);
            setState(c.state);
            setLoc(null);
          }}
        />
      </div>
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Locality <span className="font-medium normal-case tracking-normal text-slate-400">(optional)</span>
        </p>
        <PropertyListingLocalitySelector
          key={`${countryCode}-${city}`}
          value={loc?.name ?? ""}
          cityName={city}
          selectedState={state}
          countryCode={countryCode}
          placeholder={city ? `Search localities in ${city}` : undefined}
          onChange={(l) => setLoc(l.name ? { name: l.name, slug: l.slug } : null)}
        />
      </div>
      {searchButton}
    </div>
  );
}

/** Same rule as the backend city key: slugified city name. */
function cityUrlKey(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "x"
  );
}

/** /nearby URL prefix of a country (India has none). Must match guideCountryPrefix() in the backend. */
function cityPrefix(cc: string) {
  const c = cc.toUpperCase();
  return c === "IN" ? "" : `${c === "GB" ? "uk" : c.toLowerCase()}/`;
}
