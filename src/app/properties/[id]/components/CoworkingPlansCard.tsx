// Co-working centre on the property page: every plan with its own price, then terms, hours and
// what the price includes, which is what renters compare across centres.

import { CalendarClock, Check, Clock, FileText, Users } from "lucide-react";
import {
  formatPlanPrice,
  hoursLine,
  inclusionLabel,
  monthlySeatPrice,
  planTypeMeta,
  type CoworkingPlan,
} from "@/features/coworking/model";
import { formatMoney } from "@/lib/money";
import { cn } from "@/components/ui/utils";

type Props = {
  plans: CoworkingPlan[];
  currencyCode?: string | null;
  operator?: string | null;
  totalSeats?: number | null;
  seatsAvailable?: number | null;
  open24x7?: boolean | null;
  openingTime?: string | null;
  closingTime?: string | null;
  openDays?: string[] | null;
  inclusions?: string[] | null;
  lockInMonths?: number | null;
  noticePeriodDays?: number | null;
  depositMonths?: number | null;
  taxExtra?: boolean | null;
};

const months = (n: number) => `${n} month${n === 1 ? "" : "s"}`;

export function CoworkingPlansCard(props: Props) {
  const currency = props.currencyCode || "INR";
  const plans = props.plans ?? [];
  const hours = hoursLine(props);
  const terms = [
    props.lockInMonths ? { label: "Minimum lock-in", value: months(props.lockInMonths) } : null,
    props.noticePeriodDays ? { label: "Notice period", value: `${props.noticePeriodDays} days` } : null,
    props.depositMonths ? { label: "Security deposit", value: `${props.depositMonths} × monthly rent` } : null,
    props.taxExtra ? { label: "Taxes", value: "GST / taxes extra" } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const rows = plans.map((p, i) => {
    const meta = planTypeMeta(p.type);
    const perSeat = p.priceUnit === "PER_CABIN_MONTH" ? monthlySeatPrice(p) : null;
    const available = p.isAvailable !== false;
    return {
      key: `${p.type}-${i}`,
      title: p.name || meta.label,
      subtitle: p.name ? meta.label : "",
      price: formatPlanPrice(p.price, p.priceUnit, currency, false),
      perSeat: perSeat ? `≈ ${formatMoney(Math.round(perSeat), currency)} per seat / month` : "",
      details: [
        p.capacity ? `${p.capacity} ${p.type === "PRIVATE_CABIN" || p.type === "MANAGED_OFFICE" ? "seats" : "people"}` : null,
        p.daysIncluded ? `${p.daysIncluded} days / month` : null,
        p.minSeats ? `min. ${p.minSeats} seats` : null,
        p.lockInMonths ? `${months(p.lockInMonths)} lock-in` : null,
        p.depositMonths ? `${p.depositMonths} mo deposit` : null,
      ].filter((d): d is string => Boolean(d)),
      available,
      // "1 cabin left", not "1 free": free reads as "no charge".
      status: available ? (p.unitsAvailable ? leftLabel(p.type, p.unitsAvailable) : "Available") : "Full",
    };
  });

  return (
    <section id="plans" className="@container scroll-mt-24 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Workspace plans</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {props.operator ? `Run by ${props.operator}. ` : ""}Prices are starting rates; confirm availability with the operator.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
          {props.seatsAvailable ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Users className="h-3 w-3" /> {props.totalSeats ? `${props.seatsAvailable} of ${props.totalSeats} seats available` : `${props.seatsAvailable} seats available`}
            </span>
          ) : props.totalSeats ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Users className="h-3 w-3" /> {props.totalSeats} seats
            </span>
          ) : null}
          {hours && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Clock className="h-3 w-3" /> {hours}
            </span>
          )}
        </div>
      </div>

      {rows.length > 0 && (
        <>
          {/* Narrow (phones, side column): one card per plan, so nothing scrolls sideways. */}
          <ul className="space-y-2 @2xl:hidden">
            {rows.map((r) => (
              <li
                key={r.key}
                className={cn(
                  "rounded-xl border p-3",
                  r.available ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" : "border-dashed border-slate-300 bg-slate-50 opacity-70 dark:border-slate-700 dark:bg-slate-900",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">{r.title}</p>
                    {r.subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.subtitle}</p>}
                  </div>
                  <StatusBadge available={r.available} text={r.status} />
                </div>
                <p className="mt-1.5 text-lg font-bold text-slate-950 dark:text-white">{r.price}</p>
                {r.perSeat && <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{r.perSeat}</p>}
                {r.details.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.details.map((d) => (
                      <span key={d} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Wide: a comparison table. */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 @2xl:block dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2">Plan</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Details</th>
                  <th className="px-3 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((r) => (
                  <tr key={r.key} className={r.available ? "" : "opacity-60"}>
                    <td className="px-3 py-2.5 align-top">
                      <p className="font-semibold text-slate-900 dark:text-white">{r.title}</p>
                      {r.subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.subtitle}</p>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 align-top font-bold text-slate-900 dark:text-white">
                      {r.price}
                      {r.perSeat && <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{r.perSeat}</p>}
                    </td>
                    <td className="px-3 py-2.5 align-top text-xs text-slate-600 dark:text-slate-300">{r.details.join(" · ") || "—"}</td>
                    <td className="px-3 py-2.5 text-right align-top">
                      <StatusBadge available={r.available} text={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {(props.inclusions?.length ?? 0) > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Included in the price</p>
          <div className="flex flex-wrap gap-1.5">
            {props.inclusions!.map((v) => (
              <span key={v} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <Check className="h-3 w-3 text-emerald-600" /> {inclusionLabel(v)}
              </span>
            ))}
          </div>
        </div>
      )}

      {terms.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {terms.map((t) => (
            <div key={t.label} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/60">
              {t.label === "Taxes" ? <FileText className="h-3.5 w-3.5 text-slate-500" /> : <CalendarClock className="h-3.5 w-3.5 text-slate-500" />}
              <span className="text-slate-500 dark:text-slate-400">{t.label}</span>
              <span className="ml-auto font-semibold text-slate-900 dark:text-white">{t.value}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusBadge({ available, text }: { available: boolean; text: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        available ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
      )}
    >
      {text}
    </span>
  );
}

/** How many of this plan can still be booked: cabins and rooms count as units, desks as seats. */
function leftLabel(type: CoworkingPlan["type"], n: number) {
  const noun =
    type === "PRIVATE_CABIN" ? "cabin" : type === "MANAGED_OFFICE" ? "office" : type === "MEETING_ROOM" || type === "EVENT_SPACE" || type === "STUDIO" ? "room" : "seat";
  return `${n} ${noun}${n === 1 ? "" : "s"} left`;
}
