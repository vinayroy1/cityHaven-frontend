/** Shown when the selected city has too few listings: explains the fallback and offers local actions. */
import Link from "next/link";
import { ArrowRight, MapPinned, PlusCircle, Search } from "lucide-react";

const slug = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function CitySparseCard({ city, searchHref }: { city: string; searchHref: string }) {
  const actions = [
    { href: "/propertyListing", icon: PlusCircle, title: "Post your property free", sub: `Be among the first owners in ${city}`, tone: "bg-rose-600 text-white" },
    { href: `/nearby/${slug(city)}`, icon: MapPinned, title: `${city} locality guide`, sub: "Metro, hospitals & schools by area", tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
    { href: searchHref, icon: Search, title: `Search in ${city}`, sub: "See every listing we have", tone: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" },
  ];
  return (
    <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-600">Growing in {city}</p>
      <h2 className="mt-1 text-base font-bold text-slate-950 dark:text-white sm:text-lg">
        We&apos;re just getting started in {city}
      </h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
        Few listings here yet, so below are popular homes from across India.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {actions.map(({ href, icon: Icon, title, sub, tone }) => (
          <Link
            key={title}
            href={href}
            prefetch={false}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-rose-300 dark:border-slate-800"
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{title}</span>
              <span className="block truncate text-[11px] text-slate-500">{sub}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-rose-500" />
          </Link>
        ))}
      </div>
    </section>
  );
}
