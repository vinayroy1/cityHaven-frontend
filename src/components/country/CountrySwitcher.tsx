"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { SearchableSelect } from "@/components/propertyListing/SearchableSelect";
import { COUNTRY_LIST } from "@/config/countries";
import { APP_CONFIG } from "@/constants/app-config";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { setSelectedCountry, useCountry } from "@/lib/country/countryStore";
import { cn } from "@/lib/utils";

/**
 * The one place a visitor changes the portal country (header + mobile menu).
 * Same searchable dropdown as the listing form. Logged-in users get it saved to their profile.
 */
export function CountrySwitcher({ className, compact = false }: { className?: string; compact?: boolean }) {
  const country = useCountry();

  const options = useMemo(
    () =>
      COUNTRY_LIST.map((c) => ({
        value: c.code,
        label: compact ? `${c.flag} ${c.code}` : `${c.flag} ${c.name}`,
        description: compact ? c.name : undefined,
      })),
    [compact],
  );

  const change = (code: string) => {
    if (!code || code === country.code) return;
    setSelectedCountry(code, "manual");
    try {
      // Background save to the profile: silent — the cookie already switched the site.
      const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
      if (token) {
        void fetch(API_ENDPOINTS.auth.profile, {
          method: "PUT",
          credentials: "include",
          headers: {
            "content-type": "application/json",
            ...(token !== "cookie-valid" ? { authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ countryCode: code }),
        })
          .then((res) => {
            // If the user's token is invalid or the user account was deleted/reset, clean up the stale token
            if (res.status === 401 || res.status === 404) {
              try {
                localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
                localStorage.removeItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
              } catch {}
            }
          })
          .catch(() => {});
      }
    } catch {
      /* ignore */
    }
  };

  // Header: a small flag pill backed by a native <select> (no search box, never truncates).
  if (compact) {
    return (
      <label
        className={cn(
          "relative inline-flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-full border border-slate-200 bg-white pl-2.5 pr-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
          className,
        )}
        title={`Country: ${country.name}`}
        data-testid="country-switcher"
      >
        <span aria-hidden>{country.flag}</span>
        <span>{country.code}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden />
        <select
          aria-label="Country"
          value={country.code}
          onChange={(e) => change(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {COUNTRY_LIST.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div className={cn("w-full", className)} data-testid="country-switcher">
      <SearchableSelect
        value={country.code /* "IN" on the server, real value after hydration */}
        onChange={change}
        options={options}
        placeholder="Country"
        searchPlaceholder="Search Country..."
        emptyMessage="No matching country found"
      />
    </div>
  );
}
