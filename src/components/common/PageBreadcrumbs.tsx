"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { buildCanonical } from "@/constants/seo";

export interface BreadcrumbTrailItem {
  label: string;
  href?: string;
}

interface PageBreadcrumbsProps {
  items: BreadcrumbTrailItem[];
  className?: string;
  includeHome?: boolean;
  renderJsonLd?: boolean;
}

export function PageBreadcrumbs({
  items,
  className = "",
  includeHome = true,
  renderJsonLd = true,
}: PageBreadcrumbsProps) {
  // Construct the full breadcrumbs trail starting with Home if enabled
  const fullTrail: BreadcrumbTrailItem[] = includeHome
    ? [{ label: "Home", href: "/" }, ...items]
    : items;

  // Build Schema.org BreadcrumbList JSON-LD
  const jsonLdElements = fullTrail.map((item, index) => {
    const rawHref = item.href || (index === fullTrail.length - 1 ? "" : "#");
    const absoluteUrl = rawHref.startsWith("http")
      ? rawHref
      : buildCanonical(rawHref || "/");

    return {
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(rawHref ? { item: absoluteUrl } : {}),
    };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: jsonLdElements,
  };

  return (
    <>
      {renderJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <nav
        aria-label="Breadcrumb"
        className={`flex items-center overflow-x-auto no-scrollbar py-1 text-xs text-slate-500 dark:text-slate-400 ${className}`}
      >
        <ol className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
          {fullTrail.map((item, index) => {
            const isLast = index === fullTrail.length - 1;
            const isFirst = index === 0 && includeHome;

            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1 sm:gap-1.5">
                {index > 0 && (
                  <ChevronRight
                    className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-600"
                    aria-hidden="true"
                  />
                )}

                {isLast || !item.href ? (
                  <span
                    aria-current="page"
                    className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-sm md:max-w-md"
                    title={item.label}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    {isFirst && <Home className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

