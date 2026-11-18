import { SignupCreditCard } from "@/components/marketing/SignupCreditCard";
import Link from "next/link";
import { Compass, Flame } from "lucide-react";
import { buildCanonical } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { DirectoryClient } from "@/components/pandit/public/DirectoryClient";
import { ALL_SERVICE_OPTIONS, PANDIT_BASE, panditName, panditProfilePath } from "@/features/pandit/options";
import { listingPath } from "@/lib/seo/countryPath";
import type { PanditProfile } from "@/features/pandit/types";
import { ListYourService } from "../ListYourService";

const POPULAR = ["GRIHA_PRAVESH", "BHOOMI_PUJAN", "SATYANARAYAN_KATHA", "VASTU_SHANTI", "HAVAN", "RUDRABHISHEK", "NAAMKARAN", "VIVAH", "VASTU_HOME", "VASTU_FLAT_PURCHASE", "VASTU_PLOT", "VASTU_OFFICE"];

const faqs = (where: string) => [
  {
    q: `How much does a pandit charge for griha pravesh${where ? ` in ${where}` : ""}?`,
    a: "Dakshina depends on the vidhi, duration and whether samagri (puja material) is included. Each profile shows a starting fee per puja; confirm the final amount with the pandit before the day.",
  },
  {
    q: "Will the pandit bring the samagri?",
    a: "Many pandits can arrange the full samagri for an extra charge. Look for 'Samagri arranged' on the profile, or ask in your enquiry.",
  },
  {
    q: "Can I get a puja or vastu consultation online?",
    a: "Yes. Use the 'Online available' filter to find pandits who do e-puja over video and vastu consultants who review photos and floor plans online.",
  },
  {
    q: "Are the pandits and vastu consultants verified?",
    a: "Every listing is reviewed by the Awasio team before it goes live. Ratings come only from people who contacted them through Awasio.",
  },
];

export function DirectoryPage({
  city,
  locality,
  country,
  items,
  total,
  cities,
}: {
  city: string;
  locality: string | null;
  country: string | null;
  items: PanditProfile[];
  total: number;
  cities: { city: string; count: number }[];
}) {
  const where = [locality, city].filter(Boolean).join(", ");
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: where ? `Pandits and vastu consultants in ${where}` : "Pandits and vastu consultants",
    itemListElement: items.slice(0, 20).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: buildCanonical(panditProfilePath(p)), name: panditName(p) })),
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs(where).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const base = listingPath(PANDIT_BASE, city, locality, country);
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {items.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <HeaderNav />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(251,146,60,0.18),transparent_32%),radial-gradient(circle_at_10%_90%,rgba(244,63,94,0.10),transparent_30%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-10">
            <div className="mb-3 hidden sm:block">
              <PageBreadcrumbs
                items={
                  !city
                    ? [{ label: "Pandit & Vastu" }]
                    : locality
                      ? [{ label: "Pandit & Vastu", href: PANDIT_BASE }, { label: city, href: listingPath(PANDIT_BASE, city, null, country) }, { label: locality }]
                      : [{ label: "Pandit & Vastu", href: PANDIT_BASE }, { label: city }]
                }
                renderJsonLd={true}
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600">
              <Flame className="h-4 w-4" /> Puja & vastu{where ? ` in ${where}` : ""}
              <Compass className="h-4 w-4" />
            </div>
            <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl dark:text-white">
              {where ? `Pandits & vastu consultants in ${where}` : <>Book a pandit ji or <span className="bg-gradient-to-r from-amber-500 to-rose-600 bg-clip-text text-transparent">vastu expert</span></>}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
              Griha pravesh, bhoomi pujan, katha, havan, sanskars and vastu checks. Compare dakshina, languages and reviews, then enquire for your date.
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-6xl space-y-10 px-4 py-6 sm:px-6 sm:py-10">
          <DirectoryClient city={city} locality={locality ?? ""} country={country} initialItems={items} initialTotal={total} cities={cities} />
          <SignupCreditCard benefit="contact pandits & vastu experts directly" />

          <section aria-labelledby="popular-title">
            <h2 id="popular-title" className="text-lg font-bold text-slate-900 dark:text-white">Popular{where ? ` in ${where}` : ""}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {POPULAR.map((s) => {
                const o = ALL_SERVICE_OPTIONS.find((x) => x.value === s)!;
                return (
                  <Link key={s} href={`${base}?service=${s}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-amber-300 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    {o.icon} {o.label}{where ? ` in ${where}` : ""}
                  </Link>
                );
              })}
            </div>
          </section>

          <ListYourService />

          <section aria-labelledby="faq-title" className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 id="faq-title" className="text-lg font-bold text-slate-900 dark:text-white">Frequently asked questions</h2>
            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
              {faqs(where).map((f) => (
                <details key={f.q} className="group py-3">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800 marker:hidden dark:text-slate-200">
                    <span className="mr-1 inline-block transition group-open:rotate-90">›</span> {f.q}
                  </summary>
                  <p className="mt-1.5 pl-4 text-sm text-slate-600 dark:text-slate-300">{f.a}</p>
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
