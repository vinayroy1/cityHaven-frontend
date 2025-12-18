"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "./utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none py-3 sm:py-4 data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-full bg-gradient-to-r from-rose-50 via-white to-sky-50 ring-1 ring-white/70 shadow-[inset_0_1px_2px_rgba(15,23,42,0.15)] backdrop-blur data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute h-full w-full rounded-full bg-gradient-to-r from-[#f43f5e] via-[#ec4899] to-[#6366f1] shadow-[0_10px_25px_-12px_rgba(236,72,153,0.7)] transition-all data-[orientation=vertical]:h-full",
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={cn(
            "group relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-white/90 bg-slate-900/90 text-xs font-semibold text-white shadow-[0_8px_18px_-10px_rgba(15,23,42,0.85)] transition-transform duration-200",
            "before:absolute before:-inset-2 before:rounded-full before:bg-white/10 before:blur before:content-[''] sm:h-6 sm:w-6",
            "after:absolute after:-inset-1.5 after:rounded-full after:border after:border-white/40 after:content-['']",
            "hover:scale-[1.08] hover:shadow-[0_15px_32px_-16px_rgba(15,23,42,0.9)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200/60",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
