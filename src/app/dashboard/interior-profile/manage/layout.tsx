import { Suspense, type ReactNode } from "react";
import { InteriorManageLayout } from "@/components/interiors/manage/InteriorManageLayout";
import { InteriorManageLayoutSkeleton } from "@/components/interiors/skeletons";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<InteriorManageLayoutSkeleton />}>
      <InteriorManageLayout>{children}</InteriorManageLayout>
    </Suspense>
  );
}
