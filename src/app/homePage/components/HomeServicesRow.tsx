import Link from "next/link";
import { ArrowRight, Flame, HardHat, MapPin, Paintbrush, type LucideIcon } from "lucide-react";

/**
 * Home services that are not property types (so they stay out of the Buy / Rent tabs) but should be
 * one tap from the home page (Hotels has its own tab in the search box).
 * Phones: one row of four app-style shortcuts (icon above a short label) so the first screen keeps
 * room for listings. Tablet / desktop: tiles with a one-line description.
 */
const SERVICES: { label: string; short: string; hint: string; href: string; icon: LucideIcon; gradient: string; glow: string; soft: string }[] = [
  { label: "Interiors", short: "Interiors", hint: "Designs & quotes", href: "/interior-designers", icon: Paintbrush, gradient: "from-violet-500 to-fuchsia-500", glow: "sm:hover:shadow-violet-500/20" , soft: "bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-900/50" },
  { label: "Construction", short: "Construction", hint: "Build your home", href: "/construction-companies", icon: HardHat, gradient: "from-amber-500 to-orange-500", glow: "sm:hover:shadow-amber-500/20" , soft: "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900/50" },
  { label: "Pandit & Vastu", short: "Pandit", hint: "Puja & vastu", href: "/pandit-vastu", icon: Flame, gradient: "from-orange-500 to-rose-500", glow: "sm:hover:shadow-rose-500/20" , soft: "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900/50" },
  { label: "Locality guide", short: "Locality", hint: "Area insights", href: "/nearby", icon: MapPin, gradient: "from-emerald-500 to-teal-500", glow: "sm:hover:shadow-emerald-500/20" , soft: "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/50" },
];

export function HomeServicesRow() {
  return (
    <nav aria-label="Home services" className="mt-4 sm:mt-6">
      <p className="mb-2 hidden text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:mb-3 sm:block dark:text-slate-500">
        Home services
      </p>
      {/* Phones: one white card (like the search box above) holding four shortcuts. */}
      <div className="grid grid-cols-4 rounded-2xl border border-slate-200/90 bg-white px-1 py-2.5 shadow-xs sm:gap-3 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-900 sm:dark:bg-transparent">
        {SERVICES.map(({ label, short, hint, href, icon: Icon, gradient, glow, soft }) => (
          <Link
            key={href}
            href={href}
            prefetch={false}
            aria-label={label}
            className={`group flex flex-col items-center gap-1.5 rounded-xl px-1 py-0.5 text-center transition active:scale-95 sm:flex-row sm:gap-3 sm:border sm:border-slate-200 sm:bg-white sm:p-3 sm:text-left sm:shadow-xs sm:hover:-translate-y-0.5 sm:hover:border-transparent sm:hover:shadow-lg sm:dark:border-slate-800 sm:dark:bg-slate-900 ${glow}`}
          >
            {/* Phones: soft tinted icon. Tablet / desktop: bold gradient icon. */}
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 sm:hidden ${soft}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md sm:flex ${gradient}`}>
              <Icon className="h-5 w-5" />
            </span>
            {/* Phones: short label under the icon (wraps to two lines if needed). */}
            <span className="text-[11.5px] font-semibold leading-tight text-slate-800 sm:hidden dark:text-slate-100">{short}</span>
            {/* Tablet / desktop: title + one-line description. */}
            <span className="hidden min-w-0 flex-1 sm:block">
              <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{label}</span>
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{hint}</span>
            </span>
            <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-rose-500 sm:block lg:hidden" />
          </Link>
        ))}
      </div>
    </nav>
  );
}
