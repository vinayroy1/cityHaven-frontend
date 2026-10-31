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

const readable = (value?: string | null) =>
  value
    ? value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "";

const shortMoney = (value?: number | null) => {
  if (value == null || value <= 0) return "";
  if (value >= 10_000_000) return `Rs ${(value / 10_000_000).toFixed(value % 10_000_000 ? 1 : 0)} Cr`;
  if (value >= 100_000) return `Rs ${(value / 100_000).toFixed(value % 100_000 ? 1 : 0)} L`;
  return `Rs ${value.toLocaleString("en-IN")}`;
};

const decisionDetails = (item: PropertySearchItem): string[] => {
  const listingType = item.listingType?.toUpperCase();
  const subtype = (item.propertySubType?.slug || item.propertySubTypeSlug || "").toLowerCase();
  const isPlot = subtype.includes("plot-land") || item.propertyTypeSlug === "plot-land";
  const details: Array<string | null | undefined | false> = [];

  if (listingType === "PG") {
    details.push(
      item.sharingType && readable(item.sharingType),
      item.pgFor && `For ${readable(item.pgFor)}`,
      item.foodOption && readable(item.foodOption),
      item.availableBeds ? `${item.availableBeds} beds vacant` : item.totalRoomsAvailable ? `${item.totalRoomsAvailable} rooms vacant` : null,
    );
  } else if (isPlot) {
    details.push(
      area(item),
      item.plotLength && item.plotBreadth ? `${item.plotLength} × ${item.plotBreadth} ft` : null,
      item.propertyFacing && `${readable(item.propertyFacing)} facing`,
      item.openSides ? `${item.openSides} open sides` : null,
    );
  } else if (item.resCom === "COMMERCIAL") {
    details.push(
      area(item),
      item.maxNoOfSeats
        ? `${item.minNoOfSeats ? `${item.minNoOfSeats}–` : "Up to "}${item.maxNoOfSeats} seats`
        : null,
      item.shopFacadeSize ? `${item.shopFacadeSize} ${readable(item.shopFacadeSizeUnit || "ft")} frontage` : null,
      listingType === "RENT" && item.deposit ? `${shortMoney(item.deposit)} deposit` : null,
      item.officeType && readable(item.officeType),
      item.furnishing && readable(item.furnishing),
    );
  } else {
    details.push(
      item.bedrooms ? `${item.bedrooms} BHK` : null,
      area(item),
      listingType === "RENT" && item.deposit ? `${shortMoney(item.deposit)} deposit` : null,
      item.furnishing && readable(item.furnishing),
      item.floorNumber != null && item.floorNumber !== "" ? `Floor ${item.floorNumber}${item.totalFloors ? `/${item.totalFloors}` : ""}` : null,
    );
  }

  return details.filter((detail): detail is string => Boolean(detail) && detail !== "Area NA").slice(0, 3);
};

export const isFreshListing = (createdAt?: string) => {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return false;
  return Date.now() - created <= 1000 * 60 * 60 * 24 * 30;
};

const normalizeR2Url = (url?: string | null): string => {
  if (!url) return "";
  return url.replace(/^https:\/\/pub-47ad872a9b3848e190cdf10b7ad7a298\.r2\.dev\//i, "/r2-cdn/");
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
    decisionDetails: decisionDetails(item),
    isNew: isFreshListing(item.createdAt),
    isVerified: item.qcStatus === "APPROVED",
    isBoosted: item.isBoosted,
    boostTier: item.boostTier,
    posterBadge: postedAsLabel(item.postedAs),
    ownerId: item.ownerId ?? item.createdById ?? undefined,
    images: Array.from(
      new Set(
        [item.thumbnailUrl, ...(item.media?.map((m) => m.url) ?? [])]
          .filter((u): u is string => Boolean(u))
          .map(normalizeR2Url)
      )
    ),
  };
}
