/** Compact FAQ accordion for the locality guide (server-rendered; matches FAQPage JSON-LD). */
import { Fragment } from "react";
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  HeartPulse,
  Home,
  Mail,
  MessageCircleQuestion,
  Plane,
  ShoppingBag,
  TrainFront,
  TramFront,
  type LucideIcon,
} from "lucide-react";
import type { Faq } from "./seo";

const ICONS: Array<[RegExp, LucideIcon, string]> = [
  [/metro/i, TramFront, "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300"],
  [/railway/i, TrainFront, "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-300"],
  [/hospital/i, HeartPulse, "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"],
  [/school/i, GraduationCap, "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"],
  [/college/i, BookOpen, "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"],
  [/mall/i, ShoppingBag, "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300"],
  [/airport/i, Plane, "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950/40 dark:text-fuchsia-300"],
  [/pincode/i, Mail, "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"],
  [/live/i, Home, "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"],
];

function iconFor(q: string): [LucideIcon, string] {
  const hit = ICONS.find(([re]) => re.test(q));
  return hit ? [hit[1], hit[2]] : [MessageCircleQuestion, "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"];
}

/** Highlights distances ("2.2 km", "300 m") and 6-digit pincodes inside an answer. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\d+(?:\.\d+)?\s?(?:km|m)\b|\b\d{6}\b)/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            className="mx-0.5 inline-block whitespace-nowrap rounded-md bg-emerald-50 px-1.5 py-px text-[12px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
          >
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function LocalityFaq({ name, faqs }: { name: string; faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <section className="mt-8" aria-labelledby="faq-title">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 id="faq-title" className="text-lg font-bold text-slate-900 dark:text-white">
            Quick answers
          </h2>
          <p className="text-xs text-slate-500">Common questions about living in {name}</p>
        </div>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800">
          {faqs.length} questions
        </span>
      </div>

      <div className="space-y-2">
        {faqs.map((f, i) => {
          const [Icon, tone] = iconFor(f.q);
          return (
            <details
              key={f.q}
              open={i === 0}
              className="group rounded-2xl border border-slate-200/80 bg-white transition-colors open:border-emerald-200 open:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:open:border-emerald-900"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-3.5 py-3 [&::-webkit-details-marker]:hidden">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="min-w-0 flex-1 text-[13.5px] font-semibold leading-snug text-slate-800 dark:text-slate-100">
                  {f.q}
                </h3>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="pb-3.5 pl-[3.6rem] pr-4 text-[13px] leading-6 text-slate-600 dark:text-slate-400">
                <Rich text={f.a} />
              </p>
            </details>
          );
        })}
      </div>
    </section>
  );
}
