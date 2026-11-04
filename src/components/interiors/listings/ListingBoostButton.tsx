"use client";
/** Boost button on a dashboard listing card: pick 7 / 15 days and pay with credits, in place. */
import Link from "next/link";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { Coins, Loader2, Rocket } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBoostInteriorListingMutation, useGetMyInteriorBillingQuery } from "@/features/interiors/api";
import { contactVerifyApi } from "@/features/contactVerify/api";
import type { InteriorBoostOption } from "@/types/interior.types";
import { errorMessage } from "@/components/interiors/manage/manageApi";

export function ListingBoostButton({ profileId, boosted }: { profileId: number; boosted: boolean }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<InteriorBoostOption["key"] | null>(null);
  // Boost options and wallet balance are the same for every listing of this owner.
  const { data: billing, isFetching } = useGetMyInteriorBillingQuery(undefined, { skip: !open });
  const [boost] = useBoostInteriorListingMutation();

  const buy = async (o: InteriorBoostOption) => {
    setPending(o.key);
    try {
      await boost({ profileId, actionKey: o.key }).unwrap();
      dispatch(contactVerifyApi.util.invalidateTags(["Credits", "BillingSummary"]));
      toast.success(`Boost active for ${o.days} days. Your listing now ranks at the top.`);
      setOpen(false);
    } catch (e) {
      toast.error(errorMessage(e, "Could not start the boost. Check your credit balance."));
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
      >
        <Rocket className="h-4 w-4" /> {boosted ? "Extend boost" : "Boost"}
      </button>

      <AlertDialog open={open} onOpenChange={(o: boolean) => !pending && setOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{boosted ? "Extend your boost" : "Boost this listing"}</AlertDialogTitle>
            <AlertDialogDescription>
              Appear at the top of interior designer search and the homepage, with a Featured badge.
              {boosted ? " The new boost starts when the current one ends." : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {!billing && isFetching ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : billing ? (
            <>
              <p className="flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <Coins className="h-3.5 w-3.5" /> Balance: {billing.balance.toLocaleString("en-IN")} credits
              </p>
              <div className="grid grid-cols-2 gap-2">
                {billing.boostOptions.map((o) => {
                  const short = billing.balance < o.credits;
                  return (
                    <button
                      key={o.key}
                      type="button"
                      disabled={!!pending || short}
                      onClick={() => buy(o)}
                      className="rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-rose-400 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <span className="flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white">
                        {pending === o.key && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {o.days} days
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">{o.credits} credits</span>
                    </button>
                  );
                })}
              </div>
              {billing.boostOptions.length === 0 && <p className="text-sm text-slate-500">Boosts are currently unavailable.</p>}
              {billing.boostOptions.some((o) => billing.balance < o.credits) && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Need more credits?{" "}
                  <Link href="/pricing" className="font-semibold text-rose-600 underline">
                    Top up
                  </Link>
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-rose-600">Couldn&apos;t load boost options. Please try again.</p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!pending}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
