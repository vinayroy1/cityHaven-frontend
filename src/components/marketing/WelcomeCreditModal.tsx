"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gift,
  X,
  Zap,
  PhoneCall,
  Home,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Mail,
} from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";

export function WelcomeCreditModal() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [returnUrl, setReturnUrl] = useState<string>("");

  useEffect(() => {
    setMounted(true);

    const checkAuth = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null;
      setIsAuthed(Boolean(token));
    };

    checkAuth();

    // Listen for custom intent trigger: e.g. clicking "View Contact" or "Post" when not logged in
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ returnUrl?: string }>;
      if (customEvent.detail?.returnUrl) {
        setReturnUrl(customEvent.detail.returnUrl);
      } else {
        setReturnUrl(window.location.pathname + window.location.search);
      }
      setIsOpen(true);
    };

    window.addEventListener("awasio:open-welcome-credits", handleOpenEvent);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("awasio:open-welcome-credits", handleOpenEvent);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // If user is authenticated, DO NOT show modal or floating pill at all!
  if (!mounted || isAuthed) return null;

  const currentRedirect = returnUrl || (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
  const registerHref = `/auth/register?redirect=${encodeURIComponent(currentRedirect)}`;
  const loginHref = `/login?redirect=${encodeURIComponent(currentRedirect)}`;

  const modalPortal = isOpen ? (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="cursor-default relative z-10 w-full max-w-lg rounded-3xl border border-amber-500/40 bg-slate-950 p-0 text-white shadow-[0_0_60px_rgba(245,158,11,0.25)] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Glow Gradients */}
        <div className="absolute -top-24 -left-20 h-48 w-48 rounded-full bg-rose-600/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 h-48 w-48 rounded-full bg-amber-500/30 blur-3xl pointer-events-none" />

        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 p-6 text-center overflow-hidden">
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-all"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 border border-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-200 mb-2.5 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 fill-amber-300 stroke-amber-300" />
            <span>Exclusive Welcome Gift</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
            Claim 1,000 Free Credits!
          </h2>

          <p className="mt-1.5 text-xs sm:text-sm text-rose-100 max-w-sm mx-auto font-medium">
            Sign up with your email in 30 seconds and start unlocking verified owner contacts immediately.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* 3 Core Value Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 transition hover:border-amber-500/40">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white">Unlock 100 Verified Owner Contacts</h3>
                <p className="text-[11px] text-slate-400">Direct phone numbers revealed instantly &bull; Zero broker spam</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 transition hover:border-amber-500/40">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Home className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white">Post Free Property &amp; Flatmate Listings</h3>
                <p className="text-[11px] text-slate-400">Rent or sell your home with zero brokerage fees</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 transition hover:border-amber-500/40">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Zap className="h-5 w-5 fill-rose-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white">Credits Never Expire</h3>
                <p className="text-[11px] text-slate-400">Universal balance &bull; Use whenever you find your dream home</p>
              </div>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 py-1">
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-amber-400" />
              <span>Email Verification</span>
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>100% Free Signup</span>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />
              <span>Zero Brokerage</span>
            </span>
          </div>

          {/* Primary CTA Button */}
          <Link
            href={registerHref}
            onClick={() => setIsOpen(false)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-pink-600 px-5 text-sm sm:text-base font-black text-white shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:brightness-110 active:scale-98 transition-all"
          >
            <span>Claim 1,000 Free Credits Now</span>
            <ArrowRight className="h-4 w-4 stroke-[3]" />
          </Link>

          {/* Secondary Sign In Link */}
          <div className="text-center">
            <Link
              href={loginHref}
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Already have an account? <strong className="text-amber-400 underline underline-offset-4">Sign In</strong>
            </Link>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Approach 3: Floating Gift Pill for Non-Logged-In Users */}
      {!isOpen && !isDismissed && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="group relative flex items-center">
            <button
              type="button"
              onClick={() => {
                setReturnUrl(window.location.pathname + window.location.search);
                setIsOpen(true);
              }}
              className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 p-1 pr-4 text-xs font-black text-white shadow-[0_4px_25px_rgba(244,63,94,0.45)] hover:scale-105 active:scale-95 transition-all"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-md shadow-inner text-amber-300 animate-pulse">
                <Gift className="h-4 w-4" />
              </span>
              <span className="tracking-wide">
                1,000 Free Credits <span className="text-amber-200 uppercase text-[10px] ml-1 font-bold">Claim</span>
              </span>
            </button>

            {/* Close small dismiss button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Dismiss for this session"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {typeof document !== "undefined" && modalPortal ? createPortal(modalPortal, document.body) : null}
    </>
  );
}
