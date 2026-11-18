import Link from "next/link";
import { Flame, HardHat, MapPin, Paintbrush, type LucideIcon } from "lucide-react";

/**
 * Home services that are not property types (so they stay out of the Buy / Rent tabs) but should be
 * one tap from the home page (Hotels has its own tab in the search box): one row under the hero search, scrolling sideways on phones.
 */
const SERVICES: { label: string; href: string; icon: LucideIcon; tint: string }[] = [
  { label: "Interior designers", href: "/interior-designers", icon: Paintbrush, tint: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300" },
  { label: "Construction", href: "/construction-companies", icon: HardHat, tint: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300" },
  { label: "Pandit & Vastu", href: "/pandit-vastu", icon: Flame, tint: "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300" },
  { label: "Locality guide", href: "/nearby", icon: MapPin, tint: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300" },
];

export function HomeServicesRow() {
  return (
    <nav aria-label="Home services" className="mt-3 sm:mt-5">
      <p className="mb-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:text-center dark:text-slate-500">
        Home services
      </p>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
        {SERVICES.map(({ label, href, icon: Icon, tint }) => (
          <Link
            key={href}
            href={href}
            prefetch={false}
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-xs font-semibold text-slate-700 shadow-2xs transition hover:-translate-y-0.5 hover:border-rose-200 hover:text-rose-700 sm:text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-rose-900"
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tint}`}>
              <Icon className="h-4 w-4" />
            </span>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
