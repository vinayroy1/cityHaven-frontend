"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_COUNTRY, getCountry, type CountryCode } from "@/config/countries";
import { EVENT, getSelectedCountry } from "./countryStore";

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

/** Selected country code; "IN" during server render. */
export function useCountryCode(): CountryCode {
  return useSyncExternalStore(subscribe, getSelectedCountry, () => DEFAULT_COUNTRY);
}

/** Full config of the selected country (currency, phone, capital…). */
export function useCountry() {
  return getCountry(useCountryCode());
}

