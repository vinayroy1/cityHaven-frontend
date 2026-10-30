"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail, ShieldCheck, Loader2, RefreshCw, AlertCircle, Phone, ArrowLeft } from "lucide-react";

export interface ProfileUpdateOtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetEmail: string;
  isEmailChanging: boolean;
  isMobileChanging: boolean;
  newEmail?: string;
  newMobile?: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  isVerifying: boolean;
  error?: string | null;
}

export function ProfileUpdateOtpDialog({
  open,
  onOpenChange,
  targetEmail,
  isEmailChanging,
  isMobileChanging,
  newEmail,
  newMobile,
  onVerify,
  onResend,
  isVerifying,
  error: initialError,
}: ProfileUpdateOtpDialogProps) {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Timer for resend countdown
  useEffect(() => {
    if (!open) {
      setOtp("");
      setCountdown(60);
      setCanResend(false);
      setLocalError(null);
      return;
    }

    setCountdown(60);
    setCanResend(false);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, targetEmail]);

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setLocalError(null);
    try {
      await onResend();
      setCountdown(60);
      setCanResend(false);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setLocalError(err?.data?.message || err?.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setLocalError("Please enter the complete 6-digit verification code");
      return;
    }
    setLocalError(null);
    try {
      await onVerify(otp);
    } catch (err: any) {
      setLocalError(err?.data?.message || err?.message || "Verification failed");
    }
  };

  const errorMessage = localError || initialError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Top Gradient Banner */}
        <div className="bg-gradient-to-br from-rose-600 via-rose-700 to-amber-600 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />

          <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner mb-3">
            <Mail className="h-7 w-7 text-white" />
          </div>

          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-extrabold text-white">
              Verify Security Code
            </DialogTitle>
            <DialogDescription className="text-xs text-rose-100 mt-1 max-w-sm mx-auto">
              {isEmailChanging && isMobileChanging ? (
                <>To update your email and mobile number, enter the 6-digit code sent to</>
              ) : isEmailChanging ? (
                <>To verify your new email address, enter the 6-digit code sent to</>
              ) : (
                <>To authorize updating your mobile number, enter the 6-digit code sent to</>
              )}
            </DialogDescription>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 text-xs font-mono font-bold text-white/95 backdrop-blur-xs mx-auto border border-white/15">
              <span>{targetEmail}</span>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Changed info badge summary */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40 space-y-1.5">
            {isEmailChanging && newEmail && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                  <span>New Email:</span>
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">{newEmail}</span>
              </div>
            )}
            {isMobileChanging && newMobile && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>New Mobile:</span>
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">+91 {newMobile}</span>
              </div>
            )}
          </div>

          {/* OTP Input */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Enter 6-Digit Email OTP
            </label>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                if (localError) setLocalError(null);
              }}
              autoFocus
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} className="h-12 w-11 rounded-xl text-lg font-bold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                <InputOTPSlot index={1} className="h-12 w-11 rounded-xl text-lg font-bold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                <InputOTPSlot index={2} className="h-12 w-11 rounded-xl text-lg font-bold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                <InputOTPSlot index={3} className="h-12 w-11 rounded-xl text-lg font-bold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                <InputOTPSlot index={4} className="h-12 w-11 rounded-xl text-lg font-bold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                <InputOTPSlot index={5} className="h-12 w-11 rounded-xl text-lg font-bold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Resend Link & Timer */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 dark:text-slate-400">Didn't receive the code?</span>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 inline-flex items-center gap-1 transition"
              >
                {resending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Resending...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Resend Code</span>
                  </>
                )}
              </button>
            ) : (
              <span className="font-semibold text-slate-400 dark:text-slate-500">
                Resend in <span className="font-mono text-slate-700 dark:text-slate-300">{countdown}s</span>
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isVerifying}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={otp.length !== 6 || isVerifying}
              className="flex-[2] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 hover:from-rose-700 hover:to-rose-800 disabled:opacity-50 dark:shadow-none transition"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying & Saving...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verify & Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

