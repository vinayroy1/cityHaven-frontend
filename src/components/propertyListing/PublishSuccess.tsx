"use client";
/** Shown after an owner publishes a new listing: view it, share it on WhatsApp, boost it. */
import Link from "next/link";
import { CheckCircle2, Clock, Eye, LayoutDashboard, Share2 } from "lucide-react";
import { CreditBoostButton } from "@/components/billing/CreditBoostButton";
import { cn } from "@/components/ui/utils";
import { panel } from "./theme";

export type PublishedListing = {
  id: number;
  slug?: string | null;
  status?: string | null;
  title?: string | null;
  price?: string | number | null;
  location?: string | null;
  propertyType?: string | null;
  imageUrl?: string | null;
};

export function PublishSuccess({ listing, onPostAnother }: { listing: PublishedListing; onPostAnother: () => void }) {
  const live = listing.status === "ACTIVE";
  const path = `/properties/${listing.slug || listing.id}`;
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : `https://awasio.com${path}`;
  const shareText = `🏠 *${listing.title || "Check out this property"}* on Awasio – zero brokerage direct owner:\n🔗 ${url}`;

  return (
    <div className={cn(panel, "mx-auto max-w-xl p-6 text-center sm:p-8")} data-testid="publish-success">
      <div
        className={cn(
          "mx-auto flex h-14 w-14 items-center justify-center rounded-full",
          live ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600",
        )}
      >
        {live ? <CheckCircle2 className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
      </div>
      <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
        {live ? "Your listing is live! 🎉" : "Listing submitted for review"}
      </h2>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
        {live
          ? "Tenants and buyers can now find it. Share it to get your first enquiries faster."
          : "Our team will check it shortly. It goes live as soon as it's approved – we'll notify you."}
      </p>

      <div className="mt-6 grid gap-2.5">
        {live && (
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            <Share2 className="h-4 w-4" /> Share on WhatsApp
          </a>
        )}
        {live && (
          <Link
            href={path}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <Eye className="h-4 w-4" /> View my listing
          </Link>
        )}
        {live && (
          <div className="flex flex-col items-center gap-1 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <span>Want 5× more views? Boost it to the top of local search.</span>
            <CreditBoostButton targetType="PROPERTY" targetId={listing.id} />
          </div>
        )}
        <Link
          href="/dashboard/properties"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <LayoutDashboard className="h-4 w-4" /> Go to my listings
        </Link>
        <button type="button" onClick={onPostAnother} className="text-xs font-semibold text-rose-600 hover:underline">
          Post another property
        </button>
      </div>
    </div>
  );
}
