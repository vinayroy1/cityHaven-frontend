"use client";

import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { StayEditor } from "@/components/stays/StayEditor";

export default function NewStayPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <HeaderNav />
      <StayEditor />
    </div>
  );
}
