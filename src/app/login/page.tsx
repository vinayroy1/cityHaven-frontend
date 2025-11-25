'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Bell, Gauge, ShieldCheck, MessageSquare, Phone, Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

function makeCode(len = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default function LoginPage() {
  const year = new Date().getFullYear();

  const [mobile, setMobile] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const [userType, setUserType] = useState<'Buyer/Renter' | 'Agent' | 'Owner'>('Buyer/Renter');

  useEffect(() => {
    // Generate CAPTCHA on client after hydration to avoid SSR mismatch
    setCaptcha(makeCode());
  }, []);

  const validMobile = useMemo(() => /^\d{10}$/.test(mobile.replace(/\D/g, '')), [mobile]);

  const currentStep = 1;

  function refreshCaptcha() {
    setCaptcha(makeCode());
    setCaptchaInput('');
    setMessage(null);
  }

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!validMobile) {
      setMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captcha) {
      setMessage('CAPTCHA does not match.');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    try {
      sessionStorage.setItem('cityhaven_mobile', mobile);
      sessionStorage.setItem('cityhaven_otp_code', code);
      sessionStorage.setItem('cityhaven_user_type', userType);
    } catch {}
    router.push('/login/verify');
  }

  function handleVerifyOtp(_e: React.FormEvent) {}
  function resendOtp() {}

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#eef2ff] text-[#0f172a]">
      {/* Main */}
      <main className="min-h-screen md:grid md:grid-cols-2">
        {/* Login Form — mobile-first */}
        <section className="flex items-center justify-center p-4 sm:p-6 md:p-10">
          <div className="w-full max-w-sm sm:max-w-md rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl border border-slate-200">
            <div className="p-5 sm:p-7">
              {/* Mobile brand */}
              <div className="md:hidden mb-4 font-bold text-2xl tracking-tight">CityHaven</div>
              <h2 className="text-xl sm:text-2xl font-semibold">Log In with Mobile OTP</h2>

              {/* User type selector */}
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                  <span className="text-sm font-semibold tracking-wide">I am a</span>
                </div>
                <div className="mt-1 h-1 w-16 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600" />
                <div className="mt-2 inline-flex items-center rounded-xl bg-white border border-slate-200 shadow-inner p-1">
                  {(['Buyer/Renter','Agent','Owner'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setUserType(t)}
                      aria-pressed={userType === t}
                      className={`${userType === t ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'} px-3.5 py-2 text-xs sm:text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600/30`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stepper */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Step {currentStep} of 2</span>
                  <span>Verify & Send OTP</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 transition-all"
                    style={{ width: '33%' }}
                  />
                </div>
              </div>

              {/* Mobile + CAPTCHA */}
              <form className="mt-5 space-y-4" onSubmit={handleSendOtp} aria-label="Mobile OTP login form">
                <div>
                  <label htmlFor="mobile" className="text-sm font-medium">Mobile Number</label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-base font-semibold outline-none transition-colors focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25"
                      placeholder="9876543210"
                      aria-required="true"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">CAPTCHA</label>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="select-none tracking-widest rounded-lg bg-[#0f172a] text-white px-3 py-2 text-sm font-bold">
                      {captcha}
                    </div>
                    <button type="button" onClick={refreshCaptcha} className="text-sm text-[#2563eb] hover:underline" aria-label="Refresh CAPTCHA">Refresh</button>
                  </div>
                  <input
                    aria-label="Enter CAPTCHA"
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base font-semibold outline-none transition-colors focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/30"
                    placeholder="Enter the code above"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-4 py-2 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-transform hover:scale-[1.02] focus:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40"
                >
                  Send OTP
                </button>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Secure OTP over encrypted channel</span>
                </div>
              </form>

              {/* OTP moved to /login/verify */}

              {message && (
                <p className="mt-4 text-sm text-[#2563eb]" aria-live="polite">{message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Branding — hidden on small screens */}
        <section className="relative hidden md:block">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1521540216272-a50305cd4421?q=80&w=1600&auto=format&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 p-10 text-white">
            {/* Logo */}
            <div className="font-bold text-2xl tracking-tight">CityHaven</div>

            {/* Headline */}
            <h1 className="mt-6 text-4xl font-extrabold">
              Find Your Perfect Space in the City.
            </h1>
            <p className="mt-3 text-lg text-white/90">
              Welcome back. Your dream property is waiting.
            </p>

            {/* Benefits */}
            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="shrink-0" color="#f59e0b" />
                <span>Post one property absolutely FREE</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="shrink-0" color="#f59e0b" />
                <span>Get matched with verified buyers & tenants</span>
              </li>
              <li className="flex items-start gap-3">
                <Bell className="shrink-0" color="#f59e0b" />
                <span>Receive instant alerts for your criteria</span>
              </li>
              <li className="flex items-start gap-3">
                <Gauge className="shrink-0" color="#f59e0b" />
                <span>Track your listing's performance in real-time</span>
              </li>
              <li className="flex items-start gap-3">
                <MessageSquare className="shrink-0" color="#f59e0b" />
                <span>Secure & direct communication</span>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-6 text-xs text-[#475569]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div>© {year} CityHaven</div>
          <nav className="flex flex-wrap items-center gap-4">
            <Link href="#">Sitemap</Link>
            <Link href="#">About Us</Link>
            <Link href="#">Terms & Conditions</Link>
            <Link href="#">Privacy Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
