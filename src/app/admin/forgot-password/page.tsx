"use client";
/**
 * Staff password reset: email → 6-digit code (sent via the standard /auth/forgot-password flow)
 * → new password. The account still needs a staff role to sign in to the admin console.
 */
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useForgotPasswordMutation, useResetPasswordMutation } from "@/features/auth/api";

const input =
  "w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition";
const label = "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5";
const primary =
  "w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/20 transition disabled:opacity-50";

function errorText(e: unknown, fallback: string) {
  const err = e as { data?: { message?: string; errors?: Array<{ message?: string }> }; message?: string };
  return err?.data?.errors?.[0]?.message || err?.data?.message || err?.message || fallback;
}

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset" | "done">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [sendCode, sending] = useForgotPasswordMutation();
  const [resetPassword, resetting] = useResetPasswordMutation();

  const requestCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    const clean = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(clean)) return setError("Enter your staff email address.");
    try {
      await sendCode({ email: clean }).unwrap();
      setEmail(clean);
      setInfo(`We sent a 6-digit code to ${clean}. It expires in a few minutes.`);
      setStep("reset");
    } catch (err) {
      setError(errorText(err, "Could not send the code. Please try again."));
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit code from your email.");
    if (password.length < 8) return setError("Use at least 8 characters for your new password.");
    if (password !== confirm) return setError("The two passwords don't match.");
    try {
      await resetPassword({ email, otp, newPassword: password }).unwrap();
      setStep("done");
    } catch (err) {
      setError(errorText(err, "Could not reset the password. Check the code and try again."));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/25">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h1 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">Reset staff password</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Awasio admin console</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {step === "email" && (
            <form onSubmit={requestCode} className="space-y-4">
              <div>
                <label className={label}>Staff email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@awasio.com" required className={input} />
                </div>
              </div>
              <button type="submit" disabled={sending.isLoading} className={primary}>
                {sending.isLoading ? "Sending code…" : "Send reset code"} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={submitReset} className="space-y-4">
              {info && <p className="rounded-xl bg-sky-50 p-3 text-xs text-sky-800 dark:bg-sky-950/30 dark:text-sky-300">{info}</p>}
              <div>
                <label className={label}>6-digit code</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    required
                    className={`${input} tracking-[0.3em]`}
                  />
                </div>
              </div>
              <div>
                <label className={label}>New password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required className={input} />
                </div>
              </div>
              <div>
                <label className={label}>Confirm new password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className={input} />
                </div>
              </div>
              <button type="submit" disabled={resetting.isLoading} className={primary}>
                {resetting.isLoading ? "Saving…" : "Set new password"} <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => requestCode()} disabled={sending.isLoading} className="w-full text-center text-[11px] font-semibold text-slate-500 hover:text-rose-600">
                Didn&apos;t get it? Resend code
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Password updated</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sign in with your email and new password.</p>
              <button type="button" onClick={() => router.push("/admin/login")} className={primary}>
                Go to admin sign in <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <Link href="/admin/login" className="mt-5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to admin sign in
        </Link>
      </div>
    </div>
  );
}
