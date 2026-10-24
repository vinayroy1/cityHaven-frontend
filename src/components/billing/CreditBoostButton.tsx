"use client";

import React from "react";
import { Crown, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useActivateCreditPromotionMutation, useGetCreditPlatformConfigQuery } from "@/features/contactVerify/api";

type TargetType = "PROPERTY" | "FLATMATE" | "ADVISOR";

export function CreditBoostButton({ targetType, targetId, organizationId }: { targetType: TargetType; targetId: number; organizationId?: number }) {
  const { data } = useGetCreditPlatformConfigQuery();
  const [activate, { isLoading }] = useActivateCreditPromotionMutation();
  const [open, setOpen] = React.useState(false);
  const prefix = targetType === "ADVISOR" ? "ADVISOR_BOOST_" : "PROPERTY_BOOST_";
  const flagKey = targetType === "ADVISOR" ? "ADVISOR_BOOSTS_ENABLED" : targetType === "FLATMATE" ? "FLATMATE_BOOSTS_ENABLED" : "PROPERTY_BOOSTS_ENABLED";
  const enabled = data?.data.flags.find((flag) => flag.key === flagKey)?.isEnabled ?? false;
  const actions = (data?.data.actions ?? []).filter((action) => action.isEnabled && action.key.startsWith(prefix));

  if (!enabled || !actions.length) return null;

  const buy = async (actionKey: string) => {
    try {
      const result = await activate({ actionKey, targetType, targetId, organizationId }).unwrap();
      toast.success(`Boost activated until ${new Date(result.data.promotion.endsAt).toLocaleDateString()}`);
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Could not activate boost");
    }
  };

  return (
    <div className="relative">
      <button type="button" disabled={isLoading} onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-black text-white shadow-sm hover:bg-amber-600 disabled:opacity-60">
        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Boost
      </button>
      {open && <div className="absolute bottom-full right-0 z-40 mb-2 w-64 space-y-2 rounded-xl border border-amber-200 bg-white p-3 shadow-xl dark:border-amber-900 dark:bg-slate-900">
        <p className="flex items-center gap-2 text-xs font-bold"><Crown className="h-4 w-4 text-amber-500" /> Choose visibility boost</p>
        {actions.map((action) => <button key={action.key} type="button" onClick={() => void buy(action.key)} className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-xs hover:border-amber-400 dark:border-slate-700"><span><strong>{action.durationDays} days</strong><span className="block text-[10px] text-slate-500">{action.label}</span></span><strong>{action.creditAmount} credits</strong></button>)}
      </div>}
    </div>
  );
}
