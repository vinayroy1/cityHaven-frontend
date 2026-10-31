"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Lock,
  ShieldCheck,
  User,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Save,
  Loader2,
} from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { PageHeader } from "../components/PageHeader";
import { useMeQuery, useChangePasswordMutation, useLogoutMutation } from "@/features/auth/api";
import { toast } from "sonner";
import { BackButton } from "@/components/common/BackButton";

const NOTIF_PREFS_KEY = "awasio:notification-preferences";

interface NotificationPreferences {
  emailLeads: boolean;
  smsVisits: boolean;
  whatsappInquiries: boolean;
  marketingUpdates: boolean;
}

export default function DashboardSettingsPage() {
  const router = useRouter();
  const { data: me, isLoading: isLoadingMe } = useMeQuery();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Notification Preferences State
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    emailLeads: true,
    smsVisits: true,
    whatsappInquiries: true,
    marketingUpdates: false,
  });
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIF_PREFS_KEY);
      if (stored) {
        setPrefs(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleTogglePref = (key: keyof NotificationPreferences) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(updated));
      setPrefsSaved(true);
      toast.success("Preferences saved");
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch {
      toast.error("Failed to save preferences");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    try {
      await changePassword({
        currentPassword: currentPassword || undefined,
        newPassword,
      }).unwrap();

      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to update password";
      setPasswordError(msg);
      toast.error(msg);
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      localStorage.clear();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      localStorage.clear();
      router.push("/login");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900 transition-colors duration-150 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <HeaderNav />
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
        <PageHeader
          tag="Account Controls"
          title="Settings & Security"
          subtitle="Manage your communication channels, change password, and control session security."
          backHref="/dashboard"
        />

        {/* Account Profile Card */}
        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white dark:bg-white dark:text-slate-900">
                {(me?.name || me?.email || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {me?.name || "Awasio Member"}
                  </h2>
                  {me?.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {me?.email || me?.mobileNumber || "Registered User"}
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/profile"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <User className="h-3.5 w-3.5" />
              <span>Edit Full Profile</span>
            </Link>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Notification Channels
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Control how Awasio reaches you for inquiries, visit tours, and status changes
                </p>
              </div>
            </div>

            {prefsSaved && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-fade-in">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved
              </span>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <label
              onClick={() => handleTogglePref("emailLeads")}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 cursor-pointer transition hover:bg-slate-100/70"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Email alerts for hot leads & phone unlocks
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Receive instant email summaries when a buyer unlocks your contact details
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.emailLeads}
                onChange={() => {}}
                className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer"
              />
            </label>

            <label
              onClick={() => handleTogglePref("smsVisits")}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 cursor-pointer transition hover:bg-slate-100/70"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  SMS alerts for scheduled walkthrough visits
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Receive text notifications when a prospective tenant books a site visit slot
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.smsVisits}
                onChange={() => {}}
                className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer"
              />
            </label>

            <label
              onClick={() => handleTogglePref("whatsappInquiries")}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 cursor-pointer transition hover:bg-slate-100/70"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  WhatsApp direct messaging updates
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Get high-priority booking reminders and verification updates via WhatsApp
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.whatsappInquiries}
                onChange={() => {}}
                className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="space-y-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Change Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your login credentials to keep your account secure
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
            {passwordError && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Password (leave blank if setting for the first time)
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none transition focus:border-rose-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none transition focus:border-rose-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none transition focus:border-rose-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword || !newPassword}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Session Controls */}
        <div className="flex items-center justify-between rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Session</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign out from this device to end your active session
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 shadow-xs transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </main>
  );
}
