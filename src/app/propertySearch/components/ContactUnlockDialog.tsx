import React from "react";
import { CheckCircle2, PhoneCall, ShieldCheck, UserCheck, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ContactPlan, ContactStep } from "./resultCardTypes";

type OwnerContact = { name: string | null; phone: string | null } | null;

type ContactUnlockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactStep: ContactStep;
  hasActivePlan: boolean;
  leadName: string;
  leadEmail?: string;
  leadPhone: string;
  otp: string;
  otpSent: boolean;
  otpError: string | null;
  resendSeconds: number;
  loading: boolean;
  plansList: ContactPlan[];
  selectedPlan: string;
  currentPlan: ContactPlan;
  contactError: string | null;
  ownerContact: OwnerContact;
  owner?: string;
  credits: number;
  onLeadNameChange: (value: string) => void;
  onLeadEmailChange?: (value: string) => void;
  onLeadPhoneChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onRequestOtp: () => void;
  onVerifyLeadDetails: () => void;
  onSaveProfile?: () => void;
  onSelectedPlanChange: (value: string) => void;
  onPurchasePlan: () => void;
};

export function ContactUnlockDialog({
  open,
  onOpenChange,
  contactStep,
  hasActivePlan,
  leadName,
  leadEmail = "",
  leadPhone,
  otp,
  otpSent,
  otpError,
  resendSeconds,
  loading,
  plansList,
  selectedPlan,
  currentPlan,
  contactError,
  ownerContact,
  owner,
  credits,
  onLeadNameChange,
  onLeadEmailChange,
  onLeadPhoneChange,
  onOtpChange,
  onRequestOtp,
  onVerifyLeadDetails,
  onSaveProfile,
  onSelectedPlanChange,
  onPurchasePlan,
}: ContactUnlockDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-h-[92vh] overflow-y-auto border-0 bg-white p-0 shadow-2xl sm:max-w-md ${contactStep === "plans" ? "lg:max-w-5xl" : "lg:max-w-md"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-rose-600 px-5 py-5 text-white">
          <DialogHeader className="text-left">
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-white/15">
              <PhoneCall className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold">
              {contactStep === "contact"
                ? "Owner contact details"
                : contactStep === "profile"
                  ? "Complete your profile"
                  : "Contact owner directly"}
            </DialogTitle>
            <DialogDescription className="text-rose-50">
              {contactStep === "contact"
                ? "Your active contact plan allows you to view this advertiser."
                : contactStep === "profile"
                  ? "Let us know your name so the property owner can connect with you."
                  : "Verify your mobile number to view owner contact details."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-3 p-5">
          <StepIndicator contactStep={contactStep} hasActivePlan={hasActivePlan} />

          {contactStep === "details" && (
            <LeadDetailsStep
              leadPhone={leadPhone}
              otp={otp}
              otpSent={otpSent}
              otpError={otpError}
              resendSeconds={resendSeconds}
              loading={loading}
              onLeadPhoneChange={onLeadPhoneChange}
              onOtpChange={onOtpChange}
              onRequestOtp={onRequestOtp}
              onVerifyLeadDetails={onVerifyLeadDetails}
            />
          )}

          {contactStep === "profile" && (
            <ProfileDetailsStep
              leadName={leadName}
              leadEmail={leadEmail}
              loading={loading}
              error={contactError}
              onLeadNameChange={onLeadNameChange}
              onLeadEmailChange={onLeadEmailChange}
              onSaveProfile={onSaveProfile || onVerifyLeadDetails}
            />
          )}

          {contactStep === "plans" && (
            <PlanSelectionStep
              plansList={plansList}
              selectedPlan={selectedPlan}
              currentPlan={currentPlan}
              contactError={contactError}
              loading={loading}
              onSelectedPlanChange={onSelectedPlanChange}
              onPurchasePlan={onPurchasePlan}
            />
          )}

          {contactStep === "contact" && <UnlockedContactStep ownerContact={ownerContact} owner={owner} credits={credits} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepIndicator({ contactStep, hasActivePlan }: { contactStep: ContactStep; hasActivePlan: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
      {[
        ["1", "Verify Mobile", contactStep === "details" || contactStep === "profile"],
        ["2", hasActivePlan ? "Contact" : "Plan", contactStep === "plans" || contactStep === "contact"],
      ].map(([num, label, active]) => (
        <div key={label as string} className={`whitespace-nowrap rounded-md px-2 py-2 text-center ${active ? "bg-rose-50 text-rose-700" : "bg-zinc-50 text-zinc-500"}`}>
          <span className="mr-1">{num}</span>
          {label}
        </div>
      ))}
    </div>
  );
}

export function LeadDetailsStep(props: {
  leadName?: string;
  leadPhone: string;
  otp: string;
  otpSent: boolean;
  otpError: string | null;
  resendSeconds: number;
  loading: boolean;
  onLeadNameChange?: (value: string) => void;
  onLeadPhoneChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onRequestOtp: () => void;
  onVerifyLeadDetails: () => void;
}) {
  const {
    leadPhone,
    otp,
    otpSent,
    otpError,
    resendSeconds,
    loading,
    onLeadPhoneChange,
    onOtpChange,
    onRequestOtp,
    onVerifyLeadDetails,
  } = props;

  return (
    <>
      <div className="rounded-lg border border-zinc-200 p-4">
        <p className="text-sm font-semibold text-zinc-950">Enter your mobile number</p>
        <p className="mt-1 text-xs text-zinc-500">We will verify your mobile number with a one-time password (OTP).</p>
        <div className="mt-4 space-y-3">
          <div className="flex rounded-md border border-zinc-200 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100">
            <span className="inline-flex items-center px-3 text-xs font-semibold text-zinc-600 bg-zinc-50 border-r border-zinc-200 rounded-l-md">
              +91
            </span>
            <input
              value={leadPhone}
              disabled={otpSent}
              onChange={(event) => onLeadPhoneChange(event.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
              inputMode="tel"
              className="h-11 w-full rounded-r-md px-3 text-sm outline-none disabled:bg-zinc-100 disabled:text-zinc-600"
            />
            {otpSent && (
              <button
                type="button"
                onClick={() => onLeadPhoneChange(leadPhone)}
                className="px-3 text-xs font-semibold text-rose-600 hover:underline"
              >
                Change
              </button>
            )}
          </div>

          {otpSent && (
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <label className="block text-xs font-semibold text-zinc-700">Enter OTP</label>
              <input
                value={otp}
                onChange={(event) => onOtpChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit OTP"
                inputMode="numeric"
                autoFocus
                className={`h-11 w-full rounded-md border px-3 text-center text-base font-semibold tracking-[0.25em] outline-none focus:ring-2 focus:ring-rose-100 ${
                  otpError ? "border-red-400 focus:border-red-400" : "border-zinc-200 focus:border-rose-400"
                }`}
              />
              {otpError && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <span>!</span> {otpError}
                </p>
              )}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate text-zinc-500">Sent to +91 {leadPhone}</span>
                <button
                  type="button"
                  className="shrink-0 font-semibold text-rose-600 disabled:text-zinc-400"
                  disabled={resendSeconds > 0 || loading}
                  onClick={onRequestOtp}
                >
                  {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {!otpSent ? (
        <button
          type="button"
          className="w-full rounded-md bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
          disabled={leadPhone.length < 10 || loading}
          onClick={onRequestOtp}
        >
          {loading ? "Sending OTP..." : "Get OTP"}
        </button>
      ) : (
        <button
          type="button"
          className="w-full rounded-md bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
          disabled={otp.length < 6 || loading}
          onClick={onVerifyLeadDetails}
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>
      )}
    </>
  );
}

export function ProfileDetailsStep(props: {
  leadName: string;
  leadEmail?: string;
  loading: boolean;
  error?: string | null;
  onLeadNameChange: (value: string) => void;
  onLeadEmailChange?: (value: string) => void;
  onSaveProfile: () => void;
}) {
  const { leadName, leadEmail = "", loading, error, onLeadNameChange, onLeadEmailChange, onSaveProfile } = props;

  return (
    <>
      <div className="rounded-lg border border-zinc-200 p-4">
        <div className="flex items-center gap-2 text-rose-600 mb-2">
          <UserCheck className="h-5 w-5" />
          <p className="text-sm font-semibold text-zinc-950">Welcome to CityHaven!</p>
        </div>
        <p className="text-xs text-zinc-500">Please provide your name to finish creating your account.</p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Your Full Name *</label>
            <input
              value={leadName}
              onChange={(event) => onLeadNameChange(event.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="h-11 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address (Optional)</label>
            <input
              value={leadEmail}
              onChange={(event) => onLeadEmailChange?.(event.target.value)}
              placeholder="e.g. rahul@example.com"
              type="email"
              className="h-11 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </div>
        </div>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}

      <button
        type="button"
        disabled={!leadName.trim() || loading}
        onClick={onSaveProfile}
        className="w-full rounded-md bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {loading ? "Saving Profile..." : "Save & Continue"}
      </button>
    </>
  );
}

export function PlanSelectionStep(props: {
  plansList: ContactPlan[];
  selectedPlan: string;
  currentPlan: ContactPlan;
  contactError: string | null;
  loading: boolean;
  onSelectedPlanChange: (value: string) => void;
  onPurchasePlan: () => void;
}) {
  const { plansList, selectedPlan, currentPlan, contactError, loading, onSelectedPlanChange, onPurchasePlan } = props;

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[0.42fr_1fr] lg:items-start">
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
            <p className="text-sm font-bold text-zinc-950">Choose your contact pack</p>
            <p className="mt-1 text-xs text-zinc-600">Unlock this owner now and use remaining contacts on other shortlisted homes.</p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-zinc-500">Selected plan</p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-zinc-950">{currentPlan.name}</p>
                <p className="mt-1 text-xs text-zinc-600">{currentPlan.contacts}</p>
              </div>
              <p className="text-xl font-black text-zinc-950">{currentPlan.price}</p>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700">
            {["Verified mobile before reveal", "Unused contacts stay in your account", "Works for owner, agent and builder listings"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2.5 lg:grid-cols-2">
          {plansList.map((plan) => {
            const active = selectedPlan === plan.id || String(plan.dbId) === String(selectedPlan);
            const isPriority = plan.id === "power" || plan.id === "premium" || plan.id === "assisted";
            return (
              <button
                key={plan.id}
                type="button"
                aria-pressed={active}
                onClick={() => onSelectedPlanChange(plan.id)}
                className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-rose-500 bg-white shadow-lg shadow-rose-100 ring-2 ring-rose-100"
                    : "border-zinc-200 bg-white hover:border-rose-200 hover:bg-rose-50/40"
                }`}
              >
                {plan.popular && (
                  <span className="absolute right-3 top-3 rounded-md bg-zinc-950 px-2 py-1 text-[10px] font-bold uppercase text-white">
                    Popular
                  </span>
                )}
                <div className="flex gap-3 pr-12">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isPriority ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                    {isPriority ? <ShieldCheck className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-zinc-950">{plan.name}</p>
                      {active && <CheckCircle2 className="h-4 w-4 text-rose-600" />}
                    </div>
                    <p className="mt-1 text-xs font-semibold text-zinc-700">{plan.contacts}</p>
                    <p className="mt-1 text-xs text-zinc-500">{plan.description}</p>
                  </div>
                </div>
                <p className="mt-3 text-xl font-black text-zinc-950">{plan.price}</p>
              </button>
            );
          })}
        </div>
      </div>

      {contactError && <p className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{contactError}</p>}
      <button
        type="button"
        disabled={loading}
        onClick={onPurchasePlan}
        className="w-full rounded-md bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-700 disabled:bg-rose-300"
      >
        {loading ? "Processing payment..." : `Continue with ${currentPlan?.name ?? "Selected Plan"}`}
      </button>
    </>
  );
}

export function UnlockedContactStep({ ownerContact, owner, credits }: { ownerContact: OwnerContact; owner?: string; credits: number }) {
  return (
    <>
      <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div>
            <p className="text-sm font-semibold text-zinc-950">{ownerContact?.name ?? owner ?? "Owner"}</p>
            <p className="mt-1 text-xl font-bold text-zinc-950">
              {ownerContact?.phone ? `+91 ${ownerContact.phone}` : "+91 ..... ....."}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Credits remaining: {credits}</p>
          </div>
        </div>
      </div>
      <a
        href={ownerContact?.phone ? `tel:+91${ownerContact.phone}` : undefined}
        className="block w-full rounded-md bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Call owner
      </a>
    </>
  );
}
