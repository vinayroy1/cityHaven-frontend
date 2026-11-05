"use client";

import React, { useState } from "react";
import { Check, Copy, MessageCircle, Share2, Sparkles, X } from "lucide-react";
import {
  buildPropertyWhatsAppCard,
  buildFlatmateWhatsAppCard,
  type PropertyWhatsAppCardInput,
  type FlatmateWhatsAppCardInput,
} from "@/lib/share/whatsappListingShare";

export interface WhatsAppShareButtonProps {
  type: "property" | "flatmate";
  propertyData?: PropertyWhatsAppCardInput;
  flatmateData?: FlatmateWhatsAppCardInput;
  /** Custom label; defaults to "WhatsApp" or "Share on WhatsApp" */
  label?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg" | "icon";
  /** Visual variant */
  variant?: "solid" | "outline" | "pill" | "subtle";
  /** Show live preview dialog before sharing? Defaults to false (1-click direct send) */
  showPreviewModal?: boolean;
  className?: string;
}

/**
 * Standard WhatsApp SVG icon
 */
export function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

export function WhatsAppShareButton({
  type,
  propertyData,
  flatmateData,
  label = "WhatsApp",
  size = "md",
  variant = "solid",
  showPreviewModal = false,
  className = "",
}: WhatsAppShareButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fallback URL if window is defined
  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : propertyData?.url || flatmateData?.url || "https://awasio.com";

  const card =
    type === "property" && propertyData
      ? buildPropertyWhatsAppCard({ ...propertyData, url: propertyData.url || currentUrl })
      : flatmateData
      ? buildFlatmateWhatsAppCard({ ...flatmateData, url: flatmateData.url || currentUrl })
      : null;

  if (!card) return null;

  const handleOpenWhatsApp = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (showPreviewModal) {
      setModalOpen(true);
      return;
    }
    window.open(card.whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await navigator.clipboard.writeText(card.fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore clipboard error
    }
  };

  // Base styling depending on variant and size
  const sizeClasses = {
    sm: "h-8 px-2.5 text-xs gap-1.5 rounded-lg",
    md: "h-10 px-3.5 text-xs sm:text-sm font-semibold gap-2 rounded-xl",
    lg: "h-11 sm:h-12 px-5 text-sm font-bold gap-2.5 rounded-xl",
    icon: "h-10 w-10 p-0 rounded-xl",
  }[size];

  const variantClasses = {
    solid:
      "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 active:scale-[0.98]",
    outline:
      "border border-emerald-600/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40",
    pill:
      "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-xs active:scale-[0.98]",
    subtle:
      "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50",
  }[variant];

  return (
    <>
      <button
        type="button"
        onClick={handleOpenWhatsApp}
        title="Share formatted listing card on WhatsApp"
        aria-label="Share listing card on WhatsApp"
        className={`inline-flex shrink-0 items-center justify-center transition-all ${sizeClasses} ${variantClasses} ${className}`}
      >
        <WhatsAppIcon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        {size !== "icon" && <span>{label}</span>}
      </button>

      {/* Optional Preview / Share Card Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
                  <WhatsAppIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    WhatsApp Share Card Preview
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Clean, visual card formatted for WhatsApp groups
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Simulated WhatsApp Chat Bubble */}
            <div className="mt-4 rounded-2xl bg-[#EFEAE2] dark:bg-slate-950 p-4 border border-emerald-900/10">
              <div className="relative max-w-sm rounded-2xl rounded-tl-xs bg-white dark:bg-slate-850 p-3.5 shadow-sm space-y-2 text-slate-800 dark:text-slate-100 font-sans text-xs sm:text-[13px] leading-relaxed">
                <div className="font-bold text-slate-900 dark:text-white">{card.headline}</div>
                <div className="text-emerald-700 dark:text-emerald-400 font-semibold">{card.badge}</div>
                {card.connectivity && (
                  <div className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/70 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 font-medium">
                    {card.connectivity}
                  </div>
                )}
                <div className="text-slate-500 dark:text-slate-400 whitespace-pre-line text-[11px]">
                  {card.callToAction}
                </div>
                <div className="flex justify-end pt-1">
                  <span className="text-[10px] text-slate-400">Just now ✓✓</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copied!" : "Copy Card Text"}</span>
              </button>

              <a
                href={card.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setModalOpen(false)}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>Open WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

