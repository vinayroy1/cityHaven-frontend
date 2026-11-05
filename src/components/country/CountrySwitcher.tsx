"use client";

import { useMemo } from "react";
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

  return (
    <div className={cn(compact ? "w-[112px]" : "w-full", className)} data-testid="country-switcher">
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
