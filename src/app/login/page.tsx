"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Lock, ShieldCheck, RefreshCw, KeyRound, Loader2 } from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { apiClient } from "@/lib/services/api/client";

function makeCode(len = 5) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default function LoginPage() {
  const year = new Date().getFullYear();
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [showOtpAfterFailure, setShowOtpAfterFailure] = useState(false);

  useEffect(() => {
    // Generate CAPTCHA on client after hydration to avoid SSR mismatch
    setCaptcha(makeCode());
  }, []);

  const validMobile = useMemo(() => /^\d{10}$/.test(mobile.replace(/\D/g, "")), [mobile]);

  function refreshCaptcha() {
    setCaptcha(makeCode());
    setCaptchaInput('');
    setMessage(null);
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!validMobile) {
      setMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    setSendingOtp(true);
    const cleanMobile = mobile.replace(/\D/g, "");
    try {
      await apiClient.post(API_ENDPOINTS.auth.requestOtp, { mobileNumber: cleanMobile });
      setOtpRequested(true);
      setAttemptsLeft(3);
      setOtpInput("");
      setMessage('OTP sent to your mobile. Enter it below to continue.');
    } catch (err: any) {
      setMessage(err?.message || 'Unable to send OTP right now.');
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!otpRequested) return;
    const cleanMobile = mobile.replace(/\D/g, "");
    const currentOtp = otpInput; // preserve user input on error
    const currentMobile = mobile;
    if (!/^\d{6}$/.test(otpInput.trim())) {
      setMessage('Enter a valid 6-digit OTP.');
      return;
    }
    setVerifyingOtp(true);
    try {
      const response = await apiClient.post<{ accessToken?: string; refreshToken?: string; user?: unknown }>(
        API_ENDPOINTS.auth.verifyOtp,
        { mobileNumber: cleanMobile, otp: otpInput.trim() },
      );
      const tokens = response.data ?? {};
      if (tokens.accessToken) localStorage.setItem(APP_CONFIG.AUTH.TOKEN_KEY, tokens.accessToken);
      if (tokens.refreshToken) localStorage.setItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY, tokens.refreshToken);
      if (tokens.user) localStorage.setItem(APP_CONFIG.AUTH.USER_KEY, JSON.stringify(tokens.user));
      setMessage('Verified! Redirecting...');
      router.push('/homePage');
    } catch (err: any) {
      setOtpRequested(true); // keep OTP box visible
      setShowOtpAfterFailure(true);
      setMobile(currentMobile); // keep mobile intact on failure
      setOtpInput(currentOtp); // keep OTP input intact on failure
      setMessage(err?.message || 'Incorrect OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-[#0f172a]">
      {/* Main */}
      <main className="min-h-screen md:grid md:grid-cols-[1.05fr_0.95fr]">
        {/* Login Form — mobile-first */}
        <section className="flex items-center justify-center p-4 sm:p-6 md:p-10">
          <div className="w-full max-w-sm sm:max-w-md rounded-2xl bg-white/90 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(15,23,42,0.5)] border border-white/70">
            <div className="p-5 sm:p-7">
              {/* Mobile brand */}
              <div className="mb-3 flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 via-amber-400 to-emerald-400 shadow-inner shadow-amber-200/40" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-rose-600 font-semibold">CityHaven</p>
                  <p className="text-base font-semibold text-slate-900">Welcome back</p>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Sign in with mobile</h2>
              <p className="mt-1 text-sm text-slate-600">Enter your number and captcha to get a one-time password.</p>

              {/* Mobile + CAPTCHA */}
              <form className="mt-6 space-y-4" onSubmit={handleSendOtp} aria-label="Mobile OTP login form">
                <div>
                  <label htmlFor="mobile" className="text-sm font-semibold text-slate-800">Mobile Number</label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-base font-semibold outline-none transition-colors focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      placeholder="9876543210"
                      aria-required="true"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sendingOtp}
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-white text-sm font-semibold shadow-[0_18px_50px_-24px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_-28px_rgba(15,23,42,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 disabled:opacity-60"
                >
                  {sendingOtp ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Sending...</span> : "Send OTP"}
                </button>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>We never share your number.</span>
                </div>
              </form>

              {(otpRequested || showOtpAfterFailure) && (
                <form className="mt-6 space-y-3 border-t border-slate-100 pt-5" onSubmit={handleVerifyOtp}>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <KeyRound className="h-4 w-4 text-rose-500" />
                    Enter OTP
                  </div>
                  <input
                    aria-label="Enter OTP"
                    className="h-12 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-base font-semibold tracking-[0.35em] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="• • • • • •"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  />
                  <p className="text-xs text-slate-500">Attempts left: {attemptsLeft}</p>
                  <button
                    type="submit"
                    disabled={verifyingOtp}
                    className="w-full rounded-xl border border-emerald-500 bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_38px_-24px_rgba(16,185,129,0.8)] transition hover:-translate-y-0.5 hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:opacity-60"
                  >
                    {verifyingOtp ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</span> : "Verify OTP"}
                  </button>
                </form>
              )}

              {message && (
                <p className="mt-4 text-sm text-rose-600" aria-live="polite">{message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Branding — hidden on small screens */}
        <section className="relative hidden md:flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(248,113,113,0.14),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(248,180,0,0.12),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.12),transparent_30%)]" />
          <div className="relative z-10 max-w-lg space-y-6 p-12 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              <ShieldCheck className="h-4 w-4" />
              Trusted sign-in
            </div>
            <h1 className="text-4xl font-extrabold leading-tight">Access your home journey with a single OTP.</h1>
            <p className="text-base text-white/80">
              Quick, secure, and built for CityHaven. Keep exploring listings, saving favorites, and tracking your moves.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {['Encrypted delivery', 'One-minute access', 'No passwords to remember', 'Works across devices'].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-6 text-xs text-[#475569]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div>© {year} CityHaven</div>
          <nav className="flex flex-wrap items-center gap-4">
            <Link href="/homePage">Home</Link>
            <Link href="/about">About Us</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
