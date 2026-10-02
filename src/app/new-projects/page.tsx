import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Building2, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { buildCanonical } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";

export const metadata: Metadata = {
  title: "New Projects - Awasio",
  description: "Discover upcoming, newly launched, and RERA-approved residential and commercial projects across top cities.",
  alternates: { canonical: buildCanonical("/new-projects") },
  openGraph: {
    title: "New Projects - Awasio",
    description: "Discover upcoming, newly launched, and RERA-approved residential and commercial projects across top cities.",
    url: buildCanonical("/new-projects"),
    type: "website",
  },
};

export default function NewProjectsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1">
        {/* Hero Banner */}
        <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <Sparkles className="h-4 w-4" />
              <span>Upcoming & Pre-Launch</span>
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              New Projects & Developments
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600 dark:text-slate-300">
              Explore RERA-approved townships, luxury high-rises, and gated communities directly from verified builders and developers.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/propertySearch"
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 hover:shadow-lg active:scale-95"
              >
                <span>Browse all listings</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/propertyListing"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <span>List your project</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <Building2 className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">RERA Verified</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Every project is verified against official RERA registration numbers with clear possession timelines.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">Direct Builder Pricing</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Zero brokerage on builder inventory. Get early-bird discounts, payment plans, and floor-rise waivers.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">Virtual Tours</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Walk through 3D models, master layout plans, sample apartments, and clubhouse amenity walk-throughs.
              </p>
            </div>
          </div>
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}
