"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, BadgeCheck, Gift } from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";
import { formatCredits, useSignupBonus } from "@/features/contactVerify/useSignupBonus";

const noopSubscribe = () => () => {};

interface SignupCreditCardProps {
  /** What the credits are good for on this page, e.g. "unlock builder & owner contacts". */
  benefit?: string;
  className?: string;
}

/**
 * Guest-only signup card with the live welcome bonus. Renders nothing on the server and for
 * logged-in users (read after hydration, so cached pages stay identical for everyone).
 */
export function SignupCreditCard({ benefit = "unlock verified owner & builder contacts", className = "" }: SignupCreditCardProps) {
  const bonus = useSignupBonus();
  const pathname = usePathname();
  const isGuest = React.useSyncExternalStore(
    noopSubscribe,
    () => !localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY),
    () => false,
  );
  if (!isGuest || bonus <= 0) return null;
  const href = `/login?mode=signup&redirect=${encodeURIComponent(pathname || "/")}`;
  return (
    <Link
      href={href}
      prefetch={false}
      className={`group flex flex-col gap-3 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-white to-amber-50 p-4 shadow-sm transition hover:border-rose-300 hover:shadow-md sm:flex-row sm:items-center sm:p-5 dark:border-rose-900/60 dark:from-rose-950/40 dark:via-slate-900 dark:to-amber-950/30 ${className}`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/25">
        <Gift className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold text-slate-900 sm:text-base dark:text-white">
          Get {formatCredits(bonus)} free credits when you sign up
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
          <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          Use them to {benefit}. Free, takes a minute.
        </span>
      </span>
      <span className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/25 transition group-hover:-translate-y-0.5 sm:text-sm">
        Sign up free
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
