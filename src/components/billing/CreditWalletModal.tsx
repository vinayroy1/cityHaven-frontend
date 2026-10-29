"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Zap,
  X,
  Share2,
  Copy,
  Check,
  Gift,
  Users,
  Building2,
  PhoneCall,
  Flame,
  TicketPercent,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetMyCreditsQuery,
  useGetMyCreditTransactionsQuery,
  useGetCreditPlatformConfigQuery,
  useRedeemCreditCouponMutation,
} from "@/features/contactVerify/api";
import { useMeQuery } from "@/features/auth/api";
import { useModalBackHandler } from "@/lib/navigation/useModalBackHandler";

interface CreditWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: {
    name?: string;
    email?: string;
  } | null;
}

export function CreditWalletModal({ isOpen, onClose, userProfile }: CreditWalletModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
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
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useModalBackHandler({
    isOpen,
    onClose,
    pushHistoryState: false,
    name: "CreditWalletModal",
  });

  const { data: creditsData, refetch: refetchCredits } = useGetMyCreditsQuery(undefined, {
    skip: !isOpen,
  });
  const { data: transactionsData, isLoading: isLoadingTx, refetch: refetchTx } = useGetMyCreditTransactionsQuery(
    { page: 1, pageSize: 10 },
    { skip: !isOpen }
  );
  const { data: configData } = useGetCreditPlatformConfigQuery(undefined, { skip: !isOpen });
  const [redeemCoupon, { isLoading: isRedeeming }] = useRedeemCreditCouponMutation();

  const balance = creditsData?.data?.credits ?? 0;
  const flags = configData?.data?.flags ?? [];
  const actions = configData?.data?.actions ?? [];

  const contactCost = actions.find((a) => a.key === "CONTACT_UNLOCK")?.creditAmount ?? 5;
  const propertyCost = actions.find((a) => a.key === "PROPERTY_POST")?.creditAmount ?? 10;
  const flatmateCost = actions.find((a) => a.key === "FLATMATE_POST")?.creditAmount ?? 10;
  const boost7Cost = actions.find((a) => a.key === "PROPERTY_BOOST_7")?.creditAmount ?? 50;
  const referralReward = actions.find((a) => a.key === "REFERRAL_REWARD")?.creditAmount ?? 100;

  const purchaseEnabled = flags.find((f) => f.key === "CREDIT_PURCHASES_ENABLED")?.isEnabled ?? false;
  const couponsEnabled = flags.find((f) => f.key === "COUPONS_ENABLED")?.isEnabled ?? true;

  // Referral link helper
  const { data: meData } = useMeQuery(undefined, { skip: !isOpen });
  const activeUserId = meData?.id || (userProfile as any)?.id;
  const referralCode = activeUserId ? `REF${activeUserId}` : userProfile?.email ? userProfile.email : "AWASIO";
  const referralUrl = typeof window !== "undefined" ? `${window.location.origin}/signup?ref=${referralCode}` : `https://awasio.com/signup?ref=${referralCode}`;
  const shareMessage = `Join Awasio — the verified zero-brokerage real estate platform! Use my invite link to get 1,000 Free Credits to unlock owner numbers & post listings: ${referralUrl}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success("Referral invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleRedeemCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setRedeemError(null);
    setRedeemSuccess(null);

    try {
      const res = await redeemCoupon({ code: couponCode.trim().toUpperCase() }).unwrap();
      setRedeemSuccess(`🎉 Code ${res.data.code} applied! +${res.data.creditsAdded} credits added to your balance.`);
      setCouponCode("");
      toast.success(`+${res.data.creditsAdded} Credits added!`);
      void refetchCredits();
      void refetchTx();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Invalid or expired coupon code.";
      setRedeemError(msg);
      toast.error(msg);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex min-h-[100dvh] items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Semi-transparent backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={onClose}
        onPointerDown={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="credit-wallet-title"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="cursor-default relative z-10 w-full max-w-xl my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-950 animate-in zoom-in-95 duration-200"
      >
        {/* Top Header Banner with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-pink-600 to-amber-600 px-4 sm:px-6 py-3.5 sm:py-5 text-white shrink-0">
          <div className="absolute -right-6 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md shadow-inner text-amber-300">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 fill-amber-300 stroke-amber-300" />
              </div>
              <div className="min-w-0">
                <h2 id="credit-wallet-title" className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                  Awasio Credit Wallet
                </h2>
                <p className="text-[11px] sm:text-xs text-rose-100 font-medium truncate">
                  Single universal balance for every action on Awasio
                </p>
              </div>
            </div>

            {/* High-visibility Close Button (Solid White Circle with Rose X) */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-white text-rose-600 hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all shadow-lg font-bold focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close modal"
              title="Close (Esc)"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Current Balance Display Card */}
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl sm:rounded-2xl bg-black/25 p-3 sm:p-4 backdrop-blur-md border border-white/15">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-200">
                Available Balance
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                  {balance}
                </span>
                <span className="text-xs sm:text-sm font-bold text-amber-300">Credits</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-200 border border-emerald-400/30">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Active &amp; Ready</span>
              </span>
              {purchaseEnabled && (
                <Link
                  href="/pricing"
                  onClick={onClose}
                  className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow hover:bg-rose-50 transition"
                >
                  Buy More
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-3.5 sm:py-5 space-y-4 sm:space-y-6">
          {/* Section: What your credits unlock */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              Transparent Credit Usage
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Unlock Owner or Flatmate Contact</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{contactCost} Credits</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-rose-600 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Post Property Listing</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{propertyCost} Credits</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Post Flatmate Listing</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{flatmateCost} Credits</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Featured Boost (7 Days)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{boost7Cost} Credits</span>
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              * Inquiries to verified builders and RERA advisors are always <strong className="text-emerald-600 font-semibold">0 Credits</strong>.
            </p>
          </div>

          {/* Section: How to get more free credits */}
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 to-rose-50/40 p-4 dark:border-amber-900/50 dark:bg-gradient-to-br dark:from-amber-950/20 dark:to-rose-950/10">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs uppercase tracking-wider mb-2">
              <Gift className="h-4 w-4 text-amber-600" />
              <span>How To Earn Free Credits</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              Earn bonus credits anytime by inviting friends with your unique referral link:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2 rounded-xl bg-white/90 p-2.5 shadow-2xs dark:bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-[11px] font-black text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    +{referralReward}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Refer a Friend</span>
                    <p className="text-[10px] text-slate-500">When they register with your referral link</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Redeem Coupon Code */}
          {couponsEnabled && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                <TicketPercent className="h-4 w-4 text-rose-500" />
                <span>Have a Coupon or Promo Code?</span>
              </div>

              <form onSubmit={handleRedeemCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. TEST100, WELCOME100"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-900 outline-none focus:border-rose-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={isRedeeming || !couponCode.trim()}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition"
                >
                  {isRedeeming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Redeem"}
                </button>
              </form>

              {redeemSuccess && (
                <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {redeemSuccess}
                </p>
              )}
              {redeemError && (
                <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {redeemError}
                </p>
              )}
            </div>
          )}

          {/* Section: Recent Activity Ledger */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Recent Credit Activity
              </h3>
              <span className="text-[11px] text-slate-400">Real-time ledger</span>
            </div>

            {isLoadingTx ? (
              <div className="py-6 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : transactionsData?.data?.items && transactionsData.data.items.length > 0 ? (
              <div className="space-y-1.5 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
                {transactionsData.data.items.map((tx: any) => {
                  const isPositive = tx.creditChange > 0;
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-2.5 text-xs first:rounded-t-xl last:rounded-b-xl">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                            isPositive
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                          }`}
                        >
                          <Zap className="h-3.5 w-3.5 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800 dark:text-slate-200">
                            {tx.reason?.replace(/_/g, " ") || "Credit Transaction"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`font-black text-sm shrink-0 ${
                          isPositive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isPositive ? `+${tx.creditChange}` : tx.creditChange}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
                <Clock className="mx-auto h-5 w-5 text-slate-300 dark:text-slate-600 mb-1" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  No credit transactions recorded yet
                </p>
                <p className="text-[11px] text-slate-400">
                  New users receive 1,000 free credits on registration!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info & explicit Close Button */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 sm:px-6 py-2.5 sm:py-3 text-xs dark:border-slate-800 dark:bg-slate-900/60 shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Credits never expire &bull; Zero brokerage
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
