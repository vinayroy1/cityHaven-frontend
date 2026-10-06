import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildCanonical } from "@/constants/seo";
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
    const res = await fetch(
      `${API_BASE}/api/v1/propertyListing/resolve-seo-slug?slug=${encodeURIComponent(slug)}`,
      { next: { revalidate: 120 } }
    );
    const json = await res.json();
    if (json.isSearchSlug && json.seo) {
      return {
        title: json.seo.title,
        description: json.seo.metaDescription,
        keywords: json.seo.keywords,
        alternates: { canonical: buildCanonical(`/propertySearch/${slug}`) },
        openGraph: {
          title: json.seo.title,
          description: json.seo.metaDescription,
          url: buildCanonical(`/propertySearch/${slug}`),
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
    const res = await fetch(
      `${API_BASE}/api/v1/propertyListing/resolve-seo-slug?slug=${encodeURIComponent(slug)}`,
      { next: { revalidate: 120 } }
    );
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

      // Redirect to /propertySearch with pre-selected filters
      redirect(`/propertySearch?${searchParamsObj.toString()}`);
    }
  } catch (err: any) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
  }

  return <SearchPageClient />;
}
