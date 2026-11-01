"use client";

import React from "react";
import { cn } from "@/components/ui/utils";
import { errorText, fieldLabel, helpText } from "./theme";

/** Label + hint + error frame shared by every field type. */
export function FieldShell({
  id,
  label,
  required,
  publishOnly,
  help,
  error,
  counter,
  children,
  as = "div",
  hideLabel,
  className,
}: {
  id: string;
  label: string;
  required?: boolean;
  publishOnly?: boolean;
  help?: React.ReactNode;
  error?: string;
  counter?: React.ReactNode;
  children: React.ReactNode;
  /** fieldset for groups (chips / radios), so the legend labels the group. */
  as?: "div" | "fieldset";
  hideLabel?: boolean;
  className?: string;
}) {
  const labelNode = (
    <span className={cn(fieldLabel, "flex flex-wrap items-center gap-x-1.5", hideLabel && "sr-only")}>
      {label}
      {required && (
        <span className="text-rose-500" aria-hidden>
          *
        </span>
      )}
      {publishOnly && !required && (
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
          Needed to publish
        </span>
      )}
    </span>
  );
  const helpId = `${id}-help`;
  const errId = `${id}-error`;
  const footer = (
    <>
      {(help || counter) && (
        <div className="flex items-start justify-between gap-3">
          {help ? (
            <p id={helpId} className={helpText}>
              {help}
            </p>
          ) : (
            <span />
          )}
          {counter && <span className={cn(helpText, "shrink-0 tabular-nums")}>{counter}</span>}
        </div>
      )}
      {error && (
        <p id={errId} role="alert" className={errorText}>
          {error}
        </p>
      )}
    </>
  );
  if (as === "fieldset") {
    return (
      <fieldset className={cn("min-w-0 space-y-2", className)} aria-describedby={error ? errId : help ? helpId : undefined}>
        <legend className="mb-2">{labelNode}</legend>
        {children}
        {footer}
      </fieldset>
    );
  }
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <label htmlFor={id} className="block">
        {labelNode}
      </label>
      {children}
      {footer}
    </div>
  );
}

export const describedBy = (id: string, help?: unknown, error?: unknown) =>
  [error ? `${id}-error` : null, help ? `${id}-help` : null].filter(Boolean).join(" ") || undefined;

export const domId = (name: string) => `f-${name.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
