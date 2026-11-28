"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatCredits, useSignupBonus } from "@/features/contactVerify/useSignupBonus";

const BAR_DISMISSED_KEY = "awasio:signupBarDismissed";
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
  const [scrolled, setScrolled] = useState(false);
  const bonus = useSignupBonus();
  const bonusText = formatCredits(bonus || 1000);

  // Closed bar stays closed for this browser session (it used to come back on every page).
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read once on mount
      if (sessionStorage.getItem(BAR_DISMISSED_KEY)) setIsDismissed(true);
    } catch {}
  }, []);
  // Show the bar once the visitor scrolls (or after 6s on short pages), so it never covers the first
  // screen straight away.
  useEffect(() => {
    const show = () => {
      setScrolled(true);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
    const onScroll = () => {
      if (window.scrollY > 300) show();
    };
    const timer = setTimeout(show, 6000);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  const [returnUrl, setReturnUrl] = useState<string>("");

  const checkAuth = useCallback(() => {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
    const authed = Boolean(token && token !== "null" && token !== "undefined");
    setIsAuthed(authed);
    if (authed) {
      setIsOpen(false);
    }
    return authed;
  }, []);

  useEffect(() => {
    setMounted(true);
    checkAuth();

    // Listen for custom intent trigger: e.g. clicking "View Contact" or "Post" when not logged in
    const handleOpenEvent = (e: Event) => {
      // If user is already authenticated, never open welcome modal
      if (checkAuth()) return;

      const customEvent = e as CustomEvent<{ returnUrl?: string }>;
      if (customEvent.detail?.returnUrl) {
        setReturnUrl(customEvent.detail.returnUrl);
      } else {
        setReturnUrl(window.location.pathname + window.location.search);
      }
      setIsOpen(true);
    };

    window.addEventListener("awasio:open-welcome-credits", handleOpenEvent);
    window.addEventListener("auth-change", checkAuth);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("awasio:open-welcome-credits", handleOpenEvent);
      window.removeEventListener("auth-change", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, [checkAuth]);

  // Re-verify auth whenever path changes
  useEffect(() => {
    checkAuth();
  }, [pathname, checkAuth]);

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

  // Check if current route is an auth or internal dashboard/admin route
  const isAuthOrDashboardPage =
    !pathname ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    // Don't interrupt someone filling in a listing form.
    pathname.startsWith("/post-property-free") ||
    pathname.startsWith("/post-project") ||
    pathname.startsWith("/flatmates/post");

  // While the bar shows, other floating bottom elements (search Filters button, profile action bars)
  // move up by its height via the --signup-bar CSS variable.
  const barVisible = mounted && !isAuthed && !isAuthOrDashboardPage && !isOpen && !isDismissed && scrolled;
  useEffect(() => {
    const root = document.documentElement;
    if (barVisible) root.style.setProperty("--signup-bar", "4.25rem");
    else root.style.removeProperty("--signup-bar");
    return () => {
      root.style.removeProperty("--signup-bar");
    };
  }, [barVisible]);

  // NEVER render popup or pill if:
  // 1. Not mounted
  // 2. User is authenticated
  // 3. Current page is login, auth, dashboard, or admin
  if (!mounted || isAuthed || isAuthOrDashboardPage) return null;

  const currentRedirect =
    returnUrl || (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
  const loginHref = `/login?mode=signup&redirect=${encodeURIComponent(currentRedirect)}`;
  const signInHref = `/login?mode=login&redirect=${encodeURIComponent(currentRedirect)}`;

  const modalPortal = isOpen ? (
    <div
      className="fixed inset-0 z-[10000] flex min-h-[100dvh] items-center justify-center p-2.5 sm:p-4 overflow-y-auto cursor-pointer"
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
        className="cursor-default relative z-10 w-full max-w-lg my-auto max-h-[calc(100dvh-5rem)] flex flex-col rounded-2xl sm:rounded-3xl border border-amber-500/40 bg-slate-950 p-0 text-white shadow-[0_0_60px_rgba(245,158,11,0.25)] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Glow Gradients */}
        <div className="absolute -top-24 -left-20 h-48 w-48 rounded-full bg-rose-600/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 h-48 w-48 rounded-full bg-amber-500/30 blur-3xl pointer-events-none" />

        {/* Top Header Banner */}
        <div className="relative shrink-0 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 px-4 py-3.5 sm:p-6 text-center overflow-hidden">
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute right-3 top-3 sm:right-4 sm:top-4 z-20 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/35 hover:bg-black/55 text-white transition-all shadow-md active:scale-95"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 border border-white/20 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-200 mb-1.5 sm:mb-2.5 shadow-sm">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-300 stroke-amber-300" />
            <span>Exclusive Welcome Gift</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
            Claim 1,000 Free Credits!
          </h2>

          <p className="mt-1 text-[11px] sm:text-sm text-rose-100 max-w-sm mx-auto font-medium line-clamp-2 sm:line-clamp-none">
            Sign up in 30 seconds and start unlocking verified owner contacts immediately.
          </p>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-6 space-y-3 sm:space-y-4">
          {/* 3 Core Value Cards */}
          <div className="space-y-2 sm:space-y-2.5">
            <div className="flex items-center gap-2.5 sm:gap-3.5 rounded-xl sm:rounded-2xl border border-slate-800 bg-slate-900/70 p-2.5 sm:p-3.5 transition hover:border-amber-500/40">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <PhoneCall className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white">Unlock 200 Verified Owner &amp; Flatmate Contacts</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400">Only 5 credits per contact &bull; Direct phone numbers &bull; Zero broker spam</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3.5 rounded-xl sm:rounded-2xl border border-slate-800 bg-slate-900/70 p-2.5 sm:p-3.5 transition hover:border-amber-500/40">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Home className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white">Post 100 Property &amp; Flatmate Listings</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400">Only 10 credits per listing &bull; Never expires &bull; 0% commission</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3.5 rounded-xl sm:rounded-2xl border border-slate-800 bg-slate-900/70 p-2.5 sm:p-3.5 transition hover:border-amber-500/40">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 fill-rose-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white">Credits Never Expire</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400">Universal balance &bull; Use whenever you find your dream home</p>
              </div>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-slate-400 py-0.5 sm:py-1">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400" />
              <span>Email Verified</span>
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" />
              <span>100% Free</span>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-rose-400" />
              <span>0% Commission</span>
            </span>
          </div>
        </div>

        {/* Sticky/Pinned Bottom CTA Footer */}
        <div className="shrink-0 p-3 sm:p-5 border-t border-slate-900 bg-slate-950/95 backdrop-blur-sm space-y-2">
          {/* Primary CTA Button */}
          <Link
            href={loginHref}
            onClick={() => setIsOpen(false)}
            className="flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-pink-600 px-4 sm:px-5 text-xs sm:text-base font-black text-white shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:brightness-110 active:scale-98 transition-all"
          >
            <span>Claim 1,000 Free Credits Now</span>
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[3]" />
          </Link>

          {/* Secondary Sign In Link */}
          <div className="text-center">
            <Link
              href={signInHref}
              onClick={() => setIsOpen(false)}
              className="text-[11px] sm:text-xs text-slate-400 hover:text-white transition-colors"
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
      {/* Sticky signup bar for logged-out visitors (never on auth/dashboard/posting pages). It appears
          once they scroll, sits above the phone's bottom menu, and stays closed for the session. */}
      {!isOpen && !isDismissed && scrolled && (
        <div className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-40 mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300 lg:bottom-5">
          <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-white/95 p-2 pl-2.5 shadow-[0_10px_30px_rgba(244,63,94,0.25)] backdrop-blur-md dark:border-rose-900/60 dark:bg-slate-900/95">
            <button
              type="button"
              onClick={() => {
                setReturnUrl(window.location.pathname + window.location.search);
                setIsOpen(true);
              }}
              className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
              aria-label={`See what you get with ${bonusText} free credits`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 text-white">
                <Gift className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-extrabold text-slate-900 dark:text-white">Get {bonusText} free credits</span>
                <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">Unlock owner contacts</span>
              </span>
            </button>
            <Link
              href={loginHref}
              prefetch={false}
              className="inline-flex h-9 shrink-0 items-center rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-3.5 text-xs font-bold text-white shadow-md shadow-rose-600/25 transition hover:brightness-110 active:scale-95"
            >
              Sign up<span className="hidden min-[400px]:inline">&nbsp;free</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsDismissed(true);
                try {
                  sessionStorage.setItem(BAR_DISMISSED_KEY, "1");
                } catch {}
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              aria-label="Close"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {typeof document !== "undefined" && modalPortal ? createPortal(modalPortal, document.body) : null}
    </>
  );
}
