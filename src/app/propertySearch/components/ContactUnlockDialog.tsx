import React from "react";
import Link from "next/link";
import { CheckCircle2, PhoneCall, ShieldCheck, UserCheck, Zap, Building2, User, AlertCircle, Lock, Loader2, X, Sparkles, Gift } from "lucide-react";
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
  purchaseEnabled?: boolean;
  onOpenWallet?: () => void;
  contactCost?: number;
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
  purchaseEnabled = false,
  onOpenWallet,
  contactCost = 5,
}: ContactUnlockDialogProps) {
  useModalBackHandler({
    isOpen: open,
    onClose: () => onOpenChange(false),
    pushHistoryState: false,
    name: "ContactUnlockDialog",
  });

  const activeScopeObj = scopes.find((s) => s.id === selectedScope);
  const isOrgScope = selectedScope !== "PERSONAL";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={`flex flex-col gap-0 max-h-[92vh] overflow-y-auto overflow-x-hidden w-full max-w-[calc(100vw-1.5rem)] border-0 bg-white p-0 shadow-2xl sm:max-w-md ${contactStep === "plans" ? "lg:max-w-4xl" : "lg:max-w-md"}`}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerDownOutside={() => onOpenChange(false)}
        onInteractOutside={() => onOpenChange(false)}
      >
        <div className="relative bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 px-4 sm:px-5 py-4 sm:py-5 text-white overflow-hidden shrink-0">
          {/* Prominent High-Contrast Close Button */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 z-20 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white text-rose-600 shadow-md hover:bg-rose-50 hover:scale-105 active:scale-90 transition-all font-bold focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close dialog"
            title="Close (Esc)"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
          </button>

          <DialogHeader className="text-left pr-10 sm:pr-12 min-w-0">
            <div className="mb-2 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
              {contactStep === "contact" ? <PhoneCall className="h-5 w-5" /> : <Zap className="h-5 w-5 fill-amber-300 stroke-amber-300" />}
            </div>
            <DialogTitle className="text-lg sm:text-xl font-bold leading-tight break-words">
              {contactStep === "contact"
                ? "Owner contact details"
                : "Get Credits to Unlock Contact"}
            </DialogTitle>
            <DialogDescription className="text-rose-100 text-xs sm:text-sm mt-1">
              {contactStep === "contact"
                ? isOrgScope
                  ? `Unlocked for all team members in ${activeScopeObj?.name || "your organization"}.`
                  : "Unlocked for your personal account."
                : `1 Verified Contact Reveal = ${contactCost} Credits. Choose a pack below or redeem promo credits.`}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 p-3.5 sm:p-5 min-w-0 w-full">
          <StepIndicator contactStep={contactStep} />

          {/* Workspace / Account Scope Selector (when authenticated & has orgs) */}
          {scopes.length > 1 && onScopeChange && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
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
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
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

              <div className="mt-2.5 rounded-lg bg-white border border-zinc-200 p-2.5 text-xs text-zinc-600">
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
              {/* If user has enough credits in active scope */}
              {(activeScopeObj?.credits ?? credits) >= contactCost && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 sm:p-3.5 w-full min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                      <Zap className="h-4 w-4 fill-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-emerald-950 truncate">You have {activeScopeObj?.credits ?? credits} Credits</p>
                      <p className="text-[11px] text-emerald-700">Unlock this verified owner contact for {contactCost} credits.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={onUnlockContact}
                    className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 transition"
                  >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PhoneCall className="h-3.5 w-3.5" />}
                    <span>Unlock with {contactCost} Credits</span>
                  </button>
                </div>
              )}

              {isOrgScope && (activeScopeObj?.credits ?? credits) < contactCost && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="font-semibold">{activeScopeObj?.name} has {activeScopeObj?.credits ?? 0} credits ({contactCost} required)</p>
                    <p className="mt-0.5 text-amber-700">
                      Recharge a pack for this organization, or switch above to use your personal credits.
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
                userCredits={activeScopeObj?.credits ?? credits}
                contactCost={contactCost}
                onSelectedPlanChange={onSelectedPlanChange}
                onPurchasePlan={onPurchasePlan}
                purchaseEnabled={purchaseEnabled}
                onOpenWallet={onOpenWallet}
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

        {/* Footer info & explicit Close Button */}
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2.5 border-t border-zinc-200 bg-zinc-50 px-4 sm:px-5 py-3 text-xs dark:border-slate-800 dark:bg-slate-900/60 shrink-0">
          <span className="text-[11px] text-zinc-500 dark:text-slate-400 text-center sm:text-left min-w-0">
            Universal Credits never expire &bull; Verified direct owners
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1 rounded-xl border border-zinc-300 bg-white px-4 py-1.5 text-xs font-bold text-zinc-800 shadow-2xs hover:bg-zinc-50 hover:border-zinc-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition shrink-0"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepIndicator({ contactStep }: { contactStep: ContactStep }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
      {[
        ["1", "Recharge Credits", contactStep === "plans"],
        ["2", "Verified Contact", contactStep === "contact"],
      ].map(([num, label, active]) => (
        <div key={label as string} className={`rounded-lg px-2 py-2 text-center transition truncate ${active ? "bg-rose-50 text-rose-700 font-bold border border-rose-200" : "bg-zinc-50 text-zinc-500 border border-transparent"}`}>
          <span className="mr-1">{num}.</span>
          <span>{label}</span>
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
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
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
      </div>

      {props.otpError && (
        <p className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {props.otpError}
        </p>
      )}

      <button
        type="submit"
        disabled={props.loading || !loginId.trim() || !password}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-md hover:bg-rose-700 disabled:opacity-50 transition"
      >
        {props.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        <span>Sign In &amp; Continue</span>
      </button>

      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs text-zinc-500 pt-2 border-t border-zinc-100">
        <span>Don&apos;t have an account?</span>
        <Link href={registerRedirectUrl} className="font-bold text-rose-600 hover:underline">
          Register now (Free 100 Credits)
        </Link>
      </div>
    </form>
  );
}

export function PlanSelectionStep(props: {
  plansList: ContactPlan[];
  selectedPlan: string;
  currentPlan: ContactPlan;
  contactError: string | null;
  loading: boolean;
  userCredits?: number;
  contactCost?: number;
  onSelectedPlanChange: (value: string) => void;
  onPurchasePlan: () => void;
  purchaseEnabled?: boolean;
  onOpenWallet?: () => void;
}) {
  const {
    plansList,
    selectedPlan,
    currentPlan,
    contactError,
    loading,
    userCredits = 0,
    contactCost = 5,
    onSelectedPlanChange,
    onPurchasePlan,
    purchaseEnabled = false,
    onOpenWallet,
  } = props;

  return (
    <div className="space-y-4">
      {/* Insufficient Credit Alert Banner */}
      <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 fill-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-950">
                  Credits Needed
                </span>
                <span className="rounded-full bg-rose-200/70 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                  {contactCost} Credits Required
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-600">
                Your current balance: <strong className="font-bold text-zinc-950">{userCredits} Credits</strong>. Choose a credit pack below to reveal the owner&apos;s verified number.
              </p>
            </div>
          </div>

          {onOpenWallet && (
            <button
              type="button"
              onClick={onOpenWallet}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-rose-300 bg-white px-3.5 py-2 sm:py-1.5 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-50 transition active:scale-98 shrink-0"
            >
              <Gift className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span>Redeem Promo Code</span>
            </button>
          )}
        </div>
      </div>

      {/* Credit Pack Cards Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {plansList.map((plan) => {
          const active = selectedPlan === plan.id || String(plan.dbId) === String(selectedPlan);
          const isMega = plan.popular || plan.id.includes("300") || plan.name.includes("300") || plan.name.includes("Super");
          return (
            <button
              key={plan.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectedPlanChange(plan.id)}
              className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                active
                  ? "border-rose-500 bg-white shadow-lg shadow-rose-100 ring-2 ring-rose-500"
                  : "border-zinc-200 bg-white hover:border-rose-200 hover:bg-rose-50/30"
              }`}
            >
              {plan.popular && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                  <Sparkles className="h-2.5 w-2.5" />
                  Popular
                </span>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${active ? "bg-rose-600 text-white" : "bg-zinc-100 text-zinc-700"}`}>
                    <Zap className="h-4 w-4 fill-current" />
                  </span>
                  <div className="min-w-0 pr-16">
                    <p className="text-sm font-bold text-zinc-950 truncate">{plan.name}</p>
                    <p className="text-[11px] font-bold text-rose-600">{plan.contacts}</p>
                  </div>
                </div>

                <p className="mt-2 text-xs text-zinc-500 line-clamp-2">
                  {plan.description || "Universal credits for contacts, boosts, and listings."}
                </p>
              </div>

              <div className="mt-3 flex items-baseline justify-between border-t border-zinc-100 pt-2.5">
                <span className="text-xl font-black text-zinc-950">{plan.price}</span>
                <span className="text-[11px] font-semibold text-zinc-500">
                  {active ? "✓ Selected" : "Click to select"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {contactError && <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{contactError}</p>}

      <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
        <button
          type="button"
          disabled={loading || !purchaseEnabled}
          onClick={onPurchasePlan}
          className="w-full flex-1 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 disabled:opacity-50"
        >
          {loading
            ? "Processing purchase..."
            : purchaseEnabled
              ? `Recharge ${currentPlan?.price ?? ""} & Unlock Contact`
              : "Credit purchases opening soon"}
        </button>

        {onOpenWallet && (
          <button
            type="button"
            onClick={onOpenWallet}
            className="w-full sm:w-auto rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition"
          >
            Credit Wallet
          </button>
        )}
      </div>
    </div>
  );
}

export function UnlockedContactStep({
  ownerContact,
  owner,
}: {
  ownerContact: OwnerContact;
  owner?: string;
  credits?: number;
  scopeName?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/40">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Verified Direct Contact
            </span>
            <p className="mt-0.5 text-base font-bold text-zinc-950 dark:text-white truncate">
              {ownerContact?.name ?? owner ?? "Property Owner"}
            </p>
            <p className="mt-1 text-2xl font-black tracking-tight text-emerald-950 dark:text-emerald-200">
              {ownerContact?.phone ? `+91 ${ownerContact.phone}` : "+91 ..... ....."}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-slate-400">
              Direct connection &bull; Zero brokerage &bull; Lifetime unlocked
            </p>
          </div>
        </div>
      </div>
      <a
        href={ownerContact?.phone ? `tel:+91${ownerContact.phone}` : undefined}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-98 transition"
      >
        <PhoneCall className="h-4 w-4" />
        <span>Call Owner Now</span>
      </a>
    </div>
  );
}
