/** Shared server layout for /area-converter and /area-converter/[pair]. */
import Link from "next/link";
import { ChevronDown, Ruler } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { SITE_URL } from "@/constants/seo";
import { AreaConverter } from "./AreaConverter";
import { AREA_UNITS, POPULAR_PAIRS, convertArea, fmtArea, pairSlug, parsePair, type AreaUnit } from "./units";

export type Faq = { q: string; a: string };

export function AreaPage({
  h1,
  intro,
  from = "sq-ft",
  to = "sq-m",
  value = "1000",
  faqs,
  table,
  path,
  crumb,
}: {
  h1: string;
  intro: string;
  from?: string;
  to?: string;
  value?: string;
  faqs: Faq[];
  table?: [AreaUnit, AreaUnit];
  path: string;
  crumb?: string;
}) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: h1,
      url: `${SITE_URL}${path}`,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Area Converter", item: `${SITE_URL}/area-converter` },
        ...(crumb ? [{ "@type": "ListItem", position: 3, name: crumb, item: `${SITE_URL}${path}` }] : []),
      ],
    },
  ];
  const steps = [1, 5, 10, 25, 50, 100, 500, 1000, 5000, 10000];

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8f6] dark:bg-slate-950">
      <HeaderNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="flex-1 pb-24">
        <section className="border-b border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-3xl px-4 pb-8 pt-5 sm:px-6 sm:pt-8">
            <nav className="text-xs text-slate-500" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-emerald-600">Home</Link> /{" "}
              {crumb ? <Link href="/area-converter" className="hover:text-emerald-600">Area Converter</Link> : <span>Area Converter</span>}
              {crumb && <> / <span>{crumb}</span></>}
            </nav>
            <div className="mt-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                <Ruler className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                Free tool
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{h1}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{intro}</p>
            <div className="mt-5">
              <AreaConverter initialFrom={from} initialTo={to} initialValue={value} />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl space-y-8 px-4 pt-7 sm:px-6">
          {table && (
            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {table[0].plural} to {table[1].plural} table
              </h2>
              <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800/60">
                    <tr>
                      <th className="px-4 py-2.5">{table[0].plural}</th>
                      <th className="px-4 py-2.5">{table[1].plural}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {steps.map((n) => (
                      <tr key={n} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300">{n.toLocaleString("en-IN")} {table[0].short}</td>
                        <td className="px-4 py-2 font-bold text-slate-900 dark:text-white">{fmtArea(convertArea(n, table[0], table[1]))} {table[1].short}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {table && (
            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Related conversions</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  [table[1], table[0]] as const,
                  ...AREA_UNITS.filter((u) => u !== table[0] && u !== table[1]).map((u) => [table[0], u] as const),
                ].map(([x, y]) => (
                  <Link
                    key={pairSlug(x, y)}
                    href={`/area-converter/${pairSlug(x, y)}`}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                  >
                    {x.short} to {y.short}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Popular conversions</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {POPULAR_PAIRS.map((s) => {
                const p = parsePair(s)!;
                return (
                  <Link
                    key={s}
                    href={`/area-converter/${s}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {p[0].short} to {p[1].short}
                  </Link>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Unit reference</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              {AREA_UNITS.map((u) => (
                <div key={u.key} className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-2.5 text-sm first:border-0 dark:border-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-300">1 {u.name}</span>
                  <span className="text-right text-slate-900 dark:text-white">
                    {fmtArea(u.sqm)} sq m · {fmtArea(u.sqm / 0.09290304)} sq ft
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quick answers</h2>
            <div className="mt-3 space-y-2">
              {faqs.map((f, i) => (
                <details key={f.q} open={i === 0} className="group rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                    <h3 className="flex-1 text-[13.5px] font-semibold text-slate-800 dark:text-slate-100">{f.q}</h3>
                    <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-4 pb-3.5 text-[13px] leading-6 text-slate-600 dark:text-slate-400">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">All conversions</h2>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
              {AREA_UNITS.flatMap((a) =>
                AREA_UNITS.filter((b) => b !== a).map((b) => (
                  <Link key={pairSlug(a, b)} href={`/area-converter/${pairSlug(a, b)}`} className="text-slate-600 hover:text-emerald-600 dark:text-slate-400">
                    {a.plural} to {b.plural}
                  </Link>
                )),
              )}
            </div>
          </section>
        </div>
      </main>
      <FooterLinks />
    </div>
  );
}
