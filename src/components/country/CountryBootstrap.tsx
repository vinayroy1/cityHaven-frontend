"use client";

import { useEffect, useState } from "react";
import { APP_CONFIG } from "@/constants/app-config";
import { useMeQuery } from "@/features/auth/api";
import { detectUserLocation } from "@/lib/geo/geoService";
import { splitStoredMobile } from "@/lib/money";
import { getCountrySource, hasCountryDecision, setSelectedCountry } from "@/lib/country/countryStore";

/**
 * Decides the portal country once per visit, without overriding a choice:
 *   manual pick (cookie)  >  saved profile country  >  GPS / IP location  >  India
 * Renders nothing.
 */
export function CountryBootstrap() {
  // Renders nothing, so reading storage during the first client render can't cause a hydration mismatch.
  const [authed] = useState(() => {
    try {
      return typeof window !== "undefined" && Boolean(localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY));
    } catch {
      return false;
    }
  });
  const { data: me } = useMeQuery(undefined, { skip: !authed });

  // Logged in: the account decides (unless the visitor picked a country by hand).
  //  1. a non-India profile country (saved from the switcher), else
  //  2. the country of the account mobile ("+977…" -> Nepal, bare 10 digits -> India).
  useEffect(() => {
    if (!me || getCountrySource() === "manual") return;
    const user = me;
    const profile = user.countryCode?.toUpperCase();
    const mobile = user.mobileNumber && !user.mobileNumber.startsWith("g_") ? splitStoredMobile(user.mobileNumber).countryCode : null;
    const code = profile && profile !== "IN" ? profile : mobile;
    if (code) setSelectedCountry(code, "profile");
  }, [me]);

  // Location: first visit only (or while still on an automatic guess).
  useEffect(() => {
    if (hasCountryDecision()) return;
    let cancelled = false;
    const apply = (country?: string) => {
      if (!cancelled && country && !hasCountryDecision()) setSelectedCountry(country, "auto");
    };
    void detectUserLocation().then((p) => apply(p?.country));
    // GPS results arrive later through geoService's event.
    const onGeo = (e: Event) => apply((e as CustomEvent<{ country?: string }>).detail?.country);
    window.addEventListener("awasio-geo-change", onGeo);
    return () => {
      cancelled = true;
      window.removeEventListener("awasio-geo-change", onGeo);
    };
  }, []);

  return null;
}
