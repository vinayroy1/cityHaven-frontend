"use client";

import React from "react";
import { Loader2, Save, TicketPercent, ToggleLeft, WalletCards } from "lucide-react";
import {
  CreditActionConfig,
  PlatformFeatureFlag,
  useAdminCreateCouponMutation,
  useAdminGetCouponsQuery,
  useAdminUpdateCouponMutation,
  useAdminUpdateCreditActionMutation,
  useAdminUpdateFeatureFlagMutation,
  useGetCreditPlatformConfigQuery,
} from "@/features/contactVerify/api";

export function CreditPlatformAdmin() {
  const { data, isLoading } = useGetCreditPlatformConfigQuery({ admin: true });
  const { data: couponsData } = useAdminGetCouponsQuery();
  const [updateAction, { isLoading: savingAction }] = useAdminUpdateCreditActionMutation();
  const [updateFlag, { isLoading: savingFlag }] = useAdminUpdateFeatureFlagMutation();
  const [createCoupon, { isLoading: creatingCoupon }] = useAdminCreateCouponMutation();
  const [updateCoupon] = useAdminUpdateCouponMutation();
  const [drafts, setDrafts] = React.useState<Record<string, CreditActionConfig>>({});
  const [couponCode, setCouponCode] = React.useState("");
  const [couponCredits, setCouponCredits] = React.useState(50);
  const [couponLimit, setCouponLimit] = React.useState(100);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!data?.data.actions) return;
    setDrafts(Object.fromEntries(data.data.actions.map((action) => [action.key, action])));
  }, [data?.data.actions]);

  const saveAction = async (action: CreditActionConfig) => {
    await updateAction({
      key: action.key,
      data: {
        label: action.label,
        description: action.description,
        creditAmount: action.creditAmount,
        durationDays: action.durationDays,
        isEnabled: action.isEnabled,
        metadata: action.metadata,
      },
    }).unwrap();
    setMessage(`${action.label} updated`);
  };

  const toggleFlag = async (flag: PlatformFeatureFlag) => {
    await updateFlag({
      key: flag.key,
      data: { label: flag.label, description: flag.description, isEnabled: !flag.isEnabled },
    }).unwrap();
  };

  const submitCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    await createCoupon({
      code: couponCode.trim().toUpperCase(),
      credits: couponCredits,
      maxRedemptions: couponLimit,
      maxPerUser: 1,
      isActive: true,
    }).unwrap();
    setCouponCode("");
    setMessage("Coupon created");
  };

  if (isLoading) return <div className="rounded-2xl border bg-white p-8"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>;

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <WalletCards className="h-6 w-6 text-violet-600" />
        <div>
          <h2 className="font-bold text-slate-950 dark:text-white">Unified Credit Platform</h2>
          <p className="text-xs text-slate-500">All values are enforced by the backend wallet ledger.</p>
        </div>
      </div>

      {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{message}</p>}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data?.data.flags.map((flag) => (
          <button key={flag.key} type="button" disabled={savingFlag} onClick={() => void toggleFlag(flag)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-left dark:border-slate-700">
            <span><span className="block text-xs font-bold">{flag.label}</span><span className="text-[11px] text-slate-500">{flag.description}</span></span>
            <ToggleLeft className={`h-7 w-7 ${flag.isEnabled ? "rotate-180 text-emerald-600" : "text-slate-400"}`} />
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950"><tr><th className="p-3">Action</th><th className="p-3">Credits</th><th className="p-3">Days</th><th className="p-3">Enabled</th><th className="p-3" /></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {Object.values(drafts).map((action) => (
              <tr key={action.key}>
                <td className="p-3"><strong>{action.label}</strong><span className="block font-mono text-[10px] text-slate-500">{action.key}</span></td>
                <td className="p-3"><input aria-label={`${action.label} credits`} type="number" min={0} value={action.creditAmount} onChange={(e) => setDrafts((old) => ({ ...old, [action.key]: { ...action, creditAmount: Number(e.target.value) } }))} className="w-24 rounded-lg border px-2 py-1.5 dark:bg-slate-950" /></td>
                <td className="p-3"><input aria-label={`${action.label} duration`} type="number" min={1} value={action.durationDays ?? ""} onChange={(e) => setDrafts((old) => ({ ...old, [action.key]: { ...action, durationDays: e.target.value ? Number(e.target.value) : null } }))} className="w-24 rounded-lg border px-2 py-1.5 dark:bg-slate-950" /></td>
                <td className="p-3"><input aria-label={`${action.label} enabled`} type="checkbox" checked={action.isEnabled} onChange={(e) => setDrafts((old) => ({ ...old, [action.key]: { ...action, isEnabled: e.target.checked } }))} /></td>
                <td className="p-3 text-right"><button type="button" disabled={savingAction} onClick={() => void saveAction(action)} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 font-bold text-white"><Save className="h-3.5 w-3.5" /> Save</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={submitCoupon} className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <h3 className="flex items-center gap-2 text-sm font-bold"><TicketPercent className="h-4 w-4 text-rose-600" /> Create credit coupon</h3>
          <input required value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="LAUNCH100" className="w-full rounded-lg border px-3 py-2 uppercase dark:bg-slate-950" />
          <div className="grid grid-cols-2 gap-2"><input aria-label="Coupon credits" type="number" min={1} value={couponCredits} onChange={(e) => setCouponCredits(Number(e.target.value))} className="rounded-lg border px-3 py-2 dark:bg-slate-950" /><input aria-label="Maximum redemptions" type="number" min={1} value={couponLimit} onChange={(e) => setCouponLimit(Number(e.target.value))} className="rounded-lg border px-3 py-2 dark:bg-slate-950" /></div>
          <button disabled={creatingCoupon} className="w-full rounded-lg bg-rose-600 px-3 py-2 font-bold text-white">Create coupon</button>
        </form>
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <h3 className="mb-3 text-sm font-bold">Coupons</h3>
          <div className="space-y-2">{couponsData?.data.map((coupon) => <div key={coupon.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-950"><span><strong>{coupon.code}</strong><span className="ml-2 text-slate-500">+{coupon.credits} credits · {coupon.redemptionCount}/{coupon.maxRedemptions ?? "∞"}</span></span><button type="button" onClick={() => void updateCoupon({ id: coupon.id, data: { isActive: !coupon.isActive } })} className={`rounded-full px-2 py-1 text-[10px] font-bold ${coupon.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{coupon.isActive ? "ACTIVE" : "PAUSED"}</button></div>)}</div>
        </div>
      </div>
    </section>
  );
}
