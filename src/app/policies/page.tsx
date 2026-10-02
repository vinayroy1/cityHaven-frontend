import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, CheckCircle2, FileText, AlertCircle } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { buildCanonical } from "@/constants/seo";

export const metadata: Metadata = {
  title: "Policies & Safety - Awasio",
  description: "Learn about Awasio's trust, safety, cancellation, and hosting policies.",
  alternates: { canonical: buildCanonical("/policies") },
};

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1">
        <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <Shield className="h-4 w-4" />
              <span>Trust & Safety</span>
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Policies & Safety Standards
            </h1>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
              Awasio is committed to building a safe, transparent, and trustworthy real estate marketplace for owners, buyers, and tenants.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-6">
          <section id="cancellation" className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Cancellation & Refund Policy</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Subscription plans and credit unlock packs can be cancelled within 48 hours of purchase if unused. Token amounts paid towards property bookings follow mutual owner-buyer terms outlined in the preliminary agreement.
            </p>
          </section>

          <section id="hosting" className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Responsible Listing & Hosting</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              All property listings must be accurate, verified, and backed by genuine ownership or legal mandate. Misleading descriptions, non-existent inventory, or unauthorized sub-letting are strictly prohibited.
            </p>
          </section>

          <section id="privacy" className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Data Privacy & Anti-Spam</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Contact numbers unlocked through the platform are masked and protected under strict consent guidelines. Unsolicited telemarketing or sharing buyer data outside Awasio is a violation of our terms.
            </p>
          </section>

          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 hover:shadow-lg"
            >
              Contact support
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}
