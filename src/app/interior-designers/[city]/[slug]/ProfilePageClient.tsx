"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ImageIcon } from "lucide-react";
import { useGetInteriorProfileDetailQuery } from "@/features/interiors/api";
import { DesignerProfileSkeleton } from "@/components/interiors/skeletons";
import type { InteriorProfile } from "@/types/interior.types";
import { ProfileBreadcrumbBar } from "../../components/profile/ProfileBreadcrumbBar";
import { PortfolioGrid, WorkGallery } from "../../components/profile/Portfolio";
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

// The enquiry form is only needed after a click; keep it out of the initial bundle.
const InteriorInquiryModal = dynamic(
  () => import("../../components/InteriorInquiryModal").then((m) => m.InteriorInquiryModal),
  { ssr: false },
);

interface ProfilePageClientProps {
  slug: string;
  citySlug: string;
  /** Server-fetched profile; when present the client skips its own fetch. */
  initialProfile: InteriorProfile | null;
}

export function ProfilePageClient({ slug, citySlug, initialProfile }: ProfilePageClientProps) {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [modalMounted, setModalMounted] = useState(false);
  const openQuote = () => {
    setModalMounted(true);
    setIsInquiryOpen(true);
  };

  const query = useGetInteriorProfileDetailQuery(slug, { skip: !slug || !!initialProfile });
  const profile = initialProfile ?? query.data;
  const isLoading = !initialProfile && query.isLoading;
  const error = initialProfile ? undefined : query.error;

  const materials = useMemo(() => (profile ? materialGroups(profile) : []), [profile]);
  const gallery = profile?.workGallery ?? [];
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

  if (isLoading) {
    return <DesignerProfileSkeleton />;
  }

  if (!profile || error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ProfileBreadcrumbBar citySlug={citySlug} className="mb-8 justify-center" />
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
      <ProfileBreadcrumbBar
        citySlug={citySlug}
        cityName={profile.primaryCity}
        name={name}
        className="mx-auto max-w-6xl px-4 pt-3 sm:px-6"
      />
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
            subtitle={projects.length || gallery.length ? `Completed homes by ${name}` : undefined}
            action={
              projects.length > 0 ? (
                <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {projects.length} {projects.length === 1 ? "project" : "projects"}
                </span>
              ) : undefined
            }
          >
            {projects.length > 0 && <PortfolioGrid projects={projects} />}
            {gallery.length > 0 && (
              <div className={projects.length ? "mt-6" : undefined}>
                {projects.length > 0 && <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">More of our work</h3>}
                <WorkGallery images={gallery} title={name} />
              </div>
            )}
            {projects.length === 0 && gallery.length === 0 && (
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

      {modalMounted && (
        <InteriorInquiryModal profile={profile} isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
      )}
    </div>
  );
}
