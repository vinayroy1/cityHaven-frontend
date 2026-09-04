// Shared styling tokens for the property-listing flow, aligned with the
// CityHaven design language (slate-900 actions, rose/emerald accents,
// rounded cards with soft deep shadows).

export const panel =
  "rounded-[28px] border border-slate-200/70 bg-white/95 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.55)]";

export const sectionCard = "rounded-2xl border border-slate-200 bg-white/80 p-4 sm:p-5";

export const inputBase =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:opacity-50";

export const fieldLabel = "text-sm font-medium text-slate-800";
export const helpText = "text-xs text-slate-500";
export const errorText = "text-xs font-medium text-rose-600";

export const chip = {
  base: "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition",
  active: "border-slate-900 bg-slate-900 text-white shadow-sm",
  idle: "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
  disabled: "cursor-not-allowed opacity-40",
};

export const pageBg =
  "relative min-h-screen bg-gradient-to-br from-rose-50/70 via-white to-emerald-50/50";
