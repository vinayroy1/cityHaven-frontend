import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileCheck2, Lock, Sparkles, TimerReset } from "lucide-react";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { RentalAgreementTool } from "@/components/rentalAgreement/RentalAgreementTool";

export const revalidate = 86400;

const TITLE = "Free Rental Agreement Generator – Download PDF | Awasio";
const DESCRIPTION =
  "Create a rent agreement in 5 minutes. Answer simple questions, see a live preview and download a ready-to-print PDF for India and other countries. Free, no login.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: buildCanonical("/rental-agreement") },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: buildCanonical("/rental-agreement"),
    type: "website",
    images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio rental agreement generator" }],
  },
};

const faqs = [
  {
    q: "Is this rental agreement free?",
    a: "Yes. You can create, preview and download the agreement as a PDF for free, without signing up. Your details stay on your device.",
  },
  {
    q: "Is a rent agreement made online legally valid?",
    a: "The PDF is a complete draft. In India it becomes enforceable once printed on stamp paper (or with an e-stamp) of the right value and signed by both parties with witnesses; agreements of 12 months or more generally also need registration. The tool shows the steps for your country before you download.",
  },
  {
    q: "Why are most rent agreements in India for 11 months?",
    a: "Leases of 12 months or more generally must be registered at the Sub-Registrar office, which adds cost and a visit. An 11-month agreement avoids mandatory registration and can be renewed.",
  },
  {
    q: "Can I use it for a shop or office?",
    a: "Yes. Choose “Shop / office” in the first step and the agreement switches to commercial lease wording (Lessor and Lessee, commercial use).",
  },
  {
    q: "Does it work outside India?",
    a: "Yes, for Nepal, Bangladesh, Sri Lanka, Singapore, the UK, Ireland, UAE, Australia and New Zealand. Where a government standard contract is mandatory (such as Dubai's Ejari contract or Australian state forms), the tool creates a terms addendum to attach to the official form.",
  },
];

export default function RentalAgreementPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <HeaderNav />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(251,113,133,0.12),transparent_32%),radial-gradient(circle_at_15%_80%,rgba(251,146,60,0.10),transparent_28%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-10">
            <div className="mb-4 hidden flex-wrap items-center justify-between gap-3 sm:flex">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to home
              </Link>
              <div>
                <PageBreadcrumbs items={[{ label: "Rental Agreement" }]} renderJsonLd={true} />
              </div>
            </div>
            <div className="max-w-3xl">
              <div className="mb-3 hidden items-center gap-2 rounded-full border border-rose-200 sm:inline-flex bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                <Sparkles className="h-3.5 w-3.5" /> Free tool · No login
              </div>
              <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                Make your rental agreement{" "}
                <span className="bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent">in 5 minutes.</span>
                <span className="mt-0.5 block text-xs font-semibold text-slate-500 sm:hidden dark:text-slate-400">Free · No login · Instant PDF</span>
              </h1>
              <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-slate-600 sm:block sm:text-base dark:text-slate-300">
                Answer a few simple questions, watch the agreement fill in as you type, and download a clean PDF ready to print and sign.
              </p>
              <div className="mt-4 hidden flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-600 sm:flex sm:text-sm dark:text-slate-300">
                <span className="flex items-center gap-1.5"><TimerReset className="h-4 w-4 text-rose-500" /> 5 short steps</span>
                <span className="flex items-center gap-1.5"><FileCheck2 className="h-4 w-4 text-rose-500" /> Homes, rooms, shops & offices</span>
                <span className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-rose-500" /> Details stay on your device</span>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-10 px-4 py-4 sm:px-6 sm:py-10">
          <RentalAgreementTool />

          <section className="grid gap-4 md:grid-cols-3">
            {[
              ["1. Fill in the details", "Owner, tenant, rent, deposit and dates. Sensible defaults for your country are pre-filled."],
              ["2. Check the live preview", "Every answer appears instantly in the agreement, so you see exactly what you will sign."],
              ["3. Download, print & sign", "Get a PDF and the steps to make it valid where you live (stamp paper, witnesses, registration)."],
            ].map(([h, p]) => (
              <div key={h} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{h}</h2>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{p}</p>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Rental agreement: common questions</h2>
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {faqs.map((f) => (
                <details key={f.q} className="group py-3">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 dark:text-white">{f.q}</summary>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{f.a}</p>
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
