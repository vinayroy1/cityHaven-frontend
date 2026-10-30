"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  RotateCcw,
  Sparkles,
  Zap,
  Building2,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";
import { useMeQuery, useUpdateProfileMutation, useRequestProfileOtpMutation } from "@/features/auth/api";
import { APP_CONFIG } from "@/constants/app-config";
import { toast } from "sonner";
import { ProfileAvatarUploader } from "@/components/profile/ProfileAvatarUploader";
import { ProfileUpdateOtpDialog } from "@/components/profile/ProfileUpdateOtpDialog";

export function ProfileClient() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setToken(localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY));
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY));
    };
    handleAuthChange();
    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const { data: me, isLoading: isMeLoading, refetch: refetchMe } = useMeQuery(undefined, { skip: !token });

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestProfileOtpMutation();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Initial State Reference
  const [initialState, setInitialState] = useState<{
    name: string;
    email: string;
    mobileNumber: string;
    address: string;
    profileImage: string | null;
  }>({
    name: "",
    email: "",
    mobileNumber: "",
    address: "",
    profileImage: null,
  });

  // OTP Dialog State
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Sync state from server me query
  useEffect(() => {
    if (!me) return;
    const initial = {
      name: me.name || "",
      email: me.email || "",
      mobileNumber: me.mobileNumber?.replace(/\D/g, "").slice(-10) || "",
      address: me.address || "",
      profileImage: me.profileImage || null,
    };
    setName(initial.name);
    setEmail(initial.email);
    setMobileNumber(initial.mobileNumber);
    setAddress(initial.address);
    setProfileImage(initial.profileImage);
    setInitialState(initial);
  }, [me]);

  // Clean values for diffing
  const cleanEmail = email.trim().toLowerCase();
  const cleanMobile = mobileNumber.replace(/\D/g, "").slice(0, 10);
  const initialEmail = initialState.email.trim().toLowerCase();
  const initialMobile = initialState.mobileNumber.replace(/\D/g, "").slice(0, 10);

  const isEmailChanging = Boolean(cleanEmail && cleanEmail !== initialEmail);
  const isMobileChanging = Boolean(cleanMobile && cleanMobile !== initialMobile);
  const isGeneralChanging = Boolean(
    name.trim() !== initialState.name.trim() ||
    (address || "").trim() !== (initialState.address || "").trim() ||
    profileImage !== initialState.profileImage
  );

  const hasUnsavedChanges = isEmailChanging || isMobileChanging || isGeneralChanging;
  const requiresOtp = isEmailChanging || isMobileChanging;

  // Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = !email.trim() || emailRegex.test(cleanEmail);
  const isMobileValid = cleanMobile.length === 10;

  const handleDiscard = () => {
    setName(initialState.name);
    setEmail(initialState.email);
    setMobileNumber(initialState.mobileNumber);
    setAddress(initialState.address);
    setProfileImage(initialState.profileImage);
    toast.info("Changes reverted");
  };

  const syncLocalStorageAndDispatch = (updatedUser: any) => {
    if (typeof window === "undefined") return;
    try {
      const existingRaw = localStorage.getItem(APP_CONFIG.AUTH.USER_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      const merged = { ...existing, ...updatedUser };
      localStorage.setItem(APP_CONFIG.AUTH.USER_KEY, JSON.stringify(merged));
      window.dispatchEvent(new Event("auth-change"));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      // ignore
    }
  };

  // Instant avatar updater & syncer
  const handleAvatarChange = async (url: string | null) => {
    setProfileImage(url);
    try {
      const res = await updateProfile({
        name: name.trim() || initialState.name || me?.name || "User",
        profileImage: url,
        address: address.trim() || initialState.address || me?.address || null,
      }).unwrap();

      const user = res.data || res.user;
      if (user) {
        setInitialState((prev) => ({
          ...prev,
          profileImage: url,
        }));
        syncLocalStorageAndDispatch(user);
      }
      void refetchMe();
      toast.success(url ? "Profile photo updated!" : "Profile photo removed");
    } catch (err: any) {
      console.error("Auto-save avatar error:", err);
      toast.error(err?.data?.message || err?.message || "Failed to update profile photo");
    }
  };

  // Step 1: Save handler triggered by "Save Changes"
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (email.trim() && !isEmailValid) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!isMobileValid) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    // Case A: If Email or Mobile is changing, trigger Email OTP request!
    if (requiresOtp) {
      try {
        const otpRes = await requestOtp({
          newEmail: isEmailChanging ? cleanEmail : undefined,
          newMobileNumber: isMobileChanging ? cleanMobile : undefined,
        }).unwrap();

        setTargetEmail(otpRes.targetEmail || cleanEmail || initialState.email);
        setOtpError(null);
        setOtpDialogOpen(true);
        toast.info(otpRes.message || `Verification code sent to ${otpRes.targetEmail}`);
      } catch (err: any) {
        toast.error(err?.data?.message || err?.message || "Failed to send verification code");
      }
      return;
    }

    // Case B: No sensitive fields changed (only Name, Avatar, Address)
    try {
      const res = await updateProfile({
        name: name.trim(),
        profileImage,
        address: address.trim() || null,
      }).unwrap();

      const user = res.data || res.user;
      if (user) {
        setInitialState({
          name: user.name || name.trim(),
          email: user.email || email,
          mobileNumber: user.mobileNumber?.replace(/\D/g, "").slice(-10) || mobileNumber,
          address: user.address || address.trim(),
          profileImage: user.profileImage !== undefined ? user.profileImage : profileImage,
        });
        syncLocalStorageAndDispatch(user);
      }
      void refetchMe();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update profile");
    }
  };

  // Step 2: Handle OTP Verification and Final Submission
  const handleVerifyOtp = async (otpCode: string) => {
    setIsVerifyingOtp(true);
    setOtpError(null);
    try {
      const res = await updateProfile({
        name: name.trim(),
        profileImage,
        address: address.trim() || null,
        email: isEmailChanging ? cleanEmail : undefined,
        mobileNumber: isMobileChanging ? cleanMobile : undefined,
        otp: otpCode,
      }).unwrap();

      const user = res.data || res.user;
      if (user) {
        setInitialState({
          name: user.name || name.trim(),
          email: user.email || email,
          mobileNumber: user.mobileNumber?.replace(/\D/g, "").slice(-10) || mobileNumber,
          address: user.address || address.trim(),
          profileImage: user.profileImage !== undefined ? user.profileImage : profileImage,
        });
        syncLocalStorageAndDispatch(user);
      }
      void refetchMe();

      setOtpDialogOpen(false);
      toast.success("Profile and contact details updated successfully!");
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Invalid or expired verification code";
      setOtpError(msg);
      throw err;
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Step 3: Resend OTP
  const handleResendOtp = async () => {
    const otpRes = await requestOtp({
      newEmail: isEmailChanging ? cleanEmail : undefined,
      newMobileNumber: isMobileChanging ? cleanMobile : undefined,
    }).unwrap();

    toast.info(otpRes.message || "New verification code sent");
  };

  if (!mounted || (isMeLoading && !me)) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800" />
        <div className="h-64 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800" />
        <div className="h-64 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Avatar & Quick Info */}
        <div className="rounded-3xl border border-white/70 bg-white/90 p-5 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur">
          <ProfileAvatarUploader
            currentImageUrl={profileImage}
            userName={name || me?.name}
            onImageChange={handleAvatarChange}
            disabled={isUpdating}
          />

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{me?.isVerified ? "Verified Account" : "Member"}</span>
            </span>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900 transition"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>{me?.credits ?? 0} Credits Available</span>
            </Link>

            {me?.kycVerified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>KYC Verified</span>
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Personal Details */}
        <div className="rounded-3xl border border-white/70 bg-white/90 p-5 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Personal Credentials</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Keep your contact details up to date for buyer leads, site visit reminders, and owner notifications.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                <span>Full Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Contact Number */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Contact Number</span>
                  <span className="text-rose-500">*</span>
                </label>
                {isMobileChanging && (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
                    OTP Required
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile number"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-3.5 py-2.5 text-sm font-semibold font-mono text-slate-900 placeholder-slate-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Updating contact number requires OTP verification sent to your registered email.
              </p>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Email Address</span>
                </label>
                {isEmailChanging && (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
                    OTP Required
                  </span>
                )}
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Updating your email address sends a verification code to the new email address.
              </p>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>City / Address</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Indiranagar, Bengaluru"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Used to tailor search recommendations and city-level advisor services.
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
            <Info className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900 dark:text-white">Account Security Verification</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Changes to contact credentials (email and mobile number) require email OTP verification. Your name, avatar image, and location can be updated directly without verification.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {hasUnsavedChanges ? (
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                {requiresOtp ? "Unsaved changes: Email OTP required" : "Unsaved changes"}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                All profile details up to date
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleDiscard}
                disabled={isUpdating || isRequestingOtp}
                className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Discard</span>
              </button>
            )}

            <button
              type="submit"
              disabled={!hasUnsavedChanges || isUpdating || isRequestingOtp}
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 hover:from-rose-700 hover:to-rose-800 disabled:opacity-50 dark:shadow-none transition"
            >
              {isUpdating || isRequestingOtp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isRequestingOtp ? "Sending Code..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{requiresOtp ? "Verify & Save Changes" : "Save Changes"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* OTP Verification Modal */}
      <ProfileUpdateOtpDialog
        open={otpDialogOpen}
        onOpenChange={setOtpDialogOpen}
        targetEmail={targetEmail}
        isEmailChanging={isEmailChanging}
        isMobileChanging={isMobileChanging}
        newEmail={cleanEmail}
        newMobile={cleanMobile}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        isVerifying={isVerifyingOtp}
        error={otpError}
      />
    </div>
  );
}
