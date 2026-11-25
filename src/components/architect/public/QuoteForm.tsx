"use client";

import React from "react";
import { CheckCircle2, Loader2, MessageCircle, Phone, Send } from "lucide-react";
import { getStoredUserContact } from "@/lib/auth/storedUser";
import { loginUrlForCurrentPage } from "@/lib/auth/loginRedirect";
import { cn } from "@/components/ui/utils";
import { SearchableSelect } from "@/components/propertyListing/SearchableSelect";
import { useRevealArchitectContactMutation, useSendArchitectInquiryMutation } from "@/features/architect/api";
import { BHK_OPTIONS, FACING_OPTIONS, FLOOR_OPTIONS, PLOT_PRESETS, SERVICE_OPTIONS, START_WHEN_OPTIONS } from "@/features/architect/options";
import type { ArchitectInquiryInput, ArchitectService, Bhk, Facing, Floors, StartWhen } from "@/features/architect/types";

const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
const labelCls = "mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300";
const PHONE_RE = /^(\+?91|0)?[6-9]\d{9}$/;
const num = (v: string) => Number(v.replace(/\D/g, "")) || null;
/** The services people ask for most, as quick toggles. */
const WANTED: ArchitectService[] = ["FLOOR_PLAN_2D", "ELEVATION_3D", "STRUCTURAL", "APPROVAL_DRAWINGS", "VASTU_PLAN", "ESTIMATE_BOQ"];

export function QuoteForm({ profileId, businessName, defaultCity, services = [] }: { profileId: number; businessName: string; defaultCity: string; services?: ArchitectService[] }) {
  const [send, { isLoading }] = useSendArchitectInquiryMutation();
  const offered = WANTED.filter((w) => !services.length || services.includes(w));
  const [form, setForm] = React.useState<ArchitectInquiryInput>(() => {
    const me = typeof window !== "undefined" ? getStoredUserContact() : null;
    return { name: me?.name ?? "", phone: me?.mobileNumber ?? "", email: me?.email ?? "", city: defaultCity, plotWidthFt: null, plotDepthFt: null, facing: null, floors: null, bhk: null, vastu: null, servicesWanted: offered.includes("FLOOR_PLAN_2D") ? ["FLOOR_PLAN_2D"] : [], startWhen: null, message: "" };
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const set = <K extends keyof ArchitectInquiryInput>(k: K, v: ArchitectInquiryInput[K]) => setForm((x) => ({ ...x, [k]: v }));
  const wanted = form.servicesWanted ?? [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (form.name.trim().length < 2) err.name = "Enter your name";
    if (!PHONE_RE.test(form.phone.replace(/[\s()-]/g, ""))) err.phone = "Enter a valid 10-digit mobile number";
    setErrors(err);
    if (Object.keys(err).length) return;
    setServerError(null);
    try {
      await send({ id: profileId, body: { ...form, name: form.name.trim(), phone: form.phone.replace(/[\s()-]/g, ""), email: form.email || undefined } }).unwrap();
      setDone(true);
    } catch (e2) {
      setServerError((e2 as { data?: { message?: string } })?.data?.message || "Couldn't send your request. Please try again.");
    }
  };

  if (done) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <p className="mt-2 text-base font-bold text-emerald-900 dark:text-emerald-100">Request sent to {businessName}</p>
        <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">They usually call back within a day with a quote for your naksha.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="q-name" className={labelCls}>Your name *</label>
          <input id="q-name" className={cn(inputCls, errors.name && "border-rose-400")} value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
          {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="q-phone" className={labelCls}>Mobile number *</label>
          <input id="q-phone" type="tel" inputMode="numeric" className={cn(inputCls, errors.phone && "border-rose-400")} value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel-national" />
          {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <p className={labelCls}>Plot size (feet)</p>
        <div className="flex flex-wrap gap-1.5">
          {PLOT_PRESETS.map(([w, d]) => {
            const on = form.plotWidthFt === w && form.plotDepthFt === d;
            return (
              <button
                key={`${w}x${d}`}
                type="button"
                aria-pressed={on}
                onClick={() => setForm((x) => ({ ...x, plotWidthFt: on ? null : w, plotDepthFt: on ? null : d }))}
                className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition", on ? "border-rose-600 bg-rose-600 text-white" : "border-slate-200 text-slate-700 hover:border-rose-300 dark:border-slate-700 dark:text-slate-200")}
              >
                {w}×{d}
              </button>
            );
          })}
        </div>
        <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <input aria-label="Plot width in feet" inputMode="numeric" className={inputCls} placeholder="Width" value={form.plotWidthFt ?? ""} onChange={(e) => set("plotWidthFt", num(e.target.value))} />
          <span className="text-slate-400">×</span>
          <input aria-label="Plot depth in feet" inputMode="numeric" className={inputCls} placeholder="Depth" value={form.plotDepthFt ?? ""} onChange={(e) => set("plotDepthFt", num(e.target.value))} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Facing</label>
          <SearchableSelect value={form.facing ?? ""} onChange={(v) => set("facing", (v || null) as Facing | null)} options={FACING_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} placeholder="Not sure" aria-label="Facing" />
        </div>
        <div>
          <label className={labelCls}>Floors</label>
          <SearchableSelect value={form.floors ?? ""} onChange={(v) => set("floors", (v || null) as Floors | null)} options={FLOOR_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} placeholder="Not sure" aria-label="Floors" />
        </div>
        <div>
          <label className={labelCls}>BHK</label>
          <SearchableSelect value={form.bhk ?? ""} onChange={(v) => set("bhk", (v || null) as Bhk | null)} options={BHK_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} placeholder="Not sure" aria-label="BHK" />
        </div>
      </div>

      {offered.length > 0 && (
        <div>
          <p className={labelCls}>What do you need?</p>
          <div className="flex flex-wrap gap-1.5">
            {offered.map((w) => {
              const on = wanted.includes(w);
              const o = SERVICE_OPTIONS.find((x) => x.value === w)!;
              return (
                <button
                  key={w}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set("servicesWanted", on ? wanted.filter((x) => x !== w) : [...wanted, w])}
                  className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition", on ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" : "border-slate-200 text-slate-700 hover:border-rose-300 dark:border-slate-700 dark:text-slate-200")}
                >
                  {o.icon} {o.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300">
          <input type="checkbox" className="h-4 w-4 accent-rose-600" checked={!!form.vastu} onChange={(e) => set("vastu", e.target.checked || null)} /> Vastu-compliant plan
        </label>
        <SearchableSelect value={form.startWhen ?? ""} onChange={(v) => set("startWhen", (v || null) as StartWhen | null)} options={START_WHEN_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} placeholder="When do you need it?" aria-label="When do you need it?" />
      </div>
      <div>
        <label htmlFor="q-msg" className={labelCls}>Anything else? (optional)</label>
        <textarea id="q-msg" rows={2} maxLength={1500} className={cn(inputCls, "h-auto py-2.5")} placeholder="City of the plot, rooms you need, budget for the design…" value={form.message} onChange={(e) => set("message", e.target.value)} />
      </div>
      {serverError && <p className="text-sm font-medium text-rose-600" role="alert">{serverError}</p>}
      <button type="submit" disabled={isLoading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:brightness-110 disabled:opacity-60 dark:shadow-none">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Get free quote
      </button>
      <p className="text-center text-[11px] text-slate-500">Free, no obligation. Your number is shared only with {businessName}.</p>
    </form>
  );
}

/** "Show number" for signed-in visitors; logged-out visitors go to login and come back. */
export function ContactButton({ profileId }: { profileId: number }) {
  const [reveal, { isLoading }] = useRevealArchitectContactMutation();
  const [contact, setContact] = React.useState<{ phone: string; whatsapp: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const onClick = async () => {
    if (typeof window !== "undefined" && !getStoredUserContact()) {
      window.location.href = loginUrlForCurrentPage();
      return;
    }
    setError(null);
    try {
      setContact(await reveal(profileId).unwrap());
    } catch (e) {
      setError((e as { data?: { message?: string } })?.data?.message || "Couldn't load the number. Send a quote request instead.");
    }
  };

  if (contact) {
    const wa = contact.whatsapp.replace(/\D/g, "").slice(-10);
    return (
      <div className="grid grid-cols-2 gap-2">
        <a href={`tel:+91${contact.phone.replace(/\D/g, "").slice(-10)}`} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700">
          <Phone className="h-4 w-4" /> {contact.phone}
        </a>
        <a href={`https://wa.me/91${wa}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-emerald-300 text-sm font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>
    );
  }
  return (
    <div>
      <button type="button" onClick={() => void onClick()} disabled={isLoading} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />} Show phone number
      </button>
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
