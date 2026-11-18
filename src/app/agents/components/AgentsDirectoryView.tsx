import React from "react";
import { advisorPhoto } from "@/features/advisors/avatar";
import { CheckCircle2, ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import type { Agent } from "@/data/agents";
import { AgentsDirectoryClient } from "./AgentsDirectoryClient";
import { agentPath, agentsListPath } from "@/features/advisors/paths";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";


const FAQS = [
  {
    q: "How does Awasio verify real estate advisors?",
    a: "Every listed advisor undergoes multi-tier vetting including verification of their official state RERA license number, active operating address, on-ground track record, and verified documentation diligence before being certified on Awasio.",
  },
  {
    q: "Do buyers or tenants have to pay any consultation fees for site visits?",
    a: "No. Booking an in-person site visit through an Awasio verified advisor is 100% free of charge for prospective buyers and tenants. You can schedule private property walkthroughs and receive pricing guidance with zero upfront costs.",
  },
  {
    q: "What services do Awasio verified advisors provide during a walkthrough?",
    a: "Advisors arrange security gate clearance, provide printed layout blueprints, verify maintenance dues, highlight construction quality, conduct comparative market pricing analysis, and assist in price negotiations directly with the owner or developer.",
  },
  {
    q: "Can I request weekend or same-day property walkthroughs?",
    a: "Yes. When submitting a walkthrough request, you can choose 'Today', 'Tomorrow', or 'This Weekend' alongside your preferred time slot (Morning, Afternoon, or Evening). The advisor will contact you within their typical response window to confirm.",
  },
];

/**
 * /agents, /agents/<city>, /agents/<city>/<locality> (and /agents/<cc>/… outside India).
 * `agents` = the server-fetched first page, used for the ItemList structured data.
 */
export function AgentsDirectoryView({
  city = "",
  locality = "",
  country = null,
  agents,
}: {
  city?: string;
  locality?: string;
  country?: string | null;
  agents: Agent[];
}) {
  const where = [locality, city].filter(Boolean).join(", ");
  const initialCity = city;
  // Schema.org ItemList JSON-LD for Google Rich Results
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: where ? `Real estate advisors in ${where}` : "Awasio Verified Real Estate Advisors",
    description: where ? `Verified local real estate advisors in ${where}.` : "Directory of certified local real estate agents.",
    itemListElement: agents.slice(0, 20).map((agent, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "RealEstateAgent",
        name: agent.name,
        url: `https://awasio.com${agentPath(agent)}`,
        image: advisorPhoto(agent.avatar) ?? undefined,
        telephone: agent.phone,
        address: {
          "@type": "PostalAddress",
          addressLocality: agent.area,
          addressRegion: agent.city,
          addressCountry: agent.countryCode || "IN",
        },
      },
    })),
  };

  // Schema.org FAQPage JSON-LD for Google FAQ Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-150 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div>
        <HeaderNav />

        {/* Hero Header */}
        <section className="border-b border-slate-200/80 bg-white py-2.5 sm:py-8 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <PageBreadcrumbs
              items={
                !city
                  ? [{ label: "Verified Advisors" }]
                  : locality
                    ? [{ label: "Verified Advisors", href: "/agents" }, { label: city, href: agentsListPath(city, null, country) }, { label: locality }]
                    : [{ label: "Verified Advisors", href: "/agents" }, { label: city }]
              }
              className="mb-2 sm:mb-4"
              renderJsonLd={true}
            />
            <div className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 mb-1 sm:mb-3">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Awasio Certified Advisor Network</span>
            </div>
            <h1 className="text-base sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              {where ? `Verified Real Estate Advisors in ${where}` : "Find Verified Local Real Estate Advisors"}
            </h1>
            {/* Description hidden on mobile view per user request */}
            <p className="hidden sm:block mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl">
              Connect with experienced, RERA-registered local experts for physical property walkthroughs, price negotiation, and registry diligence across top Indian metros.
            </p>

            {/* Desktop Metrics Grid */}
            <div className="mt-6 hidden sm:grid sm:grid-cols-4 gap-3 max-w-3xl">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-lg font-extrabold text-slate-950 dark:text-white">100%</p>
                <p className="text-xs text-slate-500">RERA & Awasio Vetted</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-lg font-extrabold text-slate-950 dark:text-white">850+</p>
                <p className="text-xs text-slate-500">Monthly Site Visits</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-lg font-extrabold text-slate-950 dark:text-white">₹0 Fee</p>
                <p className="text-xs text-slate-500">For Buyer Walkthroughs</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-lg font-extrabold text-slate-950 dark:text-white">7+ Cities</p>
                <p className="text-xs text-slate-500">Top Metros Covered</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Directory Client Component */}
        <AgentsDirectoryClient key={`${country ?? ""}|${initialCity}|${locality}`} initialCity={initialCity} initialLocality={locality} country={country} />

        {/* Value Proposition Section */}
        <section className="border-t border-slate-200/80 bg-white py-12 dark:border-slate-800 dark:bg-slate-900/60 mt-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">
                The Awasio Verified Advisor Guarantee
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Never waste time with unregistered brokers or inaccurate listings. Every advisor on Awasio adheres to strict professionalism.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center dark:bg-rose-950/60 dark:text-rose-400 mb-3">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">Government RERA Vetting</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Every listed agent has verified RERA registration numbers and verified physical office address records in their micro-market.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950/60 dark:text-emerald-400 mb-3">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">Confirmed Guided Walkthroughs</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Book direct visits with confirmed society access, parking arrangements, and complete master plan blueprints on arrival.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950/60 dark:text-blue-400 mb-3">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">Zero Buyer Consultation Fees</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Free site visit scheduling and price advice without any upfront registration fees or hidden lock-ins.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Frequently Asked Questions Section */}
        <section className="border-t border-slate-200/80 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Everything you need to know about working with verified real estate advisors on Awasio
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 open:border-rose-300 dark:border-slate-800 dark:bg-slate-900"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-xs sm:text-sm font-bold text-slate-900 list-none dark:text-white">
                    <span>{faq.q}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 group-open:rotate-180 group-open:text-rose-600 shrink-0 ml-2" />
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5 dark:border-slate-800 dark:text-slate-300">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>

      <FooterLinks />
    </div>
  );
}
