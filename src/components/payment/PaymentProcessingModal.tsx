"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  CreditCard,
  ArrowRight,
  RefreshCw,
  Zap,
  Copy,
  Check,
  X,
  Shield,
  Wallet,
  Smartphone,
  ExternalLink,
} from "lucide-react";

export type PaymentFlowStatus =
  | "INITIALIZING"       // Creating order on backend with Cashfree
  | "CONNECTING_GATEWAY" // Session ready, launching Cashfree checkout modal
  | "CHECKOUT_OPEN"      // Cashfree modal is currently open
  | "VERIFYING"          // Cashfree payment returned COMPLETED, verifying with backend
  | "SUCCESS"            // Verified and credits added
  | "FAILED";            // Cancelled, closed, bank decline, or verification error

export interface PaymentPlanSummary {
  id?: number | string;
  name: string;
  price: number;
  currency?: string;
  contactCredits?: number;
  period?: string;
  category?: string;
  billingScope?: "USER" | "ORGANIZATION" | "PERSONAL";
}

export interface PaymentSuccessData {
  orderId?: string;
  cfPaymentId?: string;
  planName?: string;
  creditsAdded?: number;
  newBalance?: number;
  amountPaid?: number;
}

export interface PaymentProcessingModalProps {
  isOpen: boolean;
  status: PaymentFlowStatus;
  plan?: PaymentPlanSummary | null;
  errorMessage?: string | null;
  successData?: PaymentSuccessData | null;
  onClose: () => void;
  onRetry?: () => void;
  onExploreProperties?: () => void;
}

export function PaymentProcessingModal({
  isOpen,
  status,
  plan,
  errorMessage,
  successData,
  onClose,
  onRetry,
  onExploreProperties,
}: PaymentProcessingModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll while modal is active
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

  // Handle escape key (only allow when not in active verifying state)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "VERIFYING" && status !== "INITIALIZING") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, status, onClose]);

  if (!mounted || !isOpen) return null;

  const handleCopyOrderId = (idToCopy: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(idToCopy);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  const isConnecting =
    status === "INITIALIZING" ||
    status === "CONNECTING_GATEWAY" ||
    status === "CHECKOUT_OPEN";

  const isVerifying = status === "VERIFYING";
  const isSuccess = status === "SUCCESS";
  const isFailed = status === "FAILED";

  const planName = successData?.planName || plan?.name || "Contact Pack";
  const planPrice = successData?.amountPaid ?? plan?.price ?? 0;
  const creditsAdded = successData?.creditsAdded ?? plan?.contactCredits ?? 0;
  const orderId = successData?.orderId;

  return createPortal(
    <div
      className="fixed inset-0 z-[9990] flex min-h-[100dvh] items-center justify-center p-3 sm:p-4 overflow-y-auto"
      aria-labelledby="payment-modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
        onClick={() => {
          // Allow closing by clicking backdrop only on finished states
          if (isSuccess || isFailed) {
            onClose();
          }
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full max-w-md my-auto overflow-hidden rounded-3xl border shadow-2xl transition-all duration-300 ${
          isSuccess
            ? "border-emerald-300 bg-white dark:border-emerald-800 dark:bg-slate-900"
            : isFailed
            ? "border-rose-300 bg-white dark:border-rose-900 dark:bg-slate-900"
            : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        }`}
      >
        {/* Subtle decorative glowing background gradients */}
        {isSuccess && (
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        )}
        {isFailed && (
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
        )}
        {isConnecting && (
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        )}

        {/* Top Close Button (Visible on Success/Failed or when connecting) */}
        {!isVerifying && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment modal"
            className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* ---------------- STATE 1: INITIALIZING / CONNECTING LOADER ---------------- */}
        {isConnecting && (
          <div className="p-6 sm:p-8 text-center flex flex-col items-center">
            {/* Animated Radar / Pulse Ring Gateway Icon */}
            <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
              {/* Outer Pulsing Rings */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500/20 via-pink-500/20 to-indigo-500/20 animate-ping opacity-75 duration-1000" />
              <div className="absolute inset-1 rounded-full border-2 border-dashed border-rose-500/40 animate-spin [animation-duration:8s]" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-indigo-600 text-white shadow-xl shadow-rose-500/25">
                <Lock className="h-9 w-9 animate-pulse" />
              </div>
            </div>

            {/* Security Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 mb-3 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Cashfree 256-Bit SSL Encrypted</span>
            </div>

            <h3 id="payment-modal-title" className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Securing Payment Gateway
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xs">
              {status === "INITIALIZING"
                ? "Connecting with Cashfree to generate your encrypted checkout session..."
                : "Opening Cashfree secure payment window..."}
            </p>

            {/* Plan Preview Pill */}
            {plan && (
              <div className="mt-5 w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 text-left dark:border-slate-800 dark:bg-slate-950/50">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Selected Pack
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {plan.name}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      ₹{plan.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {creditsAdded > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      Contact Credits Included:
                    </span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{creditsAdded} Credits
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Animated Loading Bar */}
            <div className="mt-6 w-full">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                <div className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 rounded-full animate-pulse w-3/4 duration-700" />
              </div>
              <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                Please do not close or refresh this tab
              </p>
            </div>

            {/* Payment Method Badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                <Smartphone className="h-3 w-3 text-emerald-500" /> UPI (GPay, PhonePe, Paytm)
              </span>
              <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                <CreditCard className="h-3 w-3 text-indigo-500" /> All Cards
              </span>
              <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                <Shield className="h-3 w-3 text-amber-500" /> NetBanking
              </span>
            </div>
          </div>
        )}

        {/* ---------------- STATE 2: VERIFYING ---------------- */}
        {isVerifying && (
          <div className="p-6 sm:p-8 text-center flex flex-col items-center">
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
              <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[11px] font-bold text-amber-800 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300 mb-3">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Cashfree Payment Received</span>
            </div>

            <h3 id="payment-modal-title" className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Confirming Transaction
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xs">
              Verifying payment with Cashfree and activating credits on your wallet account...
            </p>

            <div className="mt-6 w-full rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3.5 text-xs text-amber-900 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-200">
              <p className="font-semibold">Almost there!</p>
              <p className="mt-0.5 text-[11px] text-amber-800/80 dark:text-amber-300/80">
                Please wait while we sync your newly added credits.
              </p>
            </div>
          </div>
        )}

        {/* ---------------- STATE 3: ATTRACTIVE SUCCESS MODAL ---------------- */}
        {isSuccess && (
          <div className="p-6 sm:p-8 text-center flex flex-col items-center">
            {/* Celebratory Check Icon with Glow */}
            <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-xl shadow-emerald-500/20 dark:bg-emerald-950/70 dark:text-emerald-400">
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-sm animate-bounce">
                <Sparkles className="h-3.5 w-3.5 fill-current" />
              </div>
              <CheckCircle2 className="h-11 w-11 animate-in zoom-in-50 duration-300" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Cashfree Verified Transaction</span>
            </div>

            <h3 id="payment-modal-title" className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Payment Successful!
            </h3>

            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Your contact pack has been activated. Instant unlock is now enabled for all verified owner contacts.
            </p>

            {/* Prominent Credits Added Badge */}
            <div className="mt-5 w-full rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-lg shadow-emerald-500/25">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                    Added to Your Wallet
                  </span>
                  <div className="text-2xl font-black flex items-center gap-1.5 mt-0.5">
                    <Zap className="h-6 w-6 fill-amber-300 text-amber-300" />
                    <span>+{creditsAdded} Credits</span>
                  </div>
                </div>

                {successData?.newBalance !== undefined && (
                  <div className="text-right rounded-xl bg-white/20 backdrop-blur-xs px-3 py-2 border border-white/20">
                    <span className="block text-[10px] uppercase font-bold text-emerald-100">
                      Total Balance
                    </span>
                    <span className="text-base font-black">
                      {successData.newBalance}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Receipt Summary Card */}
            <div className="mt-4 w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 text-left dark:border-slate-800 dark:bg-slate-950/50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Plan Activated:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{planName}</span>
              </div>

              {planPrice > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Amount Paid:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    ₹{planPrice.toLocaleString("en-IN")} (Incl. GST)
                  </span>
                </div>
              )}

              {orderId && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Order ID:</span>
                  <button
                    type="button"
                    onClick={() => handleCopyOrderId(orderId)}
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                  >
                    <span>{orderId.slice(0, 16)}...</span>
                    {copiedOrderId ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3 opacity-60" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex w-full flex-col gap-2.5">
              {onExploreProperties ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onExploreProperties();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition cursor-pointer"
                >
                  <span>Start Unlocking Owner Contacts</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  href="/propertySearch"
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition cursor-pointer"
                >
                  <span>Start Unlocking Owner Contacts</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Close &amp; Continue
              </button>
            </div>
          </div>
        )}

        {/* ---------------- STATE 4: ATTRACTIVE FAILURE MODAL ---------------- */}
        {isFailed && (
          <div className="p-6 sm:p-8 text-center flex flex-col items-center">
            {/* Failure Warning Icon */}
            <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 shadow-xl shadow-rose-500/20 dark:bg-rose-950/70 dark:text-rose-400">
              <AlertCircle className="h-11 w-11 animate-in zoom-in-50 duration-300" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-[11px] font-bold text-rose-700 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300 mb-2">
              <span>Payment Not Completed</span>
            </div>

            <h3 id="payment-modal-title" className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Transaction Incomplete
            </h3>

            {/* Error Message Box */}
            <div className="mt-3 w-full rounded-2xl bg-rose-50/80 border border-rose-200/90 p-3.5 text-xs text-rose-900 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200 text-left">
              <span className="font-bold block mb-0.5">Reason:</span>
              <p className="leading-relaxed">
                {errorMessage ||
                  "The payment session was either closed by the user or declined by the payment provider."}
              </p>
            </div>

            {/* Reassurance Alert (Crucial for user trust) */}
            <div className="mt-4 w-full rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 text-left text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold block">Did money get deducted from your account?</span>
                  <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300/90 leading-normal">
                    Don&apos;t worry! Cashfree will automatically reverse any deducted amount within 24–48 hours, or our webhook will automatically credit your wallet once bank settlement confirms.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex w-full flex-col gap-2.5">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500 transition cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Payment Again</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Help / Support Link */}
            <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500">
              Need assistance? Reach out at{" "}
              <a
                href="mailto:support@awasio.com"
                className="font-semibold underline hover:text-slate-700 dark:hover:text-slate-300"
              >
                support@awasio.com
              </a>
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
