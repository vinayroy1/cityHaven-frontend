import type { ReactNode } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  HardHat,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import {
  SECTOR_OPTIONS,
  SERVICE_OPTIONS,
  TURNOVER_OPTIONS,
  constructionProfilePath,
  formatCr,
  formatRate,
  isInfra,
  label,
} from "@/features/construction/options";
import type { ConstructionProfile } from "@/features/construction/types";
import { InteriorPhotoCarousel } from "@/components/interiors/InteriorPhotoCarousel";
import { CompanyAvatar } from "./CompanyAvatar";

/** Directory card (server-safe: no hooks). */
/** `badge` sits on the photo's top-right; `actions` replaces the bottom buttons (owner dashboard uses both). */
export function ConstructionCard({
  p,
  priority = false,
  badge,
  actions,
  completeness,
}: {
  p: ConstructionProfile;
  priority?: boolean;
  badge?: ReactNode;
  actions?: ReactNode;
  /** Owner views: profile completeness 0–100, shown as a progress bar. */
  completeness?: number;
}) {
  const href = constructionProfilePath(p);
  const photos = Array.from(
    new Set(
      [p.coverImage, ...(p.workGallery ?? []), ...(p.projects ?? []).flatMap((x) => [x.coverImage, ...(x.images ?? [])])].filter(
        (u): u is string => Boolean(u),
      ),
    ),
  );
  const years = p.experienceYears;
  const infra = isInfra(p);
  const tags = infra ? (p.sectors ?? []).slice(0, 3).map((s) => label(SECTOR_OPTIONS, s)) : p.services.slice(0, 3).map((s) => label(SERVICE_OPTIONS, s));
  const headline = infra
    ? p.maxContractCr
      ? { k: "Largest contract", v: formatCr(p.maxContractCr, p.countryCode) }
      : p.turnoverBand
        ? { k: "Annual turnover", v: label(TURNOVER_OPTIONS, p.turnoverBand) }
        : { k: "Infrastructure", v: "Govt & private works" }
    : { k: p.quoteOnly ? "Pricing" : "Starting from", v: p.quoteOnly || !p.startingRate ? "Price on request" : formatRate(p.startingRate, p.countryCode) };
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <Link
        href={href}
        className="relative z-10 block aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950"
        aria-label={p.businessName}
      >
        <InteriorPhotoCarousel
          photos={photos}
          alt={p.businessName}
          fallback={
            <span className="flex h-full w-full items-center justify-center">
              <HardHat className="h-12 w-12 text-amber-300/80" />
            </span>
          }
          renderImage={(src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={`${p.businessName} construction work ${i + 1}`}
              className="h-full w-full object-cover"
              loading={priority && i === 0 ? "eager" : "lazy"}
            />
          )}
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
            <Building2 className="h-3 w-3" />{" "}
            {infra
              ? "Infra contractor"
              : p.providerType === "COMPANY"
                ? "Construction company"
                : "Contractor"}
          </span>
          {p.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">
              <BadgeCheck className="h-3 w-3" /> Verified
            </span>
          )}
        </span>
        {badge && <span className="absolute right-3 top-3">{badge}</span>}
        <span className="pointer-events-none absolute bottom-3 left-3 text-white">
          <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-80">
            {headline.k}
          </span>
          <span className="block text-lg font-black">{headline.v}</span>
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-slate-900 dark:text-white">
              <Link href={href} className="hover:text-rose-600 after:absolute after:inset-0 after:rounded-[inherit] after:content-['']">
                {p.businessName}
              </Link>
            </h3>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" />{" "}
              {[p.locality, p.city].filter(Boolean).join(", ")}
            </p>
          </div>
          <CompanyAvatar
            name={p.businessName}
            logo={p.logo}
            className="h-10 w-10 shrink-0 rounded-full border border-slate-200 dark:border-slate-700 text-xs"
            alt={p.businessName}
          />
        </div>
        <div className="mt-3 flex h-9 items-center gap-x-3 overflow-hidden whitespace-nowrap border-y border-slate-100 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
          {years ? (
            <span>
              <b className="text-slate-900 dark:text-white">{years}y</b>{" "}
              experience
            </span>
          ) : null}
          {p.projectCount ? (
            <span>
              <b className="text-slate-900 dark:text-white">{p.projectCount}</b>{" "}
              projects
            </span>
          ) : null}
          {infra && p.majorClients?.length ? (
            <span className="min-w-0 truncate">
              Clients: <b className="text-slate-900 dark:text-white">{p.majorClients.slice(0, 2).join(", ")}</b>
            </span>
          ) : null}
          {!infra && p.structuralWarrantyYears ? (
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />{" "}
              {p.structuralWarrantyYears}y structural warranty
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex h-6 flex-wrap gap-1.5 overflow-hidden">
          {tags.map((s) => (
            <span
              key={s}
              className="max-w-full truncate rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {s}
            </span>
          ))}
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
        <div className="relative z-10 mt-auto grid grid-cols-2 gap-2 pt-4">
          {actions ?? (
            <>
              <Link
                href={href}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                View profile
              </Link>
              <Link
                href={`${href}#quote`}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 text-sm font-bold text-white hover:bg-rose-700"
              >
                {infra ? "Send enquiry" : "Get free quote"}
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
