import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonical, seoDefaults } from "@/constants/seo";

export const metadata: Metadata = {
  title: "Community forum | CityHaven",
  description: "Join the CityHaven community to swap tips, learn from other owners, and get help from our team.",
  alternates: { canonical: buildCanonical("/community") },
  openGraph: {
    title: "Community forum | CityHaven",
    description: "Discuss hosting, renting, and buying with the CityHaven community.",
    url: buildCanonical("/community"),
    type: "website",
  },
};

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-4">
        <h1 className="text-2xl font-semibold">Community Forum</h1>
        <p className="text-slate-600">
          Placeholder community hub for hosts, buyers, and renters. Plug in your forum provider or discussion boards here.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/homePage" className="rounded-full bg-red-500 px-4 py-2 font-semibold text-white shadow-sm transition hover:-translate-y-0.5">
            Back to home
          </Link>
          <Link href="/contact" className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5">
            Talk to support
          </Link>
        </div>
      </div>
    </main>
  );
}
