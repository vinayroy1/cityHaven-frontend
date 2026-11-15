"use client";

import React from "react";
import { CalendarDays, CheckCircle2, Loader2, MessageCircle, Phone, Send } from "lucide-react";
import { getStoredUserContact } from "@/lib/auth/storedUser";
import { loginUrlForCurrentPage } from "@/lib/auth/loginRedirect";
import { cn } from "@/components/ui/utils";
import { useRevealPanditContactMutation, useSendPanditInquiryMutation } from "@/features/pandit/api";
import { LANGUAGE_OPTIONS, label, serviceLabel } from "@/features/pandit/options";
import type { PanditInquiryInput } from "@/features/pandit/types";

const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
const PHONE_RE = /^(\+?91|0)?[6-9]\d{9}$/;
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export function EnquiryForm({
  profileId,
  name,
  defaultCity,
  services,
  languages,
  online,
  vastu,
  noticeDays,
}: {
  profileId: number;
  name: string;
  defaultCity: string;
  services: string[];
  languages: string[];
  online: boolean;
  vastu: boolean;
  noticeDays: number | null;
}) {
  const [send, { isLoading }] = useSendPanditInquiryMutation();
  const [form, setForm] = React.useState<PanditInquiryInput>(() => {
    const me = typeof window !== "undefined" ? getStoredUserContact() : null;
    const fromUrl = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("service") : null;
    return {
      name: me?.name ?? "",
      phone: me?.mobileNumber ?? "",
      email: me?.email ?? "",
      city: defaultCity,
      locality: "",
      service: fromUrl && services.includes(fromUrl) ? fromUrl : services[0] ?? null,
      eventDate: "",
      mode: "IN_PERSON",
      language: languages[0] ?? null,
      attendees: null,
      message: "",
    };
  });
  const [minDate] = React.useState(() => (noticeDays ? new Date(Date.now() + noticeDays * 86_400_000).toISOString().slice(0, 10) : today()));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const set = <K extends keyof PanditInquiryInput>(k: K, v: PanditInquiryInput[K]) => setForm((x) => ({ ...x, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (form.name.trim().length < 2) err.name = "Enter your name";
    if (!PHONE_RE.test(form.phone.replace(/[\s()-]/g, ""))) err.phone = "Enter a valid 10-digit mobile number";
    setErrors(err);
    if (Object.keys(err).length) return;
    setServerError(null);
    try {
      await send({
        id: profileId,
        body: {
          ...form,
          name: form.name.trim(),
          phone: form.phone.replace(/[\s()-]/g, ""),
          email: form.email || undefined,
          locality: form.locality?.trim() || undefined,
          eventDate: form.eventDate || undefined,
        },
      }).unwrap();
      setDone(true);
    } catch (e2) {
      setServerError((e2 as { data?: { message?: string } })?.data?.message || "Couldn't send your enquiry. Please try again.");
    }
  };

  if (done) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <p className="mt-2 text-base font-bold text-emerald-900 dark:text-emerald-100">Enquiry sent to {name}</p>
        <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">They usually call back within a few hours to confirm the date, dakshina and samagri.</p>
      </div>
    );
  }


  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="e-service" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">{vastu ? "Consultation for" : "Puja / service"}</label>
          <select id="e-service" className={inputCls} value={form.service ?? ""} onChange={(e) => set("service", e.target.value || null)}>
            {services.map((s) => <option key={s} value={s}>{serviceLabel(s)}</option>)}
            <option value="">Something else</option>
          </select>
        </div>
        <div>
          <label htmlFor="e-date" className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <CalendarDays className="h-3.5 w-3.5" /> Preferred date
          </label>
          <input id="e-date" type="date" min={minDate} className={inputCls} value={form.eventDate ?? ""} onChange={(e) => set("eventDate", e.target.value)} />
          <p className="mt-1 text-[11px] text-slate-500">{noticeDays ? `Needs at least ${noticeDays} day${noticeDays > 1 ? "s" : ""}' notice. ` : ""}Not fixed? Leave empty and ask for a muhurat.</p>
        </div>
        <div>
          <label htmlFor="e-lang" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Language</label>
          <select id="e-lang" className={inputCls} value={form.language ?? ""} onChange={(e) => set("language", e.target.value || null)}>
            {languages.map((l) => <option key={l} value={l}>{label(LANGUAGE_OPTIONS, l)}</option>)}
            <option value="">Any</option>
          </select>
        </div>
        {online && (
          <div className="sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">How</span>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="How">
              {([
                ["IN_PERSON", vastu ? "Site visit" : "At my place"],
                ["ONLINE", "Online / video"],
              ] as const).map(([v, l]) => (
                <button key={v} type="button" role="radio" aria-checked={form.mode === v} onClick={() => set("mode", v)} className={cn("h-10 rounded-xl border text-sm font-semibold", form.mode === v ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200" : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200")}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label htmlFor="e-name" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Your name *</label>
          <input id="e-name" className={cn(inputCls, errors.name && "border-rose-400")} value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
          {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="e-phone" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Mobile number *</label>
          <input id="e-phone" type="tel" inputMode="numeric" className={cn(inputCls, errors.phone && "border-rose-400")} value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel-national" />
          {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
        </div>
        {form.mode !== "ONLINE" && (
          <div className="sm:col-span-2">
            <label htmlFor="e-area" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Area / locality</label>
            <input id="e-area" className={inputCls} maxLength={120} placeholder={`e.g. Sector 62, ${defaultCity}`} value={form.locality ?? ""} onChange={(e) => set("locality", e.target.value)} />
          </div>
        )}
      </div>
      <div>
        <label htmlFor="e-msg" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Anything else? (optional)</label>
        <textarea
          id="e-msg"
          rows={2}
          maxLength={1500}
          className={cn(inputCls, "h-auto py-2.5")}
          placeholder={vastu ? "Flat / plot size, facing, what you want checked…" : "Number of people, samagri needed, timing…"}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
        />
      </div>
      {serverError && <p className="text-sm font-medium text-rose-600" role="alert">{serverError}</p>}
      <button type="submit" disabled={isLoading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:brightness-110 disabled:opacity-60 dark:shadow-none">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {vastu ? "Request consultation" : "Check availability"}
      </button>
      <p className="text-center text-[11px] text-slate-500">Free. Your number is shared only with {name}.</p>
    </form>
  );
}

/** "Show number" for signed-in visitors; logged-out visitors go to login and come back. */
export function ContactButton({ profileId }: { profileId: number }) {
  const [reveal, { isLoading }] = useRevealPanditContactMutation();
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
      setError((e as { data?: { message?: string } })?.data?.message || "Couldn't load the number. Send an enquiry instead.");
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
