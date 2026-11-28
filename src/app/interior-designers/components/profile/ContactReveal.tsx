"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { signupRedirectPath, useAutoRevealOnReturn } from "@/lib/signupRedirect";
import { interiorProfilePath } from "@/lib/interiors/profileUrl";
import { useRouter } from "next/navigation";
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
  reveal: () => Promise<Revealed | null>;
  waText: string;
};

type Revealed = { phone: string | null; whatsapp: string | null; branches: { id: number; phone: string | null }[] };

const ContactCtx = createContext<Ctx | null>(null);

/** Shares one "view contact" state across the hero, sidebar, contact section and mobile bar. */
export function InteriorContactProvider({ profile, children }: { profile: InteriorProfile; children: ReactNode }) {
  const router = useRouter();
  const [trigger, { isLoading }] = useRevealInteriorContactMutation();
  const [revealed, setRevealed] = useState<Revealed | null>(null);

  // Like property listings, the number is never shown up front: only after login, via the reveal call
  // (which logs the lead and is where credits will be charged).
  const phone = revealed?.phone ?? null;
  const whatsapp = revealed?.whatsapp ?? phone;

  const reveal = useCallback(async () => {
    if (revealed) return revealed;
    const token = typeof window !== "undefined" ? window.localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null;
    if (!token) {
      toast.info("Sign up free to view the contact number");
      // Back to this designer's profile, not the list it was opened from (e.g. the homepage).
      router.push(signupRedirectPath(interiorProfilePath(profile), { autoReveal: true }));
      return null;
    }
    try {
      const data = await trigger(profile.id).unwrap();
      const next: Revealed = { phone: data.phone, whatsapp: data.whatsapp || data.phone, branches: data.branches ?? [] };
      setRevealed(next);
      return next;
    } catch (err) {
      toast.error((err as { data?: { message?: string } })?.data?.message || "Couldn't load the contact. Please send a quote request instead.");
      return null;
    }
  }, [revealed, router, trigger, profile]);

  // Back from signup / login: show the number without another tap (profile page only, not list cards).
  useAutoRevealOnReturn(reveal, { onlyOnPath: interiorProfilePath(profile) });

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

/** Single "View contact" button for directory cards: same login + reveal flow, then shows / dials the number. */
export function ViewContactButton({ profile, className }: { profile: InteriorProfile; className?: string }) {
  return (
    <InteriorContactProvider profile={profile}>
      <ViewContactInner className={className} />
    </InteriorContactProvider>
  );
}

function ViewContactInner({ className }: { className?: string }) {
  const { phone, loading, reveal } = useContact();
  return phone ? (
    <a href={telHref(phone)} className={className} aria-label={`Call ${phone}`}>
      <Phone className="h-3.5 w-3.5" aria-hidden /> {phone}
    </a>
  ) : (
    <button type="button" onClick={() => void reveal()} disabled={loading} className={className}>
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Phone className="h-3.5 w-3.5" aria-hidden />} View Contact
    </button>
  );
}

/**
 * "Call branch": branch numbers aren't in the page. Goes through the same login + reveal as "View contact"
 * (one gated place to log the lead and, later, charge credits), then dials that branch.
 */
export function BranchCallButton({ branchId, className }: { branchId: number; className?: string }) {
  const { reveal, loading } = useContact();
  const [shown, setShown] = useState<string | null>(null);
  const onClick = async () => {
    const c = await reveal();
    if (!c) return;
    const n = c.branches.find((b) => b.id === branchId)?.phone || c.phone;
    if (!n) return toast.error("This branch hasn't added a number yet.");
    setShown(n);
    window.location.href = telHref(n);
  };
  return shown ? (
    <a href={telHref(shown)} className={className}>
      <Phone className="h-4 w-4" aria-hidden /> {shown}
    </a>
  ) : (
    <button type="button" onClick={onClick} disabled={loading} className={className}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Phone className="h-4 w-4" aria-hidden />} Call branch
    </button>
  );
}
