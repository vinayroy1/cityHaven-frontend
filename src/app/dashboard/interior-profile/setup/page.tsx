"use client";

import { Suspense } from "react";
import { InteriorWizard } from "@/components/interiors/wizard";
import { InteriorWizardSkeleton } from "@/components/interiors/skeletons";

export default function InteriorProfileSetupPage() {
  return (
    <Suspense fallback={<InteriorWizardSkeleton />}>
      <InteriorWizard />
    </Suspense>
  );
}
