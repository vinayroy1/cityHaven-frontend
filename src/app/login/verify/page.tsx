'use client';

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Lock, Loader2 } from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { apiClient } from "@/lib/services/api/client";

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
      const m = sessionStorage.getItem('cityhaven_mobile') || '';
      const c = sessionStorage.getItem('cityhaven_otp_code');
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
      router.push('/homePage');
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
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#eef2ff] text-[#0f172a]">
      <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-sm sm:max-w-md rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl border border-slate-200">
          <div className="p-5 sm:p-7">
            <div className="md:hidden mb-4 font-bold text-2xl tracking-tight">CityHaven</div>
            <h2 className="text-xl sm:text-2xl font-semibold">Verify OTP</h2>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Step 2 of 2</span>
                <span>Enter 6-digit code</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600" style={{ width: '66%' }} />
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-600 flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <span>{mobile ? `Code sent to ${mobile}` : 'Mobile number unavailable'}</span>
            </div>

            <form className="mt-5 space-y-3" onSubmit={handleVerify} aria-label="OTP verification form">
              <label htmlFor="otp" className="text-sm font-medium">Enter OTP</label>
              <input
                id="otp"
                name="otp"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base font-semibold outline-none transition-colors focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25 tracking-widest"
                placeholder="6-digit OTP"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!validOtp || verifying}
                  className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-4 py-2 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-transform hover:scale-[1.02] focus:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40 disabled:opacity-60 disabled:hover:scale-100"
                >
                  {verifying ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Verifying</span> : "Verify & Login"}
                </button>
                <button
                  type="button"
                  onClick={resend}
                  disabled={sending}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  {sending ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Sending</span> : "Resend"}
                </button>
              </div>
            </form>

            {message && (
              <p className="mt-4 text-sm text-indigo-600" aria-live="polite">{message}</p>
            )}

            <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" aria-hidden="true" /><span>Secure verification</span></div>
              <Link href="/login" className="text-indigo-600 hover:underline">Change number</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
