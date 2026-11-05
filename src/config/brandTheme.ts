/**
 * Awasio Design System & Brand Tokens (Reference Documentation & Token Catalog)
 *
 * This file serves as the design system specification and token catalog for Awasio.
 * All core application components follow these standardized design rules:
 *
 * System Rules:
 * 1. Primary colour: Rose (rose-600) for every main action ("Search", "Post", "Publish", "Contact", "Book room").
 * 2. Secondary actions: Slate (slate-900 or slate-800).
 * 3. Outlined / tertiary actions: Outlined border buttons (border-slate-200 text-slate-700).
 * 4. Semantic Accents:
 *    - Emerald: Success, "Verified", and WhatsApp only.
 *    - Amber: Credits, offers, and price highlights only.
 *    - Sky: Information notices only.
 *    - Red: Errors only.
 *    - No stray indigo, violet, or purple accents on customer-facing screens.
 * 5. Gradients: Reserved for the brand mark, "Awasio" brand word, and hero heading accent text.
 *    Banners remain plain clean neutrals or light tints (e.g. bg-rose-50).
 * 6. "NEW" badges: Curated and minimized across site.
 * 7. Shape and type scale:
 *    - Cards: rounded-2xl
 *    - Inputs and buttons: rounded-xl
 *    - Pills / chips / tags: rounded-full
 *    - Headings: font-bold (font-black only for hero display)
 *    - Body text: text-slate-600
 */

export const brandTokens = {
  // Brand Primary & Gradients
  primary: {
    base: "bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus-visible:outline-rose-600",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-600",
    ring: "focus:ring-rose-500/20 focus:border-rose-500",
  },
  gradient: {
    brandText: "bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 bg-clip-text text-transparent",
    brandMark: "bg-gradient-to-tr from-rose-600 to-amber-500 text-white",
  },

  // Button Hierarchy
  buttons: {
    primary:
      "inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-rose-700 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none",
    secondary:
      "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100",
    tertiary:
      "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
    ghost:
      "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
  },

  // Surfaces & Containers
  surfaces: {
    card: "rounded-2xl border border-slate-200/90 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900",
    panel: "rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95",
    input:
      "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-rose-400 dark:focus:ring-rose-900/30",
  },

  // Semantic Badges & Chips
  semantics: {
    verified:
      "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800",
    whatsapp:
      "inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition",
    amberCredit:
      "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800",
    skyInfo:
      "inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50/70 p-3 text-xs text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300",
    error:
      "inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400",
    pill:
      "inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
  },

  // Standard Typography
  typography: {
    hero: "font-black tracking-tight",
    heading: "font-bold tracking-tight text-slate-900 dark:text-white",
    subheading: "text-base font-semibold text-slate-800 dark:text-slate-200",
    body: "text-sm text-slate-600 dark:text-slate-400",
    muted: "text-xs text-slate-500 dark:text-slate-400",
  },
};

