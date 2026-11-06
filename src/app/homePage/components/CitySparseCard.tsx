/** Shown when the selected city has too few listings: explains the fallback and offers local actions. */
import Link from "next/link";
import { ArrowRight, MapPinned, PlusCircle, Rocket, Search } from "lucide-react";

const slug = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function CitySparseCard({ city, searchHref }: { city: string; searchHref: string }) {
  const secondary = [
    { href: `/nearby/${slug(city)}`, icon: MapPinned, title: `${city} locality guide`, sub: "Metro, hospitals & schools by area", tone: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300" },
    { href: searchHref, icon: Search, title: `Search in ${city}`, sub: "See every listing we have", tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
  ];
  return (
    <section className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-rose-50/80 via-white to-amber-50/60 p-4 shadow-xs sm:p-5 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-900/20" />
      <Rocket aria-hidden className="pointer-events-none absolute -bottom-4 right-4 h-24 w-24 rotate-12 text-rose-600/[0.06] sm:h-32 sm:w-32" />

      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 shadow-xs ring-1 ring-rose-200/70 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
          </span>
          Now growing in {city}
        </span>
        <h2 className="mt-2 text-lg font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl dark:text-white">
          We&apos;re just getting started in{" "}
          <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 bg-clip-text text-transparent">{city}</span>
        </h2>
        <p className="mt-0.5 text-xs text-slate-600 sm:text-sm dark:text-slate-400">
          Only a few listings here so far, so below are popular homes from other cities.
        </p>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-[1.2fr_1fr_1fr]">
          {/* Primary: post property */}
          <Link
            href="/propertyListing"
            prefetch={false}
            className="group relative flex items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-br from-rose-600 to-rose-500 p-3.5 text-white shadow-md shadow-rose-600/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-600/30"
          >
            <span aria-hidden className="absolute -right-6 -top-8 h-20 w-20 rounded-full bg-white/15 blur-xl" />
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/30">
              <PlusCircle className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="truncate text-sm font-bold">Post your property free</span>
                <span className="shrink-0 rounded-full bg-amber-300 px-1.5 py-px text-[9px] font-black uppercase text-rose-900">0%</span>
              </span>
              <span className="block truncate text-[11px] text-white/85">Be among the first owners in {city}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" />
          </Link>

          {secondary.map(({ href, icon: Icon, title, sub, tone }) => (
            <Link
              key={title}
              href={href}
              prefetch={false}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3.5 transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950/60"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{title}</span>
                <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">{sub}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-rose-500" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
