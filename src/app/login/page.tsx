"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Phone,
  KeyRound,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Building2,
  Home,
  Users,
  Star,
  Check,
} from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";
import { useRequestOtpMutation, useVerifyOtpMutation, useUpdateProfileMutation } from "@/features/auth/api";
import { ProfileCompletion } from "./ProfileCompletion";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { BrandLogo } from "@/components/common/BrandLogo";

// 6-digit split OTP input component with auto-focus & paste support
function SplitOtpInput({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  onComplete?: (val: string) => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = useMemo(() => {
    const arr = value.split("").slice(0, 6);
    while (arr.length < 6) arr.push("");
    return arr;
  }, [value]);

  function handleChange(index: number, val: string) {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = "";
      const newVal = newDigits.join("");
      onChange(newVal);
      return;
    }

    // If user pasted or typed multiple digits
    if (cleaned.length > 1) {
      const slice = cleaned.slice(0, 6);
      onChange(slice);
      if (slice.length === 6 && onComplete) onComplete(slice);
      const nextFocus = Math.min(slice.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleaned[0];
    const newVal = newDigits.join("");
    onChange(newVal);

    if (index < 5 && cleaned[0]) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newVal.length === 6 && onComplete) {
      onComplete(newVal);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      onChange(pastedData);
      if (pastedData.length === 6 && onComplete) onComplete(pastedData);
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 my-2">
      {[0, 1, 2, 3, 4, 5].map((idx) => {
        const isFilled = Boolean(digits[idx]);
        return (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            value={digits[idx] || ""}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            autoFocus={idx === 0}
            className={`h-12 w-11 sm:h-14 sm:w-13 text-center text-xl sm:text-2xl font-black rounded-2xl border-2 transition-all outline-none ${
              isFilled
                ? "border-emerald-500 bg-emerald-50/60 text-emerald-950 shadow-sm"
                : "border-slate-200 bg-slate-50/50 text-slate-900 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
            } disabled:opacity-50`}
          />
        );
      })}
    </div>
  );
}

function LoginContent() {
  const year = new Date().getFullYear();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const [redirectingSession, setRedirectingSession] = useState(true);

  // Form states
  const [mobile, setMobile] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [otpRequested, setOtpRequested] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Profile completion states
  const [needsProfile, setNeedsProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // API mutations
  const [requestOtp, { isLoading: sendingOtp }] = useRequestOtpMutation();
  const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyOtpMutation();
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateProfileMutation();

  // Check if session already exists
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null;
    if (token) {
      setRedirectingSession(true);
      router.replace(redirectTo);
    } else {
      setRedirectingSession(false);
    }
  }, [redirectTo, router]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const validMobile = useMemo(() => /^\d{10}$/.test(mobile.replace(/\D/g, "")), [mobile]);

  // Step indicator state
  const currentStep = needsProfile ? 3 : otpRequested ? 2 : 1;

  async function handleSendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validMobile) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, "");
    try {
      await requestOtp({ mobileNumber: cleanMobile }).unwrap();
      setOtpRequested(true);
      setAttemptsLeft(3);
      setOtpInput("");
      setResendCountdown(30);
      setSuccessMessage("OTP sent successfully to +91 " + cleanMobile);
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err?.message || "Unable to send OTP right now. Please try again.");
    }
  }

  async function handleVerifyOtp(e?: React.FormEvent, customOtp?: string) {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanMobile = mobile.replace(/\D/g, "");
    const cleanOtp = (customOtp || otpInput).trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setErrorMessage("Please enter the complete 6-digit OTP code.");
      return;
    }

    try {
      const tokens = await verifyOtp({ mobileNumber: cleanMobile, otp: cleanOtp }).unwrap();
      const userObj = tokens?.user as any;

      if (tokens?.accessToken) localStorage.setItem(APP_CONFIG.AUTH.TOKEN_KEY, tokens.accessToken);
      if (tokens?.refreshToken) localStorage.setItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY, tokens.refreshToken);
      if (tokens?.user) localStorage.setItem(APP_CONFIG.AUTH.USER_KEY, JSON.stringify(tokens.user));

      // Dispatch auth change event for headers/listeners
      window.dispatchEvent(new Event("auth-change"));

      const isNew = Boolean(tokens?.isNewUser);
      if (isNew) {
        setNeedsProfile(true);
        setProfileName(userObj?.name ?? "");
        setProfileEmail(userObj?.email ?? "");
        setSuccessMessage("Mobile verified! Complete your profile to continue.");
      } else {
        setSuccessMessage("Authentication successful! Redirecting...");
        router.replace(redirectTo);
      }
    } catch (err: any) {
      setAttemptsLeft((prev) => Math.max(0, prev - 1));
      setErrorMessage(err?.data?.message || err?.message || "Invalid OTP code. Please verify and try again.");
    }
  }

  async function handleCompleteProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage(null);

    if (!profileName.trim() || !profileEmail.trim()) {
      setProfileMessage("Please enter your full name and valid email address.");
      return;
    }

    try {
      const res = await updateProfile({ name: profileName.trim(), email: profileEmail.trim() }).unwrap();
      if (res?.user) localStorage.setItem(APP_CONFIG.AUTH.USER_KEY, JSON.stringify(res.user));
      window.dispatchEvent(new Event("auth-change"));
      router.replace(redirectTo);
    } catch (err: any) {
      setProfileMessage(err?.data?.message || err?.message || "Unable to save profile right now.");
    }
  }

  if (redirectingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-amber-50/40 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 flex flex-col justify-between transition-colors duration-150">
      {/* Main Container */}
      <main className="flex-1 lg:grid lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Interactive Login/Auth Card */}
        <section className="flex items-center justify-center p-4 sm:p-8 lg:p-12">
          <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-black/60">
            {/* Brand Header */}
            <div className="mb-6 flex items-center justify-between">
              <BrandLogo size="md" showTagline taglineText="Verified Real Estate" />

              <div className="flex items-center gap-2">
                <ThemeToggle compact />
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  OTP Secure
                </span>
              </div>
            </div>

            {/* Step Breadcrumb Progress */}
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    currentStep > 1
                      ? "bg-emerald-600 text-white"
                      : "bg-rose-600 text-white"
                  }`}
                >
                  {currentStep > 1 ? <Check className="h-3 w-3" /> : "1"}
                </span>
                <span className={currentStep === 1 ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-500 dark:text-slate-400"}>
                  Phone
                </span>
              </div>

              <div className="h-0.5 w-8 bg-slate-200 dark:bg-slate-800" />

              <div className="flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    currentStep > 2
                      ? "bg-emerald-600 text-white"
                      : currentStep === 2
                      ? "bg-rose-600 text-white"
                      : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {currentStep > 2 ? <Check className="h-3 w-3" /> : "2"}
                </span>
                <span className={currentStep === 2 ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-500 dark:text-slate-400"}>
                  OTP
                </span>
              </div>

              <div className="h-0.5 w-8 bg-slate-200 dark:bg-slate-800" />

              <div className="flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    currentStep === 3
                      ? "bg-rose-600 text-white"
                      : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  3
                </span>
                <span className={currentStep === 3 ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-500 dark:text-slate-400"}>
                  Profile
                </span>
              </div>
            </div>

            {/* Error / Success Alerts */}
            {errorMessage && (
              <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200 animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {!needsProfile ? (
              !otpRequested ? (
                /* STEP 1: Enter Mobile Number */
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                    Sign In or Register
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Enter your 10-digit mobile number to access your account instantly without passwords.
                  </p>

                  <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="mobile" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Mobile Number
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 flex items-center gap-1 text-xs font-black text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 pr-2.5">
                          🇮🇳 +91
                        </span>
                        <input
                          id="mobile"
                          name="mobile"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-20 pr-4 text-sm font-bold tracking-wider text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
                          placeholder="98765 43210"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={sendingOtp || !validMobile}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-xs font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 dark:bg-rose-600 dark:hover:bg-rose-700 dark:shadow-rose-950/50"
                    >
                      {sendingOtp ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <span>Continue with OTP</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <Lock className="h-3 w-3 text-slate-400" />
                      <span>We never share your number or send spam.</span>
                    </div>
                  </form>
                </div>
              ) : (
                /* STEP 2: Verify 6-Digit OTP with Split Inputs */
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                      Verify OTP
                    </h1>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpRequested(false);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      <Edit3 className="h-3 w-3" />
                      Change number
                    </button>
                  </div>

                  <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Enter the 6-digit code sent to <strong className="text-slate-900 dark:text-white">+91 {mobile}</strong>
                  </p>

                  <form onSubmit={(e) => handleVerifyOtp(e)} className="mt-5 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <KeyRound className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                          6-Digit Code
                        </label>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {attemptsLeft} attempts remaining
                        </span>
                      </div>

                      {/* Split 6-digit input */}
                      <SplitOtpInput
                        value={otpInput}
                        onChange={setOtpInput}
                        onComplete={(code) => handleVerifyOtp(undefined, code)}
                        disabled={verifyingOtp}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={verifyingOtp || otpInput.trim().length !== 6}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                    >
                      {verifyingOtp ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <span>Verify & Sign In</span>
                          <CheckCircle2 className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    {/* Resend OTP Button / Timer */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 dark:text-slate-400">Didn&apos;t receive code?</span>
                      {resendCountdown > 0 ? (
                        <span className="font-semibold text-slate-400">
                          Resend in <strong className="text-slate-600 dark:text-slate-300">{resendCountdown}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={sendingOtp}
                          onClick={() => handleSendOtp()}
                          className="font-bold text-rose-600 dark:text-rose-400 hover:underline disabled:opacity-50"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )
            ) : (
              /* STEP 3: Profile Completion for New Users */
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                  Complete Your Profile
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Just a few quick details to personalize your Awasio experience.
                </p>

                <ProfileCompletion
                  name={profileName}
                  email={profileEmail}
                  onChangeName={setProfileName}
                  onChangeEmail={setProfileEmail}
                  onSubmit={handleCompleteProfile}
                  isSaving={updatingProfile}
                  message={profileMessage}
                />
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Premium Real Estate Showcase with Glassmorphic Preview */}
        <section className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-12 text-white overflow-hidden">
          {/* Subtle Ambient Radial Glows & Grid Mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:28px_28px] opacity-60 pointer-events-none" />
          <div className="absolute top-[-10%] right-[-10%] h-[450px] w-[450px] rounded-full bg-rose-600/20 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] h-[450px] w-[450px] rounded-full bg-emerald-600/20 blur-[100px] pointer-events-none" />

          {/* Top Pill & Live Activity Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1.5 text-xs font-bold text-white shadow-inner backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>India&apos;s #1 Direct Owner Portal</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Platform</span>
            </div>
          </div>

          {/* Center Showcase with Realistic Interactive Glass Card */}
          <div className="relative z-10 my-auto max-w-lg space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1 text-amber-400 text-xs font-bold tracking-wider uppercase">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                <span>Zero Brokerage • 100% Direct Contact</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-white">
                Find Your Haven. <br />
                <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                  Direct from Verified Owners.
                </span>
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                Unlock instant phone numbers, schedule direct site visits, and manage multi-seat agency teams with zero friction.
              </p>
            </div>

            {/* Interactive Floating Glass Property Preview Card */}
            <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-2xl transition hover:border-white/25">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <Home className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">3 BHK Luxury Sky Villa</h4>
                    <p className="text-[10px] text-slate-400">Indiranagar, Bangalore • 1,850 sq.ft</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-black text-emerald-300">
                  Verified Owner
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div className="rounded-2xl bg-black/30 p-2.5 border border-white/5">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Expected Price</span>
                  <span className="text-sm font-black text-white">₹1.45 Cr</span>
                </div>
                <div className="rounded-2xl bg-black/30 p-2.5 border border-white/5">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Brokerage</span>
                  <span className="text-sm font-black text-emerald-400">₹0 (Zero)</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-500/20 via-slate-800/40 to-rose-500/20 p-2.5 border border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-xs">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white">Owner Contact Verified</p>
                    <p className="text-[9px] text-slate-400">+91 98••• •••89 • Instant Access</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-white text-slate-950 px-2.5 py-1 rounded-xl shadow-sm">
                  1-Click Unlock
                </span>
              </div>
            </div>

            {/* Quick Metrics & Feature Chips */}
            <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 backdrop-blur-md">
                <div className="text-sm font-black text-white">50k+</div>
                <div className="text-[10px] text-slate-400 font-medium">Verified Homes</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 backdrop-blur-md">
                <div className="text-sm font-black text-white">0%</div>
                <div className="text-[10px] text-slate-400 font-medium">Brokerage</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 backdrop-blur-md">
                <div className="text-sm font-black text-emerald-400">Instant</div>
                <div className="text-[10px] text-slate-400 font-medium">Owner Access</div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Line with Security & Privacy Badges */}
          <div className="relative z-10 border-t border-white/10 pt-6 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>End-to-end encrypted OTP</span>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />
              <span>DPDP Act & RERA Compliant</span>
            </span>
          </div>
        </section>
      </main>

      {/* Simplified Footer */}
      <footer className="border-t border-slate-200/60 bg-white/80 py-4 px-6 text-xs text-slate-500 dark:border-slate-850 dark:bg-slate-950/80 dark:text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>© {year} Awasio. All rights reserved.</div>
          <nav className="flex items-center gap-4 text-slate-600 dark:text-slate-400 font-medium">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition">Home</Link>
            <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white transition">Pricing</Link>
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">Loading sign in...</div>}>
      <LoginContent />
    </Suspense>
  );
}


