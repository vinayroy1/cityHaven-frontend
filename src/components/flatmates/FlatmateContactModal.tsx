"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  PhoneCall,
  Mail,
  MessageCircle,
  ShieldCheck,
  User,
  MapPin,
  Sparkles,
  Lock,
  Loader2,
  Copy,
  Check,
  Coins,
  ArrowRight,
  LogIn,
} from "lucide-react";
import {
  useUnlockFlatmateContactMutation,
  useGetUnlockedFlatmateContactQuery,
} from "@/features/flatmates/api";
import { useGetBillingSummaryQuery } from "@/features/contactVerify/api";
import { APP_CONFIG } from "@/constants/app-config";
import type { FlatmateListing } from "@/types/flatmate.types";
import { useModalBackHandler } from "@/lib/navigation/useModalBackHandler";

interface FlatmateContactModalProps {
  listing: FlatmateListing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (contact: { name: string; mobileNumber?: string | null; email?: string | null }) => void;
}

const CONTACT_UNLOCK_CREDIT_COST = 5;

export function FlatmateContactModal(props: FlatmateContactModalProps) {
  if (!props.listing) return null;
  return <FlatmateContactModalContent {...props} listing={props.listing} />;
}

function FlatmateContactModalContent({
  listing,
  isOpen,
  onClose,
  onSuccess,
}: FlatmateContactModalProps & { listing: FlatmateListing }) {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(() => {
    if (typeof window !== "undefined") {
      return Boolean(window.localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY));
    }
    return false;
  });
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [unlockedContact, setUnlockedContact] = useState<{
    name: string;
    mobileNumber?: string | null;
    email?: string | null;
  } | null>(null);

  // CRITICAL: pushHistoryState MUST be false to prevent popstate back-navigation loops
  // which causes the modal to blink and immediately close in Next.js App Router.
  useModalBackHandler({
    isOpen,
    onClose,
    pushHistoryState: false,
    name: "FlatmateContactModal",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasToken(Boolean(window.localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY)));
    }
  }, [isOpen]);

  // Billing summary to get user wallet balance
  const { data: billingData, refetch: refetchBilling } = useGetBillingSummaryQuery(
    { target: "USER" },
    { skip: !isOpen || !hasToken }
  );
  const userCredits = billingData?.data?.credits ?? 0;

  // Check if contact is already unlocked
  const { data: unlockedQueryData, isLoading: isCheckingUnlocked } = useGetUnlockedFlatmateContactQuery(
    listing.id,
    { skip: !isOpen || !listing.id || !hasToken }
  );

  const [unlockContact, { isLoading: isUnlocking }] = useUnlockFlatmateContactMutation();

  useEffect(() => {
    if (unlockedQueryData?.data?.unlocked) {
      setUnlockedContact({
        name: unlockedQueryData.data.name || listing.profile?.displayName || "Flatmate",
        mobileNumber: unlockedQueryData.data.mobileNumber ?? null,
        email: unlockedQueryData.data.email ?? null,
      });
    } else if (listing.contact?.mobileNumber || listing.contact?.email) {
      setUnlockedContact({
        name: listing.contact.name || listing.profile?.displayName || "Flatmate",
        mobileNumber: listing.contact.mobileNumber ?? null,
        email: listing.contact.email ?? null,
      });
    } else {
      setUnlockedContact(null);
    }
  }, [unlockedQueryData, listing]);

  const profile = listing.profile;
  const posterName = unlockedContact?.name || profile?.displayName || "Flatmate";

  const handleUnlock = async () => {
    if (!hasToken) {
      const returnTo = `/flatmates/${listing.slug}`;
      router.push(`/login?redirect=${encodeURIComponent(returnTo)}`);
      return;
    }

    if (userCredits < CONTACT_UNLOCK_CREDIT_COST) {
      toast.error(`Insufficient credits. You need ${CONTACT_UNLOCK_CREDIT_COST} credits to unlock contact details.`);
      return;
    }

    try {
      const res = await unlockContact(listing.id).unwrap();
      const contactInfo = {
        name: res.data?.name || posterName,
        mobileNumber: res.data?.mobileNumber ?? null,
        email: res.data?.email ?? null,
      };
      setUnlockedContact(contactInfo);
      void refetchBilling();

      if (res.alreadyUnlocked) {
        toast.info("Contact already unlocked! Viewing saved contact details.");
      } else {
        toast.success(`Contact unlocked! ${CONTACT_UNLOCK_CREDIT_COST} credits deducted from wallet.`);
      }

      onSuccess?.(contactInfo);
    } catch (err: any) {
      const errMsg =
        err?.data?.message || err?.message || "Failed to unlock contact. Please check your credit balance.";
      toast.error(errMsg);
    }
  };

  const copyToClipboard = (text: string, type: "phone" | "email") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === "phone") {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
    toast.success(`Copied ${type === "phone" ? "phone number" : "email address"} to clipboard!`);
  };

  const cleanPhone = (phone?: string | null) => {
    if (!phone) return "";
    return phone.replace(/[^0-9]/g, "").slice(-10);
  };

  const phoneForCall = cleanPhone(unlockedContact?.mobileNumber);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-3xl border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900 sm:max-h-[min(90dvh,720px)] sm:max-w-md shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {/* Header Gradient */}
        <div className="relative bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 px-5 py-5 text-white shrink-0">
          <DialogHeader className="text-left pr-8">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white shadow-xs">
              {unlockedContact ? <PhoneCall className="h-5 w-5" /> : <Coins className="h-5 w-5" />}
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-white">
              {unlockedContact ? "Verified Contact Details" : "Unlock Direct Contact"}
            </DialogTitle>
            <DialogDescription className="text-rose-100 text-xs sm:text-sm">
              {unlockedContact
                ? `Direct connection with ${posterName} • Zero Brokerage`
                : `Connect directly with ${posterName} without brokerage`}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5">
          {/* Poster Profile Header Card */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60 shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 font-bold text-white shadow-inner">
              {profile?.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={posterName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-6 w-6" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                  {posterName}
                </span>
                {profile?.isIdentityVerified && (
                  <span title="Verified Member">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {listing.locality ? `${listing.locality}, ${listing.cityName}` : listing.cityName}
                </span>
              </div>
              <p className="mt-0.5 text-xs font-extrabold text-rose-600 dark:text-rose-400 truncate">
                {listing.mode === "HAVE_ROOM"
                  ? listing.rent != null
                    ? `₹${listing.rent.toLocaleString("en-IN")}/mo`
                    : "Rent on Request"
                  : listing.budgetMax != null
                  ? `Budget: Up to ₹${listing.budgetMax.toLocaleString("en-IN")}`
                  : "Flexible Budget"}
              </p>
            </div>
          </div>

          {/* STATE 0: CHECKING IF CONTACT IS ALREADY UNLOCKED */}
          {hasToken && isCheckingUnlocked ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
              <span className="text-xs text-slate-500">Checking contact access...</span>
            </div>
          ) : unlockedContact ? (
            /* STATE 1: CONTACT UNLOCKED */
            <div className="space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
              {/* Verified Unlocked Banner */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Contact Unlocked &amp; Verified
                  </span>
                </div>
                <p className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
                  You have full direct access to this flatmate. Feel free to call, WhatsApp, or email directly.
                </p>
              </div>

              {/* Phone Section */}
              {unlockedContact.mobileNumber ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Phone Number
                  </span>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                      +91 {phoneForCall || unlockedContact.mobileNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`+91${phoneForCall || unlockedContact.mobileNumber}`, "phone")}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {copiedPhone ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedPhone ? "Copied" : "Copy"}</span>
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <a
                      href={`tel:+91${phoneForCall || unlockedContact.mobileNumber}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 px-3 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>Call Now</span>
                    </a>
                    <a
                      href={`https://wa.me/91${phoneForCall || unlockedContact.mobileNumber}?text=${encodeURIComponent(
                        `Hi ${posterName}, I saw your listing "${listing.title}" on Awasio and would love to connect!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 px-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#1EBE5D] active:scale-95"
                    >
                      <MessageCircle className="h-3.5 w-3.5 fill-white stroke-none" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
                  Phone number not provided on this profile.
                </div>
              )}

              {/* Email Section */}
              {unlockedContact.email ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Email Address
                  </span>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {unlockedContact.email}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(unlockedContact.email!, "email")}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0"
                    >
                      {copiedEmail ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedEmail ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <a
                    href={`mailto:${unlockedContact.email}?subject=${encodeURIComponent(
                      `Inquiry regarding ${listing.title} on Awasio`
                    )}`}
                    className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    <span>Send Email</span>
                  </a>
                </div>
              ) : null}

              <Button
                type="button"
                onClick={onClose}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Close
              </Button>
            </div>
          ) : !hasToken ? (
            /* STATE 2: NOT LOGGED IN */
            <div className="space-y-4">
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
                  <Lock className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Sign In Required to View Contact
                  </span>
                </div>
                <p className="mt-1 text-xs text-rose-900/80 dark:text-rose-200/80 leading-relaxed">
                  Sign in or create an account to view verified contact details and connect directly with {posterName}.
                </p>
              </div>

              {/* Safety & Guarantee Notice */}
              <div className="flex gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-[11px] leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Direct verified phone &amp; email access. Zero brokerage. Contact remains unlocked permanently in your account.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-xl border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </Button>
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/flatmates/${listing.slug}`)}`}
                  className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to View</span>
                </Link>
              </div>
            </div>
          ) : (
            /* STATE 3: LOGGED IN BUT LOCKED - PROMPT FOR CREDIT DEDUCTION */
            <div className="space-y-4">
              {/* Credit Cost Box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span>Your Credit Balance:</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {userCredits.toLocaleString("en-IN")} Credits
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>Contact Unlock Cost:</span>
                  <span className="font-black text-rose-600 dark:text-rose-400">
                    -{CONTACT_UNLOCK_CREDIT_COST} Credits
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  <span>Balance After Unlock:</span>
                  <span
                    className={`font-black ${
                      userCredits >= CONTACT_UNLOCK_CREDIT_COST
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600"
                    }`}
                  >
                    {Math.max(0, userCredits - CONTACT_UNLOCK_CREDIT_COST).toLocaleString("en-IN")} Credits
                  </span>
                </div>
              </div>

              {/* Insufficient Credits Notice */}
              {userCredits < CONTACT_UNLOCK_CREDIT_COST && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                    Credits Needed
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    You need <strong>{CONTACT_UNLOCK_CREDIT_COST} credits</strong> to reveal phone and email. Packs start at just ₹49.
                  </p>
                  <Link
                    href="/pricing"
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition"
                  >
                    <span>Get Credit Packs</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}

              {/* Safety & Guarantee Notice */}
              <div className="flex gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-[11px] leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Unlocking reveals verified phone and email. Contact remains unlocked permanently in your account without recurring charges.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isUnlocking}
                  className="flex-1 h-11 rounded-xl border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </Button>

                {userCredits >= CONTACT_UNLOCK_CREDIT_COST ? (
                  <Button
                    type="button"
                    onClick={handleUnlock}
                    disabled={isUnlocking}
                    className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-200 dark:shadow-none"
                  >
                    {isUnlocking ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        Unlocking...
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 mr-1.5" />
                        Unlock ({CONTACT_UNLOCK_CREDIT_COST} Credits)
                      </>
                    )}
                  </Button>
                ) : (
                  <Link
                    href="/pricing"
                    className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center gap-1.5"
                  >
                    <Coins className="w-4 h-4" />
                    <span>Buy Credits</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
