"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/features/admin/adminStore";
import { Mail, KeyRound, ArrowRight, AlertCircle, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useIsMounted } from "@/features/admin/dateUtils";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useIsMounted();
  const { loginStaff, requestOtp } = useAdmin();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const isOtpEnabled = process.env.NEXT_PUBLIC_ENABLE_OTP_FLOW === "true";
  const [authMode, setAuthMode] = useState<"PASSWORD" | "OTP">(isOtpEnabled ? "OTP" : "PASSWORD");
  const [mfaCode, setMfaCode] = useState("");
  const [step, setStep] = useState<"INPUT" | "MFA">("INPUT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    const cleanLoginId = loginId.trim();
    if (!cleanLoginId) {
      setError("Please provide your staff email or mobile number.");
      return;
    }
    if (!password) {
      setError("Please enter your staff password.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginStaff(cleanLoginId, password, true);
      if (res.success) {
        router.push("/admin");
      } else {
        setError(res.message || "Invalid staff credentials.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to authenticate staff account.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    const cleanLoginId = loginId.trim().toLowerCase();
    if (!cleanLoginId) {
      setError("Please provide your staff email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await requestOtp(cleanLoginId);
      if (res.success) {
        setStatusMessage(res.message);
        if (res.devOtp) {
          setDevOtp(res.devOtp);
          setMfaCode(res.devOtp);
        }
        setStep("MFA");
      } else {
        setError(res.message || "Unable to send authorization code. Please verify your staff email.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to connect to authentication service.");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginStaff(loginId.trim(), mfaCode.trim(), false);
      if (res.success) {
        router.push("/admin");
      } else {
        setError(res.message || "Invalid or expired authorization code.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "An unexpected error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 dark:bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-80 h-80 bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Theme Switcher in Corner */}
      {mounted && (
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer"
          title="Toggle Dark/Light Mode"
        >
          {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      )}

      {/* Main card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 relative z-10">
        <div className="flex items-center justify-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="Awasio" width={52} height={48} className="h-12 w-auto" />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Awasio Admin</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sign in with your staff account</p>
        </div>

        {statusMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5 animate-in fade-in duration-200">
            <div className="leading-relaxed font-medium">{statusMessage}</div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {isOtpEnabled && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => {
                setAuthMode("PASSWORD");
                setStep("INPUT");
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                authMode === "PASSWORD"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("OTP");
                setStep("INPUT");
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                authMode === "OTP"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Email OTP
            </button>
          </div>
        )}

        {step === "INPUT" ? (
          <div className="space-y-4">
            {authMode === "PASSWORD" ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Staff Email or Mobile
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="Email or Mobile"
                      required
                      disabled={loading}
                      className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Staff Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition"
                    />
                  </div>
                </div>

                <div className="-mt-2 text-right">
                  <Link href="/admin/forgot-password" className="text-[11px] font-semibold text-rose-600 hover:underline dark:text-rose-400">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/20 transition disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? "Signing in…" : "Sign in"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Authorized Staff Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="name@awasio.in"
                      required
                      disabled={loading}
                      className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">We&apos;ll email a one-time code to this address.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/20 transition disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? "Sending code…" : "Send sign-in code"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleMfaSubmit} className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs">
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">Staff Account:</div>
              <div className="font-mono font-semibold text-rose-600 dark:text-rose-300">{loginId}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                6-Digit Security Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit code"
                  required
                  autoFocus
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-sm font-mono tracking-widest text-center text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition"
                />
              </div>
              {devOtp && process.env.NODE_ENV === "development" && (
                <div className="mt-2 text-center text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-lg py-1 px-2">
                  Dev code: <span className="font-bold underline">{devOtp}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || mfaCode.length < 6}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Verifying…" : "Verify & sign in"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("INPUT");
                setError(null);
                setStatusMessage(null);
                setDevOtp(null);
                setMfaCode("");
              }}
              className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 py-1 transition cursor-pointer"
            >
              ← Back
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 text-center text-xs text-slate-500 flex items-center gap-4">
        <span>© Awasio</span>
        <span>•</span>
        <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-300 underline">
          Back to awasio.com
        </Link>
      </div>
    </div>
  );
}
