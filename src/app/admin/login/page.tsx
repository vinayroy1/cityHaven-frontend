"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/features/admin/adminStore";
import { Lock, Mail, KeyRound, ArrowRight, AlertCircle, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useIsMounted } from "@/features/admin/dateUtils";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useIsMounted();
  const { loginStaff, staffList } = useAdmin();

  const [email, setEmail] = useState("vinay.admin@cityhaven.in");
  const [mfaCode, setMfaCode] = useState("123456");
  const [step, setStep] = useState<"EMAIL" | "MFA">("EMAIL");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith("@cityhaven.in")) {
      setError("Only verified company staff emails (@cityhaven.in) are permitted to access this portal.");
      return;
    }

    setStep("MFA");
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginStaff(email.trim(), mfaCode.trim());
      if (res.success) {
        router.push("/admin");
      } else {
        setError(res.message || "Failed to authenticate. Check your MFA code.");
      }
    } catch {
      setError("An unexpected error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleSsoClick = (provider: "Google Workspace" | "Microsoft Entra ID") => {
    setLoading(true);
    setError(null);
    setTimeout(async () => {
      setEmail("rohan.malhotra@cityhaven.in");
      const res = await loginStaff("rohan.malhotra@cityhaven.in", "123456");
      if (res.success) {
        router.push("/admin");
      } else {
        setError("SSO authentication callback failed.");
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 dark:bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Theme Switcher in Corner */}
      {mounted && (
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer"
          title="Toggle Dark/Light Mode"
        >
          {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      )}

      {/* Main card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 relative z-10">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-rose-900/30">
            CH
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">CityHaven Internal Portal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Authorized Staff & Operations Access Only</p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-rose-600 dark:text-rose-300 border border-slate-200 dark:border-slate-700">
            <Lock className="w-3 h-3 text-rose-500" /> MFA & SSO Enforced
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {step === "EMAIL" ? (
          <div className="space-y-4">
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Company Staff Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@cityhaven.in"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Must end with @cityhaven.in domain.</p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/20 transition cursor-pointer"
              >
                <span>Continue with MFA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500 font-bold">Or Enterprise SSO</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSsoClick("Google Workspace")}
                disabled={loading}
                className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                <span className="font-bold text-rose-500">G</span> Google SSO
              </button>
              <button
                type="button"
                onClick={() => handleSsoClick("Microsoft Entra ID")}
                disabled={loading}
                className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                <span className="font-bold text-blue-500">M</span> Microsoft SSO
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleMfaSubmit} className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs">
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">Staff Account:</div>
              <div className="font-mono font-semibold text-rose-600 dark:text-rose-300">{email}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                6-Digit Authenticator (TOTP) Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-sm font-mono tracking-widest text-center text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 text-center">Default demo code: <code className="text-rose-500">123456</code></p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Verifying Session..." : "Verify & Launch Console"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("EMAIL");
                setError(null);
              }}
              className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 py-1 transition"
            >
              ← Back to Email
            </button>
          </form>
        )}

        {/* Demo Quick Logins */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Quick Demo Roster:</span>
            <span className="text-[10px] font-mono text-slate-400">Auto-fills</span>
          </div>
          <div className="space-y-1">
            {staffList.slice(0, 3).map((staff) => (
              <button
                key={staff.id}
                type="button"
                onClick={() => {
                  setEmail(staff.email);
                  setStep("EMAIL");
                  setError(null);
                }}
                className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition flex items-center justify-between font-mono text-[10px] cursor-pointer"
              >
                <span>{staff.email}</span>
                <span className="text-rose-600 dark:text-rose-400 font-sans font-semibold">{staff.roles[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500 flex items-center gap-4">
        <span>CityHaven Systems v2.4</span>
        <span>•</span>
        <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-300 underline">
          Return to Customer Site
        </Link>
      </div>
    </div>
  );
}
