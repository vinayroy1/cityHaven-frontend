"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Sparkles, User, MapPin, HeartHandshake, Loader2, ShieldCheck, Check } from "lucide-react";
import { useExpressFlatmateInterestMutation } from "@/features/flatmates/api";
import { useRouter } from "next/navigation";
import { APP_CONFIG } from "@/constants/app-config";
import type { FlatmateListing } from "@/types/flatmate.types";

interface FlatmateInterestModalProps {
  listing: FlatmateListing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const INTRO_SUGGESTIONS = [
  { label: "Introduce yourself", text: "Hi! I loved your listing. I'm a quiet working professional looking to move in soon." },
  { label: "Mention compatibility", text: "Hey there! We seem to have a great lifestyle match. Would love to connect and discuss details." },
  { label: "Ask availability", text: "Hi! Is this room still available? I would like to schedule a quick video call or visit." },
];

export function FlatmateInterestModal({
  listing,
  isOpen,
  onClose,
  onSuccess,
}: FlatmateInterestModalProps) {
  const [message, setMessage] = useState("");
  const router = useRouter();
  const [expressInterest, { isLoading }] = useExpressFlatmateInterestMutation();

  if (!listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY)) {
      const returnTo = `/flatmates/${listing.slug}`;
      router.push(`/login?redirect=${encodeURIComponent(returnTo)}`);
      return;
    }
    try {
      await expressInterest({
        listingId: listing.id,
        message: message.trim() || undefined,
      }).unwrap();

      toast.success("Interest sent successfully!", {
        description: `Your message was delivered to ${listing.profile?.displayName || "the poster"}.`,
      });
      setMessage("");
      onClose();
      onSuccess?.();
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.message || "Failed to send interest. Please make sure you are logged in.";
      toast.error(errMsg);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-3xl border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900 sm:max-h-[min(90dvh,760px)] sm:max-w-lg">
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-slate-100 px-5 pb-4 pt-5 pr-12 dark:border-slate-800 sm:px-6 sm:pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold w-fit">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Private connection request</span>
          </div>
          <DialogTitle className="text-xl font-bold leading-tight text-slate-900 dark:text-white">
            Connect with {listing.profile?.displayName || "Flatmate"}
          </DialogTitle>
          <DialogDescription className="line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
            {listing.title} • {listing.locality || listing.cityName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 font-bold text-white shadow-inner">
                {listing.profile?.profilePhoto ? <img src={listing.profile.profilePhoto} alt={listing.profile.displayName || "Roomie"} className="h-full w-full object-cover" /> : <User className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{listing.profile?.displayName || "Roomie"}</div>
                <div className="flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{listing.locality ? `${listing.locality}, ${listing.cityName}` : listing.cityName}</span></div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  {listing.mode === "HAVE_ROOM"
                    ? listing.rent != null ? `₹${listing.rent.toLocaleString("en-IN")}/mo` : "Rent on request"
                    : listing.budgetMax != null ? `Up to ₹${listing.budgetMax.toLocaleString("en-IN")}` : "Flexible budget"}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p><strong>Stay safe:</strong> Contact details remain private until acceptance. Verify the room and agreement before transferring money.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between gap-3">
                <label htmlFor="flatmate-introduction" className="text-xs font-bold text-slate-800 dark:text-slate-200">Add a short introduction <span className="font-normal text-slate-400">(optional)</span></label>
                <span className="text-[10px] tabular-nums text-slate-400">{message.length}/500</span>
              </div>
              <Textarea id="flatmate-introduction" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your occupation, move-in date, and what makes you a good flatmate…" rows={4} maxLength={500} className="min-h-28 resize-none rounded-2xl border-slate-200 text-sm focus-visible:ring-rose-500 dark:border-slate-700" />
              <p className="text-[10px] text-slate-400">A personal introduction usually gets faster replies.</p>
            </div>

            <div className="space-y-2">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400"><Sparkles className="h-3 w-3 text-amber-500" /> Use a quick starter</span>
              <div className="grid gap-2 sm:grid-cols-3">
                {INTRO_SUGGESTIONS.map((suggestion) => {
                  const selected = message === suggestion.text;
                  return (
                    <button key={suggestion.label} type="button" onClick={() => setMessage(suggestion.text)} className={`rounded-xl border p-2.5 text-left transition ${selected ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
                      <span className="flex items-center gap-1 text-[11px] font-bold">{selected && <Check className="h-3 w-3" />}{suggestion.label}</span>
                      <span className="mt-1 line-clamp-2 block text-[10px] leading-4 opacity-80">{suggestion.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:justify-between sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="h-11 rounded-xl border-slate-200 dark:border-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 rounded-xl bg-rose-600 px-6 font-semibold text-white shadow-md shadow-rose-500/20 hover:bg-rose-700 sm:min-w-40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Interest
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
