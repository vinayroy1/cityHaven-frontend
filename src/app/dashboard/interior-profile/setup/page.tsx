"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { InteriorWizard } from "@/components/interiors/wizard";

export default function InteriorProfileSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-slate-500" role="status">
          <Loader2 className="size-5 animate-spin" /> Loading…
        </div>
      }
    >
      <InteriorWizard />
    </Suspense>
  );
}
