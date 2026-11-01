"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { InteriorWizardSkeleton } from "@/components/interiors/skeletons";
import { ListingWizardShell } from "@/components/listingEngine";
import { useInteriorWizard } from "@/features/interiors/wizard/useInteriorWizard";
import { InteriorListingStatus } from "@/types/interior.types";
import { interiorCustomComponents } from "./index";
import { renderInteriorPreview } from "./InteriorPreview";
import { SubmissionStatus } from "./SubmissionStatus";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { BackButton } from "@/components/common/BackButton";

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

  if (isLoading) return <InteriorWizardSkeleton />;
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

  const listingName = profile?.displayName || profile?.businessName || "New listing";
  const topNav = (
    <div className="flex min-w-0 items-center gap-2">
      <BackButton
        variant="icon"
        fallbackHref={exitHref}
        ariaLabel="Exit setup"
        className="sm:hidden"
      />
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Interior listings", href: "/dashboard/interior-profile" },
          { label: listingName },
        ]}
        includeHome={false}
        renderJsonLd={false}
        className="min-w-0"
      />
    </div>
  );

  return (
    <ListingWizardShell
      topNav={topNav}
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
