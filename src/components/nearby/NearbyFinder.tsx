"use client";
/**
 * City + locality pickers (same components as the property listing form: all cities, suggestions
 * on focus, infinite scroll). Picking a locality opens /nearby/{slug}.
 */
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { PropertyListingCitySelector } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector } from "@/components/propertyListing/PropertyListingLocalitySelector";

export function NearbyFinder({
  defaultCity = "",
  variant = "light",
  stacked = false,
  bare = false,
}: {
  defaultCity?: string;
  variant?: "light" | "hero";
  /** Single column, no card chrome (for sidebars). */
  stacked?: boolean;
  /** Two columns on sm+, no card chrome (when the parent provides the card). */
  bare?: boolean;
}) {
  const router = useRouter();
  const [city, setCity] = useState(defaultCity);
  const [state, setState] = useState<string | undefined>(undefined);
  const [loc, setLoc] = useState<{ name: string; slug?: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const hero = variant === "hero";

  const go = () => {
    if (!city) return;
    const target = loc?.name
      ? loc.slug
        ? `/nearby/find?slug=${encodeURIComponent(loc.slug)}`
        : `/nearby/find?locality=${encodeURIComponent(loc.name)}&city=${encodeURIComponent(city)}`
      : `/nearby/${cityUrlKey(city)}`;
    startTransition(() => router.push(target));
  };

  const searchButton = (
    <button
      type="button"
      onClick={go}
      disabled={!city || pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700 sm:w-auto"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
      {loc?.name ? "Search" : city ? `Explore ${city}` : "Search"}
    </button>
  );

  return (
    <div
      className={
        bare
          ? "grid gap-2.5 p-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] sm:items-end sm:p-2"
          : stacked
          ? "grid gap-2.5"
          : `grid gap-2.5 rounded-2xl p-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] sm:items-end sm:p-4 ${
              hero
                ? "bg-white/95 shadow-xl shadow-emerald-900/20 dark:bg-slate-900/95"
                : "border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            }`
      }
    >
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">City</p>
        <PropertyListingCitySelector
          value={city}
          selectedState={state}
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
          key={city}
          value={loc?.name ?? ""}
          cityName={city}
          selectedState={state}
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
