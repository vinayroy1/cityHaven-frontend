"use client";

import { submitCopy, toastSubmitOutcome } from "@/lib/listingReview";
import React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, CircleDot, Compass, Flame, Loader2, Send, User, Users, X } from "lucide-react";
import { toast } from "sonner";
import { PropertyListingCitySelector } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector } from "@/components/propertyListing/PropertyListingLocalitySelector";
import { ChipMulti, Field, PhotoUploader, TagInput, inputCls, primaryBtn, textareaCls, toInt } from "@/components/construction/ui";
import { cn } from "@/components/ui/utils";
import { getStoredUserContact } from "@/lib/auth/storedUser";
import { useSaveMyPanditMutation, useSubmitMyPanditMutation } from "@/features/pandit/api";
import {
  ALL_SERVICE_OPTIONS,
  CONSULT_MODE_OPTIONS,
  HONORIFIC_SUGGESTIONS,
  LANGUAGE_OPTIONS,
  SERVICE_GROUPS,
  TRADITION_OPTIONS,
  serviceLabel,
} from "@/features/pandit/options";
import type { ConsultMode, MyPandit, PanditSave, PanditSegment, RateCardItem } from "@/features/pandit/types";

type StepId = "basics" | "location" | "services" | "pricing" | "photos" | "contact";
type Step = { id: StepId; label: string; title: string; sub: string };
const steps = (vastu: boolean): Step[] => [
  { id: "basics", label: "About you", title: "Tell families about yourself", sub: "This is what people see first." },
  { id: "location", label: "Location", title: "Where do you serve?", sub: "People search by city and area." },
  { id: "services", label: vastu ? "Consultations" : "Pujas", title: vastu ? "What do you consult on?" : "Which pujas do you perform?", sub: "Pick everything you offer, plus your languages." },
  { id: "pricing", label: vastu ? "Fees" : "Dakshina", title: vastu ? "Your consultation fees" : "Your dakshina", sub: "Optional, but profiles with fees get more enquiries. Leave a service empty for 'on request'." },
  { id: "photos", label: "Photos", title: "Photos & videos", sub: "Pujas you've performed, your mandir, or site visits." },
  { id: "contact", label: "Contact", title: "How should people reach you?", sub: "Then review and submit for approval." },
];

const PHONE_RE = /^(\+?91|0)?[6-9]\d{9}$/;
const cleanPhone = (s: string) => s.replace(/[\s()-]/g, "");
const URL_RE = /^https?:\/\/\S+$/i;

function initialForm(d: MyPandit | undefined): PanditSave {
  const p = d?.profile;
  const me = getStoredUserContact();
  const urlSegment = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("segment") === "VASTU" ? "VASTU" : null;
  return {
    segment: p?.segment ?? urlSegment ?? "PANDIT",
    providerType: p?.providerType ?? "INDIVIDUAL",
    displayName: p?.displayName && p.displayName !== "My listing" ? p.displayName : me?.name ?? "",
    honorific: p?.honorific ?? "",
    experienceYears: p?.experienceYears ?? null,
    teamSize: p?.teamSize ?? null,
    qualification: p?.qualification ?? "",
    gurukul: p?.gurukul ?? "",
    photo: p?.photo ?? "",
    about: p?.about ?? "",
    state: p?.state ?? "",
    city: p?.city ?? "",
    locality: p?.locality ?? "",
    address: p?.address ?? "",
    pincode: p?.pincode ?? "",
    serviceCities: p?.serviceCities ?? [],
    travelsOutstation: p?.travelsOutstation ?? false,
    services: p?.services ?? [],
    languages: p?.languages ?? ["HINDI", "SANSKRIT"],
    traditions: p?.traditions ?? [],
    consultModes: p?.consultModes ?? [],
    specializations: p?.specializations ?? [],
    samagriArranged: p?.samagriArranged ?? false,
    noticeDays: p?.noticeDays ?? null,
    rateCard: p?.rateCard ?? [],
    gallery: p?.gallery ?? [],
    videos: p?.videos ?? [],
    phone: p?.phone ?? me?.mobileNumber ?? "",
    whatsapp: p?.whatsapp ?? "",
    email: p?.email ?? me?.email ?? "",
    showPhone: p?.showPhone ?? true,
  };
}

function stepErrors(step: StepId, f: PanditSave): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === "basics" && !f.displayName?.trim()) e.displayName = "Enter your name";
  if (step === "location" && !f.city?.trim()) e.city = "Choose your city";
  if (step === "services" && !(f.services ?? []).length) e.services = f.segment === "VASTU" ? "Pick at least one consultation" : "Pick at least one puja";
  if (step === "services" && !(f.languages ?? []).length) e.languages = "Pick at least one language";
  if (step === "pricing" && (f.rateCard ?? []).some((r) => r.priceTo && r.priceTo < r.priceFrom)) e.rateCard = "The 'up to' amount must be more than the 'from' amount";
  if (step === "photos" && (f.videos ?? []).some((v) => !URL_RE.test(v))) e.videos = "Video links must start with https://";
  if (step === "contact" && !PHONE_RE.test(cleanPhone(f.phone ?? ""))) e.phone = "Enter a valid 10-digit mobile number";
  if (step === "contact" && f.whatsapp && !PHONE_RE.test(cleanPhone(f.whatsapp))) e.whatsapp = "Enter a valid WhatsApp number or leave it empty";
  return e;
}

/** `setup`: first-time flow ending in "Submit for approval". `edit`: same steps; the last step just saves. */
export function PanditWizard({ data, onDone, onCreated, mode = "setup" }: { data: MyPandit | undefined; onDone?: () => void; onCreated?: (id: number) => void; mode?: "setup" | "edit" }) {
  const [form, setForm] = React.useState<PanditSave>(() => initialForm(data));
  const [stepIdx, setStepIdx] = React.useState(0);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [save, { isLoading: saving }] = useSaveMyPanditMutation();
  const [submit, { isLoading: submitting }] = useSubmitMyPanditMutation();
  const vastu = form.segment === "VASTU";
  const STEPS = steps(vastu);
  const step = STEPS[stepIdx];
  const set = <K extends keyof PanditSave>(k: K, v: PanditSave[K]) => {
    setForm((x) => ({ ...x, [k]: v }));
    setErrors((e) => {
      if (!(k in e)) return e;
      const rest = { ...e };
      delete rest[k as string];
      return rest;
    });
  };
  const entityId = `pandit-${data?.profile?.id ?? "draft"}`;
  const createdId = React.useRef<number | null>(null);
  const top = React.useRef<HTMLDivElement>(null);

  const payload = (): PanditSave => {
    const services = form.services ?? [];
    return {
      ...form,
      phone: form.phone ? cleanPhone(form.phone) : form.phone,
      whatsapp: form.whatsapp ? cleanPhone(form.whatsapp) : "",
      displayName: form.displayName?.trim() || undefined,
      city: form.city?.trim() || undefined,
      rateCard: (form.rateCard ?? []).filter((r) => services.includes(r.service) && r.priceFrom > 0),
    };
  };

  const persist = async () => {
    try {
      const res = await save({ profileId: createdId.current ?? data?.profile?.id ?? "new", body: payload() }).unwrap();
      if (res.profile && !createdId.current && !data?.profile) {
        createdId.current = res.profile.id;
        onCreated?.(res.profile.id);
      }
      return res;
    } catch (err) {
      toast.error((err as { data?: { message?: string } })?.data?.message || "Couldn't save. Check your connection and try again.");
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
    if (!(await persist())) return;
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
      const missing = saved.readiness.items.filter((i) => i.required && !i.done);
      toast.error(`Please add: ${missing.map((i) => i.label).join(", ")}`);
      const idx = STEPS.findIndex((s) => s.id === missing[0]?.step);
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

  const toggleService = (v: string) => {
    const list = form.services ?? [];
    set("services", list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  };
  const rate = (service: string) => (form.rateCard ?? []).find((r) => r.service === service);
  const setRate = (service: string, patch: Partial<RateCardItem>) => {
    const card = form.rateCard ?? [];
    const cur = card.find((r) => r.service === service) ?? { service, priceFrom: 0 };
    const nextCard = card.some((r) => r.service === service) ? card.map((r) => (r.service === service ? { ...cur, ...patch } : r)) : [...card, { ...cur, ...patch }];
    set("rateCard", nextCard);
  };

  const groups = SERVICE_GROUPS.filter((g) => (vastu ? g.key === "vastu" || g.key === "other" : g.key !== "vastu"));
  const readiness = data?.readiness;
  const copy = submitCopy(data?.reviewRequired);
  const busy = saving || submitting;

  return (
    <div ref={top} className="scroll-mt-24">
      <ol className="mb-5 grid grid-cols-6 gap-1.5" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <button type="button" onClick={() => i < stepIdx && go(i)} disabled={i > stepIdx} aria-current={i === stepIdx ? "step" : undefined} className="group w-full text-left disabled:cursor-default">
              <span className={cn("block h-1.5 rounded-full transition", i <= stepIdx ? "bg-rose-600" : "bg-slate-200 dark:bg-slate-800")} />
              <span className={cn("mt-1.5 hidden text-[11px] font-semibold sm:block", i === stepIdx ? "text-rose-600" : "text-slate-500")}>{s.label}</span>
            </button>
          </li>
        ))}
      </ol>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Step {stepIdx + 1} of {STEPS.length}</p>
        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl dark:text-white">{step.title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{step.id === "contact" ? copy.sub : step.sub}</p>

        <div className="mt-6 space-y-5">
          {step.id === "basics" && (
            <>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">What do you offer?</p>
                <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Kind of service">
                  {([
                    ["PANDIT", "Pandit / Purohit", "Pujas, katha, havan, sanskars, weddings", Flame],
                    ["VASTU", "Vastu consultant", "Home, plot, office & floor plan vastu", Compass],
                  ] as const).map(([v, l, h, Icon]) => (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={form.segment === v}
                      onClick={() => {
                        if (form.segment === v) return;
                        set("segment", v as PanditSegment);
                        // Keep only services that fit the new kind (vastu shanti puja stays for both).
                        set("services", (form.services ?? []).filter((s) => (v === "VASTU" ? s.startsWith("VASTU") || ["MUHURAT", "KUNDALI"].includes(s) : !s.startsWith("VASTU_") || s === "VASTU_SHANTI")));
                      }}
                      className={cn("flex items-start gap-3 rounded-2xl border-2 p-3 text-left transition sm:p-4", form.segment === v ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30" : "border-slate-200 hover:border-slate-300 dark:border-slate-700")}
                    >
                      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", form.segment === v ? "text-rose-600" : "text-slate-400")} />
                      <span>
                        <span className="block text-sm font-bold text-slate-900 dark:text-white">{l}</span>
                        <span className="block text-xs text-slate-500">{h}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-slate-500">Do both? Pick your main work here. You can still add the other kind of services later.</p>
              </div>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Individual or team">
                {([
                  ["INDIVIDUAL", "Individual", "Just me", User],
                  ["TEAM", vastu ? "Firm / team" : "Pandit mandali / team", vastu ? "Several consultants" : "Several pandits & assistants", Users],
                ] as const).map(([v, l, h, Icon]) => (
                  <button key={v} type="button" role="radio" aria-checked={form.providerType === v} onClick={() => set("providerType", v)} className={cn("flex flex-col gap-1 rounded-2xl border-2 p-3 text-left transition sm:p-4", form.providerType === v ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30" : "border-slate-200 hover:border-slate-300 dark:border-slate-700")}>
                    <Icon className={cn("h-5 w-5", form.providerType === v ? "text-rose-600" : "text-slate-400")} />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{l}</span>
                    <span className="text-xs text-slate-500">{h}</span>
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                <Field label="Title" htmlFor="p-hon">
                  <input id="p-hon" list="p-hon-list" className={inputCls} maxLength={40} placeholder={vastu ? "Vastu Acharya" : "Pandit"} value={form.honorific ?? ""} onChange={(e) => set("honorific", e.target.value)} />
                  <datalist id="p-hon-list">{HONORIFIC_SUGGESTIONS.map((h) => <option key={h} value={h} />)}</datalist>
                </Field>
                <Field label={form.providerType === "TEAM" ? "Name of your team / firm" : "Your name"} required htmlFor="p-name" error={errors.displayName}>
                  <input id="p-name" className={inputCls} maxLength={120} placeholder={vastu ? "e.g. Ramesh Sharma" : "e.g. Shivnarayan Tripathi"} value={form.displayName ?? ""} onChange={(e) => set("displayName", e.target.value)} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Years of experience" htmlFor="p-exp">
                  <input id="p-exp" inputMode="numeric" className={inputCls} placeholder="e.g. 15" maxLength={2} value={form.experienceYears ?? ""} onChange={(e) => set("experienceYears", toInt(e.target.value))} />
                </Field>
                {form.providerType === "TEAM" && (
                  <Field label="Team size" htmlFor="p-team">
                    <input id="p-team" inputMode="numeric" className={inputCls} placeholder="e.g. 5" value={form.teamSize ?? ""} onChange={(e) => set("teamSize", toInt(e.target.value))} />
                  </Field>
                )}
                <Field label="Qualification" htmlFor="p-qual" hint={vastu ? "e.g. Vastu Shastra diploma, B.Arch" : "e.g. Acharya, Shastri, Vedacharya"}>
                  <input id="p-qual" className={inputCls} maxLength={200} value={form.qualification ?? ""} onChange={(e) => set("qualification", e.target.value)} />
                </Field>
                <Field label={vastu ? "Institute" : "Gurukul / Sanskrit university"} htmlFor="p-guru">
                  <input id="p-guru" className={inputCls} maxLength={200} placeholder={vastu ? "" : "e.g. Sampurnanand Sanskrit University, Varanasi"} value={form.gurukul ?? ""} onChange={(e) => set("gurukul", e.target.value)} />
                </Field>
              </div>
              <Field label="Your photo" hint="A clear photo builds trust. Square works best.">
                <PhotoUploader single value={form.photo ? [form.photo] : []} onChange={(v) => set("photo", v[0] ?? "")} entityId={entityId} folder="photo" label="Upload photo" />
              </Field>
              <Field label="About you" htmlFor="p-about" hint={vastu ? "Your approach, kind of properties you check, remedies you suggest. 2–4 lines is enough." : "Your parampara, pujas you are known for, areas you serve. 2–4 lines is enough."}>
                <textarea id="p-about" rows={4} maxLength={3000} className={textareaCls} value={form.about ?? ""} onChange={(e) => set("about", e.target.value)} />
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
                <Field label="Locality / area" htmlFor="p-loc">
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
                    <input id="p-loc" className={inputCls} disabled placeholder="Choose a city first" />
                  )}
                </Field>
                <Field label="Pincode" htmlFor="p-pin">
                  <input id="p-pin" inputMode="numeric" maxLength={6} className={inputCls} value={form.pincode ?? ""} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} />
                </Field>
              </div>
              <Field label="Address" htmlFor="p-addr" hint="Not shown publicly. Helps us verify you.">
                <input id="p-addr" className={inputCls} maxLength={300} value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
              </Field>
              <Field label="Other cities you serve" hint="People in these cities will also find you.">
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
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-rose-600" checked={!!form.travelsOutstation} onChange={(e) => set("travelsOutstation", e.target.checked)} />
                <span>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">I travel outstation</span>
                  <span className="block text-xs text-slate-500">For weddings, kathas or site visits in other cities (travel charged extra).</span>
                </span>
              </label>
            </>
          )}

          {step.id === "services" && (
            <>
              <Field label={vastu ? "Consultations" : "Pujas & services"} required error={errors.services}>
                <div className="space-y-4">
                  {groups.map((g) => (
                    <div key={g.key}>
                      <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">{g.label}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {ALL_SERVICE_OPTIONS.filter((o) => o.group === g.key).map((o) => {
                          const on = (form.services ?? []).includes(o.value);
                          return (
                            <button key={o.value} type="button" aria-pressed={on} onClick={() => toggleService(o.value)} className={cn("flex items-start gap-3 rounded-2xl border-2 p-3 text-left transition", on ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30" : "border-slate-200 hover:border-slate-300 dark:border-slate-700")}>
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
                    </div>
                  ))}
                  {!vastu && (
                    <button type="button" onClick={() => toggleService("VASTU_HOME")} className="text-xs font-semibold text-rose-600 hover:underline">
                      {(form.services ?? []).includes("VASTU_HOME") ? "✓ Also do home vastu visits" : "+ I also do home vastu visits"}
                    </button>
                  )}
                </div>
              </Field>
              <Field label="Languages" required error={errors.languages}>
                <ChipMulti options={LANGUAGE_OPTIONS} value={form.languages ?? []} onChange={(v) => set("languages", v)} />
              </Field>
              {vastu ? (
                <Field label="How do you consult?">
                  <ChipMulti options={CONSULT_MODE_OPTIONS} value={(form.consultModes ?? []) as ConsultMode[]} onChange={(v) => set("consultModes", v)} />
                </Field>
              ) : (
                <>
                  <Field label="Traditions / communities you serve">
                    <ChipMulti options={TRADITION_OPTIONS} value={form.traditions ?? []} onChange={(v) => set("traditions", v)} />
                  </Field>
                  <Field label="Online puja">
                    <ChipMulti options={CONSULT_MODE_OPTIONS.filter((o) => o.value !== "PLAN_REVIEW")} value={(form.consultModes ?? []) as ConsultMode[]} onChange={(v) => set("consultModes", v)} />
                  </Field>
                  <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                    <input type="checkbox" className="mt-1 h-4 w-4 accent-rose-600" checked={!!form.samagriArranged} onChange={(e) => set("samagriArranged", e.target.checked)} />
                    <span>
                      <span className="block text-sm font-bold text-slate-900 dark:text-white">I can arrange the samagri</span>
                      <span className="block text-xs text-slate-500">Puja material brought by you, charged separately or included in dakshina.</span>
                    </span>
                  </label>
                </>
              )}
              <Field label="Known for" hint="Tap Enter after each, e.g. Vedic griha pravesh, Bengali wedding rituals.">
                <TagInput value={form.specializations ?? []} max={20} placeholder="Type and press Enter" onChange={(v) => set("specializations", v)} />
              </Field>
              <Field label="Minimum notice (days)" htmlFor="p-notice" hint="How many days in advance people should book. Leave empty if you take same-day requests.">
                <input id="p-notice" inputMode="numeric" className={cn(inputCls, "sm:max-w-[160px]")} placeholder="e.g. 2" value={form.noticeDays ?? ""} onChange={(e) => set("noticeDays", toInt(e.target.value))} />
              </Field>
            </>
          )}

          {step.id === "pricing" && (
            <>
              {(form.services ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">Pick your services in the previous step first.</p>
              ) : (
                <ul className="space-y-3">
                  {(form.services ?? []).map((s) => {
                    const r = rate(s);
                    return (
                      <li key={s} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{serviceLabel(s)}</p>
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_120px_auto] sm:items-end">
                          <Field label="From (₹)" htmlFor={`r-f-${s}`}>
                            <input id={`r-f-${s}`} inputMode="numeric" className={cn(inputCls, "font-semibold tabular-nums")} placeholder="e.g. 2,100" value={r?.priceFrom ? r.priceFrom.toLocaleString("en-IN") : ""} onChange={(e) => setRate(s, { priceFrom: toInt(e.target.value) ?? 0 })} />
                          </Field>
                          <Field label="Up to (₹, optional)" htmlFor={`r-t-${s}`}>
                            <input id={`r-t-${s}`} inputMode="numeric" className={cn(inputCls, "tabular-nums")} placeholder="e.g. 5,100" value={r?.priceTo ? r.priceTo.toLocaleString("en-IN") : ""} onChange={(e) => setRate(s, { priceTo: toInt(e.target.value) })} />
                          </Field>
                          <Field label="Hours" htmlFor={`r-h-${s}`}>
                            <input id={`r-h-${s}`} inputMode="decimal" className={inputCls} placeholder="e.g. 2" value={r?.durationHours ?? ""} onChange={(e) => setRate(s, { durationHours: e.target.value ? Number(e.target.value.replace(/[^\d.]/g, "")) || null : null })} />
                          </Field>
                          {!vastu && (
                            <label className="col-span-2 flex h-11 items-center gap-2 text-xs font-semibold text-slate-600 sm:col-span-1 dark:text-slate-300">
                              <input type="checkbox" className="h-4 w-4 accent-rose-600" checked={!!r?.samagriIncluded} onChange={(e) => setRate(s, { samagriIncluded: e.target.checked })} /> Samagri included
                            </label>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {errors.rateCard && <p className="text-xs font-medium text-rose-600" role="alert">{errors.rateCard}</p>}
              <p className="text-xs text-slate-500">Services without a fee show as &quot;on request&quot;. Your lowest fee is shown on your card.</p>
            </>
          )}

          {step.id === "photos" && (
            <>
              <Field label="Photos" hint="Up to 30. Pujas, havans, weddings, your mandir, or sites you've checked.">
                <PhotoUploader value={form.gallery ?? []} onChange={(v) => set("gallery", v)} entityId={entityId} folder="gallery" max={30} />
              </Field>
              <Field label="Video links" hint="YouTube or Instagram links. Paste and press Enter." error={errors.videos}>
                <TagInput value={form.videos ?? []} max={10} placeholder="https://youtube.com/…" onChange={(v) => set("videos", v)} />
              </Field>
            </>
          )}

          {step.id === "contact" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Mobile number" required htmlFor="p-phone" error={errors.phone}>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-1.5 left-1.5 flex items-center rounded-lg bg-slate-100 px-2.5 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">+91</span>
                    <input id="p-phone" type="tel" inputMode="numeric" autoComplete="tel-national" className={cn(inputCls, "pl-16 text-base tracking-wide")} maxLength={14} value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value.replace(/[^\d+\s]/g, ""))} />
                  </div>
                </Field>
                <Field label="WhatsApp (if different)" htmlFor="p-wa" error={errors.whatsapp}>
                  <input id="p-wa" type="tel" inputMode="numeric" className={inputCls} maxLength={14} value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value.replace(/[^\d+\s]/g, ""))} />
                </Field>
                <Field label="Email" htmlFor="p-email">
                  <input id="p-email" type="email" className={inputCls} maxLength={160} value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
                </Field>
              </div>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-rose-600" checked={!!form.showPhone} onChange={(e) => set("showPhone", e.target.checked)} />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Let signed-in visitors see my number
                  <span className="block text-xs text-slate-500">Off: people reach you only through enquiries.</span>
                </span>
              </label>
              {readiness && (
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="mb-2 text-sm font-bold text-slate-900 dark:text-white">Checklist</p>
                  <ul className="space-y-1.5">
                    {readiness.items.map((i) => (
                      <li key={i.id} className="flex items-center gap-2 text-sm">
                        {i.done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : i.required ? <CircleAlert className="h-4 w-4 shrink-0 text-rose-600" /> : <CircleDot className="h-4 w-4 shrink-0 text-sky-500" />}
                        <span className={cn("flex-1", i.done ? "text-slate-500 line-through decoration-slate-300" : "text-slate-800 dark:text-slate-200")}>{i.label}</span>
                        {!i.done && <span className={cn("text-[11px] font-semibold", i.required ? "text-rose-600" : "text-slate-400")}>{i.required ? "required" : "optional"}</span>}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-slate-500">The checklist updates when you save.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 -mx-4 mt-4 flex items-center gap-2 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent px-4 pb-2 pt-4 sm:static sm:mx-0 sm:bg-none sm:px-0 sm:pb-0 dark:from-slate-950 dark:via-slate-950/95">
        <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" onClick={() => go(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0 || busy}>
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
        </button>
        <span className="ml-auto hidden text-xs text-slate-500 sm:inline">{saving ? "Saving…" : "Saved as you go"}</span>
        {stepIdx < STEPS.length - 1 ? (
          <button type="button" className={cn(primaryBtn, "flex-1 sm:flex-none")} onClick={() => void next()} disabled={busy}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {(step.id === "photos" && !(form.gallery ?? []).length) || (step.id === "pricing" && !(form.rateCard ?? []).some((r) => r.priceFrom > 0)) ? "Skip for now" : "Save & continue"} <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" className={cn(primaryBtn, "flex-1 sm:flex-none")} onClick={() => void finish()} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {mode === "edit" ? "Save changes" : copy.button}
          </button>
        )}
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
        <Flame className="h-3.5 w-3.5" /> {copy.note}
      </p>
    </div>
  );
}
