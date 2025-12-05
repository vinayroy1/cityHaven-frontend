"use client";

import React from "react";
import { ShieldCheck, Loader2 } from "lucide-react";

type Props = {
  name: string;
  email: string;
  onChangeName: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
  message?: string | null;
};

export function ProfileCompletion({ name, email, onChangeName, onChangeEmail, onSubmit, isSaving, message }: Props) {
  return (
    <form className="mt-6 space-y-3 border-top border-slate-100 pt-5" onSubmit={onSubmit}>
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        Complete your profile
      </div>
      <div className="space-y-2">
        <input
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          placeholder="Full name"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
        />
        <input
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => onChangeEmail(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-xl border border-emerald-500 bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_38px_-24px_rgba(16,185,129,0.8)] transition hover:-translate-y-0.5 hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:opacity-60"
      >
        {isSaving ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </span>
        ) : (
          "Save & continue"
        )}
      </button>
      {message && <p className="text-xs text-rose-600">{message}</p>}
    </form>
  );
}
