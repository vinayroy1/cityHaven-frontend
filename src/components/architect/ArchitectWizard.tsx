"use client";

import { submitCopy, toastSubmitOutcome } from "@/lib/listingReview";
import React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, CircleDot, Globe2, Loader2, PencilRuler, Plus, Send, ShieldCheck, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PropertyListingCitySelector } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector } from "@/components/propertyListing/PropertyListingLocalitySelector";
import { getStoredUserContact } from "@/lib/auth/storedUser";
import { cn } from "@/components/ui/utils";
import { useSaveMyArchitectMutation, useSubmitMyArchitectMutation } from "@/features/architect/api";
import {
  BUILDING_TYPE_OPTIONS,
  LANGUAGE_SUGGESTIONS,
  PACKAGE_PRESETS,
  PROVIDER_OPTIONS,
  QUALIFICATION_SUGGESTIONS,
  SERVICE_OPTIONS,
  UNIT_OPTIONS,
} from "@/features/architect/options";
import type { ArchitectPackage, ArchitectSave, MyArchitect } from "@/features/architect/types";
import { ChipMulti, Field, PhotoUploader, TagInput, inputCls, primaryBtn, secondaryBtn, textareaCls, toInt } from "./ui";

type StepId = "basics" | "location" | "services" | "pricing" | "photos" | "contact";
type Step = { id: StepId; label: string; title: string; sub: string };
const STEPS: Step[] = [
  { id: "basics", label: "About you", title: "Tell us about yourself", sub: "This is what people planning a home see first." },
  { id: "location", label: "Location", title: "Where do you work?", sub: "People search by city. Drawings delivered online reach every city." },
  { id: "services", label: "Services", title: "What do you design?", sub: "Pick everything you offer." },
  { id: "pricing", label: "Pricing", title: "How do you charge?", sub: "A price per sq.ft or a fixed price per package. You can also choose 'price on request'." },
  { id: "photos", label: "Portfolio", title: "Show your plans & elevations", sub: "Optional, but naksha and 3D images get far more enquiries." },
  { id: "contact", label: "Contact", title: "How should people reach you?", sub: "Then review and submit for approval." },
];

const PHONE_RE = /^(\+?91|0)?[6-9]\d{9}$/;
const cleanPhone = (s: string) => s.replace(/[\s()-]/g, "");
const ARCHITECT_WORD = /\barchitect/i;

function initialForm(d: MyArchitect | undefined): ArchitectSave {
  const p = d?.profile;
  const me = getStoredUserContact();
  return {
    providerType: p?.providerType ?? "DESIGNER",
    isFirm: p?.isFirm ?? false,
    businessName: p?.businessName && p.businessName !== "My design studio" ? p.businessName : "",
    ownerName: p?.ownerName ?? me?.name ?? "",
    yearEstablished: p?.yearEstablished ?? null,
    teamSize: p?.teamSize ?? null,
    logo: p?.logo ?? "",
    about: p?.about ?? "",
    coaNumber: p?.coaNumber ?? "",
    qualification: p?.qualification ?? "",
    licenceAuthority: p?.licenceAuthority ?? "",
    licenceNumber: p?.licenceNumber ?? "",
    canSignApprovals: p?.canSignApprovals ?? false,
    languages: p?.languages?.length ? p.languages : ["Hindi", "English"],
    state: p?.state ?? "",
    city: p?.city ?? "",
    locality: p?.locality ?? "",
    address: p?.address ?? "",
    pincode: p?.pincode ?? "",
    serviceCities: p?.serviceCities ?? [],
    worksOnline: p?.worksOnline ?? true,
    services: p?.services ?? [],
    buildingTypes: p?.buildingTypes ?? [],
    turnaroundDays: p?.turnaroundDays ?? null,
    revisionsIncluded: p?.revisionsIncluded ?? null,
    siteVisit: p?.siteVisit ?? false,
    quoteOnly: p?.quoteOnly ?? false,
    packages: p?.packages?.length ? p.packages : PACKAGE_PRESETS.map((x) => ({ ...x, includes: [...x.includes] })),
    workGallery: p?.workGallery ?? [],
    phone: p?.phone ?? me?.mobileNumber ?? "",
    whatsapp: p?.whatsapp ?? "",
    email: p?.email ?? me?.email ?? "",
    showPhone: p?.showPhone ?? true,
    gstin: p?.gstin ?? "",
  };
}

/** Only packages with a price are saved; empty preset rows are dropped. */
const validPrice = (x: ArchitectPackage) => (x.unit === "FIXED" ? x.price >= 500 : x.price >= 1 && x.price <= 5000);
const savablePackages = (pk: ArchitectPackage[] = []) =>
  pk.filter((x) => x.name.trim() && validPrice(x)).map((x) => ({ ...x, includes: x.includes.filter((i) => i.trim()) }));

function stepErrors(step: StepId, f: ArchitectSave): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === "basics") {
    if (!f.businessName?.trim()) e.businessName = "Enter your name or studio name";
    else if (f.providerType !== "ARCHITECT" && ARCHITECT_WORD.test(f.businessName))
      e.businessName = 'Only COA-registered architects can use the word "Architect". Pick "COA-registered architect" above, or use a name like "Sharma Home Planners".';
    if (f.providerType === "ARCHITECT" && !f.coaNumber?.trim()) e.coaNumber = "Enter your COA registration number, e.g. CA/2015/12345";
  }
  if (step === "location" && !f.city?.trim()) e.city = "Choose your city";
  if (step === "services" && !(f.services ?? []).length) e.services = "Pick at least one service";
  if (step === "pricing" && !f.quoteOnly && !savablePackages(f.packages).length)
    e.packages = "Add a price to at least one package (₹1–5,000 per sq.ft, or a fixed price from ₹500), or choose 'price on request'";
  if (step === "contact" && !PHONE_RE.test(cleanPhone(f.phone ?? ""))) e.phone = "Enter a valid 10-digit mobile number";
  if (step === "contact" && f.whatsapp && !PHONE_RE.test(cleanPhone(f.whatsapp))) e.whatsapp = "Enter a valid WhatsApp number or leave it empty";
  return e;
}

/**
 * `setup`: first-time flow ending in "Submit for approval".
 * `edit`: same steps for a submitted / live listing; the last step just saves.
 */
export function ArchitectWizard({ data, onDone, onCreated, mode = "setup" }: { data: MyArchitect | undefined; onDone?: () => void; onCreated?: (id: number) => void; mode?: "setup" | "edit" }) {
  const [form, setForm] = React.useState<ArchitectSave>(() => initialForm(data));
  const [stepIdx, setStepIdx] = React.useState(0);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [save, { isLoading: saving }] = useSaveMyArchitectMutation();
  const [submit, { isLoading: submitting }] = useSubmitMyArchitectMutation();
  const steps = STEPS;
  const isArchitect = form.providerType === "ARCHITECT";
  const step = steps[stepIdx];
  const set = <K extends keyof ArchitectSave>(k: K, v: ArchitectSave[K]) => {
    setForm((x) => ({ ...x, [k]: v }));
    setErrors((e) => {
      if (!(k in e)) return e;
      const rest = { ...e };
      delete rest[k as string];
      return rest;
    });
  };
  const entityId = data?.profile?.id ?? "draft";
  // Id of a listing created by this wizard's first save, so later steps update it instead of making another.
  const createdId = React.useRef<number | null>(null);
  const top = React.useRef<HTMLDivElement>(null);

  const payload = (): ArchitectSave => ({
    ...form,
    phone: form.phone ? cleanPhone(form.phone) : form.phone,
    whatsapp: form.whatsapp ? cleanPhone(form.whatsapp) : "",
    packages: savablePackages(form.packages),
    coaNumber: form.providerType === "ARCHITECT" ? form.coaNumber?.trim() || "" : form.coaNumber || undefined,
    businessName: form.businessName?.trim() || undefined,
    city: form.city?.trim() || undefined,
  });

  const persist = async () => {
    try {
      const res = await save({ profileId: createdId.current ?? data?.profile?.id ?? "new", body: payload() }).unwrap();
      if (res.profile && !createdId.current && !data?.profile) {
        createdId.current = res.profile.id;
        onCreated?.(res.profile.id);
      }
      return res;
    } catch (err) {
      const msg = (err as { data?: { message?: string } })?.data?.message;
      toast.error(msg || "Couldn't save. Check your connection and try again.");
      return null;
    }
  };

  const go = (i: number) => {
    setStepIdx(i);
    setErrors({});
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const next = async () => {
    const e = stepErrors(step.id, form);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const saved = await persist();
    if (!saved) return;
    if (stepIdx < steps.length - 1) go(stepIdx + 1);
  };

  const finish = async () => {
    const e = stepErrors("contact", form);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const saved = await persist();
    if (!saved) return;
    if (mode === "edit") {
      toast.success("Changes saved");
      onDone?.();
      return;
    }
    if (!saved.readiness.canSubmit) {
      const first = saved.readiness.items.find((i) => i.required && !i.done);
      toast.error(`Please add: ${saved.readiness.items.filter((i) => i.required && !i.done).map((i) => i.label).join(", ")}`);
      const idx = steps.findIndex((s) => s.id === first?.step);
      if (idx >= 0) go(idx);
      return;
    }
    try {
      toastSubmitOutcome(await submit(saved.profile!.id).unwrap());
      onDone?.();
    } catch (err) {
      toast.error((err as { data?: { message?: string } })?.data?.message || "Couldn't submit. Please try again.");
    }
  };

  const readiness = data?.readiness;
  const copy = submitCopy(data?.reviewRequired);
  const busy = saving || submitting;

  return (
    <div ref={top} className="scroll-mt-24">
      {/* Progress */}
      <ol className="mb-5 grid grid-cols-6 gap-1.5" aria-label="Steps">
        {steps.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => i < stepIdx && go(i)}
              disabled={i > stepIdx}
              aria-current={i === stepIdx ? "step" : undefined}
              className="group w-full text-left disabled:cursor-default"
            >
              <span className={cn("block h-1.5 rounded-full transition", i <= stepIdx ? "bg-rose-600" : "bg-slate-200 dark:bg-slate-800")} />
              <span className={cn("mt-1.5 hidden text-[11px] font-semibold sm:block", i === stepIdx ? "text-rose-600" : "text-slate-500")}>{s.label}</span>
            </button>
          </li>
        ))}
      </ol>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Step {stepIdx + 1} of {steps.length}</p>
        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl dark:text-white">{step.title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{step.id === "contact" ? copy.sub : step.sub}</p>

        <div className="mt-6 space-y-5">
          {step.id === "basics" && (
            <>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Which describes you?</p>
                <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Profile type">
                  {PROVIDER_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={form.providerType === o.value}
                      onClick={() => set("providerType", o.value)}
                      className={cn(
                        "flex flex-col gap-1 rounded-2xl border-2 p-3 text-left transition",
                        form.providerType === o.value ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30" : "border-slate-200 hover:border-slate-300 dark:border-slate-700",
                      )}
                    >
                      <span className="text-xl" aria-hidden>{o.icon}</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{o.label}</span>
                      <span className="text-xs text-slate-500">{o.hint}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  By law only COA-registered architects can be called &ldquo;Architect&rdquo;. Engineers and naksha designers are shown with their own badge.
                </p>
              </div>
              {isArchitect && (
                <div className="grid gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 sm:grid-cols-2 sm:p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
                  <Field label="COA registration number" required htmlFor="a-coa" error={errors.coaNumber} hint="We check it on the Council of Architecture register before your profile goes live.">
                    <input id="a-coa" className={cn(inputCls, "uppercase")} maxLength={40} placeholder="e.g. CA/2015/12345" value={form.coaNumber ?? ""} onChange={(e) => set("coaNumber", e.target.value.toUpperCase())} />
                  </Field>
                  <div className="flex items-start gap-2 text-xs text-emerald-800 sm:pt-7 dark:text-emerald-200">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    Verified architects get a &ldquo;COA verified&rdquo; badge, which people trust most.
                  </div>
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Firm or individual">
                {([
                  [false, "Individual", "I work on my own"],
                  [true, "Firm / studio", "A team or registered firm"],
                ] as const).map(([v, l, h]) => (
                  <button
                    key={String(v)}
                    type="button"
                    role="radio"
                    aria-checked={!!form.isFirm === v}
                    onClick={() => set("isFirm", v)}
                    className={cn(
                      "rounded-2xl border-2 p-3 text-left transition",
                      !!form.isFirm === v ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30" : "border-slate-200 hover:border-slate-300 dark:border-slate-700",
                    )}
                  >
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">{l}</span>
                    <span className="block text-xs text-slate-500">{h}</span>
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={form.isFirm ? "Firm / studio name" : "Your professional name"} required htmlFor="a-name" error={errors.businessName}>
                  <input
                    id="a-name"
                    className={inputCls}
                    maxLength={120}
                    placeholder={isArchitect ? "e.g. Sharma Architects" : form.providerType === "ENGINEER" ? "e.g. Er. Rakesh Sharma" : "e.g. Sharma Home Planners"}
                    value={form.businessName ?? ""}
                    onChange={(e) => set("businessName", e.target.value)}
                  />
                </Field>
                <Field label={form.isFirm ? "Contact person" : "Full name"} htmlFor="a-owner">
                  <input id="a-owner" className={inputCls} maxLength={120} value={form.ownerName ?? ""} onChange={(e) => set("ownerName", e.target.value)} />
                </Field>
                <Field label="Qualification" htmlFor="a-qual">
                  <input id="a-qual" list="a-qual-list" className={inputCls} maxLength={80} placeholder="e.g. B.Arch" value={form.qualification ?? ""} onChange={(e) => set("qualification", e.target.value)} />
                  <datalist id="a-qual-list">
                    {QUALIFICATION_SUGGESTIONS.map((q) => <option key={q} value={q} />)}
                  </datalist>
                </Field>
                <Field label="Practising since (year)" htmlFor="a-year">
                  <input id="a-year" inputMode="numeric" className={inputCls} placeholder="e.g. 2014" maxLength={4} value={form.yearEstablished ?? ""} onChange={(e) => set("yearEstablished", toInt(e.target.value))} />
                </Field>
              </div>
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-rose-600" checked={!!form.canSignApprovals} onChange={(e) => set("canSignApprovals", e.target.checked)} />
                <span>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">I can sign drawings for map approval</span>
                  <span className="block text-xs text-slate-500">Licensed or empanelled with a municipal corporation or development authority.</span>
                </span>
              </label>
              {form.canSignApprovals && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Licensed with" htmlFor="a-lic-auth" hint="e.g. Lucknow Development Authority, BBMP, Surat Municipal Corporation">
                    <input id="a-lic-auth" className={inputCls} maxLength={120} value={form.licenceAuthority ?? ""} onChange={(e) => set("licenceAuthority", e.target.value)} />
                  </Field>
                  <Field label="Licence number" htmlFor="a-lic-no" hint="Not shown publicly. Used for verification.">
                    <input id="a-lic-no" className={inputCls} maxLength={60} value={form.licenceNumber ?? ""} onChange={(e) => set("licenceNumber", e.target.value)} />
                  </Field>
                </div>
              )}
              <Field label="Logo or your photo" hint="Square image works best.">
                <PhotoUploader single value={form.logo ? [form.logo] : []} onChange={(v) => set("logo", v[0] ?? "")} entityId={entityId} folder="logo" label="Upload photo" />
              </Field>
              <Field label="About you" htmlFor="a-about" hint="Experience, kind of homes you design, what makes your plans good. 2–4 lines is enough.">
                <textarea id="a-about" rows={4} maxLength={3000} className={textareaCls} value={form.about ?? ""} onChange={(e) => set("about", e.target.value)} />
              </Field>
              <Field label="Languages you speak">
                <TagInput value={form.languages ?? []} max={12} suggestions={LANGUAGE_SUGGESTIONS} placeholder="e.g. Hindi" onChange={(v) => set("languages", v)} />
              </Field>
            </>
          )}

          {step.id === "location" && (
            <>
              <Field label="City" required error={errors.city}>
                <PropertyListingCitySelector
                  value={form.city ?? ""}
                  placeholder="Search your city"
                  hasError={!!errors.city}
                  onChange={(c) => {
                    if (c.name !== form.city) set("locality", "");
                    set("city", c.name);
                    if (c.state) set("state", c.state);
                  }}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Locality / area" htmlFor="a-loc">
                  {form.city ? (
                    <PropertyListingLocalitySelector
                      key={form.city}
                      value={form.locality ?? ""}
                      cityName={form.city}
                      selectedState={form.state ?? undefined}
                      placeholder="Search locality"
                      onChange={(l) => {
                        set("locality", l.name);
                        if (l.pincode && !form.pincode) set("pincode", l.pincode);
                      }}
                    />
                  ) : (
                    <input id="a-loc" className={inputCls} disabled placeholder="Choose a city first" />
                  )}
                </Field>
                <Field label="Pincode" htmlFor="a-pin">
                  <input id="a-pin" inputMode="numeric" maxLength={6} className={inputCls} value={form.pincode ?? ""} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} />
                </Field>
              </div>
              <Field label="Office address" htmlFor="a-addr" hint="Not shown publicly in full. Helps us verify your business.">
                <input id="a-addr" className={inputCls} maxLength={300} value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
              </Field>
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-rose-600" checked={!!form.worksOnline} onChange={(e) => set("worksOnline", e.target.checked)} />
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white"><Globe2 className="h-4 w-4 text-sky-600" /> I deliver drawings online, anywhere in India</span>
                  <span className="block text-xs text-slate-500">You&apos;ll also appear when people search other cities.</span>
                </span>
              </label>
              <Field label="Other cities you visit sites in" hint="People in these cities will also find you.">
                <div className="space-y-2">
                  {(form.serviceCities ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {(form.serviceCities ?? []).map((c) => (
                        <span key={c} className="inline-flex items-center gap-1 rounded-full bg-rose-50 py-1 pl-3 pr-1.5 text-sm font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">
                          {c}
                          <button type="button" aria-label={`Remove ${c}`} onClick={() => set("serviceCities", (form.serviceCities ?? []).filter((x) => x !== c))} className="rounded-full p-0.5 hover:bg-rose-100 dark:hover:bg-rose-900">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {(form.serviceCities ?? []).length < 30 && (
                    <PropertyListingCitySelector
                      key={(form.serviceCities ?? []).join("|")}
                      value=""
                      placeholder="Add a city"
                      onChange={(c) => {
                        const list = form.serviceCities ?? [];
                        if (!c.name || c.name === form.city || list.some((x) => x.toLowerCase() === c.name.toLowerCase())) return;
                        set("serviceCities", [...list, c.name]);
                      }}
                    />
                  )}
                </div>
              </Field>
            </>
          )}

          {step.id === "services" && (
            <>
              <Field label="Services" required error={errors.services}>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SERVICE_OPTIONS.map((o) => {
                    const on = (form.services ?? []).includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => set("services", on ? (form.services ?? []).filter((x) => x !== o.value) : [...(form.services ?? []), o.value])}
                        className={cn(
                          "flex items-start gap-3 rounded-2xl border-2 p-3 text-left transition",
                          on ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30" : "border-slate-200 hover:border-slate-300 dark:border-slate-700",
                        )}
                      >
                        <span className="text-xl" aria-hidden>{o.icon}</span>
                        <span className="min-w-0">
                          <span className="block text-sm font-bold text-slate-900 dark:text-white">{o.label}</span>
                          <span className="block text-xs text-slate-500">{o.hint}</span>
                        </span>
                        {on && <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-rose-600" />}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Buildings you design">
                <ChipMulti options={BUILDING_TYPE_OPTIONS} value={form.buildingTypes ?? []} onChange={(v) => set("buildingTypes", v)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Days to deliver a naksha" htmlFor="a-days" hint="Typical time for a 2D plan.">
                  <input id="a-days" inputMode="numeric" className={inputCls} placeholder="e.g. 5" value={form.turnaroundDays ?? ""} onChange={(e) => set("turnaroundDays", toInt(e.target.value))} />
                </Field>
                <Field label="Revisions included" htmlFor="a-rev">
                  <input id="a-rev" inputMode="numeric" className={inputCls} placeholder="e.g. 3" value={form.revisionsIncluded ?? ""} onChange={(e) => set("revisionsIncluded", toInt(e.target.value))} />
                </Field>
              </div>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-rose-600" checked={!!form.siteVisit} onChange={(e) => set("siteVisit", e.target.checked)} />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  I visit the plot / site
                  <span className="block text-xs text-slate-500">Measurement or a site check before designing.</span>
                </span>
              </label>
            </>
          )}

          {step.id === "pricing" && (
            <>
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-rose-600" checked={!!form.quoteOnly} onChange={(e) => set("quoteOnly", e.target.checked)} />
                <span>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">Price on request</span>
                  <span className="block text-xs text-slate-500">Don&apos;t show prices; people ask for a quote. Profiles with prices usually get more enquiries.</span>
                </span>
              </label>
              {!form.quoteOnly && (
                <div className="space-y-3">
                  {(form.packages ?? []).map((pk, i) => {
                    const upd = (patch: Partial<ArchitectPackage>) => set("packages", (form.packages ?? []).map((x, j) => (j === i ? { ...x, ...patch } : x)));
                    return (
                      <div key={i} className="rounded-2xl border border-slate-200 p-3 sm:p-4 dark:border-slate-700">
                        <div className="grid grid-cols-[1fr_auto] items-end gap-3 sm:grid-cols-[1fr_180px_150px_auto]">
                          <Field label="Package name" htmlFor={`pk-n-${i}`}>
                            <input id={`pk-n-${i}`} className={inputCls} maxLength={40} value={pk.name} onChange={(e) => upd({ name: e.target.value })} />
                          </Field>
                          <button
                            type="button"
                            aria-label={`Remove ${pk.name || "package"}`}
                            onClick={() => set("packages", (form.packages ?? []).filter((_, j) => j !== i))}
                            className="mb-0.5 flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 sm:order-last"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <Field label="Price (₹)" htmlFor={`pk-r-${i}`}>
                            <div className="relative">
                              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₹</span>
                              <input
                                id={`pk-r-${i}`}
                                inputMode="numeric"
                                className={cn(inputCls, "pl-7 font-semibold tabular-nums")}
                                placeholder={pk.unit === "FIXED" ? "e.g. 15,000" : "e.g. 12"}
                                value={pk.price ? pk.price.toLocaleString("en-IN") : ""}
                                onChange={(e) => upd({ price: toInt(e.target.value) ?? 0 })}
                              />
                            </div>
                          </Field>
                          <Field label="Charged" htmlFor={`pk-u-${i}`}>
                            <div className="grid h-11 grid-cols-2 rounded-xl border border-slate-200 p-1 dark:border-slate-700" role="radiogroup" id={`pk-u-${i}`}>
                              {UNIT_OPTIONS.map((u) => (
                                <button
                                  key={u.value}
                                  type="button"
                                  role="radio"
                                  aria-checked={pk.unit === u.value}
                                  onClick={() => upd({ unit: u.value })}
                                  className={cn("rounded-lg text-xs font-semibold transition", pk.unit === u.value ? "bg-rose-600 text-white" : "text-slate-600 dark:text-slate-300")}
                                >
                                  {u.value === "PER_SQFT" ? "/ sq.ft" : "Fixed"}
                                </button>
                              ))}
                            </div>
                          </Field>
                        </div>
                        <div className="mt-3">
                          <p className="mb-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">What&apos;s included</p>
                          <TagInput value={pk.includes} max={20} placeholder="e.g. 3D front elevation" onChange={(v) => upd({ includes: v })} />
                        </div>
                      </div>
                    );
                  })}
                  {(form.packages ?? []).length < 6 && (
                    <button type="button" className={secondaryBtn} onClick={() => set("packages", [...(form.packages ?? []), { name: "", unit: "PER_SQFT", price: 0, includes: [] }])}>
                      <Plus className="h-4 w-4" /> Add package
                    </button>
                  )}
                  {errors.packages && <p className="text-xs font-medium text-rose-600" role="alert">{errors.packages}</p>}
                  <p className="text-xs text-slate-500">Packages without a price are not shown. Typical rates: 2D naksha ₹3–15 per sq.ft, naksha with 3D ₹10–30, complete drawing sets ₹25–60.</p>
                </div>
              )}
            </>
          )}

          {step.id === "photos" && (
            <Field label="Plans, elevations & 3D views" hint="Up to 20 images. You can add full designs with plot size and facing from your dashboard later.">
              <PhotoUploader value={form.workGallery ?? []} onChange={(v) => set("workGallery", v)} entityId={entityId} folder="gallery" max={20} />
            </Field>
          )}

          {step.id === "contact" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Mobile number" required htmlFor="a-phone" error={errors.phone}>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-1.5 left-1.5 flex items-center rounded-lg bg-slate-100 px-2.5 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">+91</span>
                    <input id="a-phone" type="tel" inputMode="numeric" autoComplete="tel-national" className={cn(inputCls, "pl-16 text-base tracking-wide")} maxLength={14} value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value.replace(/[^\d+\s]/g, ""))} />
                  </div>
                </Field>
                <Field label="WhatsApp (if different)" htmlFor="a-wa" error={errors.whatsapp}>
                  <input id="a-wa" type="tel" inputMode="numeric" className={inputCls} maxLength={14} value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value.replace(/[^\d+\s]/g, ""))} />
                </Field>
                <Field label="Email" htmlFor="a-email">
                  <input id="a-email" type="email" className={inputCls} maxLength={160} value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
                </Field>
                <Field label="GSTIN (optional)" htmlFor="a-gst" hint="Helps you get the Verified badge.">
                  <input id="a-gst" className={cn(inputCls, "uppercase")} maxLength={15} value={form.gstin ?? ""} onChange={(e) => set("gstin", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} />
                </Field>
              </div>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-rose-600" checked={!!form.showPhone} onChange={(e) => set("showPhone", e.target.checked)} />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Let signed-in visitors see my number
                  <span className="block text-xs text-slate-500">Off: people reach you only through quote requests.</span>
                </span>
              </label>

              {readiness && (
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="mb-2 text-sm font-bold text-slate-900 dark:text-white">Checklist</p>
                  <ul className="space-y-1.5">
                    {readiness.items.map((i) => (
                      <li key={i.id} className="flex items-center gap-2 text-sm">
                        {i.done ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        ) : i.required ? (
                          <CircleAlert className="h-4 w-4 shrink-0 text-rose-600" />
                        ) : (
                          <CircleDot className="h-4 w-4 shrink-0 text-sky-500" />
                        )}
                        <span className={cn("flex-1", i.done ? "text-slate-500 line-through decoration-slate-300" : "text-slate-800 dark:text-slate-200")}>{i.label}</span>
                        {!i.done && <span className={cn("text-[11px] font-semibold", i.required ? "text-rose-600" : "text-slate-400")}>{i.required ? "required" : "optional"}</span>}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-slate-500">The checklist updates when you save. Optional items can be added later from your dashboard.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer actions (sticky on mobile, above the bottom menu) */}
      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 -mx-4 mt-4 flex items-center gap-2 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent px-4 pb-2 pt-4 sm:static sm:mx-0 sm:bg-none sm:px-0 sm:pb-0 dark:from-slate-950 dark:via-slate-950/95">
        <button type="button" className={secondaryBtn} onClick={() => go(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0 || busy}>
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
        </button>
        <span className="ml-auto hidden text-xs text-slate-500 sm:inline">{saving ? "Saving…" : "Saved as you go"}</span>
        {stepIdx < steps.length - 1 ? (
          <button type="button" className={cn(primaryBtn, "flex-1 sm:flex-none")} onClick={() => void next()} disabled={busy}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {step.id === "photos" && !(form.workGallery ?? []).length ? "Skip for now" : "Save & continue"} <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" className={cn(primaryBtn, "flex-1 sm:flex-none")} onClick={() => void finish()} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {mode === "edit" ? "Save changes" : copy.button}
          </button>
        )}
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
        <PencilRuler className="h-3.5 w-3.5" /> {copy.note}
      </p>
    </div>
  );
}
