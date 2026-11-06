"use client";

import React, { useState } from "react";
import { Download, Image as ImageIcon, Loader2, Share2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { WhatsAppIcon } from "@/components/common/WhatsAppShareButton";
import {
  generatePropertyShareCardBlob,
  type ShareCardCanvasInput,
} from "@/lib/share/generateShareCardCanvas";

export interface PropertyShareCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ShareCardCanvasInput;
}

export function PropertyShareCardModal({
  open,
  onOpenChange,
  data,
}: PropertyShareCardModalProps) {
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!open) return null;

  // Server-generated card preview URL
  const serverPreviewUrl = `/api/properties/share-card?title=${encodeURIComponent(
    data.title
  )}&price=${encodeURIComponent(data.price)}&location=${encodeURIComponent(
    data.location
  )}&type=${encodeURIComponent(data.propertyType)}&tag=${encodeURIComponent(
    data.tag || "Zero Brokerage · Direct Owner"
  )}&url=${encodeURIComponent(data.propertyUrl)}${
    data.imageUrl ? `&image=${encodeURIComponent(data.imageUrl)}` : ""
  }`;

  const handleDownloadImage = async () => {
    try {
      setDownloading(true);
      const blob = await generatePropertyShareCardBlob(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.title.replace(/[^a-zA-Z0-9]/g, "-")}-Awasio-Card.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Property Share Card downloaded!");
    } catch (e) {
      console.error(e);
      // Fallback: download via server image URL
      const a = document.createElement("a");
      a.href = serverPreviewUrl;
      a.download = "Property-Share-Card.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Downloading share card...");
    } finally {
      setDownloading(false);
    }
  };

  const handleShareOnWhatsApp = async () => {
    try {
      setGenerating(true);
      // If mobile browser supports sharing files directly via navigator.share:
      if (typeof navigator !== "undefined" && navigator.canShare) {
        try {
          const blob = await generatePropertyShareCardBlob(data);
          const file = new File([blob], "property-card.png", { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: data.title,
              text: `🏠 *${data.title}* · *${data.price}*\n📍 ${data.location}\n🚫 ${data.tag || "Zero Brokerage · Direct Owner"}\n\n🔗 View listing: ${data.propertyUrl}`,
              files: [file],
            });
            onOpenChange(false);
            return;
          }
        } catch (shareErr) {
          if (shareErr instanceof DOMException && shareErr.name === "AbortError") {
            return;
          }
        }
      }

      // Default WhatsApp text share with link
      const text = `🏠 *${data.title}* · *${data.price}*\n📍 ${data.location}\n🚫 ${data.tag || "Zero Brokerage · Direct Owner"}\n\n🖼️ View verified photos, floorplan & owner contact:\n${data.propertyUrl}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
      onOpenChange(false);
    } catch {
      toast.error("Could not share image directly");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Shareable Property Card
              </h3>
              <p className="text-[11px] text-slate-500">
                With your property image, price, QR code & Awasio branding
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Live Preview of the Card */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 dark:bg-slate-950">
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900 ring-1 ring-black/5 aspect-[1080/600]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={serverPreviewUrl}
              alt={data.title}
              className="h-full w-full object-contain"
              loading="eager"
            />
          </div>
          <p className="mt-3 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Customers who scan this QR code land directly on this listing and can send you enquiries.
          </p>
        </div>

        {/* Actions Footer */}
        <div className="flex flex-col gap-2 border-t border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadImage}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-800 transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Download PNG Card</span>
          </button>

          <button
            type="button"
            disabled={generating}
            onClick={handleShareOnWhatsApp}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <WhatsAppIcon className="h-4 w-4" />
            )}
            <span>Share to WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}

