"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageCircle, Phone } from "lucide-react";
import { useRevealInteriorContactMutation } from "@/features/interiors/api";
import { APP_CONFIG } from "@/constants/app-config";
import type { InteriorProfile } from "@/types/interior.types";
import { profileName, telHref, waHref } from "./utils";

type Ctx = {
  phone: string | null;
  whatsapp: string | null;
  loading: boolean;
  /** Fetches the number (login required). Resolves to the contact, or null if it couldn't be shown. */
  reveal: () => Promise<{ phone: string | null; whatsapp: string | null } | null>;
  waText: string;
};

const ContactCtx = createContext<Ctx | null>(null);

/** Shares one "view contact" state across the hero, sidebar, contact section and mobile bar. */
export function InteriorContactProvider({ profile, children }: { profile: InteriorProfile; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [trigger, { isLoading }] = useRevealInteriorContactMutation();
  const publicPhone = profile.isPhonePublic ? profile.primaryPhone || profile.contact?.phone || null : null;
  const publicWa = profile.whatsappPhone || profile.contact?.whatsapp || null;
  const [revealed, setRevealed] = useState<{ phone: string | null; whatsapp: string | null } | null>(null);

  const phone = revealed?.phone ?? publicPhone;
  const whatsapp = revealed?.whatsapp ?? publicWa ?? phone;

  const reveal = useCallback(async () => {
    if (revealed) return revealed;
    const token = typeof window !== "undefined" ? window.localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null;
    if (!token) {
      toast.info("Log in to view the contact number");
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/interior-designers")}`);
      return null;
    }
    try {
      const data = await trigger(profile.id).unwrap();
      const next = { phone: data.phone, whatsapp: data.whatsapp || data.phone };
      setRevealed(next);
      return next;
    } catch (err) {
      toast.error((err as { data?: { message?: string } })?.data?.message || "Couldn't load the contact. Please send a quote request instead.");
      return null;
    }
  }, [revealed, pathname, router, trigger, profile.id]);

  const value = useMemo<Ctx>(
    () => ({
      phone,
      whatsapp,
      loading: isLoading,
      reveal,
      waText: `Hi ${profileName(profile)}, I found you on Awasio and would like a quote.`,
    }),
    [phone, whatsapp, isLoading, reveal, profile],
  );
  return <ContactCtx.Provider value={value}>{children}</ContactCtx.Provider>;
}

function useContact() {
  const ctx = useContext(ContactCtx);
  if (!ctx) throw new Error("InteriorContactProvider missing");
  return ctx;
}

type Variant = "hero" | "card" | "bar";

const STYLES: Record<Variant, { call: string; wa: string; wrap: string }> = {
  hero: {
    wrap: "flex flex-wrap gap-2",
    call: "inline-flex min-h-11 items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-stone-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
    wa: "inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  card: {
    wrap: "mt-2 grid grid-cols-2 gap-2",
    call: "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-200 text-sm font-semibold text-slate-800 hover:bg-stone-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
    wa: "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40",
  },
  bar: {
    wrap: "flex shrink-0 gap-2",
    call: "inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-stone-200 px-3 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-200",
    wa: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
};

/** "View contact" (→ Call once revealed) + WhatsApp. Before login/reveal, both buttons fetch the number first. */
export function ContactButtons({ variant }: { variant: Variant }) {
  const { phone, whatsapp, loading, reveal, waText } = useContact();
  const s = STYLES[variant];

  const onView = async () => {
    const c = await reveal();
    if (c?.phone && variant === "bar") window.location.href = telHref(c.phone);
  };
  const onWa = async () => {
    const c = await reveal();
    const n = c?.whatsapp || c?.phone;
    if (n) window.location.href = waHref(n, waText);
  };

  return (
    <div className={s.wrap}>
      {phone ? (
        <a href={telHref(phone)} className={s.call} aria-label={`Call ${phone}`}>
          <Phone className="h-4 w-4" aria-hidden /> {variant === "bar" ? "Call" : phone}
        </a>
      ) : (
        <button type="button" onClick={onView} disabled={loading} className={s.call}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Phone className="h-4 w-4" aria-hidden />}
          {variant === "bar" ? "Contact" : "View contact"}
        </button>
      )}
      {whatsapp ? (
        <a href={waHref(whatsapp, waText)} target="_blank" rel="noopener noreferrer" className={s.wa} aria-label="WhatsApp">
          <MessageCircle className="h-4 w-4" aria-hidden /> {variant === "bar" ? null : "WhatsApp"}
        </a>
      ) : (
        <button type="button" onClick={onWa} disabled={loading} className={s.wa} aria-label="WhatsApp">
          <MessageCircle className="h-4 w-4" aria-hidden /> {variant === "bar" ? null : "WhatsApp"}
        </button>
      )}
    </div>
  );
}
