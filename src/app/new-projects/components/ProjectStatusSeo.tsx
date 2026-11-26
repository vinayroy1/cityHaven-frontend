import Link from "next/link";
import type { ProjectListing } from "@/types/project.types";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_SLUGS, projectStatusPath, type ProjectStatusValue } from "../lib/projectUrls";

type Faq = { q: string; a: string };

function copy(status: ProjectStatusValue, place: string, count: number, builders: string[]): { intro: string; faqs: Faq[] } {
  const n = count > 0 ? `${count}` : "No";
  const by = builders.length ? ` Builders listed here include ${builders.join(", ")}.` : "";
  switch (status) {
    case "NEW_LAUNCH":
      return {
        intro: `${n} new launch and upcoming residential projects in ${place} are listed on Awasio.${by} New launches usually offer the lowest entry prices and the widest choice of units, but possession is several years away, so check the RERA registration and the builder's delivery record before booking.`,
        faqs: [
          { q: `What are new launch projects in ${place}?`, a: `Projects that builders have recently launched or are about to launch (often called upcoming or pre-launch projects). Bookings open early, usually at introductory prices, and construction is at an early stage.` },
          { q: `Are new launch projects cheaper than ready to move flats in ${place}?`, a: `Usually yes: launch prices are typically lower, but you wait longer for possession and carry the risk of delays. Compare the price per sq.ft and the promised possession date on each project page.` },
          { q: `What should I check before booking a new launch project?`, a: `Check the project's RERA registration number, the builder's past delivery record, approved layout and floor plans, the payment plan, and the possession date written in the agreement.` },
        ],
      };
    case "UNDER_CONSTRUCTION":
      return {
        intro: `${n} under construction residential projects in ${place} are listed on Awasio.${by} Under construction flats usually cost less than ready to move homes and let you pay in stages, but possession depends on the builder finishing on time, so compare possession dates and RERA details.`,
        faqs: [
          { q: `Is it safe to buy an under construction flat in ${place}?`, a: `It can be, if the project is RERA registered and the builder has a good delivery record. RERA requires builders to keep buyers' money in a separate account and to deliver by the registered date.` },
          { q: `How do I check the possession date of an under construction project?`, a: `Each project page shows the expected possession date. Confirm it against the RERA registration and the date written in your builder-buyer agreement.` },
          { q: `Do I pay GST on under construction flats?`, a: `Yes. Under construction homes attract GST (currently 1% for affordable housing and 5% for others, without input tax credit). Ready to move homes with a completion certificate do not.` },
        ],
      };
    default:
      return {
        intro: `${n} ready to move residential projects in ${place} are listed on Awasio.${by} Ready to move flats let you move in or rent out straight away, with no construction risk and no GST on the purchase, though prices are usually higher than under construction homes.`,
        faqs: [
          { q: `What does ready to move mean?`, a: `Construction is complete and the flat can be handed over now. Ask for the occupancy or completion certificate before you pay.` },
          { q: `Is GST charged on ready to move flats in ${place}?`, a: `No GST applies to a ready to move home that has a completion certificate. Stamp duty and registration charges still apply.` },
          { q: `Ready to move or under construction: which is better?`, a: `Ready to move suits buyers who need the home now or want rental income immediately. Under construction suits buyers who can wait and want a lower price with staged payments.` },
        ],
      };
  }
}

/**
 * Server-rendered text for a status page (/new-projects/patna/ready-to-move): a short intro, links to the
 * sibling status pages and an FAQ (with FAQPage JSON-LD), so each status page has its own content.
 */
export function ProjectStatusSeo({
  status,
  city,
  localities,
  countryCode,
  total,
  projects,
}: {
  status: ProjectStatusValue;
  city: string;
  localities: string[];
  countryCode: string | null;
  total: number;
  projects: ProjectListing[];
}) {
  const place = [localities[0], city].filter(Boolean).join(", ");
  const builders = [...new Set(projects.map((p) => p.developerName).filter((d): d is string => !!d))].slice(0, 4);
  const { intro, faqs } = copy(status, place, total, builders);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const others = (Object.values(PROJECT_STATUS_SLUGS) as ProjectStatusValue[]).filter((s) => s !== status);

  return (
    <section className="mx-auto max-w-7xl px-3 pb-12 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 lg:grid-cols-[1fr_1.2fr] lg:gap-10 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-950 sm:text-2xl dark:text-white">
            {PROJECT_STATUS_LABEL[status]} projects in {place}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{intro}</p>
          <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Also in {place}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {others.map((s) => (
              <li key={s}>
                <Link
                  href={projectStatusPath(city, localities, countryCode, s)}
                  className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:text-slate-300"
                >
                  {PROJECT_STATUS_LABEL[s]} projects
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={projectStatusPath(city, localities, countryCode, null)}
                className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:text-slate-300"
              >
                All new projects
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-base font-black text-slate-950 sm:text-lg dark:text-white">Frequently asked questions</h2>
          <div className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {faqs.map((f, i) => (
              <details key={f.q} className="group" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-900 group-open:text-rose-700 dark:text-white dark:group-open:text-rose-400 [&::-webkit-details-marker]:hidden">
                  <h3 className="font-semibold">{f.q}</h3>
                  <span aria-hidden className="mt-0.5 text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="-mt-1 px-4 pb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
