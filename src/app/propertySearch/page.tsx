import React from "react";
import type { Metadata } from "next";
import { buildCanonical } from "@/constants/seo";
import { SearchPageClient } from "./SearchPageClient";

export const metadata: Metadata = {
  title: "Search properties - Awasio",
  description: "Discover rental, PG, and sale listings by city and locality on Awasio.",
  alternates: { canonical: buildCanonical("/propertySearch") },
  openGraph: {
    title: "Search properties - Awasio",
    description: "Discover rental, PG, and sale listings by city and locality on Awasio.",
    url: buildCanonical("/propertySearch"),
    type: "website",
  },
};

export default function PropertySearchPage() {
  return <SearchPageClient />;
}
