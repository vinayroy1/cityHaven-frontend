import React from "react";
import Link from "next/link";
import { ArrowLeft, UserCircle2, Mail, Phone, ShieldCheck, Bell, Building2, Heart } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { PageHeader } from "../components/PageHeader";
import { ProfileClient } from "./ProfileClient";

export default function DashboardProfilePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-amber-50/40 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 transition-colors duration-150">
      <HeaderNav />
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
        <PageHeader
          tag="Account"
          title="Edit Profile"
          subtitle="Manage your profile image, contact number, email address, and account preferences."
          backHref="/dashboard"
        />

        {/* Interactive Profile Editor */}
        <ProfileClient />

        {/* Quick Nav Cards */}
        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Building2 className="h-4 w-4 text-rose-500" />
              <span>My Properties</span>
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Manage your active listings & enquiries
            </p>
            <Link
              href="/dashboard/properties"
              className="mt-3 inline-block text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Go to listings →
            </Link>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Heart className="h-4 w-4 text-rose-500" />
              <span>Saved Homes</span>
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Shortlisted properties & favorites
            </p>
            <Link
              href="/favorites"
              className="mt-3 inline-block text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              View favorites →
            </Link>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Bell className="h-4 w-4 text-amber-500" />
              <span>Notifications</span>
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Lead alerts & visit SMS settings
            </p>
            <Link
              href="/dashboard/settings"
              className="mt-3 inline-block text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Manage settings →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

