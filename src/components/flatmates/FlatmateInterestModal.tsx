"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Sparkles, User, MapPin, HeartHandshake, Loader2 } from "lucide-react";
import { useExpressFlatmateInterestMutation } from "@/features/flatmates/api";
import type { FlatmateListing } from "@/types/flatmate.types";

interface FlatmateInterestModalProps {
  listing: FlatmateListing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const INTRO_SUGGESTIONS = [
  "Hi! I loved your listing. I'm a quiet working professional looking to move in soon.",
  "Hey there! We seem to have a great lifestyle match. Would love to connect and discuss details.",
  "Hi! Is this room still available? I would like to schedule a quick video call or visit.",
];

export function FlatmateInterestModal({
  listing,
  isOpen,
  onClose,
  onSuccess,
}: FlatmateInterestModalProps) {
  const [message, setMessage] = useState("");
  const [expressInterest, { isLoading }] = useExpressFlatmateInterestMutation();

  if (!listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <DialogHeader className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold w-fit">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Connect with Roomie</span>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Connect with {listing.profile?.displayName || "Flatmate"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
            {listing.title} • {listing.locality || listing.cityName}
          </DialogDescription>
        </DialogHeader>

        {/* Listing preview summary */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold shrink-0 shadow-inner">
            {listing.profile?.profilePhoto ? (
              <img
                src={listing.profile.profilePhoto}
                alt={listing.profile.displayName || "Roomie"}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {listing.profile?.displayName || "Roomie"}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{listing.locality ? `${listing.locality}, ${listing.cityName}` : listing.cityName}</span>
            </div>
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
              {listing.mode === "HAVE_ROOM"
                ? `Rent: ₹${(listing.rent ?? 0).toLocaleString("en-IN")}/mo`
                : `Budget: ₹${(listing.budgetMax ?? 0).toLocaleString("en-IN")}/mo`}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Introduce yourself (optional, but gets 3x faster replies!)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell them a little about yourself, your move-in timeline, occupation..."
              rows={4}
              maxLength={500}
              className="resize-none rounded-2xl border-slate-200 dark:border-slate-800 focus-visible:ring-rose-500 text-sm"
            />
            <div className="text-[11px] text-right text-slate-400">
              {message.length} / 500
            </div>
          </div>

          {/* Quick intro chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Quick suggestions:
            </span>
            <div className="space-y-1">
              {INTRO_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(suggestion)}
                  className="w-full text-left text-xs p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition line-clamp-1"
                >
                  &ldquo;{suggestion}&rdquo;
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2 sm:justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-full border-slate-200 dark:border-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md shadow-rose-500/20 px-6"
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
