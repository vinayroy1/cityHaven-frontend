import React, { Suspense } from "react";
import type { Metadata } from "next";
import { PropertyListingFlow } from "@/components/propertyListing/PropertyListingFlow";
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
    <main className="relative min-h-screen bg-gradient-to-br from-rose-50/70 via-white to-emerald-50/50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(244,63,94,0.10),transparent_38%),radial-gradient(circle_at_92%_0%,rgba(16,185,129,0.10),transparent_34%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-slate-900">Post your property</h1>
          <p className="text-sm text-slate-500">Free listing · reach verified buyers and tenants.</p>
        </div>
        <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">Loading…</div>}>
          <PropertyListingFlow />
        </Suspense>
      </div>
      <Toaster richColors />
    </main>
  );
}
