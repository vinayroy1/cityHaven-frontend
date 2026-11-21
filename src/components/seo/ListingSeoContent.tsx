// Server-rendered SEO content for "list with Awasio" pages (see constants/listingSeo.ts).
// Plain HTML so Google reads it without running the client-side listing flows.
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ListingCtaLink } from "./ListingCtaLink";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { LISTING_SEO, LISTING_SEO_ORDER, listingCities, type ListingSeo, type ListingSeoKey } from "@/constants/listingSeo";

export function listingMetadata(key: ListingSeoKey): Metadata {
  const s = LISTING_SEO[key];
  const url = buildCanonical(s.path);
  return {
    title: { absolute: `${s.title} | Awasio` },
    description: s.description,
    keywords: s.keywords,
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      title: `${s.title} | Awasio`,
      description: s.description,
      url,
      type: "website",
      images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }],
    },
  };
}

/** H1 + intro. `cta` adds the button (landing pages whose flow is elsewhere). */
export function ListingSeoHero({ seoKey, cta = false, compact = false }: { seoKey: ListingSeoKey; cta?: boolean; compact?: boolean }) {
  const s = LISTING_SEO[seoKey];
  return (
    <div className={compact ? "mb-3 sm:mb-4" : "py-8 sm:py-12"}>
      <h1
        className={
          compact
            ? "text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl dark:text-white"
            : "max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
        }
      >
        {s.h1}
      </h1>
      <p className={compact ? "mt-1 max-w-3xl text-xs text-slate-600 sm:text-sm dark:text-slate-400" : "mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-300"}>
        {s.intro}
      </p>
      {cta && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ListingCtaLink
            href={s.ctaHref}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-rose-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700"
          >
            {s.ctaLabel} <ArrowRight className="h-4 w-4" />
          </ListingCtaLink>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Free · 1,000 free credits on signup</span>
        </div>
      )}
    </div>
  );
}

function FaqJsonLd({ s }: { s: ListingSeo }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: s.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** How it works, benefits, who it's for, FAQ (+ FAQPage JSON-LD), city links and the other listing pages. */
export function ListingSeoDetails({ seoKey, showCta = true }: { seoKey: ListingSeoKey; showCta?: boolean }) {
  const s = LISTING_SEO[seoKey];
  const h2 = "text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white";
  return (
    <section aria-label={`About ${s.navLabel.toLowerCase()}`} className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <FaqJsonLd s={s} />

      <div>
        <h2 className={h2}>How it works</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {s.steps.map((st, i) => (
            <li key={st.title} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">{i + 1}</span>
              <h3 className="mt-2 font-bold text-slate-900 dark:text-white">{st.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{st.text}</p>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h2 className={h2}>Why list on Awasio</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {s.benefits.map((b) => (
            <li key={b.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{b.title}</h3>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{b.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          <strong className="text-slate-800 dark:text-slate-200">Who it&apos;s for:</strong> {s.audience}
        </p>
        {showCta && (
          <ListingCtaLink href={s.ctaHref} className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white hover:bg-rose-700">
            {s.ctaLabel} <ArrowRight className="h-4 w-4" />
          </ListingCtaLink>
        )}
      </div>

      <div>
        <h2 className={h2}>Frequently asked questions</h2>
        <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {s.faqs.map((f) => (
            <details key={f.q} className="group p-4" open>
              <summary className="cursor-pointer list-none font-semibold text-slate-900 dark:text-white">{f.q}</summary>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      <div>
        <h2 className={h2}>{s.cityHeading}</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {listingCities(s).map(([name, slug]) => (
            <li key={slug}>
              <Link
                href={s.cityPath(slug)}
                className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <nav aria-label="More ways to list on Awasio">
        <h2 className={h2}>More ways to list on Awasio</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {LISTING_SEO_ORDER.filter((k) => k !== seoKey).map((k) => (
            <li key={k}>
              <Link href={LISTING_SEO[k].path} className="text-sm font-semibold text-rose-700 hover:underline dark:text-rose-400">
                {LISTING_SEO[k].navLabel}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
