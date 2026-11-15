import { HardHat } from "lucide-react";

const bar = "animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800";

/** Loading state for the construction dashboard: same shape as the page so nothing jumps. */
export function ConstructionSkeleton({ withChrome = false }: { withChrome?: boolean }) {
  const body = (
    <div className="space-y-5" aria-busy="true" aria-label="Loading your construction listing">
      {/* Tabs */}
      <div className="flex gap-2">
        {[88, 104, 80, 92].map((w) => (
          <span key={w} className={`${bar} h-9 rounded-full`} style={{ width: w }} />
        ))}
      </div>
      {/* Status card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <span className={`${bar} h-6 w-6 rounded-full`} />
          <div className="flex-1 space-y-2">
            <span className={`${bar} block h-4 w-40`} />
            <span className={`${bar} block h-3 w-3/4`} />
            <span className={`${bar} mt-3 block h-10 w-44 rounded-xl`} />
          </div>
        </div>
      </div>
      {/* Completion card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className={`${bar} h-4 w-44`} />
          <span className={`${bar} h-3 w-20`} />
        </div>
        <span className={`${bar} mt-3 block h-1.5 w-full rounded-full`} />
        <div className="mt-4 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`${bar} h-4 w-4 rounded-full`} />
              <span className={`${bar} h-3.5 flex-1`} style={{ maxWidth: `${70 - i * 10}%` }} />
            </div>
          ))}
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <span className={`${bar} block h-3 w-16`} />
            <span className={`${bar} block h-5 w-10`} />
          </div>
        ))}
      </div>
    </div>
  );

  if (!withChrome) return body;
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header placeholder (the real header loads with the page) */}
      <div className="h-16 border-b border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-slate-950" />
      <div className="mx-auto w-full max-w-4xl px-4 pb-32 pt-4 sm:px-6 sm:pt-8">
        <div className="mb-5 space-y-2">
          <span className={`${bar} block h-3 w-40`} />
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-rose-600 sm:text-xs">
            <HardHat className="h-3.5 w-3.5 animate-pulse" /> Construction business
          </div>
          <span className={`${bar} block h-8 w-72 max-w-full`} />
        </div>
        {body}
      </div>
    </div>
  );
}
