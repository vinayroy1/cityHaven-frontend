import { Suspense } from "react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { LeadInbox } from "@/components/leads/LeadInbox";

export const metadata = { title: "Leads | Awasio", robots: { index: false } };

export default function LeadsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <HeaderNav />
      <Suspense>
        <LeadInbox />
      </Suspense>
    </div>
  );
}
