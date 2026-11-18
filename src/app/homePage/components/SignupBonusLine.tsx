"use client";

import React from "react";
import Link from "next/link";
import { Gift } from "lucide-react";
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
    <Link
      href="/login?mode=signup&redirect=%2F"
      prefetch={false}
      className="mx-auto mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800 transition hover:bg-amber-100 sm:text-xs dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <Gift className="h-3.5 w-3.5" />
      Sign up free &amp; get {formatCredits(bonus)} credits to unlock owner contacts
    </Link>
  );
}
