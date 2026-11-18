"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";
import { formatCredits, useSignupBonus } from "@/features/contactVerify/useSignupBonus";

const noopSubscribe = () => () => {};

/** Hero nudge for guests: sign up free and get the welcome credits. Hidden once logged in. */
export function SignupBonusLine() {
  const bonus = useSignupBonus();
  // Read the token only after hydration so the server HTML (no line) matches the first client render.
  const isGuest = React.useSyncExternalStore(
    noopSubscribe,
    () => !localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY),
    () => false,
  );
  if (!isGuest || bonus <= 0) return null;
  return (
    <div className="mt-3 flex flex-col items-center gap-1">
      <Link
        href="/login?mode=signup&redirect=%2F"
        prefetch={false}
        className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 py-1.5 pl-1.5 pr-4 text-xs font-bold text-white shadow-md shadow-rose-600/25 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-600/30 active:translate-y-0 sm:text-sm"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <Gift className="h-4 w-4" />
        </span>
        Sign up free &amp; get {formatCredits(bonus)} credits
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
      <span className="text-[11px] text-slate-500 dark:text-slate-400">Use them to unlock verified owner contacts</span>
    </div>
  );
}
