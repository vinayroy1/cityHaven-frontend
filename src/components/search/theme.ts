/**
 * Search UI design tokens. Flat, warm, on-brand — slate neutrals, rose accent,
 * one dark primary action. Consistent with src/components/propertyListing.
 */

// surfaces
export const card = "rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";
export const sheetSurface = "rounded-t-[20px] bg-white shadow-[0_-8px_40px_-12px_rgba(15,23,42,0.25)]";

// text
export const sectionLabel = "text-[13px] font-semibold uppercase tracking-[0.04em] text-slate-500";
export const heading = "text-[15px] font-semibold text-slate-900";
export const muted = "text-xs text-slate-400";

// buttons
export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-md bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50";
export const ghostButton =
  "inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50";
export const linkButton = "text-[13px] font-semibold text-rose-600 transition hover:text-rose-700";

// chips (see Chip.tsx for the component)
export const chipShell =
  "inline-flex shrink-0 select-none items-center gap-1.5 rounded-xl border text-sm font-medium transition";
export const chipIdle = "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50";
export const chipSelected = "border-slate-900 bg-slate-900 text-white";
export const chipSize = { sm: "px-3 py-1.5 text-[13px]", md: "px-3.5 py-2 text-sm" };

// form controls
export const selectTrigger =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200";
