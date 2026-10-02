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
  href = "/",
  className = "",
}: BrandLogoProps) {
  const iconSizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }[size];

  const titleSizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  }[size];

  const content = (
    <div className={`group inline-flex items-center gap-2 select-none ${className}`}>
      <span
        className={`flex shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-105 ${iconSizeClasses}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 256 256" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="256" height="256" rx="56" fill="#FFF1F2" />
          <path d="M116.1 49.8C121.9 39.9 136.1 39.9 141.9 49.8L211.7 169.1C217.6 179.2 210.3 192 198.6 192H171.1C165.7 192 160.7 189.1 158 184.4L131.8 138.9C130.5 136.6 127.5 136.6 126.2 138.9L100 184.4C97.3 189.1 92.3 192 86.9 192H59.4C47.7 192 40.4 179.2 46.3 169.1L116.1 49.8Z" fill="#E11D48" />
          <path d="M129 82L169 123V164H89V123L129 82Z" fill="white" />
          <path d="M111 144C111 134.1 119.1 126 129 126C138.9 126 147 134.1 147 144V164H111V144Z" fill="#E11D48" />
          <path d="M156 80.6L211.7 169.1C217.6 179.2 210.3 192 198.6 192H171.1C165.7 192 160.7 189.1 158 184.4L131.8 138.9C131.2 137.8 130.2 137.2 129 137.2V82L156 80.6Z" fill="#BE123C" opacity=".22" />
        </svg>
      </span>

      <div className="flex flex-col leading-none">
        <span
          className={`font-bold tracking-tight text-slate-900 dark:text-white transition-colors group-hover:text-rose-600 dark:group-hover:text-rose-400 ${titleSizeClasses}`}
        >
          Awasio
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
      <Link href={href} aria-label="Awasio Home" className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
