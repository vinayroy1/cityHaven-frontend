"use client";

import { useParams } from "next/navigation";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { StayEditor } from "@/components/stays/StayEditor";
import { useMyStays } from "@/features/stays/api";

export default function EditStayPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useMyStays();
  const stay = data?.find((s) => String(s.id) === id);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <HeaderNav />
      {isLoading ? (
        <div className="mx-auto max-w-3xl space-y-3 px-4 py-6">
          <div className="h-28 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : stay ? (
        <StayEditor key={stay.id} stay={stay} />
      ) : (
        <p className="py-20 text-center text-sm text-slate-500">Stay not found.</p>
      )}
    </div>
  );
}
