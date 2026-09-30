import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock, KeyRound } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Login</span>
          </Link>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <Lock className="h-6 w-6" />
          </div>

          <h1 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">Set New Password</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Create a strong password with at least 8 characters including numbers and symbols.
          </p>

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold outline-none transition focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-rose-400"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold outline-none transition focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-rose-400"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 hover:shadow-lg"
            >
              Update Password
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800 text-center">
            <Link href="/login" className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}
