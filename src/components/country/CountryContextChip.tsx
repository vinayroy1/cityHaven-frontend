"use client";

import { Globe2 } from "lucide-react";
import { CountrySwitcher } from "@/components/country/CountrySwitcher";
import { useCountry } from "@/lib/country/countryStore";
import { cn } from "@/lib/utils";

/**
 * "Showing <what> in 🇳🇵 Nepal ▾" — tells visitors that a page follows the site country and lets them
 * change it right there. It drives the same site-wide setting as the header / Menu switcher (no
 * separate per-page country), so every page stays in sync.
 */
export function CountryContextChip({ what, className }: { what: string; className?: string }) {
  const country = useCountry();
  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white/90 py-1 pl-3 pr-1 text-xs text-slate-600 shadow-2xs backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300",
        className,
      )}
    >
      <Globe2 className="h-3.5 w-3.5 shrink-0 text-rose-600" aria-hidden />
      <span className="min-w-0 truncate">
        {what} in <span className="font-semibold text-slate-900 dark:text-white">{country.name}</span>
      </span>
      <CountrySwitcher compact className="h-7 pl-2 pr-1.5" />
    </div>
  );
}
