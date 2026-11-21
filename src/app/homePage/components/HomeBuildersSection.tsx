"use client";

// "Build your home" on the homepage: residential builders in the visitor's city.
// Infrastructure / govt contractors are B2B, so they get one link here instead of cards.
import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, HardHat, Landmark } from "lucide-react";
import { useSearchConstructionQuery } from "@/features/construction/api";
import { getCountry } from "@/config/countries";
import { useCountryCode } from "@/lib/country/useCountry";
import { citySlug } from "@/features/construction/options";
import { ConstructionCard } from "@/components/construction/public/ConstructionCard";
import { ViewAllCard } from "./ViewAllCard";

const MIN_ITEMS = 3;

function useIdle(timeoutMs = 1200) {
  const [idle, setIdle] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (h: number) => void };
    if (w.requestIdleCallback) {
      const h = w.requestIdleCallback(() => setIdle(true), { timeout: timeoutMs + 300 });
      return () => w.cancelIdleCallback?.(h);
    }
    const t = setTimeout(() => setIdle(true), timeoutMs);
    return () => clearTimeout(t);
  }, [timeoutMs]);
  return idle;
}

function CardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-hidden>
      <div className="aspect-[16/10] animate-pulse bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-9 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default function HomeBuildersSection({ selectedCity }: { selectedCity: string }) {
  const city = selectedCity.trim();
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const countryCode = useCountryCode();

  // 1. First fetch for the visitor's selected/detected city (the backend ignores countryCode when a city is set)
  const cityQuery = useSearchConstructionQuery(
    { city: city || undefined, countryCode, segment: "RESIDENTIAL", limit: 8 }
  );

  // 2. If the user's city has < 3 builders (e.g. smaller town), fall back to the top builders in the same
  // country. Never another country's builders: a Dubai visitor must not see Indian builders priced in ₹.
  const hasFewCityItems = Boolean(city && cityQuery.data && cityQuery.data.items.length < MIN_ITEMS);
  const fallbackQuery = useSearchConstructionQuery(
    { countryCode, segment: "RESIDENTIAL", limit: 8 },
    { skip: !hasFewCityItems }
  );

  const isFallback = Boolean(city && cityQuery.data && cityQuery.data.items.length < MIN_ITEMS);
  const data = isFallback ? fallbackQuery.data : cityQuery.data;
  const isLoading = cityQuery.isLoading || (hasFewCityItems && fallbackQuery.isLoading);

  const items = data?.items ?? [];
  const countryName = getCountry(countryCode).name;
  if (!isLoading && items.length < MIN_ITEMS) return null;

  const base = "/construction-companies";
  // Showing other cities' builders (too few in this city): link to all builders, not the near-empty city page.
  const scoped = Boolean(city) && !isFallback;
  const viewAllHref = scoped ? `${base}/${citySlug(city)}` : base;
  const infraHref = `${scoped ? `${base}/${citySlug(city)}` : base}?segment=INFRA`;
  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };
  const itemClass = "flex w-[78vw] max-w-[310px] shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] sm:max-w-none lg:w-[calc((100%-2.25rem)/4)]";

  return (
    <section className="mt-6 sm:mt-10" aria-labelledby="home-builders-heading">
      <div className="mb-2.5 flex items-end justify-between gap-3 sm:mb-3.5 sm:gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <HardHat className="h-3.5 w-3.5" />
            <span>Build your home</span>
          </div>
          <h2 id="home-builders-heading" className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl dark:text-white">
            {scoped
              ? `House construction companies in ${city}`
              : isFallback
                ? `Top house construction companies across ${countryName}`
                : "House construction companies near you"}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            {isFallback
              ? `No builders listed in ${city} yet. Showing top builders across ${countryName}.`
              : <span className="hidden sm:inline">Compare rates per sq.ft, completed homes and warranties. Free quotes.</span>}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href={viewAllHref} prefetch={false} className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 sm:text-sm dark:text-rose-400">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="hidden items-center gap-1.5 lg:flex">
            {([[-1, "left", ChevronLeft], [1, "right", ChevronRight]] as const).map(([d, l, Icon]) => (
              <button
                key={l}
                type="button"
                onClick={() => scrollBy(d)}
                aria-label={`Scroll builders ${l}`}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div ref={scrollerRef} className="no-scrollbar flex w-full snap-x snap-mandatory items-stretch gap-3 overflow-x-auto pb-3 pt-1">
        {isLoading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className={itemClass}>
                <CardSkeleton />
              </div>
            ))
          : (
            <>
              {items.slice(0, 8).map((p) => (
                <div key={p.id} className={itemClass}>
                  <ConstructionCard p={p} />
                </div>
              ))}
              <div className={itemClass}>
                <ViewAllCard href={viewAllHref} title="View all builders" subtitle="Rates, completed homes and free quotes" />
              </div>
            </>
          )}
      </div>

      {/* Infra / govt contractors: one entry point, not a card row */}
      <Link
        href={infraHref}
        prefetch={false}
        className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 sm:text-sm dark:text-slate-300"
      >
        <Landmark className="h-4 w-4 shrink-0 text-slate-400" />
        Looking for infrastructure or govt contractors? <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}
