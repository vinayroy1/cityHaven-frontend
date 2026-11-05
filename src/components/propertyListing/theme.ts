// Shared styling tokens for the property-listing flow, aligned with the
// Awasio brand system (rose-600 actions, rose/amber accents, rounded-2xl cards).

export const panel =
  "rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95";

export const sectionCard = "rounded-2xl border border-slate-200 bg-white/80 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/80";

export const inputBase =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-rose-400 dark:focus:ring-rose-900/30";

export const fieldLabel = "text-sm font-medium text-slate-800 dark:text-slate-200";
export const helpText = "text-xs text-slate-500 dark:text-slate-400";
export const errorText = "text-xs font-medium text-rose-600 dark:text-rose-400";

export const chip = {
  base: "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition",
  active: "border-rose-600 bg-rose-600 text-white shadow-xs dark:border-rose-500 dark:bg-rose-600 dark:text-white",
  idle: "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800",
  disabled: "cursor-not-allowed opacity-40",
};

export const pageBg =
  "relative min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 transition-colors duration-150";

