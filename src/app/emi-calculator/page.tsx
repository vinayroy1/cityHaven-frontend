import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calculator } from "lucide-react";
import { buildCanonical } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { EmiCalculator } from "@/components/emi/EmiCalculator";

export const metadata: Metadata = {
  title: "EMI Calculator - CityHaven",
  description: "Calculate home loan EMIs instantly with CityHaven's EMI calculator.",
  alternates: { canonical: buildCanonical("/emi-calculator") },
  openGraph: {
    title: "EMI Calculator - CityHaven",
    description: "Calculate home loan EMIs instantly with CityHaven's EMI calculator.",
    url: buildCanonical("/emi-calculator"),
    type: "website",
  },
};

const faqs = [
  { q: "What is an EMI?", a: "Equated Monthly Installment — a fixed payment combining principal and interest over your tenure." },
  { q: "How is EMI calculated?", a: "Using P x r x (1+r)^n / ((1+r)^n - 1) where P is principal, r monthly rate, n total months." },
  { q: "Can I prepay my loan?", a: "Most lenders allow part-prepayment with minimal fees; it reduces interest outgo and tenure." },
  { q: "Fixed vs floating rate?", a: "Fixed stays constant; floating tracks repo/benchmark rates, so EMI may change with market moves." },
];

export default function EmiCalculatorPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1">
        <div className="relative isolate overflow-hidden bg-gradient-to-r from-rose-100 via-orange-100 to-amber-50 dark:from-slate-900 dark:via-rose-950/40 dark:to-slate-900">
          <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-lg shadow-amber-200/60 dark:bg-slate-800 dark:shadow-none font-black text-sm">
                EMI
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.25em] text-rose-600 dark:text-rose-400 font-bold">Plan your finance</p>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">EMI Calculator for your loan</h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">Adjust amount, rate, and tenure to see repayments instantly.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
          <EmiCalculator />

          <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">About EMI Calculator</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                A home loan EMI calculator helps you gauge monthly outflow, total interest, and repayment schedule before you commit. Tweak assumptions to find a
                comfortable EMI and understand how prepayment or shorter tenures can save interest.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-white">Quick tips</p>
              <ul className="mt-2 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li>• A 0.5% rate change can move EMI noticeably — compare offers.</li>
                <li>• Shorter tenures mean higher EMI but lower total interest.</li>
                <li>• Part-prepay early in the tenure to maximize interest savings.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Frequently asked questions</h2>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">FAQs</span>
            </div>
            <div className="divide-y divide-slate-200 rounded-2xl border border-slate-100 bg-slate-50 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-800/40">
              {faqs.map((item) => (
                <details key={item.q} className="group px-4 py-3">
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {item.q}
                    <span className="text-xs text-slate-500 group-open:hidden">+</span>
                    <span className="text-xs text-slate-500 hidden group-open:inline">−</span>
                  </summary>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}
