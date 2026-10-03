"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  Building2,
  User,
  Crown,
  Sparkles,
  ArrowRight,
  Loader2,
  PhoneCall,
} from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { APP_CONFIG } from "@/constants/app-config";
import { useMyOrganizationsQuery } from "@/features/organizations/api";
import {
  Plan,
  useGetPlansQuery,
  usePurchaseCreditsByPlanMutation,
  useGetBillingSummaryQuery,
} from "@/features/contactVerify/api";

type BillingCycle = "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY";

interface CycleConfig {
  key: BillingCycle;
  label: string;
  shortLabel: string;
  months: number;
  discountPct: number;
  badge?: string;
}

const BILLING_CYCLES: CycleConfig[] = [
  { key: "MONTHLY", label: "Monthly", shortLabel: "month", months: 1, discountPct: 0 },
  { key: "QUARTERLY", label: "Quarterly (3 Mo)", shortLabel: "quarter", months: 3, discountPct: 10, badge: "Save 10%" },
  { key: "HALF_YEARLY", label: "Half-Yearly (6 Mo)", shortLabel: "6 months", months: 6, discountPct: 20, badge: "Save 20%" },
  { key: "YEARLY", label: "Yearly (12 Mo)", shortLabel: "year", months: 12, discountPct: 30, badge: "Save 30%" },
];

export function PricingClient() {
  const router = useRouter();
  const [pricingCategory, setPricingCategory] = useState<"CASUAL_PACKS" | "COMBINED_PLANS">("CASUAL_PACKS");
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>("MONTHLY");
  const [billingScope, setBillingScope] = useState<"PERSONAL" | "ORGANIZATION">("PERSONAL");
  const [selectedOrgId, setSelectedOrgId] = useState<number | undefined>(undefined);
  const [selectedPlanId, setSelectedPlanId] = useState<number | string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null;
  const isAuthenticated = Boolean(token);

  // Fetch all plans dynamically from backend API
  const { data: plansData, isLoading: isPlansLoading } = useGetPlansQuery();
  const plans = plansData?.data ?? [];

  // Categorize API plans dynamically based on backend features & billing cycle
  const casualPacksFromApi = useMemo(() => {
    return plans.filter((p) => {
      const f = (p.features ?? {}) as Record<string, any>;
      return f.type === "PACK" || p.billingCycle === "ONCE" || (!f.maxActiveListings && f.creditsIncluded);
    });
  }, [plans]);

  const subscriptionPlansFromApi = useMemo(() => {
    return plans.filter((p) => {
      const f = (p.features ?? {}) as Record<string, any>;
      return f.type === "SUBSCRIPTION" || p.billingCycle !== "ONCE" || Boolean(f.maxActiveListings);
    });
  }, [plans]);

  // If backend hasn't separated them yet, display all plans from API
  const activePlansToDisplay = useMemo(() => {
    if (pricingCategory === "CASUAL_PACKS") {
      return casualPacksFromApi.length > 0 ? casualPacksFromApi : plans;
    }
    return subscriptionPlansFromApi.length > 0 ? subscriptionPlansFromApi : plans;
  }, [pricingCategory, casualPacksFromApi, subscriptionPlansFromApi, plans]);

  const activeCycleConfig = useMemo(() => {
    return BILLING_CYCLES.find((c) => c.key === selectedCycle) || BILLING_CYCLES[0];
  }, [selectedCycle]);

  const { data: orgsData } = useMyOrganizationsQuery(undefined, { skip: !isAuthenticated });
  const orgs = orgsData ?? [];

  const activeOrg = orgs.find((o) => o.id === selectedOrgId) || orgs[0];
  const effectiveOrgId = billingScope === "ORGANIZATION" ? activeOrg?.id : undefined;

  const { data: summaryData, refetch: refetchSummary } = useGetBillingSummaryQuery(
    { target: billingScope === "ORGANIZATION" ? "ORG" : "USER", organizationId: effectiveOrgId },
    { skip: !isAuthenticated || (billingScope === "ORGANIZATION" && !effectiveOrgId) }
  );
  const summary = summaryData?.data;

  const [purchaseCreditsByPlan, { isLoading: isPurchasing }] = usePurchaseCreditsByPlanMutation();

  const handlePurchasePlan = async (planId: number, planName: string) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/pricing`);
      return;
    }

    setSelectedPlanId(planId);
    setPurchaseError(null);
    setPurchaseSuccess(null);

    try {
      const res = await purchaseCreditsByPlan({
        planId,
        target: billingScope === "ORGANIZATION" ? "ORG" : "USER",
        organizationId: effectiveOrgId,
      }).unwrap();

      setPurchaseSuccess(`Successfully activated ${res.data?.planName || planName}! You now have ${res.data?.credits ?? 0} contact credits.`);
      void refetchSummary();
    } catch (err: any) {
      setPurchaseError(err?.data?.message || err?.message || "Payment activation failed. Please try again.");
    } finally {
      setSelectedPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header section */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-200 px-3.5 py-1 text-xs font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 mb-3 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              Transparent Pricing & Contact Packs
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              {pricingCategory === "CASUAL_PACKS"
                ? "Casual Contact Unlock Packs (Pay-as-you-go)"
                : "All-in-One Membership Plans (Search + Listing + Team)"}
            </h1>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              {pricingCategory === "CASUAL_PACKS"
                ? "Unlock direct verified owner numbers on demand without any monthly subscription. Pay once, contacts remain unlocked permanently."
                : "Publish listings, get priority featured placement, unlock verified owners, and manage team seats with your agency or builder brand."}
            </p>

            {/* Category Switcher: Casual Contact Packs vs All-in-One Subscriptions */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPricingCategory("CASUAL_PACKS");
                  setPurchaseSuccess(null);
                  setPurchaseError(null);
                }}
                className={`flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-xs font-bold transition shadow-sm ${
                  pricingCategory === "CASUAL_PACKS"
                    ? "border-rose-600 bg-rose-600 text-white shadow-rose-200 dark:shadow-rose-950/50"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <PhoneCall className="h-4 w-4" />
                <span>Casual Contact Packs (For Buyers / Searchers)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPricingCategory("COMBINED_PLANS");
                  setPurchaseSuccess(null);
                  setPurchaseError(null);
                }}
                className={`flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-xs font-bold transition shadow-sm ${
                  pricingCategory === "COMBINED_PLANS"
                    ? "border-slate-950 bg-slate-950 text-white shadow-slate-200 dark:border-white dark:bg-white dark:text-slate-950"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>All-in-One Plans (Owners, Brokers & Teams)</span>
              </button>
            </div>

            {/* If Combined Plans is selected, show Personal vs Organization Scope Switcher */}
            {pricingCategory === "COMBINED_PLANS" && (
              <div className="mt-4 flex flex-col items-center gap-3">
                <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setBillingScope("PERSONAL")}
                    className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition ${
                      billingScope === "PERSONAL"
                        ? "bg-slate-950 text-white shadow-sm dark:bg-slate-100 dark:text-slate-950"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    Personal Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBillingScope("ORGANIZATION");
                      if (!selectedOrgId && orgs[0]) setSelectedOrgId(orgs[0].id);
                    }}
                    className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition ${
                      billingScope === "ORGANIZATION"
                        ? "bg-slate-950 text-white shadow-sm dark:bg-slate-100 dark:text-slate-950"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    Organization Workspace
                  </button>
                </div>

                {/* Billing Cycle Switcher: Monthly / Quarterly / Half-Yearly / Yearly */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  {BILLING_CYCLES.map((cycle) => {
                    const isSelected = selectedCycle === cycle.key;
                    return (
                      <button
                        key={cycle.key}
                        type="button"
                        onClick={() => setSelectedCycle(cycle.key)}
                        className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                          isSelected
                            ? "bg-slate-950 text-white shadow-sm dark:bg-slate-100 dark:text-slate-950"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                        }`}
                      >
                        <span>{cycle.label}</span>
                        {cycle.badge && (
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-black uppercase ${
                              isSelected ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300"
                            }`}
                          >
                            {cycle.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Organization Selector (if in Org Mode and has orgs) */}
            {pricingCategory === "COMBINED_PLANS" && billingScope === "ORGANIZATION" && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {orgs.length > 0 ? (
                  <>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Purchasing for:</span>
                    <select
                      value={activeOrg?.id}
                      onChange={(e) => setSelectedOrgId(Number(e.target.value))}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 outline-none focus:border-rose-400"
                    >
                      {orgs.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({o.role?.name || "Member"})
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-200">
                    You are not an owner of any organization yet.{" "}
                    <Link href="/dashboard/organization?create=1" className="font-bold underline text-amber-900 dark:text-amber-300">
                      Create an organization
                    </Link>{" "}
                    to buy team plans.
                  </div>
                )}
              </div>
            )}

            {/* Current Balance Banner */}
            {isAuthenticated && summary && (
              <div className="mt-5 inline-flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2 text-xs text-emerald-900 shadow-sm">
                <span className="font-semibold">
                  Active balance: <strong className="font-black text-emerald-800">{summary.credits} contact credits</strong>
                </span>
                <span className="h-3 w-px bg-emerald-300" />
                <span>
                  Listings limit: <strong>{summary.allowances?.listings?.limit ?? 5} active</strong>
                </span>
                {pricingCategory === "COMBINED_PLANS" && billingScope === "ORGANIZATION" && (
                  <>
                    <span className="h-3 w-px bg-emerald-300" />
                    <span>
                      Seats limit: <strong>{summary.allowances?.seats?.limit ?? 2} members</strong>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Feedback messages */}
          {purchaseSuccess && (
            <div className="mb-8 mx-auto max-w-xl flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{purchaseSuccess}</span>
            </div>
          )}

          {purchaseError && (
            <div className="mb-8 mx-auto max-w-xl flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm">
              <ShieldCheck className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{purchaseError}</span>
            </div>
          )}

          {/* Pricing Grid - 100% Dynamic from Backend API */}
          {isPlansLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
              <p className="mt-3 text-sm text-slate-500 font-medium">Loading pricing from server...</p>
            </div>
          ) : activePlansToDisplay.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
              <p className="text-sm font-semibold">No plans found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {activePlansToDisplay.map((plan: Plan) => {
                const features = (plan.features ?? {}) as Record<string, any>;
                const baseCredits = Number(features.creditsIncluded) || 1;
                const maxListings = Number(features.maxActiveListings) || 0;
                const maxSeats = Number(features.maxSeats) || 0;
                const boosts = Number(features.featuredBoosts) || 0;
                const isPopular = Boolean(features.popular);
                const isPack = pricingCategory === "CASUAL_PACKS" || (plan.billingCycle === "ONCE" && features.type === "PACK");
                const isProcessingThis = isPurchasing && selectedPlanId === plan.id;

                // Dynamic pricing calculation based on active billing cycle
                const months = isPack ? 1 : activeCycleConfig.months;
                const discountPct = isPack ? 0 : activeCycleConfig.discountPct;
                const totalPrice = isPack
                  ? plan.price
                  : Math.round(plan.price * months * (1 - discountPct / 100));
                const effectiveMonthlyPrice = isPack
                  ? plan.price
                  : Math.round(totalPrice / months);
                const totalCredits = isPack ? baseCredits : baseCredits * months;

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 ${
                      isPopular
                        ? "border-rose-500 ring-2 ring-rose-500/20 shadow-rose-100 dark:shadow-rose-950/40"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-rose-600 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md shadow-rose-200 dark:shadow-rose-950/60">
                        Most Popular
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-black text-slate-950 dark:text-white">{plan.name}</h3>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {isPack ? (
                          <PhoneCall className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        ) : isPopular ? (
                          <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <Zap className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        )}
                      </div>
                    </div>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 min-h-[32px]">{plan.description}</p>

                    <div className="mt-4 flex flex-col">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-slate-950 dark:text-white">
                          ₹{totalPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                          {isPack ? "one-time" : `/ ${activeCycleConfig.shortLabel}`}
                        </span>
                      </div>

                      {!isPack && months > 1 && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-bold text-slate-900 dark:text-slate-200">₹{effectiveMonthlyPrice.toLocaleString("en-IN")}/mo</span>
                          <span className="text-[11px] font-semibold text-slate-400 line-through">₹{plan.price.toLocaleString("en-IN")}/mo</span>
                          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Save {discountPct}%
                          </span>
                        </div>
                      )}
                    </div>

                    {isPack && totalCredits > 0 && (
                      <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                        ~₹{Math.round(totalPrice / totalCredits)} / contact unlock
                      </p>
                    )}

                    <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-xs text-slate-700 dark:border-slate-800 dark:text-slate-300 flex-1">
                      <div className="flex items-center gap-2 font-bold text-slate-950 dark:text-white">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          {totalCredits} direct owner contact unlocks {!isPack && months > 1 ? `(${baseCredits}/mo)` : ""}
                        </span>
                      </div>

                      {maxListings > 0 && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>Up to {maxListings} active property listings</span>
                        </div>
                      )}

                      {billingScope === "ORGANIZATION" && maxSeats > 0 && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>Up to {maxSeats} team seats (members + invites)</span>
                        </div>
                      )}

                      {boosts > 0 && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>{boosts} featured placement boost{boosts === 1 ? "" : "s"}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>Permanent contact access once unlocked</span>
                      </div>

                      {billingScope === "ORGANIZATION" && !isPack && (
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-400" />
                          <span>Shared team usage with audit logs</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isPurchasing}
                      onClick={() => handlePurchasePlan(plan.id, plan.name)}
                      className={`mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-xs font-bold transition shadow-sm ${
                        isPopular
                          ? "bg-rose-600 text-white shadow-rose-200 hover:bg-rose-700 hover:shadow-md dark:shadow-rose-950/50"
                          : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {isProcessingThis ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Activating...
                        </>
                      ) : (
                        <>
                          {isAuthenticated ? `Buy ${plan.name}` : isPack ? "Unlock Contacts" : "Get Started"}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Frequently Asked Questions */}
          <div className="mt-20 border-t border-slate-200 dark:border-slate-850 pt-12">
            <h2 className="text-xl font-black text-slate-950 dark:text-white text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-xs text-slate-600 dark:text-slate-400">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-1.5">
                  <PhoneCall className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  How do contact unlocks work?
                </p>
                <p>
                  Each contact pack gives you credits to view verified owner phone numbers. Unlocking a contact charges 1 credit once per property. Once unlocked, you (or your organization members) can view that contact repeatedly without paying again.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-1.5">
                  <Building2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  Who pays for organization listings & unlocks?
                </p>
                <p>
                  Listing management is billed to the organization that owns the listing. When an employee unlocks someone else&apos;s contact using the organization workspace, the organization&apos;s allowance is deducted and shared with authorized members.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-1.5">
                  <User className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  How are team seats counted?
                </p>
                <p>
                  Seat capacity counts the owner, all active members, and unexpired pending invitations. Invitations reserve seats until accepted, revoked, or expired.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  Does buying a plan automatically verify my account?
                </p>
                <p>
                  No. Verification is an independent trust and safety process. Paid plans include priority verification support, but the verified badge is granted only when KYC documents are submitted and approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}
