"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ReactNode } from "react";
import { MapPin, Pencil, Phone, Mail, ImageIcon } from "lucide-react";
import type { InteriorProfile } from "@/types/interior.types";
import { manageHref, type ManageSectionId } from "./sections";

const inr = (n?: number | null) => (n == null ? "" : `₹${Number(n).toLocaleString("en-IN")}`);
const UNIT: Record<string, string> = {
  PER_SQFT: "/sq.ft",
  PER_ROOM: "/room",
  PER_UNIT: "/unit",
  FIXED_PRICE: " fixed",
  PER_PROJECT: "/project",
};

function Card({ title, edit, pid, children }: { title: string; edit: ManageSectionId; pid?: number | null; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        <Link
          href={manageHref(edit, pid)}
          className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Link>
      </div>
      {children}
    </section>
  );
}

function Chips({ items, max = 10 }: { items?: string[] | null; max?: number }) {
  const list = (items ?? []).filter(Boolean);
  if (!list.length) return <Empty />;
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.slice(0, max).map((s) => (
        <span key={s} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {s}
        </span>
      ))}
      {list.length > max && <span className="px-1 py-1 text-xs text-slate-500">+{list.length - max} more</span>}
    </div>
  );
}

const Empty = () => <p className="text-xs italic text-slate-400">Not added yet</p>;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      {children}
    </div>
  );
}

/** Read-only snapshot of everything the provider entered, with a jump-to-edit link per section. */
export function ListingSummary({ profile: p }: { profile: InteriorProfile }) {
  const name = p.displayName || p.businessName || "Your listing";
  const projects = p.projects ?? [];
  const packages = p.packages ?? [];
  const brands = Array.from(
    new Set(
      [
        ...(p.materialSpecs ?? []).map((m) => m.brand),
        ...(p.boardBrands ?? []),
        ...(p.finishBrands ?? []),
        ...(p.hardwareBrands ?? []),
      ].filter((b): b is string => !!b),
    ),
  );
  const price = p.isCustomQuotationOnly
    ? "Custom quote"
    : p.startingRateMin != null
      ? `${inr(p.startingRateMin)}${p.startingRateMax ? ` – ${inr(p.startingRateMax)}` : ""}${UNIT[p.pricingUnit] ?? ""}`
      : "";

  return (
    <div className="space-y-4">
      <h2 className="px-1 text-sm font-bold text-slate-900 dark:text-white">Your listing at a glance</h2>

      {/* Identity */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="relative aspect-[16/5] w-full bg-gradient-to-br from-rose-100 to-amber-50 dark:from-slate-800 dark:to-slate-900">
          {p.coverBanner && <img src={p.coverBanner} alt="" className="h-full w-full object-cover" loading="lazy" />}
        </div>
        <div className="flex gap-3 p-4 sm:p-5">
          <div className="-mt-10 h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 dark:border-slate-900 dark:bg-slate-800 sm:h-20 sm:w-20">
            {p.logo ? (
              <img src={p.logo} alt={`${name} logo`} className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="m-auto mt-5 h-6 w-6 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-slate-900 dark:text-white">{name}</p>
                {p.tagline && <p className="truncate text-xs text-slate-500">{p.tagline}</p>}
              </div>
              <Link
                href={manageHref("identity", p.id)}
                className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {p.providerType === "COMPANY" ? "Company" : "Individual designer"}
              {p.experienceYears ? ` · ${p.experienceYears} yrs experience` : ""}
            </p>
            {p.about && <p className="mt-2 line-clamp-3 break-words text-sm text-slate-700 dark:text-slate-300">{p.about}</p>}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Location & service area" edit="location" pid={p.id}>
          <div className="space-y-3">
            <p className="flex items-start gap-1.5 text-sm text-slate-700 dark:text-slate-300">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span className="break-words">
                {[p.primaryAddress, p.primaryLocality, p.primaryCity, p.primaryPincode].filter(Boolean).join(", ") || "Not added yet"}
              </span>
            </p>
            <Row label="Serves">
              <Chips items={p.serviceCities} />
            </Row>
            {!!p.branches?.length && <p className="text-xs text-slate-500">{p.branches.length} branch(es)</p>}
          </div>
        </Card>

        <Card title="Services" edit="services" pid={p.id}>
          <div className="space-y-3">
            <Row label="Services">
              <Chips items={[...(p.servicesOffered ?? []), ...(p.commercialServices ?? [])]} max={8} />
            </Row>
            <Row label="Design styles">
              <Chips items={p.designStyles} />
            </Row>
          </div>
        </Card>

        <Card title="Pricing & packages" edit="pricing" pid={p.id}>
          <div className="space-y-3">
            <Row label="Starting price">
              {price ? <p className="text-lg font-bold text-slate-900 dark:text-white">{price}</p> : <Empty />}
            </Row>
            <Row label="Packages">
              {packages.length ? (
                <ul className="space-y-1">
                  {packages.map((pk) => (
                    <li key={pk.id} className="flex justify-between gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="truncate">{pk.packageName}</span>
                      <span className="shrink-0 font-semibold">
                        {inr(pk.priceMin)}
                        {UNIT[pk.pricingUnit] ?? ""}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty />
              )}
            </Row>
          </div>
        </Card>

        <Card title="Materials & brands" edit="materials" pid={p.id}>
          <Chips items={brands} max={12} />
        </Card>
      </div>

      <Card title={`Portfolio (${projects.length})`} edit="portfolio" pid={p.id}>
        {projects.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {projects.map((pr) => (
              <div key={pr.id} className="min-w-0">
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                  {pr.coverImage && <img src={pr.coverImage} alt={pr.title} className="h-full w-full object-cover" loading="lazy" />}
                </div>
                <p className="mt-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{pr.title}</p>
                <p className="truncate text-[11px] text-slate-500">
                  {[pr.bhk || pr.propertyConfig, pr.cityName].filter(Boolean).join(" · ")}
                  {pr.isApproved ? " · Approved" : " · In review"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <Empty />
        )}
      </Card>

      <Card title="Contact" edit="contact" pid={p.id}>
        <div className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
          {p.contactPerson && <p className="font-semibold">{p.contactPerson}</p>}
          {p.primaryPhone && (
            <p className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-400" /> {p.primaryPhone}
            </p>
          )}
          {p.businessEmail && (
            <p className="flex min-w-0 items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" /> <span className="truncate">{p.businessEmail}</span>
            </p>
          )}
          {!p.contactPerson && !p.primaryPhone && !p.businessEmail && <Empty />}
        </div>
      </Card>
    </div>
  );
}
