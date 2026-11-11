/**
 * /nearby URL prefixes. India has none (existing indexed URLs stay as they are); every other
 * country lives under /nearby/{prefix}/… Must match guideCountryPrefix() in the backend.
 */
export const PREFIX_TO_COUNTRY: Record<string, string> = { ae: "AE", au: "AU", uk: "GB", np: "NP", bd: "BD", lk: "LK", sg: "SG", ie: "IE", nz: "NZ" };

export const isCountryPrefix = (s: string) => Object.hasOwn(PREFIX_TO_COUNTRY, s.toLowerCase());

/** Prefixes to try when an old unprefixed foreign URL (/nearby/dubai/…) is requested. */
export const COUNTRY_PREFIXES = Object.keys(PREFIX_TO_COUNTRY);

/** "AE" -> "ae/", "IN" -> "" (prepend to a city key). */
export const countryPrefixPath = (cc?: string | null) => {
  const c = (cc || "IN").toUpperCase();
  if (c === "IN") return "";
  const p = Object.keys(PREFIX_TO_COUNTRY).find((k) => PREFIX_TO_COUNTRY[k] === c);
  return p ? `${p}/` : "";
};

/** Country of a city key: "ae/dubai" -> "AE", "mumbai" -> "IN". */
export const countryOfKey = (cityKey: string) => {
  const i = cityKey.indexOf("/");
  return (i > 0 && PREFIX_TO_COUNTRY[cityKey.slice(0, i).toLowerCase()]) || "IN";
};
