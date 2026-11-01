import { Suspense, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { InteriorManageLayout } from "@/components/interiors/manage/InteriorManageLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-slate-500" role="status">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      }
    >
      <InteriorManageLayout>{children}</InteriorManageLayout>
    </Suspense>
  );
}
