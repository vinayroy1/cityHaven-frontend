"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PageBreadcrumbs, type BreadcrumbTrailItem } from "@/components/common/PageBreadcrumbs";
import { cn } from "@/components/ui/utils";
import { InteriorListingStatus } from "@/types/interior.types";
import { EDIT_SECTIONS, MANAGE_SECTIONS, MANAGE_TABS, manageHref, tabForSection, type ManageSectionId, type ManageTab } from "./sections";
import { useManageListing } from "./useManageListing";
import { StatusBadge } from "./StatusBadge";
import { interiorProfilePath } from "@/lib/interiors/profileUrl";
import { InteriorManageLayoutSkeleton } from "@/components/interiors/skeletons";

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

  if (isLoading || !profile) return <InteriorManageLayoutSkeleton />;

  const name = profile.displayName || profile.businessName || "Your listing";
  const isLive = profile.status === InteriorListingStatus.PUBLISHED || (!profile.status && profile.isPublished);

  const sectionLabel = MANAGE_SECTIONS.find((s) => s.id === current)?.label ?? "Overview";
  const crumbs: BreadcrumbTrailItem[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Interior listings", href: "/dashboard/interior-profile" },
    current === "overview"
      ? { label: name }
      : { label: name, href: manageHref("overview", profile.id) },
    ...(current === "overview" ? [] : [{ label: sectionLabel }]),
  ];

  const dot = (id: ManageSectionId) => {
    const step = MANAGE_SECTIONS.find((s) => s.id === id)?.stepId;
    if (!step) return null;
    // Only a quiet green dot for finished sections; unfinished ones are listed once, under "Next steps".
    if (stepHealth[step] !== "done") return null;
    return <span aria-label="Complete" className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />;
  };

  const tab = tabForSection(current);
  const editSections = EDIT_SECTIONS.filter((s) => stepHealth[s.stepId!] !== "hidden");
  const tabHref = (t: ManageTab) =>
    t === "edit" ? manageHref(editSections[0]?.id ?? "identity", profile.id) : manageHref(t === "overview" ? "overview" : t, profile.id);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="hidden sm:block">
            <PageBreadcrumbs items={crumbs} includeHome={false} renderJsonLd={false} />
          </div>
          <Link href="/dashboard/interior-profile" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-rose-600 sm:hidden dark:text-slate-300">
            <ArrowLeft className="h-4 w-4" /> All listings
          </Link>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl dark:text-white">{name}</h1>
            <StatusBadge profile={profile} />
          </div>
        </div>
        {isLive && profile.slug && (
          <Link
            href={interiorProfilePath(profile)}
            target="_blank"
            className="inline-flex h-10 w-fit items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            View public page <ExternalLink className="h-4 w-4" />
          </Link>
        )}
      </header>

      {/* Tabs */}
      <nav aria-label="Listing sections" className="no-scrollbar -mx-4 mb-5 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {MANAGE_TABS.map((t) => (
          <Link
            key={t.id}
            href={tabHref(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
              tab === t.id ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {/* Edit listing: compact section strip (scrolls on mobile), green dot = complete */}
      {tab === "edit" && (
        <nav aria-label="Edit sections" className="no-scrollbar -mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {editSections.map((s) => {
            const active = s.id === current;
            return (
              <Link
                key={s.id}
                href={manageHref(s.id, profile.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                  active
                    ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
                )}
              >
                {s.label}
                {dot(s.id)}
              </Link>
            );
          })}
        </nav>
      )}

      <main className="min-w-0">{children}</main>
    </div>
  );
}
