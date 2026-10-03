"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { chipShell, chipIdle, chipSelected, chipSize } from "./theme";

type ChipProps = {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
  /** show a check mark when selected (default true) */
  showCheck?: boolean;
};

export function Chip({ selected, onClick, children, size = "md", className, showCheck = true }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(chipShell, chipSize[size], selected ? chipSelected : chipIdle, className)}
    >
      {selected && showCheck && <Check className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}
