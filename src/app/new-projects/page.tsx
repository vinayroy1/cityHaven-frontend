import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonical } from "@/constants/seo";

export const metadata: Metadata = {
  title: "New Projects - CityHaven",
  description: "Discover new and RERA-approved projects across top cities.",
  alternates: { canonical: buildCanonical("/new-projects") },
  openGraph: {
    title: "New Projects - CityHaven",
    description: "Discover new and RERA-approved projects across top cities.",
    url: buildCanonical("/new-projects"),
    type: "website",
  },
};

export default function NewProjectsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold">New Projects</h1>
        <p className="mt-3 text-slate-600">
          Explore upcoming and RERA-registered projects. Swap this stub with your project catalog or CMS-powered feed.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/propertySearch" className="rounded-full bg-red-500 px-4 py-2 font-semibold text-white shadow-sm transition hover:-translate-y-0.5">
            View projects
          </Link>
          <Link href="/propertyListing" className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5">
            List your project
          </Link>
        </div>
      </div>
    </main>
  );
}
