"use client";

import React, { useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowRight, BedDouble, ChevronLeft, ChevronRight } from "lucide-react";
import { StayCard, StayCardSkeleton } from "@/components/stays/StayCard";
import { useStaySearch } from "@/features/stays/api";
import { useCountry } from "@/lib/country/countryStore";

/**
 * Home page carousel: stays in the selected city, else across the portal country.
 * Hidden when there is nothing to show (no empty boxes on the home page).
 */
export function HomeStaysSection({ selectedCity }: { selectedCity?: string }) {
  const country = useCountry();
  const city = selectedCity?.trim() || undefined;
  const cityQ = useStaySearch({ countryCode: country.code, city }, Boolean(city));
  const allQ = useStaySearch({ countryCode: country.code });
  const cityItems = useMemo(() => cityQ.data?.pages.flatMap((p) => p.items) ?? [], [cityQ.data]);
  const allItems = useMemo(() => allQ.data?.pages.flatMap((p) => p.items) ?? [], [allQ.data]);
  const useCity = Boolean(city) && cityItems.length > 0;
  const items = (useCity ? cityItems : allItems).slice(0, 10);
  const loading = allQ.isLoading && (!city || cityQ.isLoading);
  const rail = useRef<HTMLDivElement>(null);

  if (!loading && items.length === 0) return null;

  const scrollBy = (dir: number) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.9, behavior: "smooth" });
  const item = "w-[78vw] max-w-[300px] shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] sm:max-w-none lg:w-[calc((100%-2.25rem)/4)]";

  return (
    <section className="mt-6 sm:mt-10" aria-labelledby="home-stays-heading">
      <div className="mb-2.5 flex items-end justify-between gap-3 sm:mb-3.5">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <BedDouble className="h-3.5 w-3.5" />
            <span>Hotels & stays</span>
            <span className="rounded-full bg-rose-600 px-1.5 py-px text-[9px] font-black text-white">NEW</span>
          </div>
          <h2 id="home-stays-heading" className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl dark:text-white">
            {useCity ? `Places to stay in ${city}` : `Places to stay across ${country.name}`}
          </h2>
          <p className="mt-0.5 hidden text-sm text-slate-500 sm:block dark:text-slate-400">
            Hotels, guest houses, homestays & dharamshalas — compare nightly prices, call or book directly.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/stays" prefetch={false} className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 sm:text-sm dark:text-rose-400">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="hidden items-center gap-1.5 lg:flex">
            {[-1, 1].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => scrollBy(d)}
                aria-label={d < 0 ? "Scroll stays left" : "Scroll stays right"}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {d < 0 ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div ref={rail} className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar">
        {loading
          ? [0, 1, 2, 3].map((i) => (
              <div key={i} className={item}>
                <StayCardSkeleton />
              </div>
            ))
          : items.map((s) => (
              <div key={s.id} className={item}>
                <StayCard stay={s} />
              </div>
            ))}
      </div>
    </section>
  );
}
