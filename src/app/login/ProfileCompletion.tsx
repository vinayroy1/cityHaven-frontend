"use client";

import React from "react";
import { User, Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

type Props = {
  name: string;
  email: string;
  onChangeName: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
  message?: string | null;
};

export function ProfileCompletion({
  name,
  email,
  onChangeName,
  onChangeEmail,
  onSubmit,
  isSaving,
  message,
}: Props) {
  const isFormValid = name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <div>
        <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Full Name
        </label>
        <div className="relative flex items-center">
          <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            id="fullName"
            name="name"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400"
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div>
        <label htmlFor="emailAddress" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Email Address
        </label>
        <div className="relative flex items-center">
          <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            id="emailAddress"
            name="email"
            type="email"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400"
            placeholder="rahul.sharma@example.com"
            value={email}
            onChange={(e) => onChangeEmail(e.target.value)}
          />
        </div>
      </div>

      {message && (
        <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving || !isFormValid}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving Profile...
          </>
        ) : (
          <>
            <span>Complete & Continue</span>
            <CheckCircle2 className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}

