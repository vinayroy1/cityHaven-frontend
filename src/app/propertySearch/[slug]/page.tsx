import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildCanonical } from "@/constants/seo";
import { buildSearchHref, parseSearchParams } from "@/components/search/searchQuery";
import { toInternalApiUrl } from "@/lib/api/internalApi";
import { SearchPageClient } from "../SearchPageClient";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Normalize API URL to avoid /api/api
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const API_BASE = rawApiUrl.replace(/\/api$/, "");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const endpoint = toInternalApiUrl(
      `${API_BASE}/api/v1/propertyListing/resolve-seo-slug?slug=${encodeURIComponent(slug)}`
    );
    const res = await fetch(endpoint, { next: { revalidate: 120 } });
    const json = await res.json();
    if (json.isSearchSlug && json.seo) {
      const resolvedParams = new URLSearchParams();
      if (json.filters?.cityName) resolvedParams.set("city", json.filters.cityName);
      if (json.filters?.locality) resolvedParams.append("locality", json.filters.locality);
      if (json.filters?.listingType) resolvedParams.set("listingType", json.filters.listingType);
      const canonicalPath = buildSearchHref(parseSearchParams(resolvedParams));
      return {
        title: json.seo.title,
        description: json.seo.metaDescription,
        keywords: json.seo.keywords,
        alternates: { canonical: buildCanonical(canonicalPath) },
        openGraph: {
          title: json.seo.title,
          description: json.seo.metaDescription,
          url: buildCanonical(canonicalPath),
          type: "website",
          siteName: "Awasio",
        },
      };
    }
  } catch (err) {
    // fallback
  }

  const cleanTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${cleanTitle} | Verified Listings - Awasio`,
    description: `Explore verified properties for ${cleanTitle} on Awasio.`,
  };
}

export default async function PropertySearchSlugPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;

  // Resolve filters from backend
  try {
    const endpoint = toInternalApiUrl(
      `${API_BASE}/api/v1/propertyListing/resolve-seo-slug?slug=${encodeURIComponent(slug)}`
    );
    const res = await fetch(endpoint, { next: { revalidate: 120 } });
    const json = await res.json();

    if (json.isSearchSlug && json.filters) {
      const searchParamsObj = new URLSearchParams();

      if (json.filters.cityName) {
        searchParamsObj.set("cityName", json.filters.cityName);
      }
      if (json.filters.locality) {
        searchParamsObj.set("locality", json.filters.locality);
      }
      if (json.filters.listingType) {
        searchParamsObj.set(
          "intent",
          json.filters.listingType === "RENT" ? "rent" : "buy"
        );
      }
      if (json.filters.bedrooms && json.filters.bedrooms.length > 0) {
        searchParamsObj.set("bedrooms", String(json.filters.bedrooms[0]));
      }

      // Carry over any extra search params passed in query
      for (const [key, value] of Object.entries(query)) {
        if (value && typeof value === "string") {
          searchParamsObj.set(key, value);
        }
      }

      redirect(buildSearchHref(parseSearchParams(searchParamsObj)));
    }
  } catch (err: any) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
  }

  // Fallback to local intent parser if backend fails or doesn't return filters
  const { extractSlotsFromQuery } = await import("@/lib/search/intentParser");
  const textQuery = slug.replace(/-/g, " ");
  const slots = extractSlotsFromQuery(textQuery);
  
  if (slots.hasExtractedFilters) {
    const searchParamsObj = new URLSearchParams();
    
    if (slots.intent) {
      searchParamsObj.set("intent", slots.intent.toLowerCase());
    }
    if (slots.bedroomsMin) {
      searchParamsObj.set("bedroomsMin", String(slots.bedroomsMin));
      // Also set standard bedrooms parameter that the UI expects
      searchParamsObj.set("bedrooms", String(slots.bedroomsMin));
    }
    if (slots.subType) {
      searchParamsObj.set("subType", slots.subType);
    }
    
    // Carry over any extra search params
    for (const [key, value] of Object.entries(query)) {
      if (value && typeof value === "string" && !searchParamsObj.has(key)) {
        searchParamsObj.set(key, value);
      }
    }
    
    redirect(buildSearchHref(parseSearchParams(searchParamsObj)));
  }

  return <SearchPageClient />;
}
