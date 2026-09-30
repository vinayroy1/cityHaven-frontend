"use client";

import React from "react";
import { LockKeyhole, Phone } from "lucide-react";
import { ContactAccessFlow } from "./ContactAccessFlow";

type OwnerContactCardProps = {
  propertyId: number | string;
  name: string;
  postedAgo: string;
};

export function OwnerContactCard({ propertyId, name, postedAgo }: OwnerContactCardProps) {
  const initial = name.trim().slice(0, 2).toUpperCase() || "CH";
  const [phone, setPhone] = React.useState<string | null>(null);
  const digits = phone?.replace(/\D/g, "") ?? "";
  const contactNumber = digits.length === 10 ? `91${digits}` : digits;
  const buttonClass = "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

  return (
    <section aria-label="Owner contact" className="w-full overflow-hidden rounded-lg border border-zinc-200 bg-white text-zinc-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white">
      <div className="p-5">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Contact owner</h2>
        <div className="mt-5 flex items-center gap-3">
          <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">{initial}</div>
          <div className="min-w-0">
            <p className="break-words text-base font-semibold text-zinc-900 dark:text-white">{name}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">Posted {postedAgo}</p>
          </div>
        </div>
        <div className="my-5 border-t border-zinc-100 dark:border-slate-800" />
        {phone ? (
          <>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Contact unlocked</p>
            <p className="mt-2 break-all text-xl font-semibold text-zinc-900 dark:text-white">+{contactNumber}</p>
            <a href={`tel:+${contactNumber}`} className={`${buttonClass} mt-5`}><Phone className="h-4 w-4" /> Call owner</a>
          </>
        ) : (
          <>
            <div className="flex items-start gap-2.5">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-slate-500" />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-slate-200">Owner contact is private</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-slate-400">Use one credit to reveal the phone number.</p>
              </div>
            </div>
            <ContactAccessFlow key={propertyId} propertyId={propertyId} onContact={setPhone} />
          </>
        )}
      </div>
    </section>
  );
}
