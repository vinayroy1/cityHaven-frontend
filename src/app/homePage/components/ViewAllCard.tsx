import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Trailing "View all" tile for the homepage's horizontal carousels.
 *
 * It has no intrinsic size: it fills its slot (h-full w-full), and the carousels' flex rows
 * stretch every slot to the tallest card, so it always matches that section's own cards.
 * `compact` lays it out in a row for short, wide cards (e.g. the horizontal flatmate cards).
 */
export function ViewAllCard({
  href,
  title,
  subtitle,
  compact = false,
}: {
  href: string;
  title: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={`group flex h-full w-full rounded-2xl border border-dashed border-rose-200 bg-gradient-to-br from-rose-50 via-white to-rose-100/60 transition hover:border-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-rose-900/60 dark:from-rose-950/30 dark:via-slate-900 dark:to-rose-950/20 ${
        compact ? "items-center gap-4 p-5 text-left" : "flex-col items-center justify-center gap-3 p-6 text-center"
      }`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/30 transition group-hover:scale-110">
        <ArrowRight className="h-5 w-5" aria-hidden />
      </span>
      <span className={compact ? "min-w-0" : "contents"}>
        <span className="block text-base font-bold text-slate-950 dark:text-white">{title}</span>
        {subtitle && <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{subtitle}</span>}
      </span>
    </Link>
  );
}
