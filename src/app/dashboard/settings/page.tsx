import React from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Lock, ShieldCheck, User } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { PageHeader } from "../components/PageHeader";

export default function DashboardSettingsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 transition-colors duration-150">
      <HeaderNav />
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
        <PageHeader
          tag="Preferences"
          title="Account Settings"
          subtitle="Notification preferences, security, and account controls."
          backHref="/dashboard"
        />

        <div className="space-y-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage how you receive alerts and property enquiry notifications</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Email alerts for buyer leads</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Get notified when a buyer leaves an enquiry on your listing</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600" />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">SMS updates for visit bookings</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Receive instant SMS when an in-person tour is requested</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600" />
            </label>
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
