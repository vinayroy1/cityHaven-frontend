"use client";

import React from "react";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, CircleAlert, CircleDot, HardHat, Loader2, Plus, Send, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { PropertyListingCitySelector } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector } from "@/components/propertyListing/PropertyListingLocalitySelector";
import { getStoredUserContact } from "@/lib/auth/storedUser";
import { cn } from "@/components/ui/utils";
import { useSaveMyConstructionMutation, useSubmitMyConstructionMutation } from "@/features/construction/api";
import {
  BUILDING_TYPE_OPTIONS,
  IN_HOUSE_OPTIONS,
  MATERIAL_GROUPS,
  PACKAGE_PRESETS,
  SERVICE_OPTIONS,
} from "@/features/construction/options";
import type { ConstructionPackage, ConstructionSave, MyConstruction } from "@/features/construction/types";
import { ChipMulti, Field, PhotoUploader, TagInput, inputCls, primaryBtn, secondaryBtn, textareaCls, toInt } from "./ui";

type StepId = "basics" | "location" | "services" | "pricing" | "photos" | "contact";
const STEPS: { id: StepId; label: string; title: string; sub: string }[] = [
  { id: "basics", label: "Business", title: "Tell us about your business", sub: "This is what customers see first." },
  { id: "location", label: "Location", title: "Where do you work?", sub: "Customers search by city." },
  { id: "services", label: "Services", title: "What do you build?", sub: "Pick everything you take on." },
  { id: "pricing", label: "Pricing", title: "How do you charge?", sub: "Per sq.ft package rates help customers compare. You can also choose 'price on request'." },
  { id: "photos", label: "Photos", title: "Show your work", sub: "Optional, but listings with photos get far more enquiries." },
  { id: "contact", label: "Contact", title: "How should customers reach you?", sub: "Then review and submit for approval." },
];

const PHONE_RE = /^(\+?91|0)?[6-9]\d{9}$/;
const cleanPhone = (s: string) => s.replace(/[\s()-]/g, "");

function initialForm(d: MyConstruction | undefined): ConstructionSave {
  const p = d?.profile;
  const me = getStoredUserContact();
  return {
    providerType: p?.providerType ?? "COMPANY",
    businessName: p?.businessName && p.businessName !== "My construction company" ? p.businessName : "",
    ownerName: p?.ownerName ?? me?.name ?? "",
    yearEstablished: p?.yearEstablished ?? null,
    teamSize: p?.teamSize ?? null,
    logo: p?.logo ?? "",
    about: p?.about ?? "",
    state: p?.state ?? "",
    city: p?.city ?? "",
    locality: p?.locality ?? "",
    address: p?.address ?? "",
    pincode: p?.pincode ?? "",
    serviceCities: p?.serviceCities ?? [],
    services: p?.services ?? [],
    buildingTypes: p?.buildingTypes ?? [],
    inHouse: p?.inHouse ?? [],
    typicalDurationMonths: p?.typicalDurationMonths ?? null,
    maxConcurrentProjects: p?.maxConcurrentProjects ?? null,
    quoteOnly: p?.quoteOnly ?? false,
    packages: p?.packages?.length ? p.packages : PACKAGE_PRESETS.map((x) => ({ ...x, includes: [...x.includes] })),
    workGallery: p?.workGallery ?? [],
    materials: p?.materials ?? {},
    structuralWarrantyYears: p?.structuralWarrantyYears ?? null,
    waterproofingWarrantyYears: p?.waterproofingWarrantyYears ?? null,
    phone: p?.phone ?? me?.mobileNumber ?? "",
    whatsapp: p?.whatsapp ?? "",
    email: p?.email ?? me?.email ?? "",
    showPhone: p?.showPhone ?? true,
    gstin: p?.gstin ?? "",
  };
}

/** Only packages with a rate are saved; empty preset rows are dropped. */
const savablePackages = (pk: ConstructionPackage[] = []) =>
  pk.filter((x) => x.name.trim() && x.ratePerSqft >= 100).map((x) => ({ ...x, includes: x.includes.filter((i) => i.trim()) }));

function stepErrors(step: StepId, f: ConstructionSave): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === "basics" && !f.businessName?.trim()) e.businessName = "Enter your business name";
  if (step === "location" && !f.city?.trim()) e.city = "Choose your city";
  if (step === "services" && !(f.services ?? []).length) e.services = "Pick at least one service";
  if (step === "pricing" && !f.quoteOnly && !savablePackages(f.packages).length) e.packages = "Add a rate (₹100 or more per sq.ft) to at least one package, or choose 'price on request'";
  if (step === "contact" && !PHONE_RE.test(cleanPhone(f.phone ?? ""))) e.phone = "Enter a valid 10-digit mobile number";
  if (step === "contact" && f.whatsapp && !PHONE_RE.test(cleanPhone(f.whatsapp))) e.whatsapp = "Enter a valid WhatsApp number or leave it empty";
  return e;
}

/**
 * `setup`: first-time flow ending in "Submit for approval".
 * `edit`: same steps for a submitted / live listing; the last step just saves.
 */
export function ConstructionWizard({ data, onDone, mode = "setup" }: { data: MyConstruction | undefined; onDone?: () => void; mode?: "setup" | "edit" }) {
  const [form, setForm] = React.useState<ConstructionSave>(() => initialForm(data));
  const [stepIdx, setStepIdx] = React.useState(0);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [save, { isLoading: saving }] = useSaveMyConstructionMutation();
  const [submit, { isLoading: submitting }] = useSubmitMyConstructionMutation();
  const step = STEPS[stepIdx];
  const set = <K extends keyof ConstructionSave>(k: K, v: ConstructionSave[K]) => {
    setForm((x) => ({ ...x, [k]: v }));
    setErrors((e) => {
      if (!(k in e)) return e;
      const rest = { ...e };
      delete rest[k as string];
      return rest;
    });
  };
  const entityId = data?.profile?.id ?? "draft";
  const top = React.useRef<HTMLDivElement>(null);

  const payload = (): ConstructionSave => ({
    ...form,
    phone: form.phone ? cleanPhone(form.phone) : form.phone,
    whatsapp: form.whatsapp ? cleanPhone(form.whatsapp) : "",
    packages: savablePackages(form.packages),
    businessName: form.businessName?.trim() || undefined,
    city: form.city?.trim() || undefined,
  });

  const persist = async () => {
    try {
      return await save(payload()).unwrap();
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
    if (stepIdx < STEPS.length - 1) go(stepIdx + 1);
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
      const idx = STEPS.findIndex((s) => s.id === first?.step);
      if (idx >= 0) go(idx);
      return;
    }
    try {
      await submit().unwrap();
      toast.success("Submitted! We'll review your listing shortly.");
      onDone?.();
    } catch (err) {
      toast.error((err as { data?: { message?: string } })?.data?.message || "Couldn't submit. Please try again.");
    }
  };

  const readiness = data?.readiness;
  const busy = saving || submitting;

  return (
    <div ref={top} className="scroll-mt-24">
      {/* Progress */}
      <ol className="mb-5 grid grid-cols-6 gap-1.5" aria-label="Steps">
        {STEPS.map((s, i) => (
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
        <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Step {stepIdx + 1} of {STEPS.length}</p>
        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl dark:text-white">{step.title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{step.sub}</p>

        <div className="mt-6 space-y-5">
          {step.id === "basics" && (
            <>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Business type">
                {([
                  ["COMPANY", "Construction company", "Registered firm or builder", Building2],
                  ["INDIVIDUAL", "Independent contractor", "Thekedar / small team", User],
                ] as const).map(([v, l, h, Icon]) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={form.providerType === v}
                    onClick={() => set("providerType", v)}
                    className={cn(
                      "flex flex-col gap-1 rounded-2xl border-2 p-3 text-left transition sm:p-4",
                      form.providerType === v ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30" : "border-slate-200 hover:border-slate-300 dark:border-slate-700",
                    )}
                  >
                    <Icon className={cn("h-5 w-5", form.providerType === v ? "text-rose-600" : "text-slate-400")} />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{l}</span>
                    <span className="text-xs text-slate-500">{h}</span>
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Business name" required htmlFor="c-name" error={errors.businessName}>
                  <input id="c-name" className={inputCls} maxLength={120} placeholder="e.g. Shree Ram Constructions" value={form.businessName ?? ""} onChange={(e) => set("businessName", e.target.value)} />
                </Field>
                <Field label="Owner / contact person" htmlFor="c-owner">
                  <input id="c-owner" className={inputCls} maxLength={120} value={form.ownerName ?? ""} onChange={(e) => set("ownerName", e.target.value)} />
                </Field>
                <Field label="Working since (year)" htmlFor="c-year">
                  <input id="c-year" inputMode="numeric" className={inputCls} placeholder="e.g. 2012" maxLength={4} value={form.yearEstablished ?? ""} onChange={(e) => set("yearEstablished", toInt(e.target.value))} />
                </Field>
                <Field label="Team size" htmlFor="c-team">
                  <input id="c-team" inputMode="numeric" className={inputCls} placeholder="e.g. 25" value={form.teamSize ?? ""} onChange={(e) => set("teamSize", toInt(e.target.value))} />
                </Field>
              </div>
              <Field label="Logo or your photo" hint="Square image works best.">
                <PhotoUploader single value={form.logo ? [form.logo] : []} onChange={(v) => set("logo", v[0] ?? "")} entityId={entityId} folder="logo" label="Upload logo" />
              </Field>
              <Field label="About your company" htmlFor="c-about" hint="Experience, kind of homes you build, areas you cover. 2–4 lines is enough.">
                <textarea id="c-about" rows={4} maxLength={3000} className={textareaCls} value={form.about ?? ""} onChange={(e) => set("about", e.target.value)} />
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
                <Field label="Locality / area" htmlFor="c-loc">
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
                    <input id="c-loc" className={inputCls} disabled placeholder="Choose a city first" />
                  )}
                </Field>
                <Field label="Pincode" htmlFor="c-pin">
                  <input id="c-pin" inputMode="numeric" maxLength={6} className={inputCls} value={form.pincode ?? ""} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} />
                </Field>
              </div>
              <Field label="Office address" htmlFor="c-addr" hint="Not shown publicly in full. Helps us verify your business.">
                <input id="c-addr" className={inputCls} maxLength={300} value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
              </Field>
              <Field label="Other cities you work in" hint="Customers in these cities will also find you.">
                <TagInput value={form.serviceCities ?? []} onChange={(v) => set("serviceCities", v)} placeholder="Type a city and press Enter" max={30} />
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
              <Field label="Buildings you construct">
                <ChipMulti options={BUILDING_TYPE_OPTIONS} value={form.buildingTypes ?? []} onChange={(v) => set("buildingTypes", v)} />
              </Field>
              <Field label="In-house team & support">
                <ChipMulti options={IN_HOUSE_OPTIONS} value={form.inHouse ?? []} onChange={(v) => set("inHouse", v)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Typical time to build a G+1 house (months)" htmlFor="c-dur">
                  <input id="c-dur" inputMode="numeric" className={inputCls} placeholder="e.g. 8" value={form.typicalDurationMonths ?? ""} onChange={(e) => set("typicalDurationMonths", toInt(e.target.value))} />
                </Field>
                <Field label="Projects you can run at once" htmlFor="c-conc">
                  <input id="c-conc" inputMode="numeric" className={inputCls} placeholder="e.g. 5" value={form.maxConcurrentProjects ?? ""} onChange={(e) => set("maxConcurrentProjects", toInt(e.target.value))} />
                </Field>
              </div>
            </>
          )}

          {step.id === "pricing" && (
            <>
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-rose-600" checked={!!form.quoteOnly} onChange={(e) => set("quoteOnly", e.target.checked)} />
                <span>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">Price on request</span>
                  <span className="block text-xs text-slate-500">Don&apos;t show rates; customers ask for a quote. Listings with rates usually get more enquiries.</span>
                </span>
              </label>
              {!form.quoteOnly && (
                <div className="space-y-3">
                  {(form.packages ?? []).map((pk, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 p-3 sm:p-4 dark:border-slate-700">
                      <div className="grid grid-cols-[1fr_auto] items-end gap-3 sm:grid-cols-[1fr_200px_auto]">
                        <Field label="Package name" htmlFor={`pk-n-${i}`}>
                          <input id={`pk-n-${i}`} className={inputCls} maxLength={40} value={pk.name} onChange={(e) => set("packages", (form.packages ?? []).map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                        </Field>
                        <button
                          type="button"
                          aria-label={`Remove ${pk.name || "package"}`}
                          onClick={() => set("packages", (form.packages ?? []).filter((_, j) => j !== i))}
                          className="mb-0.5 flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 sm:order-last"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <Field label="Rate (₹ per sq.ft)" htmlFor={`pk-r-${i}`}>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₹</span>
                            <input
                              id={`pk-r-${i}`}
                              inputMode="numeric"
                              className={cn(inputCls, "pl-7 font-semibold tabular-nums")}
                              placeholder="e.g. 1,850"
                              value={pk.ratePerSqft ? pk.ratePerSqft.toLocaleString("en-IN") : ""}
                              onChange={(e) => set("packages", (form.packages ?? []).map((x, j) => (j === i ? { ...x, ratePerSqft: toInt(e.target.value) ?? 0 } : x)))}
                            />
                          </div>
                        </Field>
                      </div>
                      <div className="mt-3">
                        <p className="mb-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">What&apos;s included</p>
                        <TagInput value={pk.includes} max={20} placeholder="e.g. UltraTech cement, Tata Tiscon steel" onChange={(v) => set("packages", (form.packages ?? []).map((x, j) => (j === i ? { ...x, includes: v } : x)))} />
                      </div>
                    </div>
                  ))}
                  {(form.packages ?? []).length < 6 && (
                    <button type="button" className={secondaryBtn} onClick={() => set("packages", [...(form.packages ?? []), { name: "", ratePerSqft: 0, includes: [] }])}>
                      <Plus className="h-4 w-4" /> Add package
                    </button>
                  )}
                  {errors.packages && <p className="text-xs font-medium text-rose-600" role="alert">{errors.packages}</p>}
                  <p className="text-xs text-slate-500">Packages without a rate are not shown. Typical turnkey rates: ₹1,500–₹2,800 per sq.ft depending on city and finish.</p>
                </div>
              )}
            </>
          )}

          {step.id === "photos" && (
            <>
              <Field label="Photos of homes you've built" hint="Up to 20. Site progress and finished houses both work.">
                <PhotoUploader value={form.workGallery ?? []} onChange={(v) => set("workGallery", v)} entityId={entityId} folder="gallery" max={20} />
              </Field>
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Materials & brands you use</p>
                <p className="mb-3 text-xs text-slate-500">Optional. Tap a suggestion or type your own.</p>
                <div className="space-y-4">
                  {MATERIAL_GROUPS.slice(0, 3).map((g) => (
                    <Field key={g.key} label={g.label}>
                      <TagInput
                        value={(form.materials ?? {})[g.key] ?? []}
                        suggestions={g.suggestions}
                        onChange={(v) => set("materials", { ...(form.materials ?? {}), [g.key]: v })}
                      />
                    </Field>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Structural warranty (years)" htmlFor="c-sw">
                  <input id="c-sw" inputMode="numeric" className={inputCls} placeholder="e.g. 10" value={form.structuralWarrantyYears ?? ""} onChange={(e) => set("structuralWarrantyYears", toInt(e.target.value))} />
                </Field>
                <Field label="Waterproofing warranty (years)" htmlFor="c-ww">
                  <input id="c-ww" inputMode="numeric" className={inputCls} placeholder="e.g. 5" value={form.waterproofingWarrantyYears ?? ""} onChange={(e) => set("waterproofingWarrantyYears", toInt(e.target.value))} />
                </Field>
              </div>
            </>
          )}

          {step.id === "contact" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Mobile number" required htmlFor="c-phone" error={errors.phone}>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-1.5 left-1.5 flex items-center rounded-lg bg-slate-100 px-2.5 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">+91</span>
                    <input id="c-phone" type="tel" inputMode="numeric" autoComplete="tel-national" className={cn(inputCls, "pl-16 text-base tracking-wide")} maxLength={14} value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value.replace(/[^\d+\s]/g, ""))} />
                  </div>
                </Field>
                <Field label="WhatsApp (if different)" htmlFor="c-wa" error={errors.whatsapp}>
                  <input id="c-wa" type="tel" inputMode="numeric" className={inputCls} maxLength={14} value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value.replace(/[^\d+\s]/g, ""))} />
                </Field>
                <Field label="Email" htmlFor="c-email">
                  <input id="c-email" type="email" className={inputCls} maxLength={160} value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
                </Field>
                <Field label="GSTIN (optional)" htmlFor="c-gst" hint="Helps you get the Verified badge.">
                  <input id="c-gst" className={cn(inputCls, "uppercase")} maxLength={15} value={form.gstin ?? ""} onChange={(e) => set("gstin", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} />
                </Field>
              </div>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-rose-600" checked={!!form.showPhone} onChange={(e) => set("showPhone", e.target.checked)} />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Let signed-in customers see my number
                  <span className="block text-xs text-slate-500">Off: customers reach you only through quote requests.</span>
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
        {stepIdx < STEPS.length - 1 ? (
          <button type="button" className={cn(primaryBtn, "flex-1 sm:flex-none")} onClick={() => void next()} disabled={busy}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {step.id === "photos" && !(form.workGallery ?? []).length ? "Skip for now" : "Save & continue"} <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" className={cn(primaryBtn, "flex-1 sm:flex-none")} onClick={() => void finish()} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {mode === "edit" ? "Save changes" : "Submit for approval"}
          </button>
        )}
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
        <HardHat className="h-3.5 w-3.5" /> Our team reviews every construction listing before it goes live.
      </p>
    </div>
  );
}
