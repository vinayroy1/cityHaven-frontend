import { notFound } from "next/navigation";
import { ManageSectionPage } from "@/components/interiors/manage/ManageSectionPage";
import { LeadsPanel } from "@/components/interiors/manage/LeadsPanel";
import { isManageRouteSection } from "@/components/interiors/manage/sections";
import type { InteriorWizardSection } from "@/types/interior.types";

export default async function InteriorManageSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!isManageRouteSection(section)) notFound();
  if (section === "leads") return <LeadsPanel />;
  return <ManageSectionPage section={section as InteriorWizardSection} />;
}
