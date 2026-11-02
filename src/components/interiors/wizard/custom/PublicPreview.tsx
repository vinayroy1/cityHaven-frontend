"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { InteriorWizardValues } from "@/types/interior.types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InteriorDirectoryCard, InteriorProfilePreview } from "../InteriorPreview";
import { secondaryBtn } from "./ui";

export default function PublicPreview({ values }: CustomStepProps<InteriorWizardValues>) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="w-full max-w-xs">
        <InteriorDirectoryCard values={values} />
      </div>
      <div className="space-y-2">
        <p className="text-sm text-slate-600 dark:text-slate-300">This is your card in search results. Open the full view to check your profile the way a homeowner will.</p>
        <button type="button" className={secondaryBtn} onClick={() => setOpen(true)}>
          <Eye className="size-4" /> Preview as homeowner
        </button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview as homeowner</DialogTitle>
            <DialogDescription>Phone and email are shown only if you turned on “Show phone on public profile” / “Show email on public profile”; otherwise homeowners reach you through the enquiry form.</DialogDescription>
          </DialogHeader>
          <InteriorProfilePreview values={values} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
