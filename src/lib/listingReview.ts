import { toast } from "sonner";

/** Wording for the submit step, depending on the admin "review required" switch (default: review on). */
export const submitCopy = (reviewRequired?: boolean) =>
  reviewRequired === false
    ? { button: "Publish listing", note: "Your listing goes live as soon as you publish.", sub: "Then review and publish." }
    : { button: "Submit for approval", note: "Our team reviews every listing before it goes live.", sub: "Then review and submit for approval." };

/** Toast that matches what actually happened after submit (live, payment due, changes needed or in review). */
export function toastSubmitOutcome(res: { profile?: { status?: string | null; reviewNotes?: string | null } | null; billing?: { pausedForPayment?: boolean } | null } | undefined) {
  const status = res?.profile?.status;
  if (status === "PUBLISHED") toast.success("🎉 You're live! Customers can now find you and send enquiries.");
  else if (status === "PAUSED" && res?.billing?.pausedForPayment) toast.success("Approved! Add credits to go live.");
  else if (status === "CHANGES_REQUESTED") toast.message("Almost there: a few details are still needed.", { description: res?.profile?.reviewNotes ?? undefined });
  else toast.success("Submitted! We'll review your listing shortly.");
}
