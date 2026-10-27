"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Home,
  CreditCard,
} from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import {
  useVerifyBillingPaymentMutation,
  useGetMyCreditsQuery,
} from "@/features/contactVerify/api";
import { toast } from "sonner";

export function PaymentStatusClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("order_id");
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyBillingPaymentMutation();
  const { data: creditsData, refetch: refetchCredits } = useGetMyCreditsQuery();

  const [status, setStatus] = useState<"VERIFYING" | "SUCCESS" | "FAILED">("VERIFYING");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activatedData, setActivatedData] = useState<{
    planName?: string;
    creditsAdded?: number;
    credits?: number;
  } | null>(null);

  useEffect(() => {
    if (!orderId) {
      setStatus("FAILED");
      setErrorMessage("No Order ID was detected in the payment return URL.");
      return;
    }

    let isMounted = true;

    async function runVerification() {
      try {
        const res = await verifyPayment({ orderId: orderId || undefined }).unwrap();
        if (!isMounted) return;

        setStatus("SUCCESS");
        setActivatedData({
          planName: res.data?.planName,
          creditsAdded: res.data?.creditsAdded,
          credits: res.data?.credits,
        });
        toast.success("Payment verified! Your credits are ready to use.");
        void refetchCredits();
      } catch (err: any) {
        if (!isMounted) return;
        setStatus("FAILED");
        const msg =
          err?.data?.message ||
          err?.message ||
          "Payment verification failed. If your money was deducted, our webhook will automatically credit your account.";
        setErrorMessage(msg);
      }
    }

    void runVerification();

    return () => {
      isMounted = false;
    };
  }, [orderId, verifyPayment, refetchCredits]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      <HeaderNav />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">
          {status === "VERIFYING" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 dark:bg-amber-950/40">
                <Loader2 className="h-10 w-10 animate-spin text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Verifying Payment
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Contacting Cashfree gateway to confirm your transaction details...
              </p>
              {orderId && (
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Ref: {orderId}
                </div>
              )}
            </div>
          )}

          {status === "SUCCESS" && (
            <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-white p-8 sm:p-10 text-center shadow-2xl dark:border-emerald-900/50 dark:bg-slate-900">
              <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-inner dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-11 w-11" />
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 mb-3">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Cashfree Verified Transaction</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                Payment Successful!
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Thank you! Your contact pack has been activated and your credits are ready to use across all properties.
              </p>

              {/* Summary Card */}
              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-left dark:border-slate-800 dark:bg-slate-950/60 space-y-2.5">
                {activatedData?.planName && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Pack Purchased:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activatedData.planName}</span>
                  </div>
                )}
                {activatedData?.creditsAdded ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Credits Added:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      +{activatedData.creditsAdded} Credits
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Total Available Balance:</span>
                  <span className="flex items-center gap-1 font-black text-slate-900 dark:text-white text-sm">
                    <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                    {activatedData?.credits ?? creditsData?.data?.credits ?? 0} Credits
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/propertySearch"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition"
                >
                  <Home className="h-4 w-4" />
                  <span>Browse Properties</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {status === "FAILED" && (
            <div className="relative overflow-hidden rounded-3xl border border-rose-200 bg-white p-8 sm:p-10 text-center shadow-xl dark:border-rose-900/50 dark:bg-slate-900">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 shadow-inner dark:bg-rose-950/60 dark:text-rose-400">
                <XCircle className="h-11 w-11" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                Payment Not Completed
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {errorMessage || "The transaction was not completed or was cancelled."}
              </p>

              {orderId && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Order ID: {orderId}
                </div>
              )}

              <p className="mt-4 text-xs text-slate-400">
                If money was deducted from your account, please do not worry. Our secure gateway webhook will automatically detect and reconcile your payment within a few minutes.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/pricing")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Try Again on Pricing</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Re-check Status</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}
