import React from "react";
import { MessageCircle, Phone, ShieldCheck } from "lucide-react";

type OwnerContactCardProps = {
  name: string;
  postedAgo: string;
  badge?: string;
};

export function OwnerContactCard({ name, postedAgo, badge = "Verified" }: OwnerContactCardProps) {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-slate-900 text-white shadow-lg">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-semibold">{name.slice(0, 2).toUpperCase()}</div>
        <div>
          <p className="text-sm text-white/70">Owner</p>
          <p className="text-base font-semibold">{name}</p>
          <p className="text-xs text-emerald-200">Posted {postedAgo}</p>
        </div>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">
          <ShieldCheck className="h-4 w-4" /> {badge}
        </span>
      </div>

      <div className="space-y-3 px-4 py-4">
        <label className="block text-xs uppercase tracking-wide text-white/70">Name</label>
        <input className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none" placeholder="Your name" />
        <label className="block text-xs uppercase tracking-wide text-white/70">Phone number</label>
        <div className="flex gap-2">
          <span className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white">+91</span>
          <input className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none" placeholder="98765 43210" />
        </div>
        <label className="block text-xs uppercase tracking-wide text-white/70">Message</label>
        <textarea
          className="h-20 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none"
          placeholder="I am interested in this land. Please call back."
        />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5">
            <Phone className="h-4 w-4" /> Call owner
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </button>
        </div>
        <p className="text-[11px] text-white/60">By sending an enquiry you agree to be contacted by CityHaven and the owner.</p>
      </div>
    </div>
  );
}
