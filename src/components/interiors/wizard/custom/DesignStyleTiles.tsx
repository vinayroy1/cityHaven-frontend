"use client";

import { Check } from "lucide-react";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { InteriorWizardValues } from "@/types/interior.types";
import { DESIGN_STYLE_OPTIONS } from "@/features/interiors/wizard/options";
import { cn } from "@/lib/utils";
import { getAt, propPath, setPath, strOpts } from "./ui";

/** Warm palette swatches per style (stand-ins until curated 4:3 photos are added). */
const SWATCH: Record<string, string[]> = {
  Modern: ["#e7e5e4", "#a8a29e", "#292524"],
  Contemporary: ["#f5f5f4", "#d6b98c", "#57534e"],
  Minimalist: ["#fafaf9", "#e7e5e4", "#a8a29e"],
  Scandinavian: ["#f8fafc", "#e2d5c3", "#94a3b8"],
  "Modern Classic": ["#f5efe6", "#c8a97e", "#3f3f46"],
  "Luxury & Neo-Classical": ["#fdf6e3", "#c9a227", "#1c1917"],
  Japandi: ["#efe9e1", "#b8a58c", "#44403c"],
  "Bohemian & Eclectic": ["#fde68a", "#c2410c", "#065f46"],
  Industrial: ["#d6d3d1", "#78716c", "#1c1917"],
  "Traditional & Indian Ethnic": ["#fef3c7", "#b45309", "#7f1d1d"],
  Rustic: ["#e7d8c9", "#a16207", "#57381f"],
  "Art Deco": ["#fef9c3", "#0f766e", "#111827"],
};

export default function DesignStyleTiles({ values, form, props }: CustomStepProps<InteriorWizardValues>) {
  const path = propPath(props, "field", "services.designStyles");
  const max = typeof props?.max === "number" ? props.max : 5;
  const selected = getAt<string[]>(values, path) ?? [];
  const full = selected.length >= max;

  return (
    <div className="space-y-2">
      <div role="group" aria-label="Design styles" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {strOpts(DESIGN_STYLE_OPTIONS).map((o) => {
          const on = selected.includes(o.value);
          const sw = SWATCH[o.value] ?? ["#f5f5f4", "#d6d3d1", "#57534e"];
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              disabled={!on && full}
              onClick={() => setPath(form, path, on ? selected.filter((s) => s !== o.value) : [...selected, o.value])}
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 text-left transition disabled:cursor-not-allowed disabled:opacity-40",
                on ? "border-slate-900 shadow-md dark:border-white" : "border-transparent hover:border-slate-300",
              )}
            >
              <span className="flex aspect-[4/3] w-full" aria-hidden>
                <span className="flex-[3]" style={{ background: sw[0] }} />
                <span className="flex flex-[2] flex-col">
                  <span className="flex-1" style={{ background: sw[1] }} />
                  <span className="flex-1" style={{ background: sw[2] }} />
                </span>
              </span>
              <span className="block bg-white px-3 py-2 text-sm font-semibold text-slate-900 dark:bg-slate-900 dark:text-white">{o.label}</span>
              {on && (
                <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-slate-900 text-white shadow dark:bg-white dark:text-slate-900">
                  <Check className="size-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        {selected.length}/{max} selected{full ? " — remove one to pick another." : ""}
      </p>
    </div>
  );
}
