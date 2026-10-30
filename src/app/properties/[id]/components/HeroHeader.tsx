"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Calendar as CalendarIcon, MapPin, Phone, Share2, Sparkles } from "lucide-react";
import { ContactAccessFlow } from "./ContactAccessFlow";

const ScheduleVisitDialog = dynamic(
  () => import("@/components/property/ScheduleVisitDialog").then((m) => m.ScheduleVisitDialog),
  { ssr: false }
);

type HeroHeaderProps = {
  propertyId: string | number;
  title: string;
  subtitle: string;
  price: string;
  priceHint: string;
  category: string;
  tags: string[];
  ownerName?: string | null;
  locality?: string | null;
  cityName?: string | null;
};

export function HeroHeader({
  propertyId,
  title,
  subtitle,
  price,
  priceHint,
  category,
  tags,
  ownerName,
  locality,
  cityName,
}: HeroHeaderProps) {
  const [shareStatus, setShareStatus] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  useEffect(() => {
    const handleUnlocked = (e: any) => {
      if (String(e.detail?.propertyId) === String(propertyId) && e.detail?.phone) {
        setPhone(e.detail.phone);
      }
    };
    window.addEventListener("awasio:contact-unlocked", handleUnlocked);
    return () => window.removeEventListener("awasio:contact-unlocked", handleUnlocked);
  }, [propertyId]);

  const digits = phone?.replace(/\D/g, "") ?? "";
  const contactNumber = digits.length === 10 ? `91${digits}` : digits;

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus("Link copied");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setShareStatus("Could not share link");
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{category}</p>
            </div>
            <h1 className="mt-2 break-words text-2xl font-semibold text-zinc-950 dark:text-white sm:text-3xl">{title}</h1>
            <p className="mt-3 flex items-start gap-2 text-sm text-zinc-600 dark:text-slate-400"><MapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <span role="status" className="text-xs text-zinc-600 dark:text-slate-400">{shareStatus}</span>
            <button type="button" onClick={share} title="Share property" aria-label="Share property" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-slate-400">Asking price</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-950 dark:text-white">{price}</span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{priceHint}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Top Quick Action Buttons: View Owner Contact & Schedule Visit */}
          <div className="flex flex-col items-start sm:items-end gap-2 sm:self-end w-full sm:w-auto">
            {phone && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-slate-600 dark:text-slate-400">Owner Contact:</span>
                <a
                  href={`tel:+${contactNumber}`}
                  className="font-mono text-sm font-bold text-emerald-700 hover:underline dark:text-emerald-400 tracking-wide"
                >
                  +{contactNumber}
                </a>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center sm:gap-2.5">
              <button
                type="button"
                onClick={() => setScheduleOpen(true)}
                className="inline-flex h-10 sm:h-11 w-full sm:w-auto items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-2 sm:px-5 text-xs sm:text-sm font-bold text-white shadow-sm shadow-rose-200 transition hover:from-rose-700 hover:to-rose-800 active:scale-[0.98] dark:shadow-none whitespace-nowrap"
              >
                <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>Schedule Visit</span>
              </button>

              {phone ? (
                <a
                  href={`tel:+${contactNumber}`}
                  className="inline-flex h-10 sm:h-11 w-full sm:w-44 items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-700 px-2 sm:px-4 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.98] whitespace-nowrap"
                >
                  <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span>Call Owner</span>
                </a>
              ) : (
                <div className="w-full sm:w-auto shrink-0">
                  <ContactAccessFlow
                    propertyId={propertyId}
                    onContact={setPhone}
                    triggerLabel="View Owner Contact"
                    triggerClassName="inline-flex h-10 sm:h-11 w-full sm:w-44 items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-700 px-1.5 sm:px-4 text-[11px] sm:text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.98] whitespace-nowrap"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ScheduleVisitDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        property={{
          id: propertyId,
          title,
          locality,
          cityName,
          price,
          ownerName: ownerName || "Property Owner",
        }}
      />
    </>
  );
}
