import React from "react";
import Link from "next/link";
import { CheckCircle2, PhoneCall, ShieldCheck, UserCheck, Zap, Building2, User, AlertCircle, Lock, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ContactPlan, ContactStep } from "./resultCardTypes";
import { useModalBackHandler } from "@/lib/navigation/useModalBackHandler";

type OwnerContact = { name: string | null; phone: string | null } | null;

export type ScopeOption = {
  id: number | "PERSONAL";
  name: string;
  credits: number;
};

type ContactUnlockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactStep: ContactStep;
  hasActivePlan?: boolean;
  leadName?: string;
  leadEmail?: string;
  leadPhone?: string;
  otp?: string;
  otpSent?: boolean;
  otpError?: string | null;
  resendSeconds?: number;
  loading: boolean;
  plansList: ContactPlan[];
  selectedPlan: string;
  currentPlan: ContactPlan;
  contactError: string | null;
  ownerContact: OwnerContact;
  owner?: string;
  credits: number;
  scopes?: ScopeOption[];
  selectedScope?: "PERSONAL" | number;
  onScopeChange?: (scope: "PERSONAL" | number) => void;
  onUnlockContact?: () => void;
  onLeadNameChange?: (value: string) => void;
  onLeadEmailChange?: (value: string) => void;
  onLeadPhoneChange?: (value: string) => void;
  onOtpChange?: (value: string) => void;
  onRequestOtp?: () => void;
  onVerifyLeadDetails?: (password?: string, loginId?: string) => void;
  onSaveProfile?: () => void;
  onSelectedPlanChange: (value: string) => void;
  onPurchasePlan: () => void;
};

export function ContactUnlockDialog({
  open,
  onOpenChange,
  contactStep,
  loading,
  plansList,
  selectedPlan,
  currentPlan,
  contactError,
  ownerContact,
  owner,
  credits,
  scopes = [],
  selectedScope = "PERSONAL",
  onScopeChange,
  onUnlockContact,
  onSelectedPlanChange,
  onPurchasePlan,
}: ContactUnlockDialogProps) {
  useModalBackHandler({
    isOpen: open,
    onClose: () => onOpenChange(false),
    name: "ContactUnlockDialog",
  });

  const activeScopeObj = scopes.find((s) => s.id === selectedScope);
  const isOrgScope = selectedScope !== "PERSONAL";

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
                : "Choose a contact pack"}
            </DialogTitle>
            <DialogDescription className="text-rose-50">
              {contactStep === "contact"
                ? isOrgScope
                  ? `Unlocked for all team members in ${activeScopeObj?.name || "your organization"}.`
                  : "Unlocked for your personal account."
                : "Select a contact pack to instantly unlock verified owner phone numbers."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-3 p-5">
          <StepIndicator contactStep={contactStep} />

          {/* Workspace / Account Scope Selector (when authenticated & has orgs) */}
          {scopes.length > 1 && onScopeChange && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Active Billing Workspace</p>
              <div className="flex flex-wrap gap-1.5">
                {scopes.map((scope) => {
                  const active = selectedScope === scope.id;
                  const isOrg = scope.id !== "PERSONAL";
                  return (
                    <button
                      key={String(scope.id)}
                      type="button"
                      onClick={() => onScopeChange(scope.id as any)}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "bg-rose-600 text-white shadow-sm"
                          : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
                      }`}
                    >
                      {isOrg ? <Building2 className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                      {scope.name} ({scope.credits} {scope.credits === 1 ? "credit" : "credits"})
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 rounded-md bg-white border border-zinc-200 p-2 text-xs text-zinc-600">
                {isOrgScope ? (
                  <p className="flex items-center gap-1.5 font-medium text-zinc-900">
                    <Building2 className="h-3.5 w-3.5 text-rose-600" />
                    Using {activeScopeObj?.name}&apos;s contact allowance ({activeScopeObj?.credits ?? 0} available)
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 font-medium text-zinc-900">
                    <User className="h-3.5 w-3.5 text-rose-600" />
                    Using your Personal Account balance ({activeScopeObj?.credits ?? credits} credits)
                  </p>
                )}
              </div>
            </div>
          )}

          {contactStep === "plans" && (
            <>
              {(activeScopeObj?.credits ?? credits) > 0 && onUnlockContact && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs text-emerald-900 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                        {activeScopeObj?.credits ?? credits} Contact Credit{(activeScopeObj?.credits ?? credits) === 1 ? "" : "s"} Available
                      </p>
                      <p className="text-emerald-700 dark:text-emerald-300 mt-0.5">
                        You have active credits in {isOrgScope ? activeScopeObj?.name : "your Personal Account"}. Unlock this owner immediately without purchasing a new pack.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={onUnlockContact}
                    className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 transition"
                  >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PhoneCall className="h-3.5 w-3.5" />}
                    <span>Unlock with 1 Credit</span>
                  </button>
                </div>
              )}

              {isOrgScope && (activeScopeObj?.credits ?? credits) === 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="font-semibold">{activeScopeObj?.name} has 0 contact credits remaining</p>
                    <p className="mt-0.5 text-amber-700">
                      You can purchase a pack for this organization, or switch above to use your personal credits.
                    </p>
                  </div>
                </div>
              )}

              <PlanSelectionStep
                plansList={plansList}
                selectedPlan={selectedPlan}
                currentPlan={currentPlan}
                contactError={contactError}
                loading={loading}
                onSelectedPlanChange={onSelectedPlanChange}
                onPurchasePlan={onPurchasePlan}
              />
            </>
          )}

          {contactStep === "contact" && (
            <UnlockedContactStep
              ownerContact={ownerContact}
              owner={owner}
              credits={credits}
              scopeName={isOrgScope ? activeScopeObj?.name : "Personal Account"}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepIndicator({ contactStep }: { contactStep: ContactStep }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
      {[
        ["1", "Select Plan", contactStep === "plans"],
        ["2", "Owner Contact", contactStep === "contact"],
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
  leadPhone?: string;
  leadLoginId?: string;
  otp?: string;
  otpSent?: boolean;
  otpError?: string | null;
  resendSeconds?: number;
  loading?: boolean;
  onLeadPhoneChange?: (value: string) => void;
  onLeadLoginIdChange?: (value: string) => void;
  onOtpChange?: (value: string) => void;
  onRequestOtp?: () => void;
  onVerifyLeadDetails?: (password?: string, loginId?: string) => void;
  returnUrl?: string;
}) {
  const [loginId, setLoginId] = React.useState(props.leadPhone || props.leadLoginId || "");
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password) return;
    props.onVerifyLeadDetails?.(password, loginId.trim());
  };

  const loginRedirectUrl = props.returnUrl
    ? `/login?redirect=${encodeURIComponent(props.returnUrl)}`
    : `/login`;
  const registerRedirectUrl = props.returnUrl
    ? `/auth/register?redirect=${encodeURIComponent(props.returnUrl)}`
    : `/auth/register`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 mb-2">
          <div className="rounded-lg bg-rose-50 p-2 dark:bg-rose-950/60">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-950 dark:text-white">Sign In Required to View Contact</p>
            <p className="text-xs text-zinc-500 dark:text-slate-400">Direct owner details require an active account</p>
          </div>
        </div>

        <div className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Direct verified owner telephone reveal</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Schedule private site walkthroughs</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Zero broker spam guarantee</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-slate-300 mb-1">
            Email or Mobile Number
          </label>
          <input
            type="text"
            value={loginId}
            onChange={(e) => {
              setLoginId(e.target.value);
              props.onLeadPhoneChange?.(e.target.value);
              props.onLeadLoginIdChange?.(e.target.value);
            }}
            placeholder="e.g. your.email@example.com or 9876543210"
            required
            autoComplete="username"
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-slate-300">
              Password
            </label>
            <Link
              href="/login?mode=forgot"
              className="text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {props.otpError && (
          <p className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {props.otpError}
          </p>
        )}

        <button
          type="submit"
          disabled={!loginId.trim() || password.length < 4 || props.loading}
          className="w-full rounded-lg bg-rose-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-slate-800"
        >
          {props.loading ? "Authenticating..." : "Sign In & View Contact"}
        </button>

        <div className="text-center pt-2">
          <p className="text-xs text-zinc-500 dark:text-slate-400">
            New to Awasio?{" "}
            <Link
              href={registerRedirectUrl}
              className="font-bold text-rose-600 hover:underline dark:text-rose-400"
            >
              Register with Email OTP
            </Link>
          </p>
        </div>
      </div>
    </form>
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
          <p className="text-sm font-semibold text-zinc-950">Welcome to Awasio!</p>
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

export function UnlockedContactStep({
  ownerContact,
  owner,
  credits,
  scopeName,
}: {
  ownerContact: OwnerContact;
  owner?: string;
  credits: number;
  scopeName?: string;
}) {
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
            <p className="mt-1 text-xs text-zinc-500">
              Credits remaining: {credits} {scopeName ? `(${scopeName})` : ""}
            </p>
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
