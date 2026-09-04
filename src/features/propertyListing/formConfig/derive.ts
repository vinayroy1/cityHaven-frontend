// Small derivations from the form state: the "2 BHK" style configuration label
// and a suggested listing title.

import { PROPERTY_SUBTYPES } from "@/constants/backend-schema";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";

const subTypeName = (slug?: string) =>
  PROPERTY_SUBTYPES.find((s) => s.slug === slug)?.name ?? "Property";

/** e.g. "3 BHK", "Studio", "Plot", "Office". */
export function deriveConfiguration(v: PropertyListingFormValues): string {
  const slug = v.context.propertySubTypeSlug ?? "";
  if (slug.includes("plot-land")) return "Plot";
  if (slug === "1rk-studio-apartment") return "Studio";
  if (v.context.listingType === "PG") return v.details.sharingType ? `${v.details.sharingType} sharing` : "PG";
  if (v.context.resCom === "COMMERCIAL") return subTypeName(slug);
  const beds = v.details.bedrooms;
  return beds ? `${beds}${beds >= 6 ? "+" : ""} BHK` : subTypeName(slug);
}

const listingVerb: Record<string, string> = { SELL: "for Sale", RENT: "for Rent", PG: "PG" };

/** e.g. "3 BHK Apartment for Rent in Whitefield, Bengaluru". */
export function suggestTitle(v: PropertyListingFormValues): string {
  const config = deriveConfiguration(v);
  const name = subTypeName(v.context.propertySubTypeSlug);
  const verb = listingVerb[v.context.listingType] ?? "";
  const where = [v.location.locality, v.location.cityName].filter(Boolean).join(", ");
  // Don't repeat: a config that's already contained in the type name (Studio, Plot) stands alone.
  const head = !config || name.toLowerCase().includes(config.toLowerCase()) ? name : `${config} ${name}`;
  return [head, verb, where && `in ${where}`].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}
