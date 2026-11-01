"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Check, CloudOff, Loader2, PencilLine } from "lucide-react";
import { cn } from "@/components/ui/utils";
import type { AutosaveStatus } from "@/lib/listingEngine/useAutosave";

const ago = (d: Date, now: number) => {
  const s = Math.max(0, Math.round((now - d.getTime()) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

export function SaveStatusPill({
  status,
  lastSavedAt,
  onRetry,
  className,
}: {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  onRetry?: () => void;
  className?: string;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  let icon: React.ReactNode = null;
  let text = "";
  let tone = "text-slate-500";
  switch (status) {
    case "pending":
      icon = <PencilLine className="h-3.5 w-3.5" />;
      text = "Unsaved changes";
      break;
    case "saving":
      icon = <Loader2 className="h-3.5 w-3.5 animate-spin" />;
      text = "Saving…";
      break;
    case "saved":
      icon = <Check className="h-3.5 w-3.5" />;
      text = lastSavedAt ? `Saved ${ago(lastSavedAt, now)}` : "Saved";
      tone = "text-emerald-700 dark:text-emerald-400";
      break;
    case "offline":
      icon = <CloudOff className="h-3.5 w-3.5" />;
      text = "Offline – will retry";
      tone = "text-amber-700 dark:text-amber-400";
      break;
    case "error":
      icon = <AlertCircle className="h-3.5 w-3.5" />;
      text = "Couldn’t save";
      tone = "text-rose-600 dark:text-rose-400";
      break;
    default:
      text = lastSavedAt ? `Saved ${ago(lastSavedAt, now)}` : "Autosave on";
  }
  return (
    <span role="status" aria-live="polite" className={cn("inline-flex min-w-0 items-center gap-1.5 text-xs font-medium", tone, className)}>
      {icon}
      <span className="truncate">{text}</span>
      {status === "error" && onRetry && (
        <button type="button" onClick={onRetry} className="underline underline-offset-2">
          Retry
        </button>
      )}
    </span>
  );
}
