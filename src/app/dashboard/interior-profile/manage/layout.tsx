import type { ReactNode } from "react";
import { InteriorManageLayout } from "@/components/interiors/manage/InteriorManageLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return <InteriorManageLayout>{children}</InteriorManageLayout>;
}
