"use client";

import React from "react";
import { LockKeyhole, Loader2, Building2, User, AlertCircle, ShieldCheck } from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PlanSelectionStep } from "@/app/propertySearch/components/ContactUnlockDialog";
import { useMeQuery } from "@/features/auth/api";
import { useMyOrganizationsQuery } from "@/features/organizations/api";
import {
  useGetPlansQuery,
  useLazyCheckUnlockedContactQuery,
  useLazyGetBillingSummaryQuery,
  usePurchaseCreditsByPlanMutation,
  useCreateBillingOrderMutation,
  useVerifyBillingPaymentMutation,
  useUnlockPropertyContactMutation,
  BillingSummary,
} from "@/features/contactVerify/api";
import { launchCashfreeCheckout } from "@/lib/cashfree/cashfreeCheckout";

type Step = "check" | "plans";

function errorMessage(error: unknown) {
  const value = error as { data?: { message?: string }; message?: string };
  return value?.data?.message || value?.message || "Unable to continue. Please try again.";
}

type ContactAccessFlowProps = {
  propertyId: number | string;
  onContact: (phone: string) => void;
  triggerClassName?: string;
  triggerLabel?: string;
};

export function ContactAccessFlow({
  propertyId,
  onContact,
  triggerClassName,
  triggerLabel = "View owner contact",
}: ContactAccessFlowProps) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>("plans");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = React.useState("");

  // Billing scope: "PERSONAL" | organizationId number
  const [selectedScope, setSelectedScope] = React.useState<"PERSONAL" | number>("PERSONAL");
  const [personalSummary, setPersonalSummary] = React.useState<BillingSummary | null>(null);
  const [orgSummary, setOrgSummary] = React.useState<BillingSummary | null>(null);

  const [check] = useLazyCheckUnlockedContactQuery();
  const [fetchSummary] = useLazyGetBillingSummaryQuery();
  const [purchase] = usePurchaseCreditsByPlanMutation();
  const [createBillingOrder] = useCreateBillingOrderMutation();
  const [verifyBillingPayment] = useVerifyBillingPaymentMutation();
  const [unlock] = useUnlockPropertyContactMutation();

  const orgsQuery = useMyOrganizationsQuery(undefined, {
    skip: typeof window === "undefined" || !localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY),
  });
  const orgs = orgsQuery.data ?? [];

  const plansQuery = useGetPlansQuery(undefined, { skip: !open || step !== "plans" });
  const plans = (plansQuery.data?.data ?? [])
    .filter((p) => (Number(p.contactCredits) > 0 || Number(p.features?.creditsIncluded) > 0) && p.price > 0 && p.isActive !== false)
    .map((p) => {
      const credits = p.contactCredits ?? Number(p.features?.creditsIncluded) ?? 1;
      return {
        dbId: p.id,
        id: String(p.id),
        name: p.name,
        description: p.tagline || p.description || "",
        credits,
        contacts: `${credits} verified owner contact${credits === 1 ? "" : "s"}`,
        price: new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: p.currencyCode || "INR",
          maximumFractionDigits: 0,
        }).format(p.price),
        popular: Boolean(p.isPopular || p.features?.popular),
      };
    });
  const currentPlan = plans.find((p) => p.id === selectedPlanId) ?? plans[0];

  const token = typeof window !== "undefined" ? localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) ?? "" : "";
  const { data: meData } = useMeQuery(undefined, { skip: !token });

  const activeOrg = orgs.find((o) => o.id === selectedScope);
  const isOrgScope = selectedScope !== "PERSONAL" && Boolean(activeOrg);
  const personalCredits = personalSummary?.credits ?? meData?.credits ?? 0;
  const currentCredits = isOrgScope ? (orgSummary?.credits ?? 0) : personalCredits;

  const router = useRouter();
  const searchParams = useSearchParams();

  // Background check on load if already unlocked or returning from login with autoUnlock
  React.useEffect(() => {
    if (!localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY)) return;
    let active = true;
    void (async () => {
      try {
        const contact = await check(propertyId).unwrap();
        if (!active) return;
        const isUnlocked = Boolean(contact?.unlocked || contact?.data?.unlocked);
        const ownerPhone = contact?.data?.ownerPhone || (contact as any)?.ownerPhone;
        if (isUnlocked && ownerPhone) {
          onContact(ownerPhone);
          return;
        }
        // If returning from login with autoUnlock, immediately trigger the flow
        if (searchParams.get("autoUnlock") === "true") {
          setOpen(true);
          void run(checkAndUnlock);
        }
      } catch {
        // Silent catch for background access check
      }
    })();
    return () => {
      active = false;
    };
  }, [propertyId, check, onContact, searchParams]);

  // Load billing summaries when open or scope changes
  React.useEffect(() => {
    if (!open || typeof window === "undefined" || !localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY)) return;
    let active = true;
    void (async () => {
      try {
        const pSum = await fetchSummary({ target: "USER" }).unwrap();
        if (active) setPersonalSummary(pSum.data);

        if (isOrgScope && typeof selectedScope === "number") {
          const oSum = await fetchSummary({ target: "ORG", organizationId: selectedScope }).unwrap();
          if (active) setOrgSummary(oSum.data);
        }
      } catch {
        // Handled in flow
      }
    })();
    return () => {
      active = false;
    };
  }, [open, selectedScope, isOrgScope, fetchSummary]);

  async function checkAndUnlock() {
    setError(null);
    try {
      // 1. Check if already unlocked
      const contact = await check(propertyId).unwrap();
      const isAlreadyUnlocked = Boolean(contact?.unlocked || contact?.data?.unlocked);
      const ownerPhone = contact?.data?.ownerPhone || (contact as any)?.ownerPhone;
      if (isAlreadyUnlocked && ownerPhone) {
        onContact(ownerPhone);
        setOpen(false);
        return;
      }

      // 2. Refresh summaries
      const pSum = await fetchSummary({ target: "USER" }).unwrap();
      const personalCredits = pSum.data.credits ?? 0;
      setPersonalSummary(pSum.data);

      let orgBalance = 0;
      if (isOrgScope && typeof selectedScope === "number") {
        const oSum = await fetchSummary({ target: "ORG", organizationId: selectedScope }).unwrap();
        setOrgSummary(oSum.data);
        orgBalance = oSum.data.credits ?? 0;
      }

      let scopeToUse: "PERSONAL" | number = selectedScope;
      let availableBalance = isOrgScope ? orgBalance : personalCredits;

      // Smart scope fallback if current selected scope has 0 credits
      if (availableBalance <= 0) {
        if (personalCredits > 0) {
          scopeToUse = "PERSONAL";
          setSelectedScope("PERSONAL");
          availableBalance = personalCredits;
        } else if (orgs.length > 0) {
          for (const org of orgs) {
            try {
              const oRes = await fetchSummary({ target: "ORG", organizationId: org.id }).unwrap();
              if ((oRes.data.credits ?? 0) > 0) {
                scopeToUse = org.id;
                setSelectedScope(org.id);
                availableBalance = oRes.data.credits ?? 0;
                setOrgSummary(oRes.data);
                break;
              }
            } catch {
              // ignore
            }
          }
        }
      }

      if (availableBalance > 0) {
        // Unlock contact with active scope
        const res = await unlock({
          propertyId,
          organizationId: scopeToUse !== "PERSONAL" && typeof scopeToUse === "number" ? scopeToUse : undefined,
        }).unwrap();

        if (res.data?.ownerPhone) {
          onContact(res.data.ownerPhone);
          setOpen(false);
          return;
        }
      }

      // If insufficient credits in chosen scope, show plans
      setStep("plans");
      setOpen(true);
    } catch (err: any) {
      if (err?.status === 401 || err?.originalStatus === 401) {
        localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
        setOpen(false);
        const returnUrl = encodeURIComponent(`${window.location.pathname}?autoUnlock=true`);
        router.push(`/login?redirect=${returnUrl}`);
      } else if (err?.status === 402 || err?.data?.message?.includes("credits") || err?.data?.message?.includes("allowance")) {
        setStep("plans");
        setOpen(true);
      } else {
        const msg = err?.data?.message || err?.message || "Owner contact not available";
        toast.error(msg);
        setOpen(false);
      }
    }
  }

  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e: any) {
      const msg = e?.data?.message || e?.message || "Failed to proceed";
      toast.error(msg);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  function begin() {
    setError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null;
    if (!token) {
      const returnUrl = `${window.location.pathname}?autoUnlock=true`;
      window.dispatchEvent(
        new CustomEvent("awasio:open-welcome-credits", {
          detail: { returnUrl },
        })
      );
      return;
    }
    void run(checkAndUnlock);
  }

  return (
    <>
      <button
        type="button"
        onClick={begin}
        disabled={busy}
        className={
          triggerClassName ??
          "mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 py-3 text-sm font-semibold text-white hover:bg-emerald-800 shadow-sm disabled:opacity-75"
        }
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        ) : (
          <LockKeyhole className="h-4 w-4 shrink-0" />
        )}
        <span>{busy ? "Checking access..." : triggerLabel}</span>
      </button>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!busy) setOpen(value);
        }}
      >
        <DialogContent className={`max-h-[90vh] overflow-y-auto ${step === "plans" ? "sm:max-w-4xl" : "sm:max-w-md"}`}>
          <DialogHeader>
            <DialogTitle>
              {step === "plans" ? "Purchase contact credits" : "Unlock owner contact"}
            </DialogTitle>
            <DialogDescription>
              {step === "plans"
                ? isOrgScope
                  ? `Select a contact pack for ${activeOrg?.name || "your organization"}.`
                  : "Choose a contact pack for your personal account."
                : "Checking access..."}
            </DialogDescription>
          </DialogHeader>

          {/* Workspace / Account Scope Selector (if member of organizations) */}
          {orgs.length > 0 && (
            <div className="mb-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400 mb-2">Active Billing Workspace</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedScope("PERSONAL")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    selectedScope === "PERSONAL"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  Personal ({personalCredits} credits)
                </button>
                {orgs.map((org) => {
                  const active = selectedScope === org.id;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => setSelectedScope(org.id)}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "bg-emerald-700 text-white shadow-sm"
                          : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      {org.name}
                    </button>
                  );
                })}
              </div>

              {/* Informative Workspace Scope Banner */}
              <div className="mt-2.5 rounded-md bg-white border border-zinc-200 p-2.5 text-xs text-zinc-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {isOrgScope ? (
                  <div className="space-y-1">
                    <p className="font-semibold text-zinc-950 dark:text-white flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      Using {activeOrg?.name}&apos;s contact allowance ({currentCredits} available)
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-slate-400">
                      Unlocking this contact will make it visible to all authorized team members in {activeOrg?.name}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-semibold text-zinc-950 dark:text-white flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      Using your Personal Account balance ({personalCredits} credits)
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-slate-400">
                      This unlock is saved to your personal account only.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "check" && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400 mb-3" />
              <p className="text-sm font-medium text-zinc-800 dark:text-slate-200">Checking contact access & allowance...</p>
              <p className="text-xs text-zinc-500 dark:text-slate-400 mt-1">Please wait a moment.</p>
            </div>
          )}

          {step === "plans" && (
            <>
              {isOrgScope && currentCredits === 0 && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-semibold">{activeOrg?.name} has 0 contact credits remaining</p>
                    <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                      As an employee/manager, you can ask an organization Admin/Owner to purchase a pack, or switch above to use your Personal Account.
                    </p>
                  </div>
                </div>
              )}

              {plansQuery.isFetching ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-400 dark:text-slate-500 mb-2" />
                  <p className="text-sm text-zinc-600 dark:text-slate-400">Loading contact packs...</p>
                </div>
              ) : plansQuery.isError ? (
                <div className="py-4 text-center">
                  <p className="text-sm text-red-600 dark:text-rose-400 mb-2">Could not load plans.</p>
                  <button
                    type="button"
                    onClick={() => void plansQuery.refetch()}
                    className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Retry
                  </button>
                </div>
              ) : currentPlan ? (
                <PlanSelectionStep
                  plansList={plans}
                  selectedPlan={currentPlan.id}
                  currentPlan={currentPlan}
                  contactError={error}
                  loading={busy}
                  userCredits={currentCredits}
                  purchaseEnabled={true}
                  onSelectedPlanChange={setSelectedPlanId}
                  onPurchasePlan={() =>
                    void run(async () => {
                      const orderRes = await createBillingOrder({
                        planId: currentPlan.dbId,
                        target: isOrgScope ? "ORG" : "USER",
                        organizationId: isOrgScope && typeof selectedScope === "number" ? selectedScope : undefined,
                      }).unwrap();

                      const orderData = orderRes.data;
                      if (orderData?.paymentSessionId) {
                        toast.info("Opening Cashfree checkout...");
                        const checkoutResult = await launchCashfreeCheckout(orderData.paymentSessionId, {
                          redirectTarget: "_modal",
                        });

                        if (checkoutResult.status === "CLOSED") {
                          toast.info("Payment window was closed.");
                          return;
                        }

                        if (checkoutResult.status === "FAILED") {
                          toast.error(checkoutResult.error || "Payment was not completed.");
                          return;
                        }

                        if (checkoutResult.status === "REDIRECTED") {
                          toast.info("Redirecting for payment authentication...");
                          return;
                        }

                        toast.loading("Verifying payment with Cashfree...", { id: "verify-contact-plan" });
                        await verifyBillingPayment({
                          orderId: orderData.orderId,
                          cfPaymentId: checkoutResult.paymentDetails?.paymentId
                            ? String(checkoutResult.paymentDetails.paymentId)
                            : undefined,
                        }).unwrap();
                        toast.dismiss("verify-contact-plan");
                        toast.success("Contact pack activated! Unlocking owner number...");
                      }

                      await checkAndUnlock();
                    })
                  }
                />
              ) : (
                <p className="py-4 text-center text-sm text-zinc-500">No contact plans are available right now.</p>
              )}
            </>
          )}

          {error && (
            <div role="alert" className="text-sm text-red-700 mt-2">
              <p>{error}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
