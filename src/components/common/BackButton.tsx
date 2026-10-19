"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useSafeBack } from "@/lib/navigation/useSafeBack";
import { triggerSafeBack } from "@/lib/navigation/backNavigation";
import { useRouter } from "next/navigation";

export interface BackButtonProps {
  /**
   * Fallback URL if internal navigation history is empty or direct landing.
   * Defaults to `"/"`.
   */
  fallbackHref?: string;
  /**
   * Optional visible text label (e.g. "Back", "Back to Search").
   * If omitted, renders an accessible icon-only button.
   */
  label?: string;
  /**
   * Visual variant:
   * - "pill": rounded full with border and subtle background (ideal for page tops & headers)
   * - "ghost": minimal transparent button with subtle hover background
   * - "button": standard rounded-xl bordered button
   * - "icon": circular icon button (min 44x44 touch target)
   * - "floating": elevated shadow for overlaying on media / gallery
   */
  variant?: "pill" | "ghost" | "button" | "icon" | "floating";
  size?: "sm" | "md" | "lg";
  className?: string;
  iconClassName?: string;
  title?: string;
  ariaLabel?: string;
  /**
   * Optional pre-back handler. If returns `true`, back navigation is cancelled.
   */
  onBeforeBack?: () => boolean | void;
}

export const BackButton: React.FC<BackButtonProps> = ({
  fallbackHref = "/",
  label,
  variant = "pill",
  size = "md",
  className = "",
  iconClassName = "",
  title,
  ariaLabel,
  onBeforeBack,
}) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    triggerSafeBack(router, fallbackHref, { onBeforeBack });
  };

  const accessibleLabel = ariaLabel || label || (title ? title : "Go back");

  // Variant styling
  const variantStyles = {
    pill: "inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-95 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-slate-700",
    ghost:
      "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
    button:
      "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
    icon: "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-95 min-h-[40px] min-w-[40px] p-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
    floating:
      "inline-flex items-center justify-center rounded-full bg-white/90 p-2.5 text-slate-800 shadow-lg backdrop-blur-md transition-all hover:bg-white hover:scale-105 active:scale-95 dark:bg-slate-900/90 dark:text-white dark:hover:bg-slate-900 min-h-[44px] min-w-[44px]",
  }[variant];

  // Size styling
  const sizeStyles = {
    sm: "text-[11px] py-1 px-2.5 gap-1",
    md: "text-xs py-1.5 px-3.5 gap-1.5",
    lg: "text-sm py-2 px-4 gap-2",
  }[size];

  // Icon sizing
  const iconSizeStyles = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-4.5 w-4.5",
  }[size];

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={accessibleLabel}
      title={title || label || "Go back"}
      className={`group select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 touch-manipulation ${variantStyles} ${variant !== "icon" && variant !== "floating" ? sizeStyles : ""} ${className}`}
    >
      <ArrowLeft
        className={`shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5 ${iconSizeStyles} ${iconClassName}`}
        aria-hidden="true"
      />
      {label && <span className="truncate">{label}</span>}
    </button>
  );
};

export default BackButton;
