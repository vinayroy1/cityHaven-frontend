"use client";

import { BadgeCheck, IndianRupee, MessageCircle, Sparkles } from "lucide-react";
import { ListingTypesGrid } from "@/components/common/ListOnAwasioSheet";

const PERKS = [
  [IndianRupee, "Free"],
  [MessageCircle, "Direct enquiries"],
  [BadgeCheck, "No commission"],
] as const;

/**
 * Tablet / desktop only: compact owner band just below the banner carousel (about 170px tall): a dark
 * promo panel on the left, every listing type as slim chips on the right. Phones skip it (the first screen stays for buyers); there
 * the header's List Free button and the bottom bar's Post open the chooser.
 */
export function HomeListOnAwasio() {
  return (
    <section aria-labelledby="list-on-awasio" className="mt-6 hidden text-left sm:block">
      <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[230px_1fr] dark:border-slate-800 dark:bg-slate-900">
        <div className="relative isolate flex flex-col justify-center overflow-hidden bg-slate-950 px-5 py-4 text-white">
          <span className="absolute -left-10 -top-14 -z-10 h-36 w-36 rounded-full bg-rose-500/40 blur-3xl" aria-hidden />
          <span className="absolute -bottom-14 right-0 -z-10 h-32 w-32 rounded-full bg-amber-400/30 blur-3xl" aria-hidden />
          <span className="inline-flex w-fit items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-200">
            <Sparkles className="h-3 w-3" /> For owners &amp; businesses
          </span>
          <h2 id="list-on-awasio" className="mt-1.5 text-lg font-extrabold leading-snug tracking-tight">
            Own a property or business?{" "}
            <span className="bg-gradient-to-r from-rose-300 to-amber-200 bg-clip-text text-transparent">List it free.</span>
          </h2>
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {PERKS.map(([Icon, text]) => (
              <li key={text} className="inline-flex items-center gap-1 text-[11px] text-white/75">
                <Icon className="h-3 w-3 text-emerald-300" /> {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-white p-3 dark:from-slate-900 dark:to-slate-900">
          <ListingTypesGrid />
        </div>
      </div>
    </section>
  );
}
