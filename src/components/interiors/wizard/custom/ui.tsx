"use client";

// Shared building blocks for the interior wizard custom steps.
// Kept local to the interiors wizard so it does not depend on in-flight engine UI.

import React, { useId, useRef, useState } from "react";
import { Check, GripVertical, ImagePlus, Loader2, Minus, Plus, X } from "lucide-react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MobileEditorScreen } from "./MobileEditorScreen";
import { useIsMobile } from "@/components/ui/use-mobile";
import { useInteriorUpload, type InteriorUploadSubFolder } from "@/features/interiors/upload";
import { cn } from "@/lib/utils";
import type { InteriorWizardValues } from "@/types/interior.types";

export const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-slate-800";
export const textareaCls = cn(inputCls, "h-auto min-h-[88px] py-2.5 leading-relaxed");
export const primaryBtn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900";
export const secondaryBtn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
export const ghostIconBtn =
  "inline-flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white";

export type Form = UseFormReturn<InteriorWizardValues>;

/** Typed-loosely path helpers: custom components get their paths from section props. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAt<T = any>(obj: unknown, path: string): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return path.split(".").reduce<any>((acc, k) => (acc == null ? acc : acc[k]), obj) as T;
}

export function setPath(form: Form, path: string, value: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form.setValue(path as any, value as any, { shouldDirty: true, shouldValidate: true });
}

export function propPath(props: Record<string, unknown> | undefined, key: string, fallback: string): string {
  const v = props?.[key];
  return typeof v === "string" && v ? v : fallback;
}

export const newId = (prefix: string) =>
  `${prefix}-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;

export const toNum = (raw: string): number | null => {
  if (raw.trim() === "") return null;
  const n = Number(raw.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
};

export const formatINR = (n: number | null | undefined) =>
  n == null ? "" : `₹${Math.round(n).toLocaleString("en-IN")}`;

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  required?: boolean;
  children: (id: string) => React.ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children(id)}
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
  disabled,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={!!active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-sm dark:border-white dark:bg-white dark:text-slate-950"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
    >
      {active && <Check className="size-3.5" aria-hidden />}
      {children}
    </button>
  );
}

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  multiple,
  label,
}: {
  options: { value: T; label: string }[];
  value: T[] | T | "" | null | undefined;
  onChange: (next: T[] | T) => void;
  multiple?: boolean;
  label?: string;
}) {
  const arr = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = arr.includes(o.value);
        return (
          <Chip
            key={o.value}
            active={on}
            onClick={() =>
              multiple ? onChange(on ? arr.filter((v) => v !== o.value) : [...arr, o.value]) : onChange(o.value)
            }
          >
            {o.label}
          </Chip>
        );
      })}
    </div>
  );
}

/** Large selectable card (Airbnb-host style). */
export function ChoiceCard({
  selected,
  onSelect,
  icon,
  title,
  description,
  footer,
}: {
  selected: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  footer?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group relative flex w-full flex-col items-start gap-3 rounded-2xl border-2 p-4 text-left transition sm:p-5",
        selected
          ? "border-slate-900 bg-slate-50 shadow-sm dark:border-white dark:bg-slate-800"
          : "border-slate-200 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900",
      )}
    >
      {icon && (
        <span
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-xl",
            selected ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
          )}
        >
          {icon}
        </span>
      )}
      <span className="block">
        <span className="block text-base font-semibold text-slate-900 dark:text-white">{title}</span>
        {description && <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{description}</span>}
      </span>
      {footer}
      <span
        className={cn(
          "absolute right-4 top-4 inline-flex size-5 items-center justify-center rounded-full border-2",
          selected ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900" : "border-slate-300",
        )}
        aria-hidden
      >
        {selected && <Check className="size-3" />}
      </span>
    </button>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 px-4 py-8 text-center dark:border-slate-700">
      <span className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {icon}
      </span>
      <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={primaryBtn}>
      <Plus className="size-4" aria-hidden /> {children}
    </button>
  );
}

/** Right Sheet on desktop; full-screen, keyboard-aware editor on mobile (bottom drawers break with the iOS keyboard). */
export function EditorPanel({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <MobileEditorScreen open={open} onOpenChange={onOpenChange} title={title} description={description} footer={footer}>
        {children}
      </MobileEditorScreen>
    );
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-slate-200 p-5 dark:border-slate-800">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">{children}</div>
        <div className="flex justify-end gap-2 border-t border-slate-200 p-4 dark:border-slate-800">{footer}</div>
      </SheetContent>
    </Sheet>
  );
}

/** Upload helper (presign + PUT via features/interiors/upload). */
export function useUploader(subFolder: string) {
  const uploadFile = useInteriorUpload();
  const [busy, setBusy] = useState(0);
  const upload = async (file: File): Promise<string | null> => {
    setBusy((b) => b + 1);
    try {
      return await uploadFile(file, subFolder as InteriorUploadSubFolder);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed. Please try again.");
      return null;
    } finally {
      setBusy((b) => b - 1);
    }
  };
  return { upload, uploading: busy > 0 };
}

export function ImageUpload({
  value,
  onChange,
  subFolder,
  label,
  aspect = "wide",
  accept = "image/*",
}: {
  value: string;
  onChange: (url: string) => void;
  subFolder: string;
  label: string;
  aspect?: "wide" | "square";
  accept?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUploader(subFolder);
  const isImage = !value || /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(value) || accept.startsWith("image");
  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="sr-only"
        aria-label={label}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) {
            const url = await upload(f);
            if (url) onChange(url);
          }
        }}
      />
      {value ? (
        <div className={cn("relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700", aspect === "square" ? "size-28" : "aspect-[16/9] w-full")}>
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="size-full object-cover" />
          ) : (
            <a href={value} target="_blank" rel="noreferrer" className="flex size-full items-center justify-center p-2 text-xs underline">
              View file
            </a>
          )}
          <div className="absolute right-2 top-2 flex gap-1">
            <button type="button" onClick={() => ref.current?.click()} className="rounded-lg bg-white/90 px-2 py-1 text-xs font-medium shadow">
              Replace
            </button>
            <button type="button" aria-label={`Remove ${label}`} onClick={() => onChange("")} className="rounded-lg bg-white/90 p-1 shadow">
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 text-sm text-slate-500 transition hover:border-slate-500 hover:text-slate-800 dark:border-slate-700",
            aspect === "square" ? "size-28" : "aspect-[16/9] w-full",
          )}
        >
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          <span>{uploading ? "Uploading…" : label}</span>
        </button>
      )}
    </div>
  );
}

/** Bulk image picker: multi-select or drop files, drag thumbnails to reorder. */
export function ImagesUpload({
  value,
  onChange,
  subFolder,
  label,
  max = 30,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  subFolder: string;
  label: string;
  max?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUploader(subFolder);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const list = value ?? [];
  const addFiles = async (all: File[]) => {
    const files = all.filter((f) => f.type.startsWith("image/")).slice(0, Math.max(0, max - list.length));
    const urls: string[] = [];
    for (const f of files) {
      const u = await upload(f);
      if (u) urls.push(u);
    }
    if (urls.length) onChange([...list, ...urls]);
  };
  return (
    <div
      onDragOver={(e) => {
        if (dragFrom === null && e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setDropActive(true);
        }
      }}
      onDragLeave={() => setDropActive(false)}
      onDrop={(e) => {
        if (dragFrom !== null || !e.dataTransfer.files.length) return;
        e.preventDefault();
        setDropActive(false);
        void addFiles(Array.from(e.dataTransfer.files));
      }}
      className={cn("rounded-xl transition", dropActive && "ring-2 ring-slate-900 ring-offset-2 dark:ring-white")}
    >
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        aria-label={label}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          void addFiles(files);
        }}
      />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {list.map((url, i) => (
          <div
            key={`${url}-${i}`}
            draggable
            onDragStart={() => setDragFrom(i)}
            onDragEnd={() => setDragFrom(null)}
            onDragOver={(e) => dragFrom !== null && e.preventDefault()}
            onDrop={(e) => {
              if (dragFrom === null) return;
              e.preventDefault();
              e.stopPropagation();
              onChange(moveItem(list, dragFrom, i));
              setDragFrom(null);
            }}
            className={cn(
              "group relative aspect-square cursor-grab overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700",
              dragFrom === i && "opacity-40",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`${label} ${i + 1}`} className="size-full object-cover" draggable={false} />
            <span className="absolute left-1 top-1 rounded-md bg-white/90 p-0.5 text-slate-600 shadow" aria-hidden>
              <GripVertical className="size-3.5" />
            </span>
            <button
              type="button"
              aria-label={`Remove image ${i + 1}`}
              onClick={() => onChange(list.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 rounded-md bg-white/90 p-0.5 shadow"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {list.length < max && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 px-1 text-center text-xs text-slate-500 hover:border-slate-500 dark:border-slate-700"
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            {uploading ? "Uploading…" : list.length ? "Add more" : "Add or drop photos"}
          </button>
        )}
      </div>
      {list.length > 1 && <p className="mt-1.5 text-xs text-slate-500">Drag to reorder · {list.length}/{max}</p>}
    </div>
  );
}

export function TagInput({
  value,
  onChange,
  placeholder,
  suggestions = [],
  label,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  label: string;
}) {
  const [draft, setDraft] = useState("");
  const list = value ?? [];
  const add = (t: string) => {
    const s = t.trim();
    if (s && !list.includes(s)) onChange([...list, s]);
    setDraft("");
  };
  const remaining = suggestions.filter((s) => !list.includes(s));
  return (
    <div className="space-y-2">
      {list.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {list.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-1 pl-3 pr-1 text-sm dark:bg-slate-800">
              {t}
              <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(list.filter((x) => x !== t))} className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700">
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          aria-label={label}
          className={inputCls}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            }
          }}
        />
        <button type="button" className={secondaryBtn} onClick={() => add(draft)} disabled={!draft.trim()}>
          Add
        </button>
      </div>
      {remaining.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {remaining.slice(0, 8).map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:border-slate-500 dark:border-slate-600 dark:text-slate-300">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <span>
        <span className="block text-sm font-medium text-slate-900 dark:text-white">{label}</span>
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-slate-900 peer-focus-visible:ring-2 peer-focus-visible:ring-slate-400 dark:peer-checked:bg-white" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5 dark:peer-checked:bg-slate-900" />
      </span>
    </label>
  );
}

export function StatusBadge({ tone, children }: { tone: "slate" | "green" | "amber" | "rose" | "blue"; children: React.ReactNode }) {
  const t = {
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    blue: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  }[tone];
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", t)}>{children}</span>;
}

export function apiErrorMessage(e: unknown, fallback = "Something went wrong. Please try again.") {
  const d = (e as { data?: { message?: string } })?.data;
  return d?.message || fallback;
}

/** Reactive read of a dotted path (re-renders on change). */
export function usePathValue<T>(form: Form, path: string): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useWatch({ control: form.control, name: path as any }) as T;
}

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

export const formatRange = (min: number | null | undefined, max: number | null | undefined) =>
  min == null ? "" : max != null && max > min ? `${formatINR(min)} – ${formatINR(max)}` : formatINR(min);

export function TextInput({
  label,
  value,
  onChange,
  hint,
  error,
  required,
  className,
  ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  label: string;
  value: string | number | null | undefined;
  onChange: (v: string) => void;
  hint?: React.ReactNode;
  error?: string;
}) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {(id) => (
        <input
          id={id}
          className={cn(inputCls, error && "border-rose-400")}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          {...rest}
        />
      )}
    </Field>
  );
}

/** − n + stepper for small integers (years, days). */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 50,
  label,
  suffix,
}: {
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  min?: number;
  max?: number;
  label: string;
  suffix?: string;
}) {
  const v = value ?? null;
  return (
    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950" role="group" aria-label={label}>
      <button type="button" aria-label={`Decrease ${label}`} className={ghostIconBtn} disabled={v == null || v <= min} onClick={() => onChange(v == null || v - 1 < min ? null : v - 1)}>
        <Minus className="size-4" />
      </button>
      <span className="min-w-14 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {v == null ? "—" : `${v}${suffix ? ` ${suffix}` : ""}`}
      </span>
      <button type="button" aria-label={`Increase ${label}`} className={ghostIconBtn} disabled={v != null && v >= max} onClick={() => onChange(v == null ? Math.max(min, 1) : Math.min(max, v + 1))}>
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/** Question-style sub heading inside a step. */
export function SubHeading({ title, hint, right }: { title: string; hint?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-base font-semibold text-slate-900 dark:text-white">{title}</p>
        {hint && <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
      {right}
    </div>
  );
}

/** Engine Option values may be string | number | boolean; these components use strings. */
export const strOpts = (opts: readonly { value: unknown; label: string }[]) => opts.map((o) => ({ value: String(o.value), label: o.label }));
