import type { PropertySearchItem } from "@/types/propertySearch.types";
import type { ResultCardProps } from "./resultCardTypes";

const money = (value?: number | null, listingType?: string | null) => {
  if (value == null) return "Price on request";
  const suffix = listingType === "RENT" || listingType === "PG" ? "/month" : "";
  return `Rs ${value.toLocaleString("en-IN")}${suffix}`;
};

const area = (item: PropertySearchItem) => {
  const entries = [
    { label: "Plot", value: item.plotArea, unit: item.plotAreaUnit },
    { label: "Built-up", value: item.builtUpArea, unit: item.builtUpAreaUnit },
    { label: "Carpet", value: item.carpetArea, unit: item.carpetAreaUnit ?? item.areaUnit },
  ];
  const found = entries.find((entry) => entry.value != null && entry.value > 0);
  if (!found?.value) return "Area NA";
  const unit = (found.unit || "sq.ft").replace(/_/g, " ").toLowerCase();
  return `${found.label} ${found.value.toLocaleString("en-IN")} ${unit}`;
};

const postedAsLabel = (postedAs?: string | null) => {
  if (!postedAs) return "Listing";
  const normalized = postedAs.toUpperCase();
  if (normalized === "OWNER") return "Owner";
  if (normalized === "AGENT") return "Agent";
  if (normalized === "BUILDER") return "Builder";
  return postedAs[0] + postedAs.slice(1).toLowerCase();
};

export const isFreshListing = (createdAt?: string) => {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return false;
  return Date.now() - created <= 1000 * 60 * 60 * 24 * 30;
};

export function toResultCardProps(item: PropertySearchItem): ResultCardProps {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    subtitle: [item.locality, item.subLocality, item.cityName].filter(Boolean).join(" · "),
    price: money(item.price, item.listingType),
    area: area(item),
    owner: postedAsLabel(item.postedAs),
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    type: item.propertySubType?.name || item.propertySubTypeName || item.propertyType?.name || item.propertyTypeName,
    listingType: item.listingType,
    resCom: item.resCom,
    isNew: isFreshListing(item.createdAt),
    isVerified: item.qcStatus === "APPROVED",
    posterBadge: postedAsLabel(item.postedAs),
    ownerId: item.ownerId ?? item.createdById ?? undefined,
    images: [item.thumbnailUrl, ...(item.media?.map((m) => m.url) ?? [])].filter(Boolean) as string[],
  };
}
