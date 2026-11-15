import type { ReactNode } from "react";
import Link from "next/link";
import { BadgeCheck, Compass, Flame, Languages, MapPin, PackageCheck, Star, Video } from "lucide-react";
import { CompanyAvatar } from "@/components/construction/public/CompanyAvatar";
import { LANGUAGE_OPTIONS, SEGMENT_LABEL, formatInr, label, panditName, panditProfilePath, serviceLabel } from "@/features/pandit/options";
import type { PanditProfile } from "@/features/pandit/types";

/** Small star rating ("4.8 ★ (23)"); "New" when there are no reviews yet. */
export function RatingPill({ avg, count, className = "" }: { avg: number; count: number; className?: string }) {
  if (!count) return <span className={`inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300 ${className}`}>New</span>;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white ${className}`} aria-label={`Rated ${avg.toFixed(1)} out of 5 from ${count} reviews`}>
      {avg.toFixed(1)} <Star className="h-3 w-3 fill-current" />
      <span className="font-medium opacity-90">({count})</span>
    </span>
  );
}

/**
 * Person-first card (server-safe): the pandit's photo and name lead, not a property-style banner.
 * `badge` shows next to the name (owner status); `actions` replaces the buttons.
 */
export function PanditCard({
  p,
  badge,
  actions,
  completeness,
  service,
}: {
  p: PanditProfile;
  priority?: boolean;
  badge?: ReactNode;
  actions?: ReactNode;
  completeness?: number;
  /** Directory filtered by a service: show that service first. */
  service?: string;
}) {
  const href = panditProfilePath(p);
  const name = panditName(p);
  const vastu = p.segment === "VASTU";
  const services = service && p.services.includes(service) ? [service, ...p.services.filter((s) => s !== service)] : p.services;
  const langs = p.languages.slice(0, 3).map((l) => label(LANGUAGE_OPTIONS, l));
  const online = p.consultModes?.includes("ONLINE") || p.services.includes("ONLINE_PUJA") || p.services.includes("VASTU_ONLINE");
  const Icon = vastu ? Compass : Flame;
  return (
    <article className="relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {/* Saffron accent strip */}
      <span aria-hidden className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

      <div className="flex items-start gap-3.5">
        <Link href={href} className="relative shrink-0" aria-label={name}>
          <CompanyAvatar
            name={p.displayName}
            logo={p.photo}
            className="h-20 w-20 rounded-2xl text-xl font-black ring-2 ring-amber-200 ring-offset-2 dark:ring-amber-900 dark:ring-offset-slate-900"
            imageClassName="h-full w-full rounded-2xl object-cover"
            alt={name}
          />
          {p.isVerified && (
            <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-white p-0.5 dark:bg-slate-900" title="Verified by Awasio">
              <BadgeCheck className="h-5 w-5 fill-emerald-600 text-white" />
            </span>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">
              <Icon className="h-3 w-3" /> {SEGMENT_LABEL[p.segment] ?? "Pandit"}
            </p>
            {badge ?? <RatingPill avg={p.ratingAvg} count={p.ratingCount} className="shrink-0" />}
          </div>
          <h3 className="mt-0.5 line-clamp-2 text-base font-bold leading-snug text-slate-900 dark:text-white">
            <Link href={href} className="hover:text-rose-600">{name}</Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" /> {[p.locality, p.city].filter(Boolean).join(", ")}
          </p>
          <p className="mt-1 truncate text-xs text-slate-600 dark:text-slate-400">
            {p.experienceYears ? <><b className="text-slate-900 dark:text-white">{p.experienceYears} yrs</b> exp</> : null}
            {p.experienceYears && langs.length ? " · " : null}
            {langs.length ? <><Languages className="mb-0.5 inline h-3 w-3 text-amber-600" /> {langs.join(", ")}</> : null}
          </p>
        </div>
      </div>

      <div className="mt-3 flex h-[52px] flex-wrap content-start gap-1.5 overflow-hidden">
        {services.slice(0, 4).map((s) => (
          <span key={s} className={`max-w-full truncate rounded-full px-2.5 py-0.5 text-[11px] font-medium ${s === service ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200" : "bg-orange-50 text-orange-900 dark:bg-slate-800 dark:text-slate-300"}`}>
            {serviceLabel(s)}
          </span>
        ))}
        {services.length > 4 && <span className="px-1 py-0.5 text-[11px] font-semibold text-slate-500">+{services.length - 4} more</span>}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
        {online && <span className="inline-flex items-center gap-1"><Video className="h-3.5 w-3.5 text-sky-600" /> {vastu ? "Online consult" : "Online puja"}</span>}
        {!vastu && p.samagriArranged && <span className="inline-flex items-center gap-1"><PackageCheck className="h-3.5 w-3.5 text-emerald-600" /> Brings samagri</span>}
        {p.travelsOutstation && <span>Travels outstation</span>}
      </div>

      {typeof completeness === "number" && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-600 dark:text-slate-300">Profile completeness</span>
            <span className="text-slate-900 dark:text-white">{completeness}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={completeness} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness">
            <div className={`h-full rounded-full transition-all ${completeness >= 100 ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${Math.max(0, Math.min(100, completeness))}%` }} />
          </div>
        </div>
      )}

      <div className="mt-auto pt-3">
        <div className="flex items-end justify-between border-t border-dashed border-slate-200 pt-3 dark:border-slate-700">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{vastu ? "Consultation from" : "Dakshina from"}</p>
            <p className="text-lg font-black text-slate-950 dark:text-white">{p.startingPrice ? formatInr(p.startingPrice) : "On request"}</p>
          </div>
          {badge && <RatingPill avg={p.ratingAvg} count={p.ratingCount} />}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {actions ?? (
            <>
              <Link href={href} className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                View profile
              </Link>
              <Link href={`${href}${service ? `?service=${service}` : ""}#enquire`} className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 text-sm font-bold text-white hover:brightness-110">
                {vastu ? "Book consult" : "Check dates"}
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
