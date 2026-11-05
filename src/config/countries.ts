/**
 * Country registry — the single place that knows how a country formats money,
 * phone numbers and addresses. Adding a country = adding one entry here.
 *
 * Keep in sync with awasio-backend/src/config/countries.ts (same shape/values).
 * India ("IN") is the default everywhere, so existing data behaves exactly as before.
 */

export type CountryCode = "IN" | "NP" | "BD" | "LK";

export interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string;
  currency: string; // ISO 4217
  currencySymbol: string;
  /** Intl locale used for digit grouping (en-IN groups as 12,34,567). */
  locale: string;
  /** "lakh" = short prices as L / Cr, "million" = K / M. */
  bigNumbers: "lakh" | "million";
  phoneCode: string; // "+91"
  /** Local mobile number without country code or leading trunk 0. */
  phonePattern: RegExp;
  phoneExample: string;
  phoneDigits: number;
  timeZone: string;
  regionLabel: string; // State / Province / Division
  /** First-level regions for the listing form; India uses its own states list. */
  regions?: string[];
  postalLabel: string;
  postalPattern: RegExp;
  /** India-only RERA fields in the listing form. */
  hasRera: boolean;
  /** City pages fall back to when the visitor has not picked one. */
  defaultCity: string;
  /** Shown first in city pickers (India keeps its API-driven list). */
  popularCities: string[];
}

export const DEFAULT_COUNTRY: CountryCode = "IN";

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  IN: {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    currency: "INR",
    currencySymbol: "₹",
    locale: "en-IN",
    bigNumbers: "lakh",
    phoneCode: "+91",
    phonePattern: /^[6-9]\d{9}$/,
    phoneExample: "98765 43210",
    phoneDigits: 10,
    timeZone: "Asia/Kolkata",
    regionLabel: "State",
    postalLabel: "Pincode",
    postalPattern: /^\d{6}$/,
    hasRera: true,
    defaultCity: "New Delhi",
    popularCities: [],
  },
  NP: {
    code: "NP",
    name: "Nepal",
    flag: "🇳🇵",
    currency: "NPR",
    currencySymbol: "Rs.",
    locale: "en-IN",
    bigNumbers: "lakh",
    phoneCode: "+977",
    phonePattern: /^9[678]\d{8}$/,
    phoneExample: "98012 34567",
    phoneDigits: 10,
    timeZone: "Asia/Kathmandu",
    regionLabel: "Province",
    regions: ["Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"],
    postalLabel: "Postal code",
    postalPattern: /^\d{5}$/,
    hasRera: false,
    defaultCity: "Kathmandu",
    popularCities: ["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Biratnagar", "Bharatpur", "Butwal", "Birgunj"],
  },
  BD: {
    code: "BD",
    name: "Bangladesh",
    flag: "🇧🇩",
    currency: "BDT",
    currencySymbol: "৳",
    locale: "en-IN",
    bigNumbers: "lakh",
    phoneCode: "+880",
    phonePattern: /^1[3-9]\d{8}$/,
    phoneExample: "1712 345678",
    phoneDigits: 10,
    timeZone: "Asia/Dhaka",
    regionLabel: "Division",
    regions: [
      "Barishal Division", "Chattogram Division", "Dhaka Division", "Khulna Division",
      "Mymensingh Division", "Rajshahi Division", "Rangpur Division", "Sylhet Division",
    ],
    postalLabel: "Postal code",
    postalPattern: /^\d{4}$/,
    hasRera: false,
    defaultCity: "Dhaka",
    popularCities: ["Dhaka", "Chattogram", "Khulna", "Rajshahi", "Sylhet", "Gazipur", "Narayanganj", "Cumilla"],
  },
  LK: {
    code: "LK",
    name: "Sri Lanka",
    flag: "🇱🇰",
    currency: "LKR",
    currencySymbol: "Rs.",
    locale: "en-US",
    bigNumbers: "million",
    phoneCode: "+94",
    phonePattern: /^7\d{8}$/,
    phoneExample: "71 234 5678",
    phoneDigits: 9,
    timeZone: "Asia/Colombo",
    regionLabel: "Province",
    regions: [
      "Western Province", "Central Province", "Southern Province", "Northern Province", "Eastern Province",
      "North Western Province", "North Central Province", "Uva Province", "Sabaragamuwa Province",
    ],
    postalLabel: "Postal code",
    postalPattern: /^\d{5}$/,
    hasRera: false,
    defaultCity: "Colombo",
    popularCities: ["Colombo", "Negombo", "Kandy", "Galle", "Moratuwa", "Dehiwala-Mount Lavinia", "Jaffna", "Kurunegala"],
  },
};

export const COUNTRY_LIST: CountryConfig[] = Object.values(COUNTRIES);

const CURRENCY_TO_COUNTRY: Record<string, CountryCode> = Object.fromEntries(
  COUNTRY_LIST.map((c) => [c.currency, c.code]),
) as Record<string, CountryCode>;

export function isCountryCode(v: unknown): v is CountryCode {
  return typeof v === "string" && v.toUpperCase() in COUNTRIES;
}

/** Never throws: unknown / empty codes fall back to India. */
export function getCountry(code?: string | null): CountryConfig {
  const c = (code || "").toUpperCase();
  return COUNTRIES[c as CountryCode] ?? COUNTRIES[DEFAULT_COUNTRY];
}

export function countryForCurrency(currency?: string | null): CountryConfig {
  return getCountry(CURRENCY_TO_COUNTRY[(currency || "").toUpperCase()]);
}
