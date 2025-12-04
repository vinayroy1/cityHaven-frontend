import React from "react";
import type { Metadata } from "next";
import { PropertyListingFlow } from "@/components/propertyListing/flow/PropertyListingFlow";
import { Toaster } from "@/components/ui/sonner";
import { buildCanonical } from "@/constants/seo";

export const metadata: Metadata = {
  title: "Post your property - CityHaven",
  description: "List your property for rent or sale on CityHaven and reach verified buyers and tenants.",
  alternates: { canonical: buildCanonical("/propertyListing") },
  openGraph: {
    title: "Post your property - CityHaven",
    description: "List your property for rent or sale on CityHaven and reach verified buyers and tenants.",
    url: buildCanonical("/propertyListing"),
    type: "website",
  },
};

export default function PropertyListingPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-r from-rose-50 via-white to-indigo-50">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,rgba(244,63,94,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(79,70,229,0.12),transparent_28%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PropertyListingFlow />
      </div>
      <Toaster richColors />
    </main>
  );
}
