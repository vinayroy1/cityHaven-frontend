"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { InteriorListingStatus } from "@/types/interior.types";
import { MANAGE_SECTIONS, manageHref, type ManageSectionId } from "./sections";
import { useManageListing } from "./useManageListing";
import { StatusBadge } from "./StatusBadge";

function activeSection(pathname: string): ManageSectionId {
  const seg = pathname.split("/manage/")[1]?.split("/")[0];
  return (MANAGE_SECTIONS.find((s) => s.id === seg)?.id ?? "overview") as ManageSectionId;
}

export function InteriorManageLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { profile, isLoading, stepHealth } = useManageListing();
  const current = activeSection(pathname);

  // No profile yet → the wizard is the right place.
  useEffect(() => {
    if (!isLoading && !profile) router.replace("/dashboard/interior-profile/setup");
  }, [isLoading, profile, router]);

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500" role="status">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading your listing…
      </div>
    );
  }

  const name = profile.displayName || profile.businessName || "Your listing";
  const isLive = profile.status === InteriorListingStatus.PUBLISHED || (!profile.status && profile.isPublished);
  const visibleSections = MANAGE_SECTIONS.filter((s) => !s.stepId || stepHealth[s.stepId] !== "hidden");

  const dot = (id: ManageSectionId) => {
    const step = MANAGE_SECTIONS.find((s) => s.id === id)?.stepId;
    if (!step) return null;
    const h = stepHealth[step];
    return (
      <span
        aria-label={h === "done" ? "Complete" : "Needs attention"}
        className={cn("h-2 w-2 shrink-0 rounded-full", h === "done" ? "bg-emerald-500" : "bg-amber-500")}
      />
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      <header className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link href="/dashboard/interior-profile" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <ArrowLeft className="h-3.5 w-3.5" /> All Interior Listings
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-bold text-slate-900 dark:text-white">{name}</h1>
            <StatusBadge profile={profile} />
          </div>
          <p className="text-xs text-slate-500">Interior business listing</p>
        </div>
        {isLive && profile.slug && (
          <Link
            href={`/interior-designers/${encodeURIComponent((profile.primaryCity || "india").toLowerCase())}/${profile.slug}`}
            target="_blank"
            className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            View public page <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        {/* Mobile: horizontal pills. Desktop: sidebar. */}
        <nav aria-label="Listing sections" className="-mx-4 lg:mx-0 lg:w-60 lg:shrink-0">
          <ul className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:sticky lg:top-20 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
            {visibleSections.map((s, i) => {
              const active = s.id === current;
              const showHeading = s.group && s.group !== visibleSections[i - 1]?.group;
              return (
                <li key={s.id} className="shrink-0">
                  {showHeading && (
                    <p className="hidden px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400 lg:block">{s.group}</p>
                  )}
                  <Link
                    href={manageHref(s.id, profile?.id)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors lg:rounded-xl lg:border-transparent lg:text-sm",
                      active
                        ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 lg:bg-transparent",
                    )}
                  >
                    <span className="flex-1">{s.label}</span>
                    {dot(s.id)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
