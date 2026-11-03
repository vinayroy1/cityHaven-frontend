"use client";
/**
 * City + locality pickers (same components as the property listing form: all cities, suggestions
 * on focus, infinite scroll). Picking a locality opens /nearby/{slug}.
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const hero = variant === "hero";

  return (
    <div
      className={
        bare
          ? "grid gap-2.5 p-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:p-2"
          : stacked
          ? "grid gap-2.5"
          : `grid gap-2.5 rounded-2xl p-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:p-4 ${
              hero
                ? "bg-white/95 shadow-xl shadow-emerald-900/20 dark:bg-slate-900/95"
                : "border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            }`
      }
    >
      <div>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">City</p>
        <PropertyListingCitySelector
          value={city}
          selectedState={state}
          placeholder="Select city"
          onChange={(c) => {
            setCity(c.name);
            setState(c.state);
          }}
        />
      </div>
      <div>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Locality</p>
        <PropertyListingLocalitySelector
          key={city}
          value=""
          cityName={city}
          selectedState={state}
          placeholder={city ? `Search localities in ${city}` : undefined}
          onChange={(loc) => {
            if (!loc.name) return;
            if (loc.slug) router.push(`/nearby/${encodeURIComponent(loc.slug)}`);
            else router.push(`/nearby/find?locality=${encodeURIComponent(loc.name)}&city=${encodeURIComponent(city)}`);
          }}
        />
      </div>
    </div>
  );
}
