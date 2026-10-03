"use client";

import React from "react";
import { LockKeyhole, Phone } from "lucide-react";
import { ContactAccessFlow } from "./ContactAccessFlow";

type OwnerContactCardProps = {
  propertyId: number | string;
  name: string;
  postedAgo: string;
  title?: string | null;
  locality?: string | null;
  cityName?: string | null;
  price?: string | null;
};

import { Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { ScheduleVisitDialog } from "@/components/property/ScheduleVisitDialog";

export function OwnerContactCard({
  propertyId,
  name,
  postedAgo,
  title,
  locality,
  cityName,
  price,
}: OwnerContactCardProps) {
  const initial = name.trim().slice(0, 2).toUpperCase() || "CH";
  const [phone, setPhone] = React.useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);

  const digits = phone?.replace(/\D/g, "") ?? "";
  const contactNumber = digits.length === 10 ? `91${digits}` : digits;
  const buttonClass =
    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

  return (
    <>
      <section
        aria-label="Owner contact & site visit"
        className="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
      >
        <div className="p-5">
          {/* Primary Action 1: Schedule Visit (High Intent) */}
          <div className="mb-5 rounded-xl bg-gradient-to-tr from-rose-50 to-amber-50/50 p-3.5 border border-rose-100 dark:border-rose-900/40 dark:from-rose-950/40 dark:to-slate-900">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Direct Site Visit • Free</span>
            </div>
            <p className="mt-1 text-xs text-zinc-600 dark:text-slate-300">
              Pick a convenient date and time to inspect this property in person or via live video tour.
            </p>
            <button
              type="button"
              onClick={() => setScheduleOpen(true)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 active:scale-[0.98] dark:shadow-rose-950 sm:text-sm"
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Schedule a Free Visit</span>
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 dark:border-slate-800 pt-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
              Direct Owner Contact
            </h2>
            <span className="text-[11px] text-zinc-400">0% Brokerage</span>
          </div>

          <div className="mt-3.5 flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-sm font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
            >
              {initial}
            </div>
            <div className="min-w-0">
              <p className="break-words text-sm font-bold text-zinc-900 dark:text-white">{name}</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">Posted {postedAgo}</p>
            </div>
          </div>

          <div className="my-4 border-t border-zinc-100 dark:border-slate-800" />

          {phone ? (
            <>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Contact unlocked
              </p>
              <p className="mt-1.5 break-all text-xl font-bold text-zinc-900 dark:text-white">
                +{contactNumber}
              </p>
              <a href={`tel:+${contactNumber}`} className={`${buttonClass} mt-4`}>
                <Phone className="h-4 w-4" /> Call owner
              </a>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2.5">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-slate-500" />
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-slate-200">
                    Owner contact is private
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500 dark:text-slate-400">
                    Use your free credit or verify phone to call owner directly.
                  </p>
                </div>
              </div>
              <ContactAccessFlow key={propertyId} propertyId={propertyId} onContact={setPhone} />
            </>
          )}
        </div>
      </section>

      <ScheduleVisitDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        property={{
          id: propertyId,
          title,
          locality,
          cityName,
          price,
          ownerName: name,
        }}
      />
    </>
  );
}
