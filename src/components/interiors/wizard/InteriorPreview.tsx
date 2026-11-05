"use client";

import { BadgeCheck, MapPin, ShieldCheck, Star } from "lucide-react";
import type { InteriorWizardValues } from "@/types/interior.types";
import { formatINR } from "./custom/ui";
import { warrantySummary } from "./custom/WarrantyMatrix";
import { projectCaption } from "./custom/PortfolioManager";

const unitLabel: Record<string, string> = { PER_SQFT: "/sq.ft", PER_ROOM: "/room", PER_PROJECT: "/project", FIXED_PRICE: "" };

export const displayName = (v: InteriorWizardValues) =>
  (v.identity.providerType === "COMPANY" ? v.identity.businessName : v.identity.displayName || v.identity.fullName) || "Your studio name";

export function startingPriceText(v: InteriorWizardValues) {
  if (v.pricing.priceMode === "QUOTE_ONLY") return "Price on request";
  if (v.pricing.startingRateMin != null) return `From ${formatINR(v.pricing.startingRateMin, v.location?.countryCode)}${unitLabel[v.pricing.pricingUnit] ?? ""}`;
  const p = v.pricing.packages.filter((x) => x.isActive && x.priceMin != null).sort((a, b) => (a.priceMin ?? 0) - (b.priceMin ?? 0))[0];
  return p ? `From ${formatINR(p.priceMin, v.location?.countryCode)}${unitLabel[p.pricingUnit] ?? ""}` : "Add a starting price";
}

/** Directory card exactly as homeowners see it in search results. */
export function InteriorDirectoryCard({ values: v }: { values: InteriorWizardValues }) {
  const cover = v.identity.coverBanner || v.portfolio.projects.find((p) => p.coverImage)?.coverImage;
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-50 to-stone-200 dark:from-slate-800 dark:to-slate-900">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="size-full object-cover" />
        )}
        {v.identity.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.identity.logo} alt="" className="absolute bottom-3 left-3 size-12 rounded-xl border-2 border-white object-cover shadow" />
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-white">{displayName(v)}</h3>
          {v.team.credentials.some((c) => c.status === "VERIFIED") && <BadgeCheck className="size-5 shrink-0 text-sky-600" aria-label="Verified" />}
        </div>
        {v.identity.tagline && <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{v.identity.tagline}</p>}
        <p className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="size-3.5" /> {[v.location.primaryLocality, v.location.primaryCity].filter(Boolean).join(", ") || "Your city"}
        </p>
        {v.services.designStyles.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {v.services.designStyles.slice(0, 3).map((s) => (
              <span key={s} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700 dark:bg-slate-800 dark:text-slate-300">{s}</span>
            ))}
          </div>
        )}
        <p className="pt-1 text-sm font-semibold text-slate-900 dark:text-white">{startingPriceText(v)}</p>
      </div>
    </article>
  );
}

/** Condensed public profile (preview pane + "Preview as homeowner"). */
export function InteriorProfilePreview({ values: v, compact }: { values: InteriorWizardValues; compact?: boolean }) {
  const warranty = warrantySummary(v.warranty.warranties);
  const packages = v.pricing.packages.filter((p) => p.isActive);
  const projects = v.portfolio.projects.slice(0, compact ? 2 : 6);
  return (
    <div className="space-y-5">
      <InteriorDirectoryCard values={v} />
      {!compact && v.identity.about && <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">{v.identity.about}</p>}
      {v.services.servicesOffered.length > 0 && (
        <section>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Services</h4>
          <p className="text-sm">{v.services.servicesOffered.slice(0, compact ? 4 : 20).join(" · ")}</p>
        </section>
      )}
      {packages.length > 0 && (
        <section>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Packages</h4>
          <ul className="grid grid-cols-2 gap-2">
            {packages.map((p) => (
              <li key={p.id} className="rounded-xl border border-slate-200 p-2.5 text-sm dark:border-slate-700">
                <p className="font-semibold">{p.packageName}</p>
                <p className="text-xs text-slate-500">{p.priceMin != null ? `${formatINR(p.priceMin)}${unitLabel[p.pricingUnit] ?? ""}` : "On request"}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {projects.length > 0 && (
        <section>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Projects</h4>
          <ul className="grid grid-cols-2 gap-2">
            {projects.map((p) => (
              <li key={p.id}>
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                  {p.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverImage} alt="" className="size-full object-cover" />
                  )}
                </div>
                <p className="mt-1 truncate text-xs font-medium">{p.title || "Untitled"}</p>
                <p className="truncate text-[11px] text-slate-500">{projectCaption(p)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {warranty && (
        <p className="flex items-center gap-1.5 text-sm text-emerald-800 dark:text-emerald-200">
          <ShieldCheck className="size-4" /> {warranty}
        </p>
      )}
      {!compact && v.portfolio.projects.length === 0 && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500"><Star className="size-3.5" /> Projects you add appear here.</p>
      )}
    </div>
  );
}

/** For VerticalConfig.renderPreview (pane ≥1280px, sheet below). */
export const renderInteriorPreview = (values: InteriorWizardValues) => (
  // The shell's pane / sheet already titles this "Live preview" / "Preview".
  <InteriorProfilePreview values={values} compact />
);
