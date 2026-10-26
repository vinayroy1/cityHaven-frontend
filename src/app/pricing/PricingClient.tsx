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
  Users,
  Home,
  Flame,
  Check,
  Coins,
  BadgePercent,
  Clock,
  LucideIcon,
} from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { APP_CONFIG } from "@/constants/app-config";
import { useMyOrganizationsQuery } from "@/features/organizations/api";
import {
  Plan,
  PlanCategory,
  useGetCreditPlatformConfigQuery,
  usePurchaseCreditsByPlanMutation,
  useGetBillingSummaryQuery,
  useRedeemCreditCouponMutation,
} from "@/features/contactVerify/api";

type CategoryMeta = {
  label: string;
  badgeLabel: string;
  subtitle: string;
  icon: LucideIcon;
};

const CATEGORY_CONFIG: Record<PlanCategory | string, CategoryMeta> = {
  BUYER_TENANT: {
    label: "Common Credit Packs",
    badgeLabel: "One Wallet, Every Action",
    subtitle: "Use the same credits for contacts, listings, renewals, property boosts, flatmate posts, and advisor spotlights.",
    icon: PhoneCall,
  },
  FLATMATE: {
    label: "Flatmates & Rooms",
    badgeLabel: "Direct Connect & Fast Fill",
    subtitle: "Direct room connects from ₹49, urgent move-in locality spotlights, and verified roomie trust badges.",
    icon: Users,
  },
  OWNER_LANDLORD: {
    label: "Property Owners",
    badgeLabel: "100% Free Listing",
    subtitle: "Post your property for ₹0. Boost visibility with top-rank locality spotlights and rental agreement assistance.",
    icon: Home,
  },
  AGENCY_BROKER: {
    label: "Multi-Property & Teams",
    badgeLabel: "High Volume & Shared Workspaces",
    subtitle: "Scalable monthly plans for multi-unit owners, property managers & team workspaces. 10 to 100 listings, shared credits & multi-agent seats.",
    icon: Building2,
  },
};

export function PricingClient() {
  const router = useRouter();

  // Fetch all active plans from backend DB
  const { data: platformData, isLoading: isPlansLoading } = useGetCreditPlatformConfigQuery();
  const plans: Plan[] = platformData?.data?.plans ?? [];
  const purchaseEnabled = platformData?.data?.flags.find((flag) => flag.key === "CREDIT_PURCHASES_ENABLED")?.isEnabled ?? false;

  // Group plans dynamically by category as provided by DB
  const categoriesPresent = useMemo<(PlanCategory | string)[]>(() => {
    const set = new Set<string>();
    if (plans.length) set.add("BUYER_TENANT");
    return Array.from(set);
  }, [plans]);

  // Active category selection
  const [activeCategory, setActiveCategory] = useState<PlanCategory | string>("BUYER_TENANT");

  // Sync active category if loaded
  React.useEffect(() => {
    if (categoriesPresent.length > 0 && !categoriesPresent.includes(activeCategory)) {
      setActiveCategory(categoriesPresent[0]);
    }
  }, [categoriesPresent, activeCategory]);

  const [billingScope, setBillingScope] = useState<"PERSONAL" | "ORGANIZATION">("PERSONAL");
  const [selectedOrgId, setSelectedOrgId] = useState<number | undefined>(undefined);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null;
  const isAuthenticated = Boolean(token);

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
  const [redeemCoupon, { isLoading: isRedeemingCoupon }] = useRedeemCreditCouponMutation();
  const couponsEnabled = platformData?.data?.flags.find((flag) => flag.key === "COUPONS_ENABLED")?.isEnabled ?? false;

  const handleCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    setPurchaseError(null);
    try {
      const result = await redeemCoupon({ code: couponCode, organizationId: effectiveOrgId }).unwrap();
      setPurchaseSuccess(`${result.data.code} redeemed: +${result.data.creditsAdded} credits. Balance: ${result.data.credits}.`);
      setCouponCode("");
      void refetchSummary();
    } catch (error: any) {
      setPurchaseError(error?.data?.message || "Coupon could not be redeemed.");
    }
  };

  // Active plans to display under selected category, sorted by sortOrder and price
  const plansForCategory = useMemo(() => {
    return plans
      .filter((p) => (p.contactCredits ?? p.features?.creditsIncluded ?? 0) > 0)
      .sort((a, b) => {
        if ((a.sortOrder ?? 0) !== (b.sortOrder ?? 0)) {
          return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        }
        return a.price - b.price;
      });
  }, [plans]);

  const categoryMeta: CategoryMeta = CATEGORY_CONFIG[activeCategory] || {
    label: activeCategory.replace(/_/g, " "),
    badgeLabel: "Flexible Plan",
    subtitle: "Tailored real estate solutions for maximum value.",
    icon: Sparkles,
  };

  const handleAction = async (plan: Plan) => {
    setPurchaseError(null);
    setPurchaseSuccess(null);

    if (!purchaseEnabled) {
      setPurchaseError("Credit purchases are not open yet. You can still use earned and promotional credits.");
      return;
    }

    // Free tier: direct to property posting
    if (plan.price === 0) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=/post-property`);
      } else {
        router.push(`/post-property`);
      }
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?redirect=/pricing`);
      return;
    }

    setSelectedPlanId(plan.id);

    try {
      const res = await purchaseCreditsByPlan({
        planId: plan.id,
        target: billingScope === "ORGANIZATION" ? "ORG" : "USER",
        organizationId: effectiveOrgId,
      }).unwrap();

      setPurchaseSuccess(
        `Successfully activated ${res.data?.planName || plan.name}! Current balance: ${res.data?.credits ?? 0} contact credits.`
      );
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
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-200 px-3.5 py-1 text-xs font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 mb-3 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              <span>Zero Brokerage &bull; Micro-Transaction Disruption</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 dark:text-white">
              Fair &amp; Affordable Real Estate
            </h1>

            <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              One transparent credit balance powers every paid action. Earn credits now and use them across contacts, posting, renewals, and visibility boosts.
            </p>

            {/* Dynamic Category Selector Tabs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
              {categoriesPresent.map((catKey) => {
                const isSelected = activeCategory === catKey;
                const meta = CATEGORY_CONFIG[catKey] || {
                  label: catKey.replace(/_/g, " "),
                  icon: Sparkles,
                };
                const IconComponent = meta.icon;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => {
                      setActiveCategory(catKey);
                      setPurchaseSuccess(null);
                      setPurchaseError(null);
                    }}
                    className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-xs sm:text-sm font-bold transition shadow-sm ${
                      isSelected
                        ? "border-rose-600 bg-rose-600 text-white shadow-rose-200 dark:shadow-rose-950/60"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    <IconComponent className="h-4 w-4 shrink-0" />
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Category Description Banner */}
            <div className="mt-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400 inline-block max-w-2xl">
              <span className="font-bold text-rose-600 dark:text-rose-400 mr-1.5">{categoryMeta.badgeLabel}:</span>
              {categoryMeta.subtitle}
            </div>

            {/* Early Launch Notice if Purchases are Disabled */}
            {!purchaseEnabled && (
              <div className="mt-4 mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 text-left sm:text-center">
                <p className="font-bold flex items-center justify-center gap-1.5 text-amber-800 dark:text-amber-300">
                  <Sparkles className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>Early Founder Launch &bull; Enjoy Free Credits!</span>
                </p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  Paid credit top-ups are currently in preview mode. All new users receive <strong>1,000 free credits on registration</strong> to unlock verified contacts, post listings, and test visibility boosts.
                </p>
              </div>
            )}

            {/* Organization / Personal Switcher for Agency & Broker Plans */}
            {activeCategory === "AGENCY_BROKER" && (
              <div className="mt-6 flex flex-col items-center gap-3">
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

                {billingScope === "ORGANIZATION" && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
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
                        You do not own an organization workspace yet.{" "}
                        <Link href="/dashboard/organization?create=1" className="font-bold underline text-amber-900 dark:text-amber-300">
                          Create an organization
                        </Link>{" "}
                        to subscribe to team seats.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Current Balance Banner */}
            {isAuthenticated && summary && (
              <div className="mt-5 inline-flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2 text-xs text-emerald-900 shadow-sm">
                <span className="font-semibold">
                  Active balance: <strong className="font-black text-emerald-800">{summary.credits.toLocaleString("en-IN")} Credits</strong>
                </span>
                <span className="h-3 w-px bg-emerald-300" />
                <span>
                  Listings limit: <strong>{summary.allowances?.listings?.limit ?? 5} active</strong>
                </span>
                {billingScope === "ORGANIZATION" && (
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

          {/* Feedback banners */}
          {purchaseSuccess && (
            <div className="mb-8 mx-auto max-w-xl flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-sm animate-in fade-in duration-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{purchaseSuccess}</span>
            </div>
          )}

          {purchaseError && (
            <div className="mb-8 mx-auto max-w-xl flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm animate-in fade-in duration-200">
              <ShieldCheck className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{purchaseError}</span>
            </div>
          )}

          {couponsEnabled && isAuthenticated && (
            <form onSubmit={handleCoupon} className="mb-8 mx-auto flex max-w-xl gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <input aria-label="Coupon code" required value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="Enter coupon code" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm uppercase outline-none focus:border-rose-500 dark:border-slate-700 dark:bg-slate-950" />
              <button disabled={isRedeemingCoupon} className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60">{isRedeemingCoupon ? "Redeeming…" : "Redeem"}</button>
            </form>
          )}

          {/* Transparent Credit Value Guide */}
          <div className="mb-8 rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-rose-50/40 to-slate-50 p-5 shadow-xs dark:border-amber-950/60 dark:from-amber-950/20 dark:via-rose-950/10 dark:to-slate-900">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-white font-black text-xs shadow-xs">
                    🪙
                  </div>
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white">
                    One Universal Credit Wallet Powers Every Action
                  </h4>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Transparent
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Every pack deposits credits directly into your wallet. Use them interchangeably for verified owner reveals, listing posts, renewals, and top-rank locality boosts. Credits never expire.
                </p>
              </div>

              {/* Action cost cheat sheet */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 font-bold shadow-xs border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                  <PhoneCall className="h-3.5 w-3.5 text-rose-500" />
                  <span>10 cr / Contact Unlock</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 font-bold shadow-xs border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                  <Home className="h-3.5 w-3.5 text-blue-500" />
                  <span>30 cr / Property Post</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 font-bold shadow-xs border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                  <Users className="h-3.5 w-3.5 text-purple-500" />
                  <span>20 cr / Flatmate Post</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 font-bold shadow-xs border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  <span>50 cr / 7-Day Boost</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Cards Grid - 100% Dynamic from Backend DB */}
          {isPlansLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
              <p className="mt-3 text-sm text-slate-500 font-medium">Fetching verified plans from server...</p>
            </div>
          ) : plansForCategory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
              <p className="text-sm font-semibold">No active plans found for this category.</p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${
                plansForCategory.length === 3
                  ? "lg:grid-cols-3 max-w-5xl mx-auto"
                  : plansForCategory.length >= 4
                  ? "lg:grid-cols-4 max-w-7xl mx-auto"
                  : "max-w-3xl mx-auto"
              }`}
            >
              {plansForCategory.map((plan: Plan) => {
                const isPopular = Boolean(plan.isPopular);
                const isProcessingThis = isPurchasing && selectedPlanId === plan.id;
                const isFree = plan.price === 0;
                const isMonthly = plan.billingCycle === "MONTHLY";

                // Total universal credits provided
                const creditsAmount = Number(plan.contactCredits) || Number(plan.features?.creditsIncluded) || 0;

                // Discount calculation
                const hasDiscount = Boolean(plan.originalPrice && plan.originalPrice > plan.price);
                const discountPct = hasDiscount
                  ? Math.round((((plan.originalPrice ?? 0) - plan.price) / (plan.originalPrice ?? 1)) * 100)
                  : 0;

                // Dynamic validity label
                const validityLabel =
                  plan.billingCycle === "ONE_TIME"
                    ? plan.durationDays
                      ? `${plan.durationDays} days validity`
                      : "Lifetime Validity (Never expires)"
                    : plan.billingCycle === "MONTHLY"
                    ? "/ month"
                    : plan.billingCycle === "DAILY"
                    ? `${plan.durationDays ?? 7} days spotlight`
                    : plan.billingCycle.toLowerCase();

                // Effective per credit rate
                const perCreditRateText =
                  plan.features?.perCreditRate ||
                  (creditsAmount > 0 && plan.price > 0
                    ? `₹${(plan.price / creditsAmount).toFixed(2)} / credit`
                    : null);

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 ${
                      isPopular
                        ? "border-rose-500 ring-2 ring-rose-500/20 shadow-rose-100 dark:shadow-rose-950/40"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                    }`}
                  >
                    {/* Badge: Most Popular / Rent 3x Faster / Best Value */}
                    {(plan.badge || isPopular) && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-rose-600 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md shadow-rose-200 dark:shadow-rose-950/60 whitespace-nowrap">
                        {plan.badge || "Most Popular"}
                      </div>
                    )}

                    {/* Plan Title & Icon */}
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <h3 className="text-xl font-black text-slate-950 dark:text-white">{plan.name}</h3>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0">
                        {isPopular ? (
                          <Flame className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        ) : isFree ? (
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Zap className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        )}
                      </div>
                    </div>

                    {/* Tagline / Subtitle */}
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 min-h-[32px] line-clamp-2">
                      {plan.tagline || plan.description}
                    </p>

                    {/* Prominent Credits Display Pill */}
                    {creditsAmount > 0 && (
                      <div className="mt-3.5 flex items-center justify-between rounded-2xl bg-amber-500/10 border border-amber-500/25 px-3.5 py-2.5 dark:bg-amber-500/15">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xs font-black text-sm shrink-0">
                            🪙
                          </div>
                          <div>
                            <div className="text-base sm:text-lg font-black text-slate-950 dark:text-white leading-none">
                              +{creditsAmount.toLocaleString("en-IN")} Credits
                            </div>
                            <span className="block text-[10px] font-semibold text-amber-800 dark:text-amber-300 mt-0.5">
                              {isMonthly ? "Monthly team credit pool" : "Added to your wallet instantly"}
                            </span>
                          </div>
                        </div>

                        {perCreditRateText && (
                          <span className="rounded-full bg-white/90 dark:bg-slate-900/90 px-2.5 py-1 text-[11px] font-black text-amber-800 dark:text-amber-300 shadow-xs border border-amber-200 dark:border-amber-900 shrink-0">
                            {perCreditRateText}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price Block */}
                    <div className="mt-4 flex flex-col">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">
                          {isFree ? "Free" : `₹${plan.price.toLocaleString("en-IN")}`}
                        </span>

                        {hasDiscount && (
                          <span className="text-sm font-semibold text-slate-400 line-through">
                            ₹{plan.originalPrice?.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {validityLabel}
                        </span>

                        {hasDiscount && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Save {discountPct}%
                          </span>
                        )}
                      </div>

                      {creditsAmount > 0 && (
                        <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 shrink-0" />
                          <span>
                            {perCreditRateText ? `${perCreditRateText} • ` : ""}Universal wallet balance
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Feature Checklist - 100% Dynamic from Backend featureList JSON */}
                    <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-xs text-slate-700 dark:border-slate-800 dark:text-slate-300 flex-1">
                      {plan.featureList && plan.featureList.length > 0 ? (
                        plan.featureList.map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-2 ${
                              item.highlight ? "font-bold text-slate-950 dark:text-white" : ""
                            }`}
                          >
                            <CheckCircle2
                              className={`h-4 w-4 shrink-0 mt-0.5 ${
                                item.highlight
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            />
                            <span>{item.text}</span>
                          </div>
                        ))
                      ) : (
                        // Fallback in case a plan has no featureList
                        <>
                          {creditsAmount > 0 ? (
                            <div className="flex items-center gap-2 font-bold text-slate-950 dark:text-white">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              <span>+{creditsAmount.toLocaleString("en-IN")} Universal credits added to wallet</span>
                            </div>
                          ) : null}
                          {creditsAmount >= 10 && (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              <span>Unlock up to {Math.floor(creditsAmount / 10)} verified owner / flatmate contacts</span>
                            </div>
                          )}
                          {creditsAmount >= 20 && (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              <span>Or publish {Math.floor(creditsAmount / 30)} properties (30 cr) / {Math.floor(creditsAmount / 20)} flatmates (20 cr)</span>
                            </div>
                          )}
                          {plan.activeListings ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              <span>Up to {plan.activeListings} active property listings</span>
                            </div>
                          ) : null}
                          {plan.teamSeats && plan.teamSeats > 1 ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              <span>{plan.teamSeats} team agent seats</span>
                            </div>
                          ) : null}
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span>Lifetime validity (credits never expire)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span>Zero brokerage guarantee</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      disabled={isPurchasing || !purchaseEnabled}
                      onClick={() => handleAction(plan)}
                      className={`mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-xs font-bold transition shadow-sm ${
                        isPopular
                          ? "bg-rose-600 text-white shadow-rose-200 hover:bg-rose-700 hover:shadow-md dark:shadow-rose-950/50"
                          : isFree
                          ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
                          : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {isProcessingThis ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Activating...</span>
                        </>
                      ) : (
                        <>
                          <span>{purchaseEnabled ? (plan.ctaText || (isFree ? "Get Started" : `Get ${plan.name}`)) : "Purchases launching soon"}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Comparison / Disruption Value Proposition */}
          <div className="mt-20 rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black uppercase text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                The Awasio Advantage
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                Why Pay ₹25,000 Brokerage When You Can Pay ₹29?
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                See how Awasio eliminates traditional rental brokerage and inflated portal subscription fees.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/50">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Traditional Brokers</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">1 Month Rent</p>
                <p className="text-xs text-rose-600 font-semibold mt-0.5">₹15,000 – ₹50,000 fee</p>
                <ul className="mt-4 space-y-2 text-slate-500 text-xs">
                  <li>&times; Biased recommendations</li>
                  <li>&times; Heavy upfront commission</li>
                  <li>&times; High pressure sales tactics</li>
                  <li>&times; Zero post-signing support</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/50">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Old Property Portals</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">₹2,999 – ₹6,999</p>
                <p className="text-xs text-amber-600 font-semibold mt-0.5">Strict monthly expiry</p>
                <ul className="mt-4 space-y-2 text-slate-500 text-xs">
                  <li>&times; Unused contacts expire in 30 days</li>
                  <li>&times; Forced high-ticket bundled packs</li>
                  <li>&times; Unverified owner listings</li>
                  <li>&times; Continuous marketing call spam</li>
                </ul>
              </div>

              <div className="rounded-2xl border-2 border-rose-500 bg-rose-50/50 p-6 dark:bg-rose-950/20 shadow-lg shadow-rose-100 dark:shadow-rose-950/50">
                <p className="font-bold text-rose-600 uppercase tracking-wider text-[11px]">Awasio Micro-Packs</p>
                <p className="text-xl font-black text-slate-950 dark:text-white mt-1">From ₹29</p>
                <p className="text-xs text-emerald-600 font-bold mt-0.5">Lifetime Validity &bull; 0% Commission</p>
                <ul className="mt-4 space-y-2 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Pay only for what you shortlist</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Credits never expire (lifetime validity)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>100% verified telephone reveals</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Free listings for genuine property owners</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="mt-20 border-t border-slate-200 dark:border-slate-850 pt-12">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-xs text-slate-600 dark:text-slate-400">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-1.5">
                  <PhoneCall className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  How do universal credits and contact unlocks work?
                </p>
                <p>
                  Each pack adds transparent credits directly to your wallet balance. Unlocking a verified owner or flatmate contact charges 10 credits once per listing. Once unlocked, you have permanent access to that contact in your dashboard without ever paying again. Your credits never expire and can also be used for property listings (30 credits), flatmate posts (20 credits), and visibility boosts (50 credits).
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-1.5">
                  <Home className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  Is property listing really 100% free for owners?
                </p>
                <p>
                  Yes! Genuine property owners can list their property for ₹0 with zero brokerage commission. If you want faster occupancy, you can opt for an optional Locality Spotlight Boost (₹149) or Owner Complete Pack with KYC and digital rental agreement templates (₹399).
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-1.5">
                  <Users className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  How do flatmate connects and spotlights work?
                </p>
                <p>
                  Room seekers can use universal credits (10 credits per verified connect) or grab the Roomie Connect Pass (+30 Credits for ₹49) to connect with verified room posters directly. Room posters with an urgent vacancy can spotlight their listing at the top of their locality for 7 days (50 credits) to find a compatible roommate quickly.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-1.5">
                  <Building2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  How do multi-property plans and team workspaces work?
                </p>
                <p>
                  Any user or organization managing multiple properties can subscribe to monthly plans starting at ₹299/mo. Team plans (Agency Pro and Fleet) include shared credit pools and multiple team seats so your team members can manage listings and unlock owner leads collaboratively from their own logins.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-1.5">
                  <Sparkles className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  What about Advisor Profiles on Awasio?
                </p>
                <p>
                  Any verified real estate advisor or RERA consultant can create an Advisor Profile from their dashboard for free. It gives you a public profile page and directory search ranking. Advisors who want premium placement on the homepage carousel can opt for a City Spotlight or Pro Advisor badge.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-1.5">
                  <Flame className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  How does New Project listing work for builders?
                </p>
                <p>
                  Builders, developers, and official project marketing partners can showcase RERA-registered townships, floor plans, and brochures on Awasio via Post Project. Featured projects receive priority discovery in the New Projects directory and direct buyer enquiries.
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
