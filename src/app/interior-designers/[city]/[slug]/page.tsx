"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ImageIcon } from "lucide-react";
import { useGetInteriorProfileDetailQuery } from "@/features/interiors/api";
import { DesignerProfileSkeleton } from "@/components/interiors/skeletons";
import { InteriorInquiryModal } from "../../components/InteriorInquiryModal";
import { PortfolioGrid } from "../../components/profile/Portfolio";
import {
  EnquiryCard,
  MobileCtaBar,
  ProfileHero,
  Section,
  SectionNav,
} from "../../components/profile/ProfileParts";
import {
  AboutSection,
  AreasSection,
  ContactSection,
  CredentialsSection,
  MaterialsSection,
  PricingSection,
  ReviewsSection,
  ServicesSection,
  TeamSection,
  WarrantySection,
  credentialItems,
  hasPricing,
  hasServices,
  hasWarranty,
  materialGroups,
} from "../../components/profile/ProfileSections";
import { profileName } from "../../components/profile/utils";

export default function InteriorProfileDetailPage() {
  const params = useParams<{ city: string; slug: string }>();
  const slug = params?.slug;
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const openQuote = () => setIsInquiryOpen(true);

  const { data: profile, isLoading, error } = useGetInteriorProfileDetailQuery(slug as string, {
    skip: !slug,
  });

  const materials = useMemo(() => (profile ? materialGroups(profile) : []), [profile]);
  const projects = useMemo(
    () =>
      (profile?.projects ?? [])
        .slice()
        .sort((a, b) => Number(!!b.isFeatured) - Number(!!a.isFeatured)),
    [profile],
  );

  const sections = useMemo(() => {
    if (!profile) return [];
    const cred = credentialItems(profile);
    const team = (profile.teamMembers ?? []).filter((m) => m.isPublic !== false && m.name);
    return [
      { id: "about", label: "About", show: true },
      { id: "services", label: "Services", show: hasServices(profile) },
      {
        id: "areas",
        label: profile.branches?.length ? "Branches" : "Service areas",
        show: !!profile.branches?.length || !!profile.serviceCities?.length || !!profile.primaryCity,
      },
      { id: "pricing", label: "Pricing", show: hasPricing(profile) },
      { id: "materials", label: "Materials", show: materials.length > 0 },
      { id: "portfolio", label: "Portfolio", show: true },
      { id: "team", label: "Team", show: team.length > 0 },
      {
        id: "credentials",
        label: "Credentials",
        show: profile.isVerified || cred.docs.length + cred.awards.length + cred.certs.length > 0,
      },
      { id: "warranty", label: "Warranty", show: hasWarranty(profile) },
      { id: "reviews", label: "Reviews", show: true },
      { id: "contact", label: "Contact", show: true },
    ].filter((s) => s.show);
  }, [profile, materials]);

  if (isLoading || (!slug && !error)) {
    return <DesignerProfileSkeleton />;
  }

  if (!profile || error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Designer profile not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The interior designer or studio you are looking for is either unpublished or does not exist.
        </p>
        <Link
          href="/interior-designers"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-rose-600 px-5 text-sm font-bold text-white shadow-md hover:bg-rose-700"
        >
          Back to interior directory
        </Link>
      </div>
    );
  }

  const show = (id: string) => sections.some((s) => s.id === id);
  const name = profileName(profile);

  return (
    <div className="min-h-screen overflow-x-clip bg-stone-50 pb-28 lg:pb-16 dark:bg-slate-950">
      <ProfileHero profile={profile} onQuote={openQuote} />
      <SectionNav items={sections} />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:py-10">
        <main className="min-w-0 space-y-6">
          <AboutSection profile={profile} />
          {show("services") && <ServicesSection profile={profile} />}
          {show("areas") && <AreasSection profile={profile} />}
          {show("pricing") && <PricingSection profile={profile} onQuote={openQuote} />}
          {show("materials") && <MaterialsSection groups={materials} />}

          <Section
            id="portfolio"
            title="Portfolio"
            subtitle={projects.length ? `Completed homes by ${name}` : undefined}
            action={
              projects.length > 0 ? (
                <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {projects.length} {projects.length === 1 ? "project" : "projects"}
                </span>
              ) : undefined
            }
          >
            {projects.length > 0 ? (
              <PortfolioGrid projects={projects} />
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center dark:border-slate-700">
                <ImageIcon className="mx-auto h-8 w-8 text-stone-300" aria-hidden />
                <p className="mt-2 font-semibold text-slate-900 dark:text-white">Portfolio coming soon</p>
                <p className="mt-1 text-sm text-slate-500">Ask {name} for photos of recent work.</p>
              </div>
            )}
          </Section>

          {show("team") && <TeamSection profile={profile} />}
          {show("credentials") && <CredentialsSection profile={profile} />}
          {show("warranty") && <WarrantySection profile={profile} />}
          <ReviewsSection profile={profile} onQuote={openQuote} />
          <ContactSection profile={profile} onQuote={openQuote} />
        </main>

        <aside className="hidden lg:block" aria-label="Enquiry">
          <div className="sticky top-20">
            <EnquiryCard profile={profile} onQuote={openQuote} />
          </div>
        </aside>
      </div>

      <MobileCtaBar profile={profile} onQuote={openQuote} />

      <InteriorInquiryModal profile={profile} isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
    </div>
  );
}
