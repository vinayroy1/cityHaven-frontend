"use client";

import React from "react";
import { LockKeyhole, Loader2 } from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LeadDetailsStep, ProfileDetailsStep, PlanSelectionStep } from "@/app/propertySearch/components/ContactUnlockDialog";
import { useUpdateProfileMutation } from "@/features/auth/api";
import {
  useGetPlansQuery,
  useLazyCheckUnlockedContactQuery,
  useLazyGetMyCreditsQuery,
  useRequestContactOtpMutation,
  useVerifyContactOtpMutation,
  usePurchaseCreditsByPlanMutation,
  useUnlockPropertyContactMutation,
} from "@/features/contactVerify/api";

type Step = "signin" | "profile" | "check" | "plans" | "confirm";

function errorMessage(error: unknown) {
  const value = error as { data?: { message?: string }; message?: string };
  return value?.data?.message || value?.message || "Unable to continue. Please try again.";
}

export function ContactAccessFlow({ propertyId, onContact }: { propertyId: number | string; onContact: (phone: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>("signin");
  const [credits, setCredits] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const [selected, setSelected] = React.useState("");

  const [check] = useLazyCheckUnlockedContactQuery();
  const [getCredits] = useLazyGetMyCreditsQuery();
  const [requestOtp] = useRequestContactOtpMutation();
  const [verifyOtp] = useVerifyContactOtpMutation();
  const [updateProfile] = useUpdateProfileMutation();
  const [purchase] = usePurchaseCreditsByPlanMutation();
  const [unlock] = useUnlockPropertyContactMutation();

  const plansQuery = useGetPlansQuery(undefined, { skip: !open || step !== "plans" });
  const plans = (plansQuery.data?.data ?? [])
    .filter((p) => Number(p.features?.creditsIncluded) > 0)
    .map((p) => ({
      dbId: p.id,
      id: String(p.id),
      name: p.name,
      description: p.description || "",
      credits: Number(p.features?.creditsIncluded),
      contacts: `${p.features?.creditsIncluded} owner contacts`,
      price: new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: p.currencyCode || "INR",
        maximumFractionDigits: 0,
      }).format(p.price),
      popular: Boolean(p.features?.popular),
    }));
  const current = plans.find((p) => p.id === selected) ?? plans[0];

  React.useEffect(() => {
    if (!localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY)) return;
    let active = true;
    void (async () => {
      try {
        const contact = await check(propertyId).unwrap();
        if (!active) return;
        if (contact?.data?.unlocked && contact.data.ownerPhone) {
          onContact(contact.data.ownerPhone);
          return;
        }
        const balance = await getCredits().unwrap();
        if (active) setCredits(balance.data.credits);
      } catch {
        // Silent catch for background access check
      }
    })();
    return () => {
      active = false;
    };
  }, [propertyId, check, getCredits, onContact]);

  React.useEffect(() => {
    if (!seconds) return;
    const timer = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  async function checkAndUnlock() {
    setStep("check");
    setError(null);
    try {
      // 1. Check if already unlocked
      const contact = await check(propertyId).unwrap();
      if (contact?.data?.unlocked && contact.data.ownerPhone) {
        onContact(contact.data.ownerPhone);
        setOpen(false);
        return;
      }

      // 2. Fetch credits
      const result = await getCredits().unwrap();
      const balance = result.data.credits ?? 0;
      setCredits(balance);

      if (balance > 0) {
        // Automatically unlock contact
        const res = await unlock(propertyId).unwrap();
        if (res.data?.ownerPhone) {
          setCredits(res.credits ?? null);
          onContact(res.data.ownerPhone);
          setOpen(false);
          return;
        }
      }

      // If 0 credits, show plans
      setStep("plans");
    } catch (err: any) {
      // If unauthorized / token invalid, fallback to sign in
      if (err?.status === 401 || err?.originalStatus === 401) {
        localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
        setStep("signin");
      } else if (err?.status === 402 || err?.data?.message?.includes("credits")) {
        setStep("plans");
      } else {
        setError(errorMessage(err));
        setStep("signin");
      }
    }
  }

  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  function begin() {
    setOpen(true);
    setError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null;
    if (!token) {
      setStep("signin");
      setSent(false);
      setOtp("");
      setMobile("");
      setName("");
      setEmail("");
      return;
    }
    void run(checkAndUnlock);
  }

  async function sendOtp() {
    if (mobile.trim().length < 10) return;
    await requestOtp({ mobileNumber: mobile.trim() }).unwrap();
    setSent(true);
    setOtp("");
    setSeconds(30);
  }

  async function signIn() {
    if (mobile.trim().length < 10 || otp.trim().length < 6) return;
    const response = await verifyOtp({
      mobileNumber: mobile.trim(),
      otp: otp.trim(),
      propertyId: Number(propertyId),
      source: "property_details",
    }).unwrap();

    if (!response.data?.accessToken) throw new Error("Sign-in failed");
    localStorage.setItem(APP_CONFIG.AUTH.TOKEN_KEY, response.data.accessToken);
    if (response.data.refreshToken) {
      localStorage.setItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY, response.data.refreshToken);
    }
    window.dispatchEvent(new Event("auth-change"));
    window.dispatchEvent(new Event("storage"));

    const userName = response.data.user?.name;
    const isNewUser = response.data.isNewUser || !userName || userName === "New User" || userName === "User";

    if (isNewUser) {
      setStep("profile");
    } else {
      await checkAndUnlock();
    }
  }

  async function saveProfile() {
    if (!name.trim()) return;
    await updateProfile({ name: name.trim(), email: email.trim() || undefined }).unwrap();
    await checkAndUnlock();
  }

  return (
    <>
      <button
        type="button"
        onClick={begin}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
      >
        <LockKeyhole className="h-4 w-4" />
        {credits === 0 ? "Buy credits to unlock" : "View owner contact"}
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
              {step === "signin"
                ? "Sign in to view owner contact"
                : step === "profile"
                  ? "Complete your profile"
                  : step === "plans"
                    ? "Buy contact credits"
                    : "Unlock owner contact"}
            </DialogTitle>
            <DialogDescription>
              {step === "signin"
                ? "Enter your mobile number to get started."
                : step === "profile"
                  ? "Please enter your details to complete your account."
                  : step === "plans"
                    ? "Choose a contact pack to view owner numbers."
                    : "Unlocking this property..."}
            </DialogDescription>
          </DialogHeader>

          {step === "signin" && (
            <LeadDetailsStep
              leadPhone={mobile}
              otp={otp}
              otpSent={sent}
              otpError={error}
              resendSeconds={seconds}
              loading={busy}
              onLeadPhoneChange={(value) => {
                setMobile(value);
                setSent(false);
                setOtp("");
                setError(null);
              }}
              onOtpChange={(value) => {
                setOtp(value);
                setError(null);
              }}
              onRequestOtp={() => void run(sendOtp)}
              onVerifyLeadDetails={() => void run(signIn)}
            />
          )}

          {step === "profile" && (
            <ProfileDetailsStep
              leadName={name}
              leadEmail={email}
              loading={busy}
              error={error}
              onLeadNameChange={setName}
              onLeadEmailChange={setEmail}
              onSaveProfile={() => void run(saveProfile)}
            />
          )}

          {step === "check" && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-sm font-medium text-zinc-800">Checking contact access...</p>
              <p className="text-xs text-zinc-500 mt-1">Please wait a moment.</p>
            </div>
          )}

          {step === "plans" && (
            <>
              {plansQuery.isFetching ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-400 mb-2" />
                  <p className="text-sm text-zinc-600">Loading plans...</p>
                </div>
              ) : plansQuery.isError ? (
                <div className="py-4 text-center">
                  <p className="text-sm text-red-600 mb-2">Could not load plans.</p>
                  <button
                    type="button"
                    onClick={() => void plansQuery.refetch()}
                    className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-200"
                  >
                    Retry
                  </button>
                </div>
              ) : current ? (
                <PlanSelectionStep
                  plansList={plans}
                  selectedPlan={current.id}
                  currentPlan={current}
                  contactError={error}
                  loading={busy}
                  onSelectedPlanChange={setSelected}
                  onPurchasePlan={() =>
                    void run(async () => {
                      await purchase({ planId: current.dbId }).unwrap();
                      await checkAndUnlock();
                    })
                  }
                />
              ) : (
                <p className="py-4 text-center text-sm text-zinc-500">No contact plans are available right now.</p>
              )}
            </>
          )}

          {step === "confirm" && (
            <>
              <p className="text-sm text-zinc-600">
                Your balance: <strong>{credits} credits</strong>
              </p>
              <button
                type="button"
                disabled={busy}
                className="rounded-md bg-emerald-700 p-3 text-sm font-semibold text-white disabled:opacity-60"
                onClick={() =>
                  void run(async () => {
                    const result = await unlock(propertyId).unwrap();
                    if (!result.data?.ownerPhone) throw new Error("Contact unavailable");
                    setCredits(result.credits ?? null);
                    onContact(result.data.ownerPhone);
                    setOpen(false);
                  })
                }
              >
                {busy ? "Unlocking..." : "Unlock contact · 1 credit"}
              </button>
            </>
          )}

          {error && step !== "signin" && step !== "profile" && (
            <div role="alert" className="text-sm text-red-700 mt-2">
              <p>{error}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
