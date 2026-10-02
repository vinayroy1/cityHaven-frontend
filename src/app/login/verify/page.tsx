'use client';

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Lock, Loader2, ArrowLeft } from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { apiClient } from "@/lib/services/api/client";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { BrandLogo } from "@/components/common/BrandLogo";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    try {
      const m = sessionStorage.getItem('awasio_mobile') || '';
      const c = sessionStorage.getItem('awasio_otp_code');
      setMobile(m);
      setOtpCode(c);
      if (!m || !c) setMessage('No active OTP. Please request again.');
      else setMessage('Enter the OTP sent to your mobile.');
    } catch {
      setMessage('Storage unavailable. Please request OTP again.');
    }
  }, []);

  const validOtp = useMemo(() => /^\d{6}$/.test(otpInput.trim()), [otpInput]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!mobile) {
      setMessage('No OTP found. Request again.');
      return;
    }
    if (!validOtp) {
      setMessage('Enter a valid 6-digit OTP.');
      return;
    }
    setVerifying(true);
    try {
      const response = await apiClient.post<{ accessToken?: string; refreshToken?: string; user?: unknown }>(
        API_ENDPOINTS.auth.verifyOtp,
        { mobileNumber: mobile.replace(/\D/g, ""), otp: otpInput.trim() },
      );
      const tokens = response.data ?? {};
      if (tokens.accessToken) localStorage.setItem(APP_CONFIG.AUTH.TOKEN_KEY, tokens.accessToken);
      if (tokens.refreshToken) localStorage.setItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY, tokens.refreshToken);
      if (tokens.user) localStorage.setItem(APP_CONFIG.AUTH.USER_KEY, JSON.stringify(tokens.user));
      setMessage('Login successful! Redirecting...');
      router.push('/');
    } catch (err: any) {
      setMessage(err?.message || 'Invalid OTP. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  async function resend() {
    if (!mobile) {
      setMessage('Enter mobile on previous step.');
      return;
    }
    setSending(true);
    try {
      await apiClient.post(API_ENDPOINTS.auth.requestOtp, { mobileNumber: mobile.replace(/\D/g, "") });
      setMessage('New OTP sent to your mobile.');
    } catch (err: any) {
      setMessage(err?.message || 'Could not resend OTP.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/40 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-150">
      {/* Top Bar with Back Link & Theme Switcher */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Login</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-sm sm:max-w-md rounded-3xl bg-white/95 backdrop-blur-xl shadow-xl border border-slate-200 dark:bg-slate-900/90 dark:border-slate-800">
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <BrandLogo size="md" showTagline taglineText="Verified Real Estate" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Verify OTP</h2>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Step 2 of 2</span>
                <span>Enter 6-digit code</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full rounded-full bg-rose-600" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <span>{mobile ? `Code sent to ${mobile}` : 'Mobile number unavailable'}</span>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleVerify} aria-label="OTP verification form">
              <div>
                <label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Enter OTP</label>
                <input
                  id="otp"
                  name="otp"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-lg font-bold outline-none transition focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-rose-400 tracking-widest text-center"
                  placeholder="------"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!validOtp || verifying}
                  className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-white text-sm font-bold shadow-md shadow-rose-200 transition hover:bg-rose-700 hover:shadow-lg disabled:opacity-60 disabled:hover:scale-100"
                >
                  {verifying ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Verifying</span> : "Verify & Login"}
                </button>
                <button
                  type="button"
                  onClick={resend}
                  disabled={sending}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-60"
                >
                  {sending ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Sending</span> : "Resend"}
                </button>
              </div>
            </form>

            {message && (
              <p className="mt-4 text-sm font-medium text-rose-600 dark:text-rose-400" aria-live="polite">{message}</p>
            )}

            <div className="mt-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" aria-hidden="true" /><span>Secure verification</span></div>
              <Link href="/login" className="font-bold text-rose-600 dark:text-rose-400 hover:underline">Change number</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
