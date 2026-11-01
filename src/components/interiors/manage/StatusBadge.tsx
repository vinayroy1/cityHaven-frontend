import { InteriorListingStatus, type InteriorProfile } from "@/types/interior.types";
import { cn } from "@/components/ui/utils";

const META: Record<InteriorListingStatus, { label: string; cls: string }> = {
  DRAFT: { label: "Draft", cls: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  SUBMITTED: { label: "Submitted", cls: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300" },
  IN_REVIEW: { label: "In review", cls: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300" },
  CHANGES_REQUESTED: { label: "Changes requested", cls: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" },
  PUBLISHED: { label: "Live", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" },
  PAUSED: { label: "Paused", cls: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100" },
  TEMP_UNAVAILABLE: { label: "Temporarily unavailable", cls: "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300" },
  ARCHIVED: { label: "Archived", cls: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" },
  REJECTED: { label: "Rejected", cls: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" },
};

/** Legacy rows have no status: fall back to isPublished. */
export const effectiveStatus = (p: Pick<InteriorProfile, "status" | "isPublished"> | null | undefined): InteriorListingStatus =>
  p?.status ?? (p?.isPublished ? InteriorListingStatus.PUBLISHED : InteriorListingStatus.DRAFT);

export function StatusBadge({ profile, className }: { profile: Pick<InteriorProfile, "status" | "isPublished"> | null | undefined; className?: string }) {
  const m = META[effectiveStatus(profile)];
  return <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", m.cls, className)}>{m.label}</span>;
}
