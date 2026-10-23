import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, ShieldCheck, Sparkles, TimerReset } from "lucide-react";
import { buildCanonical } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { EmiCalculator } from "@/components/emi/EmiCalculator";

export const metadata: Metadata = {
  title: "Home Loan EMI Calculator | Awasio",
  description: "Calculate your home loan EMI, total interest, and total repayment instantly. Adjust the loan amount, interest rate, and tenure to plan with confidence.",
  alternates: { canonical: buildCanonical("/emi-calculator") },
  openGraph: {
    title: "Home Loan EMI Calculator | Awasio",
    description: "Estimate your monthly home loan payment and total interest in seconds.",
    url: buildCanonical("/emi-calculator"),
    type: "website",
  },
};

const faqs = [
  { q: "What is a home loan EMI?", a: "EMI stands for Equated Monthly Instalment. It is the fixed amount you repay each month, made up of both principal and interest." },
  { q: "How is my EMI calculated?", a: "The estimate uses the standard reducing-balance formula based on your principal, monthly interest rate, and total number of monthly payments." },
  { q: "Does a shorter tenure save money?", a: "Usually, yes. A shorter tenure raises the monthly EMI but reduces the total interest paid over the life of the loan." },
  { q: "Will my actual lender EMI be the same?", a: "This is an indicative estimate. Processing fees, rate changes, insurance, and your lender’s terms may affect the final repayment amount." },
];

export default function EmiCalculatorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <HeaderNav />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(251,113,133,0.12),transparent_32%),radial-gradient(circle_at_15%_80%,rgba(251,146,60,0.10),transparent_28%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <Link href="/" className="mb-7 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"><ArrowLeft className="h-3.5 w-3.5" /> Back to home</Link>
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"><Sparkles className="h-3.5 w-3.5" /> Free financial planning tool</div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Know your EMI before you <span className="bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent">choose your home.</span></h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Estimate monthly repayments, compare loan tenures, and understand your total interest—without spreadsheets or guesswork.</p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300 sm:text-sm">
                <span className="flex items-center gap-2"><TimerReset className="h-4 w-4 text-rose-500" /> Instant results</span>
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-rose-500" /> No personal details</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-rose-500" /> Easy loan comparison</span>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
          <EmiCalculator />
          <section className="grid gap-5 md:grid-cols-3">
            {[
              ["01", "Set your budget", "Start with the amount you expect to borrow after accounting for your down payment."],
              ["02", "Compare tenures", "Balance a comfortable monthly EMI against the extra interest of a longer repayment period."],
              ["03", "Check loan offers", "Compare interest rates and fees from lenders before you make a final decision."],
            ].map(([number, title, copy]) => (
              <article key={number} className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <span className="text-xs font-bold tracking-widest text-rose-600 dark:text-rose-400">{number}</span>
                <h2 className="mt-3 text-base font-bold text-slate-950 dark:text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{copy}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-8 border-t border-slate-200 py-10 dark:border-slate-800 lg:grid-cols-[.65fr_1.35fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">Need to know</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Frequently asked questions</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">A few simple answers to help you plan your home loan with confidence.</p>
            </div>
            <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {faqs.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-slate-900 marker:content-none dark:text-white sm:text-base">{item.q}<ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" /></summary>
                  <p className="max-w-2xl pt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.a}</p>
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
