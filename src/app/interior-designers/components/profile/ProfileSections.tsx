"use client";

import React from "react";
import {
  Award,
  BadgeCheck,
  Building2,
  Check,
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  User,
  Wrench,
} from "lucide-react";
import type {
  CredentialDocType,
  InteriorPackage,
  InteriorProfile,
  MaterialCategory,
  WarrantyCategory,
} from "@/types/interior.types";
import { Chips, Section, consultationSummary, workingSummary } from "./ProfileParts";
import {
  MATERIAL_CATEGORY_LABEL,
  humanize,
  nonEmpty,
  priceRange,
  profileName,
  telHref,
  waHref,
} from "./utils";

/* --------------------------------- About ---------------------------------- */

export function AboutSection({ profile }: { profile: InteriorProfile }) {
  const stats = [
    { label: "Experience", value: profile.experienceYears ? `${profile.experienceYears}+ yrs` : "" },
    { label: "Projects", value: profile.projects?.length ? String(profile.projects.length) : "" },
    { label: "Team size", value: profile.teamSizeRange || (profile.teamSize ? String(profile.teamSize) : "") },
    { label: "Established", value: profile.yearEstablished ? String(profile.yearEstablished) : "" },
    {
      label: "Project size",
      value:
        profile.areaCapacity?.minSqft || profile.minProjectAreaSqft
          ? `${(profile.areaCapacity?.minSqft ?? profile.minProjectAreaSqft)?.toLocaleString("en-IN")}–${(
              profile.areaCapacity?.maxSqft ?? profile.maxProjectAreaSqft
            )?.toLocaleString("en-IN")} sq.ft`
          : "",
    },
  ].filter((s) => s.value && !s.value.includes("undefined"));
  const styles = nonEmpty(profile.designStyles);
  const specs = nonEmpty(profile.specializations);
  const links = [
    { href: profile.website, label: "Website" },
    { href: profile.instagram, label: "Instagram" },
    { href: profile.facebook, label: "Facebook" },
    { href: profile.linkedin, label: "LinkedIn" },
    { href: profile.youtube, label: "YouTube" },
  ].filter((l): l is { href: string; label: string } => !!l.href);

  return (
    <Section id="about" title={`About ${profileName(profile)}`}>
      {profile.about?.trim() && (
        <p className="whitespace-pre-line break-words text-base leading-relaxed text-slate-700 dark:text-slate-300">{profile.about}</p>
      )}
      {stats.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-stone-50 p-4 dark:bg-slate-800/50">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</dt>
              <dd className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {styles.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Design styles</h3>
          <Chips items={styles} tone="rose" />
        </div>
      )}
      {specs.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Specialisations</h3>
          <Chips items={specs} />
        </div>
      )}
      {links.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href.startsWith("http") ? l.href : `https://${l.href}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-stone-200 px-4 text-sm font-medium text-slate-700 hover:bg-stone-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Globe className="h-4 w-4" aria-hidden />
              {l.label}
            </a>
          ))}
        </div>
      )}
    </Section>
  );
}

/* -------------------------------- Services -------------------------------- */

export function hasServices(p: InteriorProfile) {
  return (
    nonEmpty(p.servicesOffered).length +
      nonEmpty(p.commercialServices).length +
      nonEmpty(p.propertyTypesHandled).length +
      nonEmpty(p.executionCapabilities).length >
    0
  );
}

export function ServicesSection({ profile }: { profile: InteriorProfile }) {
  const services = nonEmpty([...profile.servicesOffered, ...(profile.commercialServices ?? [])]);
  const types = nonEmpty(profile.propertyTypesHandled);
  const caps = nonEmpty(profile.executionCapabilities);
  return (
    <Section id="services" title="Services">
      {services.length > 0 && (
        <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {services.map((s) => (
            <li key={s} className="flex items-start gap-2.5 text-sm text-slate-800 dark:text-slate-200">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/50">
                <Check className="h-3.5 w-3.5" aria-hidden />
              </span>
              {s}
            </li>
          ))}
        </ul>
      )}
      {types.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Property types handled</h3>
          <Chips items={types} />
        </div>
      )}
      {caps.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">In-house capabilities</h3>
          <Chips items={caps} />
        </div>
      )}
    </Section>
  );
}

/* --------------------------- Branches & service areas --------------------- */

export function AreasSection({ profile }: { profile: InteriorProfile }) {
  const branches = (profile.branches ?? []).filter((b) => b.isActive !== false);
  const cities = nonEmpty(profile.serviceCities);
  const localities = nonEmpty(profile.serviceLocalities);
  return (
    <Section id="areas" title={branches.length ? "Branches & service areas" : "Service areas"}>
      {branches.length > 0 && (
        <ul className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {branches.map((b) => {
            const phone = b.phone || b.contactNumber;
            return (
              <li key={b.id} className="rounded-2xl border border-stone-200 p-4 dark:border-slate-800">
                <p className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <Building2 className="h-4 w-4 text-rose-600" aria-hidden />
                  {b.branchName}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {nonEmpty([b.address, b.locality, b.city]).join(", ")}
                </p>
                {(b.managerName || b.branchManagerName) && (
                  <p className="mt-1 text-xs text-slate-500">Manager: {b.managerName || b.branchManagerName}</p>
                )}
                {phone && (
                  <a href={telHref(phone)} className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-rose-700 dark:text-rose-400">
                    <Phone className="h-4 w-4" aria-hidden /> Call branch
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <div className="space-y-4 text-sm">
        {profile.primaryCity && (
          <p className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden />
            Based in {nonEmpty([profile.primaryCity, profile.primaryState]).join(", ")}
            {profile.siteVisitRadiusKm ? ` · site visits within ${profile.siteVisitRadiusKm} km` : ""}
          </p>
        )}
        {cities.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Cities served</h3>
            <Chips items={cities} />
          </div>
        )}
        {localities.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Localities</h3>
            <Chips items={localities} />
          </div>
        )}
        {profile.servesOutstation && (
          <p className="text-slate-600 dark:text-slate-400">Also takes up outstation projects.</p>
        )}
      </div>
    </Section>
  );
}

/* ---------------------------- Pricing & packages -------------------------- */

const pkgPrice = (p: InteriorPackage) => priceRange(p.priceMin, p.priceMax, p.pricingUnit) || "On request";

const pkgSpec = (p: InteriorPackage, cat: MaterialCategory, legacy?: string | null) => {
  const rows = (p.materialSpecs ?? []).filter((s) => s.category === cat);
  if (rows.length) return rows.map((s) => nonEmpty([s.brand, s.spec]).join(" ")).join(", ");
  return legacy || "";
};

const pkgWarranty = (p: InteriorPackage) => {
  const w = p.warranty;
  const wood = w?.woodworkYears ?? p.woodworkWarrantyYears;
  const hw = w?.hardwareYears ?? p.hardwareWarrantyYears;
  return nonEmpty([wood ? `${wood} yr woodwork` : "", hw ? `${hw} yr hardware` : ""]).join(" · ");
};

export function hasPricing(p: InteriorProfile) {
  return (
    !!p.packages?.some((x) => x.isActive !== false) ||
    !!p.roomPricing?.some((r) => r.priceMin != null) ||
    p.startingRateMin != null ||
    p.isCustomQuotationOnly
  );
}

export function PricingSection({ profile, onQuote }: { profile: InteriorProfile; onQuote: () => void }) {
  const packages = (profile.packages ?? [])
    .filter((p) => p.isActive !== false)
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  const rooms = (profile.roomPricing ?? []).filter((r) => r.priceMin != null);
  const included = [
    profile.startingRateMaterialIncluded && "Material",
    profile.startingRateLaborIncluded && "Labour",
    profile.startingRateDesignIncluded && "Design",
    profile.startingRateGstIncluded && "GST",
  ].filter(Boolean) as string[];

  const allRows: { label: string; get: (p: InteriorPackage) => string }[] = [
    { label: "Price", get: pkgPrice },
    { label: "Best for", get: (p) => nonEmpty(p.applicableBhk?.length ? p.applicableBhk : p.applicablePropertyTypes).join(", ") },
    { label: "Board / ply", get: (p) => pkgSpec(p, "BOARD", p.boardMaterialAndBrand) },
    { label: "Finish", get: (p) => pkgSpec(p, "SURFACE_FINISH", p.finishAndBrand) },
    { label: "Hardware", get: (p) => pkgSpec(p, "HARDWARE", p.hardwareAndBrand) },
    { label: "Countertop", get: (p) => pkgSpec(p, "COUNTERTOP", p.countertopSpec) },
    { label: "Warranty", get: pkgWarranty },
    { label: "Includes", get: (p) => nonEmpty(p.inclusions).join(", ") },
    { label: "Excludes", get: (p) => nonEmpty(p.exclusions).join(", ") },
    { label: "Conditions", get: (p) => nonEmpty(p.conditions).join(", ") },
  ];
  const rows = allRows.filter((r) => packages.some((p) => r.get(p)));

  return (
    <Section id="pricing" title="Pricing & packages" subtitle="Indicative rates. Final quote depends on site measurements and finishes.">
      <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:from-rose-950/30 dark:to-amber-950/20">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {profile.isCustomQuotationOnly || profile.startingRateMin == null ? "Pricing" : "Starting rate"}
          </p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {profile.isCustomQuotationOnly || profile.startingRateMin == null
              ? "Custom quote"
              : priceRange(profile.startingRateMin, profile.startingRateMax, profile.pricingUnit)}
          </p>
          {included.length > 0 && !profile.isCustomQuotationOnly && (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Includes {included.join(", ")}
              {!profile.startingRateGstIncluded ? " · GST extra" : ""}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onQuote}
          className="min-h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          Get exact estimate
        </button>
      </div>

      {packages.length > 0 && rows.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">Compare packages</h3>
          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0" tabIndex={0} role="region" aria-label="Package comparison table, scroll horizontally">
            <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 z-10 w-32 bg-white p-3 dark:bg-slate-900">
                    <span className="sr-only">Feature</span>
                  </th>
                  {packages.map((p) => (
                    <th key={p.id} scope="col" className="min-w-[180px] rounded-t-2xl bg-stone-50 p-3 align-bottom dark:bg-slate-800/60">
                      <span className="block text-base font-bold text-slate-900 dark:text-white">{p.packageName}</span>
                      {p.packageCategory && <span className="text-xs font-normal text-slate-500">{p.packageCategory}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label}>
                    <th scope="row" className="sticky left-0 z-10 border-t border-stone-100 bg-white p-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                      {r.label}
                    </th>
                    {packages.map((p) => (
                      <td
                        key={p.id}
                        className={`border-t border-stone-100 bg-stone-50/60 p-3 align-top dark:border-slate-800 dark:bg-slate-800/30 ${
                          r.label === "Price" ? "font-bold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {r.get(p) || <span className="text-slate-400">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="sticky left-0 bg-white dark:bg-slate-900" />
                  {packages.map((p) => (
                    <td key={p.id} className="rounded-b-2xl bg-stone-50/60 p-3 dark:bg-slate-800/30">
                      <button
                        type="button"
                        onClick={onQuote}
                        className="min-h-11 w-full rounded-xl border border-rose-200 bg-white text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300"
                      >
                        Enquire
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rooms.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">Room-wise pricing</h3>
          <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-200 dark:divide-slate-800 dark:border-slate-800">
            {rooms.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span className="font-medium text-slate-800 dark:text-slate-200">{r.customLabel || humanize(r.room)}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{priceRange(r.priceMin, r.priceMax, r.unit)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}

/* --------------------------------- Materials ------------------------------ */

export function materialGroups(p: InteriorProfile) {
  const groups = new Map<string, Set<string>>();
  const add = (label: string, val?: string | null) => {
    if (!val?.trim()) return;
    if (!groups.has(label)) groups.set(label, new Set());
    groups.get(label)!.add(val.trim());
  };
  if (p.materialSpecs?.length) {
    p.materialSpecs.forEach((m) =>
      add(MATERIAL_CATEGORY_LABEL[m.category] ?? humanize(m.category), m.brand ? `${m.brand}${m.material ? ` · ${m.material}` : ""}` : m.material),
    );
  } else {
    const legacy: [MaterialCategory, string[]][] = [
      ["BOARD", [...(p.boardBrands ?? []), ...(p.boardMaterials ?? [])]],
      ["SURFACE_FINISH", [...(p.finishBrands ?? []), ...(p.surfaceFinishes ?? [])]],
      ["HARDWARE", [...(p.hardwareBrands ?? []), ...(p.hardwareFittings ?? [])]],
      ["COUNTERTOP", p.countertops ?? []],
      ["FLOORING", p.flooringAndWalls ?? []],
    ];
    legacy.forEach(([cat, vals]) => vals.forEach((v) => add(MATERIAL_CATEGORY_LABEL[cat], v)));
  }
  return Array.from(groups, ([label, set]) => ({ label, items: Array.from(set) }));
}

export function MaterialsSection({ groups }: { groups: { label: string; items: string[] }[] }) {
  return (
    <Section id="materials" title="Material specifications" subtitle="Brands and materials this studio commits to.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g.label} className="rounded-2xl border border-stone-200 p-4 dark:border-slate-800">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{g.label}</h3>
            <ul className="flex flex-wrap gap-2">
              {g.items.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ----------------------------------- Team --------------------------------- */

export function TeamSection({ profile }: { profile: InteriorProfile }) {
  const members = (profile.teamMembers ?? []).filter((m) => m.isPublic !== false && m.name);
  return (
    <Section id="team" title="Meet the team">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {members.map((m) => (
          <li key={m.id} className="flex gap-4 rounded-2xl border border-stone-200 p-4 dark:border-slate-800">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-stone-100 dark:bg-slate-800">
              {m.profilePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.profilePhoto} alt={m.name} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-stone-400">
                  <User className="h-7 w-7" aria-hidden />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white">{m.name}</p>
              {m.designation && <p className="text-sm text-rose-700 dark:text-rose-400">{m.designation}</p>}
              <p className="mt-1 text-xs text-slate-500">
                {nonEmpty([m.experienceYears ? `${m.experienceYears} yrs exp` : "", m.qualification, m.specialization]).join(" · ")}
              </p>
              {m.introduction && <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">{m.introduction}</p>}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* -------------------------------- Credentials ----------------------------- */

const CRED_LABEL: Record<CredentialDocType, string> = {
  GST_CERT: "GST registration",
  PAN: "PAN",
  COI: "Certificate of incorporation",
  MSME: "MSME / Udyam",
  TRADE_LICENSE: "Trade licence",
  COA_REG: "Council of Architecture registration",
  IIID_MEMBERSHIP: "IIID membership",
  DEGREE: "Design degree",
  ID_PROOF: "Identity verified",
  OTHER: "Other document",
};

export function credentialItems(p: InteriorProfile) {
  const items = new Set<string>();
  (p.credentials ?? []).filter((c) => c.status === "VERIFIED").forEach((c) => items.add(CRED_LABEL[c.type] ?? humanize(c.type)));
  if (p.coaRegistrationNumber) items.add(CRED_LABEL.COA_REG);
  if (p.iiidMembershipNumber) items.add(CRED_LABEL.IIID_MEMBERSHIP);
  if (p.qualification) items.add(nonEmpty([p.qualification, p.institute]).join(", "));
  return {
    docs: Array.from(items),
    awards: nonEmpty(p.awards),
    certs: nonEmpty(p.certifications),
  };
}

export function CredentialsSection({ profile }: { profile: InteriorProfile }) {
  const { docs, awards, certs } = credentialItems(profile);
  return (
    <Section id="credentials" title="Credentials & verification">
      {profile.isVerified && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
          <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-600" aria-hidden />
          <div>
            <p className="font-semibold text-emerald-900 dark:text-emerald-300">Verified by Awasio</p>
            <p className="text-sm text-emerald-800/80 dark:text-emerald-400/80">
              Business documents and portfolio were reviewed
              {profile.verifiedAt ? ` on ${new Date(profile.verifiedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : ""}.
            </p>
          </div>
        </div>
      )}
      {docs.length > 0 && (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {docs.map((d) => (
            <li key={d} className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
              <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
              {d}
            </li>
          ))}
        </ul>
      )}
      {[...awards, ...certs].length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Awards & certifications</h3>
          <ul className="space-y-2">
            {[...awards, ...certs].map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Award className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}

/* --------------------------------- Warranty ------------------------------- */

const WARRANTY_LABEL: Record<WarrantyCategory, string> = {
  WOODWORK: "Woodwork",
  HARDWARE: "Hardware",
  CIVIL: "Civil work",
  ELECTRICAL: "Electrical",
  PLUMBING: "Plumbing",
  PAINT: "Paint",
  APPLIANCES: "Appliances",
  OTHER: "Other",
};

export function warrantyRows(p: InteriorProfile) {
  const fmt = (y?: number | null, m?: number | null) =>
    nonEmpty([y ? `${y} yr${y > 1 ? "s" : ""}` : "", m ? `${m} mo` : ""]).join(" ");
  if (p.warranties?.length) {
    return p.warranties
      .map((w) => ({ id: w.id, label: WARRANTY_LABEL[w.category] ?? humanize(w.category), term: fmt(w.years, w.months), coverage: w.coverage?.trim() || "" }))
      .filter((w) => w.term);
  }
  return [
    { id: "w", label: "Woodwork", term: fmt(p.woodworkWarrantyYears), coverage: "" },
    { id: "h", label: "Hardware", term: fmt(p.hardwareWarrantyYears), coverage: "" },
    { id: "c", label: "Civil work", term: fmt(p.civilWarrantyYears), coverage: "" },
  ].filter((w) => w.term);
}

export function WarrantySection({ profile }: { profile: InteriorProfile }) {
  const rows = warrantyRows(profile);
  const s = profile.support;
  const maint = s?.freeMaintenanceMonths ?? profile.freeMaintenanceMonths;
  const channels = nonEmpty(s?.channels).map(humanize);
  return (
    <Section id="warranty" title="Warranty & after-sales">
      {rows.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {rows.map((w) => (
            <li key={w.id} className="rounded-2xl border border-stone-200 p-4 dark:border-slate-800">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{w.label}</p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{w.term}</p>
              {w.coverage && <p className="mt-1 text-xs text-slate-500">{w.coverage}</p>}
            </li>
          ))}
        </ul>
      )}
      <ul className="mt-5 space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
        {maint ? (
          <li className="flex items-start gap-2">
            <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden />
            {maint} months of free maintenance after handover
          </li>
        ) : null}
        {s?.responseTimeHours ? (
          <li className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden />
            Responds to service requests within {s.responseTimeHours} hours
          </li>
        ) : null}
        {channels.length > 0 && (
          <li className="flex items-start gap-2">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden />
            Support via {channels.join(", ")}
          </li>
        )}
        {(s?.afterSalesNote || profile.warrantyClaimProcess) && (
          <li className="rounded-xl bg-stone-50 p-3 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
            {s?.afterSalesNote || profile.warrantyClaimProcess}
          </li>
        )}
      </ul>
    </Section>
  );
}

export function hasWarranty(p: InteriorProfile) {
  return warrantyRows(p).length > 0 || !!p.support?.freeMaintenanceMonths || !!p.freeMaintenanceMonths || !!p.support?.afterSalesNote;
}

/* --------------------------------- Reviews -------------------------------- */

export function ReviewsSection({ profile, onQuote }: { profile: InteriorProfile; onQuote: () => void }) {
  const rating = Number(profile.rating);
  const has = (profile.reviewCount ?? 0) > 0 && rating > 0;
  return (
    <Section id="reviews" title="Reviews">
      {has ? (
        <div className="flex items-center gap-4">
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{rating.toFixed(1)}</p>
          <div>
            <div className="flex" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`h-5 w-5 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} aria-hidden />
              ))}
            </div>
            <p className="text-sm text-slate-500">Based on {profile.reviewCount} reviews</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center dark:border-slate-700">
          <Star className="mx-auto h-8 w-8 text-stone-300" aria-hidden />
          <p className="mt-2 font-semibold text-slate-900 dark:text-white">No reviews yet</p>
          <p className="mt-1 text-sm text-slate-500">Worked with {profileName(profile)}? Reviews open after a verified project.</p>
          <button type="button" onClick={onQuote} className="mt-4 min-h-11 rounded-xl border border-stone-300 px-5 text-sm font-semibold text-slate-800 hover:bg-stone-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
            Start a project
          </button>
        </div>
      )}
    </Section>
  );
}

/* --------------------------------- Contact -------------------------------- */

export function ContactSection({ profile, onQuote }: { profile: InteriorProfile; onQuote: () => void }) {
  const name = profileName(profile);
  const phone = profile.isPhonePublic ? profile.primaryPhone || profile.contact?.phone : null;
  const whatsapp = profile.whatsappPhone || profile.contact?.whatsapp;
  const email = profile.isEmailPublic ? profile.businessEmail || profile.contact?.email : null;
  const hours = workingSummary(profile);
  const consult = consultationSummary(profile);
  const contactName = profile.contact?.contactName || profile.contactPerson;

  return (
    <Section id="contact" title="Contact & enquiry">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          {contactName && (
            <li className="flex items-start gap-2">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {contactName}
            </li>
          )}
          {profile.primaryAddress && (
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <span className="break-words">{profile.primaryAddress}</span>
            </li>
          )}
          {hours && (
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {hours}
            </li>
          )}
          {consult && (
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
              {consult}
              {profile.requiresAppointment ? " · by appointment" : ""}
            </li>
          )}
          {profile.typicalExecutionDurationText && (
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              Typical execution: {profile.typicalExecutionDurationText}
            </li>
          )}
        </ul>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onQuote}
            className="min-h-12 rounded-xl bg-rose-600 text-sm font-bold text-white shadow-md hover:bg-rose-700"
          >
            Get free quote
          </button>
          {whatsapp && (
            <a
              href={waHref(whatsapp, `Hi ${name}, I found you on Awasio and would like a quote.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300"
            >
              <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
            </a>
          )}
          {phone && (
            <a href={telHref(phone)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-200 text-sm font-semibold text-slate-800 hover:bg-stone-50 dark:border-slate-700 dark:text-slate-200">
              <Phone className="h-4 w-4" aria-hidden /> Call {phone}
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="inline-flex min-h-12 items-center justify-center gap-2 break-all rounded-xl border border-stone-200 px-3 text-sm font-semibold text-slate-800 hover:bg-stone-50 dark:border-slate-700 dark:text-slate-200">
              <Mail className="h-4 w-4 shrink-0" aria-hidden /> {email}
            </a>
          )}
        </div>
      </div>
    </Section>
  );
}

