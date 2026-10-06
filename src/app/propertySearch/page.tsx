import React from "react";
import type { Metadata } from "next";
import { buildCanonical } from "@/constants/seo";
import { SearchPageClient } from "./SearchPageClient";

type SearchProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Normalize API URL to avoid /api/api
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const API_BASE = rawApiUrl.replace(/\/api$/, "");

export async function generateMetadata({ searchParams }: SearchProps): Promise<Metadata> {
  const params = await searchParams;
  const rawCity = params.cityName || params.city;
  const city = Array.isArray(rawCity) ? rawCity[0] : rawCity;
  const locality = Array.isArray(params.locality) ? params.locality[0] : params.locality;
  const intent = Array.isArray(params.intent) ? params.intent[0] : params.intent; // buy, rent, pg, commercial

  const intentLabel =
    intent === "rent"
      ? "for Rent"
      : intent === "pg"
      ? "PG & Co-Living"
      : intent === "commercial"
      ? "Commercial Properties for Sale & Rent"
      : "for Sale & Rent";

  const locationLabel = locality && city ? `${locality}, ${city}` : city || locality || "India";

  // --- Fetch property count with 24-hour cache ---
  let countStr = "";
  try {
    const listingType = intent === "rent" ? "RENT" : intent === "pg" ? "PG" : "SELL";
    const backendUrl = new URL(`${API_BASE}/api/v1/propertyListing/search`);
    backendUrl.searchParams.set("pageSize", "1");
    backendUrl.searchParams.set("listingType", listingType);
    if (city) backendUrl.searchParams.set("cityName", city);
    if (locality) backendUrl.searchParams.set("locality", locality);

    const res = await fetch(backendUrl.toString(), {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (res.ok) {
      const responseData = await res.json();
      const count = responseData.data?.total || 0;
      if (count > 0) {
        // Format to nearest hundred for a cleaner SEO look if > 100
        countStr = count > 100 ? `${Math.floor(count / 100) * 100}+ ` : `${count} `;
      }
    }
  } catch (error) {
    // Fail silently, just won't show the count
  }
  // ------------------------------------------------

  const title = city || locality
    ? `${countStr}Properties in ${locationLabel} ${intentLabel} | Verified Listings - Awasio`
    : `Search ${countStr}Verified Properties ${intentLabel} Across India | Awasio`;

  const description =
    `Explore ${countStr || "verified "}apartments, builder floors, houses & commercial real estate ${intentLabel} in ${locationLabel}. Zero brokerage options, RERA certified advisors & transparent pricing on Awasio.`;

  const canonicalPath = city
    ? `/propertySearch?cityName=${encodeURIComponent(city)}`
    : "/propertySearch";

  return {
    title,
    description,
    alternates: { canonical: buildCanonical(canonicalPath) },
    openGraph: {
      title,
      description,
      url: buildCanonical(canonicalPath),
      type: "website",
      siteName: "Awasio",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function PropertySearchPage() {
  return <SearchPageClient />;
}

