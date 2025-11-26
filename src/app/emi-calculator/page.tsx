import React from "react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { EmiCalculator } from "@/components/emi/EmiCalculator";

const faqs = [
  { q: "What is an EMI?", a: "Equated Monthly Installment — a fixed payment combining principal and interest over your tenure." },
  { q: "How is EMI calculated?", a: "Using P x r x (1+r)^n / ((1+r)^n - 1) where P is principal, r monthly rate, n total months." },
  { q: "Can I prepay my loan?", a: "Most lenders allow part-prepayment with minimal fees; it reduces interest outgo and tenure." },
  { q: "Fixed vs floating rate?", a: "Fixed stays constant; floating tracks repo/benchmark rates, so EMI may change with market moves." },
];

export default function EmiCalculatorPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <HeaderNav />
      <div className="relative isolate overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-orange-400">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.14),transparent_25%)]" />
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-10 sm:px-6 relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg shadow-red-500/30">EMI</div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-100">Plan your finance</p>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">EMI Calculator for your loan</h1>
            <p className="text-sm text-amber-50">Adjust amount, rate, and tenure to see repayments instantly.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        <EmiCalculator />

        <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">About EMI Calculator</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              A home loan EMI calculator helps you gauge monthly outflow, total interest, and repayment schedule before you commit. Tweak assumptions to find a
              comfortable EMI and understand how prepayment or shorter tenures can save interest.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Quick tips</p>
            <ul className="mt-2 space-y-2 text-xs text-slate-600">
              <li>• A 0.5% rate change can move EMI noticeably — compare offers.</li>
              <li>• Shorter tenures mean higher EMI but lower total interest.</li>
              <li>• Part-prepay early in the tenure to maximize interest savings.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Frequently asked questions</h2>
            <span className="text-xs font-semibold text-slate-500">FAQs</span>
          </div>
          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-100 bg-slate-50">
            {faqs.map((item) => (
              <details key={item.q} className="group px-4 py-3">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-800">
                  {item.q}
                  <span className="text-xs text-slate-500 group-open:hidden">+</span>
                  <span className="text-xs text-slate-500 hidden group-open:inline">−</span>
                </summary>
                <p className="mt-2 text-sm text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
