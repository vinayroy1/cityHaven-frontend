"use client";

import React from "react";
import { CheckCircle2, Loader2, MessageCircle, Phone, Send } from "lucide-react";
import { getStoredUserContact } from "@/lib/auth/storedUser";
import { loginUrlForCurrentPage } from "@/lib/auth/loginRedirect";
import { cn } from "@/components/ui/utils";
import { useRevealConstructionContactMutation, useSendConstructionInquiryMutation } from "@/features/construction/api";
import { BUILDING_TYPE_OPTIONS, FLOOR_OPTIONS, START_WHEN_OPTIONS } from "@/features/construction/options";
import type { BuildingType, ConstructionInquiryInput, Floors, StartWhen } from "@/features/construction/types";

const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
const PHONE_RE = /^(\+?91|0)?[6-9]\d{9}$/;

export function QuoteForm({ profileId, businessName, defaultCity }: { profileId: number; businessName: string; defaultCity: string }) {
  const [send, { isLoading }] = useSendConstructionInquiryMutation();
  const [form, setForm] = React.useState<ConstructionInquiryInput>(() => {
    const me = typeof window !== "undefined" ? getStoredUserContact() : null;
    return { name: me?.name ?? "", phone: me?.mobileNumber ?? "", email: me?.email ?? "", city: defaultCity, floors: null, plotSizeSqft: null, buildingType: "INDEPENDENT_HOUSE", startWhen: null, message: "" };
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const set = <K extends keyof ConstructionInquiryInput>(k: K, v: ConstructionInquiryInput[K]) => setForm((x) => ({ ...x, [k]: v }));

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
        <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">They usually call back within a day. Keep your phone handy.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="q-name" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Your name *</label>
          <input id="q-name" className={cn(inputCls, errors.name && "border-rose-400")} value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
          {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="q-phone" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Mobile number *</label>
          <input id="q-phone" type="tel" inputMode="numeric" className={cn(inputCls, errors.phone && "border-rose-400")} value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel-national" />
          {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="q-type" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">What do you want to build?</label>
          <select id="q-type" className={inputCls} value={form.buildingType ?? ""} onChange={(e) => set("buildingType", (e.target.value || null) as BuildingType | null)}>
            {BUILDING_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="q-floors" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Floors</label>
          <select id="q-floors" className={inputCls} value={form.floors ?? ""} onChange={(e) => set("floors", (e.target.value || null) as Floors | null)}>
            <option value="">Not sure yet</option>
            {FLOOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="q-plot" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Plot size (sq.ft)</label>
          <input id="q-plot" inputMode="numeric" className={inputCls} placeholder="e.g. 1200" value={form.plotSizeSqft ?? ""} onChange={(e) => set("plotSizeSqft", Number(e.target.value.replace(/\D/g, "")) || null)} />
        </div>
        <div>
          <label htmlFor="q-when" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">When do you want to start?</label>
          <select id="q-when" className={inputCls} value={form.startWhen ?? ""} onChange={(e) => set("startWhen", (e.target.value || null) as StartWhen | null)}>
            <option value="">Select</option>
            {START_WHEN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="q-msg" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Anything else? (optional)</label>
        <textarea id="q-msg" rows={2} maxLength={1500} className={cn(inputCls, "h-auto py-2.5")} placeholder="Budget, location of the plot, design ideas…" value={form.message} onChange={(e) => set("message", e.target.value)} />
      </div>
      {serverError && <p className="text-sm font-medium text-rose-600" role="alert">{serverError}</p>}
      <button type="submit" disabled={isLoading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:brightness-110 disabled:opacity-60 dark:shadow-none">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Get free quote
      </button>
      <p className="text-center text-[11px] text-slate-500">Free, no obligation. Your number is shared only with {businessName}.</p>
    </form>
  );
}

/** "Show number" for signed-in visitors; logged-out visitors go to login and come back. */
export function ContactButton({ profileId }: { profileId: number }) {
  const [reveal, { isLoading }] = useRevealConstructionContactMutation();
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
