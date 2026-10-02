import React from "react";
import Link from "next/link";
import { ArrowLeft, UserCircle2, Mail, Phone, ShieldCheck, Bell } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { PageHeader } from "../components/PageHeader";

export default function DashboardProfilePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 transition-colors duration-150">
      <HeaderNav />
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
        <PageHeader
          tag="Account"
          title="My Profile"
          subtitle="Manage your personal details, KYC status, and notification preferences."
          backHref="/dashboard"
        />

        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <UserCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Personal Account</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage credentials and authentication</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>KYC Status</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Verified Member</p>
              <Link href="/dashboard/kyc" className="mt-2 inline-block text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline">
                View KYC details →
              </Link>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-950 dark:bg-rose-950/20">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                <UserCircle2 className="h-4 w-4 text-rose-600" />
                <span>Advisor & RERA</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Agent Verification</p>
              <Link href="/dashboard/advisor-profile" className="mt-2 inline-block text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline">
                Manage advisor profile →
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Bell className="h-4 w-4 text-amber-500" />
                <span>Alerts & Notifications</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Instant SMS & Email</p>
              <Link href="/dashboard/settings" className="mt-2 inline-block text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline">
                Manage settings →
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
