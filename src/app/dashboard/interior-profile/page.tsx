"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useGetMyInteriorProfileQuery } from "@/features/interiors/api";
import { InteriorListingStatus } from "@/types/interior.types";

const WIZARD_STEPS = 9;

/** Routes the provider to the wizard (unfinished draft) or the management area. */
export default function InteriorProfileEntryPage() {
  const router = useRouter();
  const { data: profile, isLoading, isError } = useGetMyInteriorProfileQuery();

  useEffect(() => {
    if (isLoading) return;
    const status = profile?.status ?? (profile?.isPublished ? InteriorListingStatus.PUBLISHED : InteriorListingStatus.DRAFT);
    const unfinishedDraft = !profile || (status === InteriorListingStatus.DRAFT && (profile.wizardStep ?? 0) < WIZARD_STEPS);
    // Legacy profiles (no status, not published) already have data — send them to manage.
    const legacyDraft = profile && !profile.status && !profile.isPublished && profile.wizardStep == null;
    if (isError) return;
    router.replace(unfinishedDraft && !legacyDraft ? "/dashboard/interior-profile/setup" : "/dashboard/interior-profile/manage");
  }, [isLoading, isError, profile, router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-sm text-slate-500" role="status">
      {isError ? (
        <p>Could not load your listing. Please refresh the page.</p>
      ) : (
        <><Loader2 className="h-5 w-5 animate-spin" /> Opening your listing…</>
      )}
    </div>
  );
}
