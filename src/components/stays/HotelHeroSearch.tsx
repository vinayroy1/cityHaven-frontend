"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { PropertyListingCitySelector } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector } from "@/components/propertyListing/PropertyListingLocalitySelector";
import { useCountry } from "@/lib/country/countryStore";

export function staysHref(city?: string, locality?: string) {
  const qs = new URLSearchParams();
  if (city) qs.set("city", city);
  if (city && locality) qs.set("locality", locality);
  const s = qs.toString();
  return `/stays${s ? `?${s}` : ""}`;
}

/**
 * Home "Hotels" tab: city + area, then opens the Stays search page.
 * Area appears once a city is picked; Search works with no city too (country-wide stays).
 */
export function HotelHeroSearch({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const country = useCountry();
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [going, setGoing] = useState(false);

  const go = () => {
    setGoing(true);
    router.push(staysHref(city, locality));
  };

  return (
    <div className={compact ? "space-y-2" : "flex flex-col gap-2.5 sm:flex-row sm:items-start"}>
      <div className={`min-w-0 ${compact ? "" : "sm:w-64 sm:shrink-0"}`}>
        <PropertyListingCitySelector
          value={city}
          countryCode={country.code}
          onChange={(c) => {
            setCity(c.name);
            setLocality("");
          }}
          placeholder="Which city?"
        />
      </div>
      {(city || !compact) && (
        <div className="min-w-0 sm:flex-1">
          <PropertyListingLocalitySelector
            value={locality}
            cityName={city}
            countryCode={country.code}
            onChange={(l) => setLocality(l.name)}
            placeholder={city ? `Area in ${city} (optional)` : "Pick a city first"}
          />
        </div>
      )}
      <button
        type="button"
        onClick={go}
        disabled={going}
        className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-rose-600 font-bold text-white shadow-xs transition hover:bg-rose-700 active:scale-[0.98] disabled:opacity-80 ${
          compact ? "h-11 w-full text-sm" : "h-11 px-6 text-sm sm:h-[46px]"
        }`}
        aria-label="Search hotels and stays"
      >
        {going ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        {city ? `Search stays in ${city}` : "Search hotels & stays"}
      </button>
    </div>
  );
}
