"use client";

import React from "react";
import { Clock, X } from "lucide-react";
import { cn } from "@/components/ui/utils";

/**
 * Modern replacement for <input type="time">. Value is "HH:MM" (24h) or "" — same as the native input,
 * so it drops into existing forms. Shows "9:30 AM"; a popover offers quick presets plus
 * hour / minute / AM-PM pickers.
 */
type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Presets shown as one-tap chips ("HH:MM"). */
  presets?: string[];
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 15, 30, 45];
const DEFAULT_PRESETS = ["08:00", "09:00", "10:00", "11:00", "12:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

function parse(v: string) {
  const m = /^(\d{1,2}):(\d{2})/.exec(v || "");
  if (!m) return null;
  const h24 = Math.min(23, Number(m[1]));
  return { h12: h24 % 12 === 0 ? 12 : h24 % 12, min: Number(m[2]), pm: h24 >= 12 };
}
const to24 = (h12: number, min: number, pm: boolean) =>
  `${String((h12 % 12) + (pm ? 12 : 0)).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
export function formatTime12(v: string) {
  const p = parse(v);
  return p ? `${p.h12}:${String(p.min).padStart(2, "0")} ${p.pm ? "PM" : "AM"}` : "";
}

export function TimePicker({
  id, value, onChange, onBlur, placeholder = "Select time", disabled, className, presets = DEFAULT_PRESETS, ...aria
}: Props) {
  const [open, setOpen] = React.useState(false);
  const root = React.useRef<HTMLDivElement>(null);
  const cur = parse(value);
  const h12 = cur?.h12 ?? 9;
  const min = cur?.min ?? 0;
  const pm = cur?.pm ?? false;

  React.useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !root.current?.contains(e.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open, onBlur]);

  const cell = (active: boolean) =>
    cn(
      "flex h-9 items-center justify-center rounded-lg text-sm font-semibold transition",
      active
        ? "bg-rose-600 text-white shadow-sm"
        : "text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-slate-800",
    );

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        {...aria}
        className={cn(
          "group flex h-11 w-full items-center gap-2.5 rounded-xl border bg-white px-3 text-left text-sm shadow-sm transition",
          "hover:border-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60",
          "dark:border-slate-700 dark:bg-slate-900",
          open ? "border-rose-400 ring-2 ring-rose-100 dark:ring-rose-900/50" : "border-slate-200",
        )}
      >
        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition", value ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60" : "bg-slate-100 text-slate-400 dark:bg-slate-800")}>
          <Clock className="h-4 w-4" />
        </span>
        <span className={cn("flex-1 font-semibold", value ? "text-slate-900 dark:text-white" : "font-normal text-slate-400")}>
          {value ? formatTime12(value) : placeholder}
        </span>
        {value && !disabled && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Clear time"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="rounded-md p-1 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-800"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a time"
          className="absolute left-0 z-50 mt-2 w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900"
        >
          <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick pick</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  onChange(p);
                  setOpen(false);
                  onBlur?.();
                }}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-semibold transition",
                  value === p
                    ? "border-rose-600 bg-rose-600 text-white"
                    : "border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:text-slate-300",
                )}
              >
                {formatTime12(p)}
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto] gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div>
              <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Hour</p>
              <div className="mt-1.5 grid grid-cols-4 gap-1">
                {HOURS.map((h) => (
                  <button key={h} type="button" className={cell(!!cur && h === h12)} onClick={() => onChange(to24(h, min, pm))}>
                    {h}
                  </button>
                ))}
              </div>
              <p className="mt-2.5 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Minute</p>
              <div className="mt-1.5 grid grid-cols-4 gap-1">
                {MINUTES.map((m) => (
                  <button key={m} type="button" className={cell(!!cur && m === min)} onClick={() => onChange(to24(h12, m, pm))}>
                    :{String(m).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">&nbsp;</p>
              <div className="mt-1.5 flex flex-col gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {[false, true].map((isPm) => (
                  <button
                    key={String(isPm)}
                    type="button"
                    onClick={() => onChange(to24(h12, min, isPm))}
                    className={cn(
                      "h-9 w-12 rounded-lg text-xs font-bold transition",
                      cur && pm === isPm ? "bg-white text-rose-600 shadow-sm dark:bg-slate-900" : "text-slate-500 hover:text-slate-800 dark:text-slate-400",
                    )}
                  >
                    {isPm ? "PM" : "AM"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!cur) onChange(to24(h12, min, pm));
                  setOpen(false);
                  onBlur?.();
                }}
                className="mt-auto h-9 rounded-lg bg-slate-900 text-xs font-bold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
