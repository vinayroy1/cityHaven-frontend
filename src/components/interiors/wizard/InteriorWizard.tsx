"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ListingWizardShell } from "@/components/listingEngine";
import { useInteriorWizard } from "@/features/interiors/wizard/useInteriorWizard";
import { InteriorListingStatus } from "@/types/interior.types";
import { interiorCustomComponents } from "./index";
import { renderInteriorPreview } from "./InteriorPreview";
import { SubmissionStatus } from "./SubmissionStatus";

const UNDER_REVIEW = new Set<InteriorListingStatus | undefined>([InteriorListingStatus.SUBMITTED, InteriorListingStatus.IN_REVIEW]);

/** Interior designer onboarding: 3 phases / 9 steps on the shared listing engine. */
export function InteriorWizard() {
  const searchParams = useSearchParams();
  const profileIdParam = searchParams.get("profileId");
  const profileId = profileIdParam ? Number(profileIdParam) : undefined;

  const { vertical, profile, isLoading, isError, refetch } = useInteriorWizard({
    profileId,
    customComponents: interiorCustomComponents,
  });
  const [done, setDone] = useState<"submitted" | "published" | null>(null);
  const config = useMemo(() => ({ ...vertical, renderPreview: renderInteriorPreview }), [vertical]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-slate-500" role="status">
        <Loader2 className="size-5 animate-spin" /> Loading your listing…
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-sm text-slate-600" role="alert">
        Could not load your listing.
        <button type="button" onClick={() => refetch()} className="rounded-xl border border-slate-300 px-4 py-2 font-medium">Try again</button>
      </div>
    );
  }
  if (done || UNDER_REVIEW.has(profile?.status)) {
    return (
      <div className="px-4 py-10">
        <SubmissionStatus
          status={done === "published" ? InteriorListingStatus.PUBLISHED : profile?.status ?? InteriorListingStatus.SUBMITTED}
          submittedAt={profile?.lastSubmittedAt}
          reviewNotes={profile?.reviewNotes}
        />
      </div>
    );
  }

  const exitHref = profile?.id
    ? `/dashboard/interior-profile/manage?profileId=${profile.id}`
    : "/dashboard/interior-profile";

  return (
    <ListingWizardShell
      vertical={config}
      heading="List your interior studio"
      subheading="About 10 minutes. Saved as you go — come back any time."
      exitHref={exitHref}
      submitLabel="Submit for review"
      publishLabel="Submit & publish"
      onSubmitted={() => setDone("submitted")}
      onPublished={() => setDone("published")}
    />
  );
}
