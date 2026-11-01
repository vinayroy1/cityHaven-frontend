"use client";

import React from "react";
import { PageBreadcrumbs, type BreadcrumbTrailItem } from "@/components/common/PageBreadcrumbs";
import { BackButton } from "@/components/common/BackButton";
import { cityLabel } from "../../lib/breadcrumbs";

interface ProfileBreadcrumbBarProps {
  citySlug: string;
  cityName?: string | null;
  name?: string;
  className?: string;
}

/** Home › Interior designers › {City} › {Name}, plus a back button on mobile. */
export function ProfileBreadcrumbBar({ citySlug, cityName, name, className = "" }: ProfileBreadcrumbBarProps) {
  const city = cityName || cityLabel(citySlug);
  const items: BreadcrumbTrailItem[] = [
    { label: "Interior designers", href: "/interior-designers" },
    { label: city, href: `/interior-designers?city=${encodeURIComponent(city)}` },
  ];
  if (name) items.push({ label: name });

  return (
    <div className="bg-white dark:bg-slate-900">
      <div className={`flex min-w-0 items-center gap-2 ${className}`}>
        <BackButton variant="icon" fallbackHref="/interior-designers" ariaLabel="Go back" className="lg:hidden" />
        <PageBreadcrumbs items={items} renderJsonLd={false} className="min-w-0 flex-1" />
      </div>
    </div>
  );
}
