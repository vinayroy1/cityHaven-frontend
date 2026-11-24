"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, MapPin } from "lucide-react";

/** Set by the backend on the last page it will serve: no city picked, or a logged-out visitor's page limit. */
export type PagingLimit = "CITY_REQUIRED" | "LOGIN_REQUIRED";

/** Reads `pagingLimit` from a search response (`{ data: { pagingLimit } }` or `{ pagingLimit }`). */
export function pagingLimitOf(res: unknown): PagingLimit | null {
  const r = res as { pagingLimit?: unknown; data?: { pagingLimit?: unknown } } | null | undefined;
  const v = r?.pagingLimit ?? r?.data?.pagingLimit;
  return v === "CITY_REQUIRED" || v === "LOGIN_REQUIRED" ? v : null;
}

/** Shown under a result list when the backend stopped paging on purpose. */
export function PagingLimitNote({ limit, className = "" }: { limit: PagingLimit | null | undefined; className?: string }) {
  const pathname = usePathname();
  if (!limit) return null;
  // Path only (city / area are in it); useSearchParams would need a Suspense boundary on every page.
  const here = pathname || "/";
  return (
    <div className={`mx-auto mt-6 flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-5 text-center dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {limit === "LOGIN_REQUIRED" ? (
        <>
          <p className="text-sm text-slate-700 dark:text-slate-300">You&apos;ve reached the end of the free preview. Log in to see more results.</p>
          <Link
            href={`/login?redirect=${encodeURIComponent(here)}`}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white hover:bg-rose-700"
          >
            <LogIn className="h-4 w-4" /> Log in to see more
          </Link>
        </>
      ) : (
        <p className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <MapPin className="h-4 w-4 shrink-0 text-rose-500" /> Select a city to see all results.
        </p>
      )}
    </div>
  );
}
