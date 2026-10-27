import React, { Suspense } from "react";
import { PaymentStatusClient } from "./PaymentStatusClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Payment Status | Awasio",
  description: "Check your transaction and credit pack activation status on Awasio.",
};

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <PaymentStatusClient />
    </Suspense>
  );
}
