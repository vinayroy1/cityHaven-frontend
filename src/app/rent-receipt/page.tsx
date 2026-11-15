import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, CalendarRange, FileText, Lock, Sparkles, Stamp } from "lucide-react";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { RentReceiptTool } from "@/components/rentReceipt/RentReceiptTool";

export const revalidate = 86400;

const TITLE = "Free Rent Receipt Generator for HRA – Download PDF | Awasio";
const DESCRIPTION =
  "Generate rent receipts for HRA claims in seconds. Monthly, quarterly or full financial year receipts in one PDF, with landlord PAN, revenue stamp and HRA calculator. Free, no login.";
const URL = buildCanonical("/rent-receipt");

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "rent receipt generator",
    "rent receipt format",
    "house rent receipt",
    "rent receipt for HRA",
    "online rent receipt",
    "rent receipt pdf",
    "HRA exemption calculator",
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    type: "website",
    images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio rent receipt generator" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const faqs = [
  {
    q: "Is this rent receipt generator free?",
    a: "Yes. Create and download as many rent receipts as you need, free and without signing up. Your details are saved only on your device.",
  },
  {
    q: "What details does a rent receipt need for HRA?",
    a: "Tenant and landlord names, the rented property's address, the rent amount (in figures and words), the period it covers, the payment date and mode, and the landlord's signature. Landlord PAN is needed when annual rent is above ₹1,00,000.",
  },
  {
    q: "When is the landlord's PAN mandatory?",
    a: "If the rent you pay in a financial year is more than ₹1,00,000 (about ₹8,333 a month), your employer needs the landlord's PAN to allow the HRA exemption. If the landlord has no PAN, a signed declaration from the landlord is usually accepted.",
  },
  {
    q: "Is a revenue stamp required on a rent receipt?",
    a: "A ₹1 revenue stamp is needed when rent above ₹5,000 is paid in cash. Receipts for UPI, bank transfer or cheque payments generally don't need one. The generator adds a stamp box automatically for cash receipts above ₹5,000.",
  },
  {
    q: "Can I make receipts for the whole financial year at once?",
    a: "Yes. Pick 'This year' (April to March) and the tool creates all 12 monthly receipts in a single PDF, two per A4 page, ready to print and sign. You can also choose quarterly, half-yearly or yearly receipts.",
  },
  {
    q: "How is HRA exemption calculated?",
    a: "Under the old tax regime, the exempt HRA is the lowest of: the actual HRA received; rent paid minus 10% of basic salary (plus DA); and 50% of basic for metro cities (Delhi, Mumbai, Kolkata, Chennai) or 40% elsewhere. HRA exemption is not available under the new tax regime.",
  },
  {
    q: "Can I pay rent to my parents and claim HRA?",
    a: "Yes, if you genuinely pay them rent and they own the house. Keep rent receipts and bank or UPI records, and your parents should show the rent as income in their tax return. You cannot claim HRA for rent paid to your spouse.",
  },
];

const howTo = [
  ["Enter the details", "Tenant and landlord names, property address, monthly rent and the landlord's PAN if annual rent is above ₹1 lakh."],
  ["Pick the period", "One tap for this or last financial year, or choose any months. Select monthly, quarterly, half-yearly or yearly receipts."],
  ["Download and sign", "Get every receipt in one PDF, two per A4 page. Print, get the landlord's signature, and submit to your employer."],
] as const;

export default function RentReceiptPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to generate a rent receipt online",
      totalTime: "PT2M",
      step: howTo.map(([name, text], i) => ({ "@type": "HowToStep", position: i + 1, name, text })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Awasio Rent Receipt Generator",
      url: URL,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      description: DESCRIPTION,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HeaderNav />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(251,113,133,0.13),transparent_32%),radial-gradient(circle_at_10%_90%,rgba(251,146,60,0.10),transparent_28%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-10">
            <div className="mb-4 hidden flex-wrap items-center justify-between gap-3 sm:flex">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to home
              </Link>
              <PageBreadcrumbs items={[{ label: "Rent Receipt Generator" }]} renderJsonLd={true} />
            </div>
            <div className="max-w-3xl">
              <div className="mb-3 hidden items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 sm:inline-flex dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                <Sparkles className="h-3.5 w-3.5" /> Free tool · No login · Instant PDF
              </div>
              <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                Rent receipt generator{" "}
                <span className="bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent">for HRA claims.</span>
                <span className="mt-0.5 block text-xs font-semibold text-slate-500 sm:hidden dark:text-slate-400">Free · Full year in one PDF · No login</span>
              </h1>
              <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-slate-600 sm:block sm:text-base dark:text-slate-300">
                Create monthly, quarterly or full financial-year rent receipts in one PDF, with landlord PAN, revenue stamp box and amount in words. Ready to print and submit to your employer.
              </p>
              <div className="mt-4 hidden flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-600 sm:flex sm:text-sm dark:text-slate-300">
                <span className="flex items-center gap-1.5"><CalendarRange className="h-4 w-4 text-rose-500" /> 12 months in one click</span>
                <span className="flex items-center gap-1.5"><Stamp className="h-4 w-4 text-rose-500" /> PAN & revenue stamp rules built in</span>
                <span className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-rose-500" /> Details stay on your device</span>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-10 px-4 py-4 sm:px-6 sm:py-10">
          <RentReceiptTool />

          <section aria-labelledby="how-title">
            <h2 id="how-title" className="text-xl font-bold text-slate-950 dark:text-white">How to generate a rent receipt online</h2>
            <ol className="mt-4 grid gap-4 md:grid-cols-3">
              {howTo.map(([h, p], i) => (
                <li key={h} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-sm font-black text-rose-600 dark:bg-rose-950/50">{i + 1}</span>
                  <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{h}</h3>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{p}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="grid gap-4 md:grid-cols-2" aria-labelledby="format-title">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900">
              <h2 id="format-title" className="flex items-center gap-2 text-lg font-bold text-slate-950 dark:text-white">
                <FileText className="h-5 w-5 text-rose-500" /> Rent receipt format
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">A valid house rent receipt for HRA should include:</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {[
                  "Tenant's and landlord's names",
                  "Address of the rented property",
                  "Rent amount in figures and words",
                  "Rent period (month or months covered)",
                  "Payment date and mode (UPI, bank, cheque or cash)",
                  "Landlord's PAN if annual rent exceeds ₹1 lakh",
                  "Landlord's signature (with ₹1 revenue stamp for cash above ₹5,000)",
                ].map((t) => (
                  <li key={t} className="flex gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Rent receipts and HRA: quick rules</h2>
              <dl className="mt-3 space-y-3 text-sm">
                {[
                  ["Who needs them", "Salaried employees claiming HRA exemption submit rent receipts to their employer, usually quarterly or before the financial year closes."],
                  ["PAN rule", "Landlord PAN is required when the yearly rent is above ₹1,00,000."],
                  ["Revenue stamp", "₹1 stamp on receipts for cash rent above ₹5,000. Not needed for UPI or bank payments."],
                  ["Tax regime", "HRA exemption applies only under the old tax regime."],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-semibold text-slate-900 dark:text-white">{k}</dt>
                    <dd className="mt-0.5 text-slate-600 dark:text-slate-400">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 dark:border-slate-800 dark:bg-slate-900" aria-labelledby="faq-title">
            <h2 id="faq-title" className="text-xl font-bold text-slate-950 dark:text-white">Rent receipt: common questions</h2>
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {faqs.map((f) => (
                <details key={f.q} className="group py-3">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 dark:text-white">{f.q}</summary>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-gradient-to-br from-slate-900 to-rose-950 p-6 text-white sm:flex-row sm:items-center sm:p-8">
            <div>
              <h2 className="text-lg font-bold">Need a rental agreement too?</h2>
              <p className="mt-1 text-sm text-slate-300">Make a complete rent agreement in 5 minutes and download it as a PDF. Your details carry over to the receipts.</p>
            </div>
            <Link href="/rental-agreement" className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-rose-50">
              Create rental agreement
            </Link>
          </section>
        </div>
      </main>
      <FooterLinks />
    </div>
  );
}
