import React from "react";
import { AlertTriangle, Info, Smile } from "lucide-react";
import { cn } from "./utils";

type Tone = "info" | "warning" | "error" | "muted";

type Action = {
  label: string;
  onClick?: () => void;
};

type StateMessageProps = {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  tone?: Tone;
  action?: Action;
  className?: string;
};

const toneStyles: Record<Tone, { pill: string; accent: string; icon: string; title: string; text: string }> = {
  info: {
    pill: "bg-sky-50 text-sky-700",
    accent: "from-sky-500/90 via-sky-400/70 to-emerald-400/90",
    icon: "text-sky-600",
    title: "text-slate-900",
    text: "text-slate-600",
  },
  warning: {
    pill: "bg-amber-50 text-amber-700",
    accent: "from-amber-500/90 via-amber-400/70 to-orange-400/90",
    icon: "text-amber-600",
    title: "text-slate-900",
    text: "text-slate-700",
  },
  error: {
    pill: "bg-rose-50 text-rose-700",
    accent: "from-rose-500/90 via-rose-400/70 to-amber-400/90",
    icon: "text-rose-600",
    title: "text-slate-900",
    text: "text-slate-700",
  },
  muted: {
    pill: "bg-slate-100 text-slate-700",
    accent: "from-slate-400/80 via-slate-300/60 to-slate-200/90",
    icon: "text-slate-600",
    title: "text-slate-900",
    text: "text-slate-600",
  },
};

export function StateMessage({
  title = "Something went wrong",
  description = "We couldn't load this section. Please try again.",
  icon,
  tone = "info",
  action,
  className,
}: StateMessageProps) {
  const Icon = icon ?? (tone === "error" ? AlertTriangle : tone === "muted" ? Smile : Info);
  const styles = toneStyles[tone];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.38)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-gradient-to-br from-sky-400/15 via-indigo-500/10 to-emerald-300/15 blur-3xl" />
        <div className="absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-gradient-to-br from-amber-300/18 via-rose-300/10 to-sky-200/18 blur-3xl" />
      </div>
      <div className={cn("absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b", styles.accent)} />
      <div className="flex items-start gap-3">
        <span className={cn("inline-flex h-11 w-11 items-center justify-center rounded-xl backdrop-blur", styles.pill)}>
          <Icon className={cn("h-5 w-5", styles.icon)} />
        </span>
        <div className="flex-1 space-y-1">
          <p className={cn("text-sm font-semibold tracking-tight", styles.title)}>{title}</p>
          {description && <p className={cn("text-sm leading-relaxed", styles.text)}>{description}</p>}
          {action?.label && (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
