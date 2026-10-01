"use client";

import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  taglineText?: string;
  href?: string | null;
  className?: string;
}

export function BrandLogo({
  size = "md",
  showTagline = false,
  taglineText = "Verified Real Estate",
  href = "/homePage",
  className = "",
}: BrandLogoProps) {
  const iconSizeClasses = {
    sm: "h-8 w-8 text-xs rounded-full shadow-md shadow-rose-200 dark:shadow-rose-950/40",
    md: "h-10 w-10 text-sm rounded-full shadow-lg shadow-rose-200 dark:shadow-rose-950/50",
    lg: "h-12 w-12 text-base rounded-full shadow-xl shadow-rose-300/40 dark:shadow-rose-950/60",
  }[size];

  const titleSizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  }[size];

  const content = (
    <div className={`group inline-flex items-center gap-2 select-none ${className}`}>
      {/* Circular Rose-600 Background Badge matching View Contact button */}
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-rose-600 font-bold text-white tracking-tight transition-transform duration-200 group-hover:scale-105 ${iconSizeClasses}`}
      >
        CH
      </span>

      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <span
          className={`font-bold tracking-tight text-slate-900 dark:text-white transition-colors group-hover:text-rose-600 dark:group-hover:text-rose-400 ${titleSizeClasses}`}
        >
          CityHaven
        </span>
        {showTagline && (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            {taglineText}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="CityHaven Home" className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
