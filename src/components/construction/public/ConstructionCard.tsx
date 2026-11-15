import Link from "next/link";
import { BadgeCheck, Building2, HardHat, MapPin, ShieldCheck } from "lucide-react";
import { SERVICE_OPTIONS, constructionProfilePath, formatRate, label } from "@/features/construction/options";
import type { ConstructionProfile } from "@/features/construction/types";

/** Directory card (server-safe: no hooks). */
export function ConstructionCard({ p, priority = false }: { p: ConstructionProfile; priority?: boolean }) {
  const href = constructionProfilePath(p);
  const cover = p.coverImage || p.workGallery?.[0] || p.projects?.[0]?.coverImage || null;
  const years = p.experienceYears;
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950" aria-label={p.businessName}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={`${p.businessName} construction work`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading={priority ? "eager" : "lazy"} />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <HardHat className="h-12 w-12 text-amber-300/80" />
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
            <Building2 className="h-3 w-3" /> {p.providerType === "COMPANY" ? "Construction company" : "Contractor"}
          </span>
          {p.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">
              <BadgeCheck className="h-3 w-3" /> Verified
            </span>
          )}
        </span>
        <span className="absolute bottom-3 left-3 text-white">
          <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-80">{p.quoteOnly ? "Pricing" : "Starting from"}</span>
          <span className="block text-lg font-black">{p.quoteOnly || !p.startingRate ? "Price on request" : formatRate(p.startingRate)}</span>
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-slate-900 dark:text-white">
              <Link href={href} className="hover:text-rose-600">{p.businessName}</Link>
            </h3>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" /> {[p.locality, p.city].filter(Boolean).join(", ")}
            </p>
          </div>
          {p.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.logo} alt="" className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover dark:border-slate-700" loading="lazy" />
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-y border-slate-100 py-2 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
          {years ? <span><b className="text-slate-900 dark:text-white">{years}y</b> experience</span> : null}
          {p.projectCount ? <span><b className="text-slate-900 dark:text-white">{p.projectCount}</b> projects</span> : null}
          {p.structuralWarrantyYears ? (
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> {p.structuralWarrantyYears}y structural warranty</span>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.services.slice(0, 3).map((s) => (
            <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {label(SERVICE_OPTIONS, s)}
            </span>
          ))}
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <Link href={href} className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            View profile
          </Link>
          <Link href={`${href}#quote`} className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 text-sm font-bold text-white hover:bg-rose-700">
            Get free quote
          </Link>
        </div>
      </div>
    </article>
  );
}
