// Server-rendered SEO content for "list with Awasio" pages (see constants/listingSeo.ts).
// Plain HTML so Google reads it without running the client-side listing flows.
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, ChevronDown, Gift, Images, MapPin, ShieldCheck, Target, Users, Zap } from "lucide-react";
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

const BENEFIT_ICONS = [Gift, Target, Images, BadgeCheck, Zap, ShieldCheck];
const BENEFIT_TINTS = [
  "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300",
  "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300",
  "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300",
  "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",
];

/** How it works, benefits, who it's for, FAQ (+ FAQPage JSON-LD), city links and the other listing pages. */
export function ListingSeoDetails({ seoKey, showCta = true }: { seoKey: ListingSeoKey; showCta?: boolean }) {
  const s = LISTING_SEO[seoKey];
  const h2 = "text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white";
  const eyebrow = "text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400";
  return (
    <section aria-label={`About ${s.navLabel.toLowerCase()}`} className="mx-auto w-full max-w-6xl space-y-16 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <FaqJsonLd s={s} />

      <div id="how-it-works" className="scroll-mt-24">
        <p className={eyebrow}>Simple 3-step process</p>
        <h2 className={`mt-1 ${h2}`}>How it works</h2>
        <ol className="relative mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-6 hidden border-t-2 border-dashed border-rose-200 sm:block dark:border-rose-900/50" aria-hidden />
          {s.steps.map((st, i) => (
            <li key={st.title} className="relative rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-2xs transition hover:-translate-y-0.5 hover:shadow-md sm:text-center dark:border-slate-800 dark:bg-slate-900">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-lg font-bold text-white shadow-lg shadow-rose-600/25">
                {i + 1}
              </span>
              <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">{st.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{st.text}</p>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <p className={eyebrow}>Benefits</p>
        <h2 className={`mt-1 ${h2}`}>Why list on Awasio</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {s.benefits.map((b, i) => {
            const BI = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
            return (
              <li key={b.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${BENEFIT_TINTS[i % BENEFIT_TINTS.length]}`}>
                  <BI className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{b.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{b.text}</p>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 flex gap-3 rounded-2xl border border-slate-200 bg-slate-100/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <Users className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden />
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <strong className="font-semibold text-slate-900 dark:text-white">Who it&apos;s for:</strong> {s.audience}
          </p>
        </div>
      </div>

      {showCta && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-rose-600 to-amber-500 p-6 text-white shadow-xl shadow-rose-600/20 sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-2xl font-bold tracking-tight sm:text-3xl">Start getting enquiries today</p>
              <p className="mt-1.5 max-w-xl text-sm text-white/85 sm:text-base">Free to list, takes a few minutes, and you get 1,000 free credits on signup.</p>
            </div>
            <ListingCtaLink
              href={s.ctaHref}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
            >
              {s.ctaLabel} <ArrowRight className="h-4 w-4" />
            </ListingCtaLink>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-12">
        <div>
          <p className={eyebrow}>FAQ</p>
          <h2 className={`mt-1 ${h2}`}>Frequently asked questions</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Can&apos;t find an answer? Write to us from the contact page and we&apos;ll help you get listed.</p>
        </div>
        <div className="space-y-3">
          {s.faqs.map((f, i) => (
            <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs open:shadow-md dark:border-slate-800 dark:bg-slate-900" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-slate-900 dark:text-white [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      <div>
        <h2 className={h2}>{s.cityHeading}</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {listingCities(s).map(([name, slug]) => (
            <li key={slug}>
              <Link
                href={s.cityPath(slug)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden /> {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <nav aria-label="More ways to list on Awasio">
        <h2 className={h2}>More ways to list on Awasio</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LISTING_SEO_ORDER.filter((k) => k !== seoKey).map((k) => (
            <li key={k}>
              <Link
                href={LISTING_SEO[k].path}
                className="group flex h-full items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-rose-300 hover:text-rose-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                {LISTING_SEO[k].navLabel}
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-rose-600" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
