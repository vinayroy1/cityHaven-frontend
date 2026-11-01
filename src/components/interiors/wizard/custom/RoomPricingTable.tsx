"use client";

import { Plus, Trash2 } from "lucide-react";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { InteriorPricingUnit, InteriorWizardValues, RoomPricingRow, RoomType } from "@/types/interior.types";
import { ROOM_TYPES } from "@/features/interiors/wizard/options";
import { Chip, getAt, ghostIconBtn, inputCls, newId, propPath, setPath, toNum } from "./ui";

const UNITS: { value: InteriorPricingUnit; label: string }[] = [
  { value: "PER_ROOM", label: "per room" },
  { value: "PER_SQFT", label: "per sq.ft" },
];

export default function RoomPricingTable({ values, form, props }: CustomStepProps<InteriorWizardValues>) {
  const path = propPath(props, "field", "pricing.roomPricing");
  const rows = getAt<RoomPricingRow[]>(values, path) ?? [];
  const write = (next: RoomPricingRow[]) => setPath(form, path, next);
  const update = (id: string, p: Partial<RoomPricingRow>) => write(rows.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const used = new Set(rows.map((r) => r.room));
  const add = (room: RoomType) => write([...rows, { id: newId("room"), room, priceMin: null, priceMax: null, unit: "PER_ROOM", inclusions: [] }]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {ROOM_TYPES.filter((r) => !used.has(r.value) || r.value === "OTHER").map((r) => (
          <Chip key={r.value} onClick={() => add(r.value)}>
            <Plus className="size-3.5" /> {r.label}
          </Chip>
        ))}
      </div>
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="px-3 py-2 text-left font-medium" scope="col">Room</th>
                <th className="px-3 py-2 text-left font-medium" scope="col">From ₹</th>
                <th className="px-3 py-2 text-left font-medium" scope="col">Up to ₹</th>
                <th className="px-3 py-2 text-left font-medium" scope="col">Unit</th>
                <th className="px-3 py-2" scope="col"><span className="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const label = ROOM_TYPES.find((x) => x.value === r.room)?.label ?? "Room";
                return (
                  <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2">
                      {r.room === "OTHER" ? (
                        <input aria-label="Room name" className={inputCls} placeholder="Room name" value={r.customLabel ?? ""} onChange={(e) => update(r.id, { customLabel: e.target.value })} />
                      ) : (
                        <span className="font-medium">{label}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input aria-label={`${label} from price`} inputMode="numeric" className={inputCls} value={r.priceMin ?? ""} onChange={(e) => update(r.id, { priceMin: toNum(e.target.value) })} />
                    </td>
                    <td className="px-3 py-2">
                      <input aria-label={`${label} max price`} inputMode="numeric" className={inputCls} value={r.priceMax ?? ""} onChange={(e) => update(r.id, { priceMax: toNum(e.target.value) })} />
                    </td>
                    <td className="px-3 py-2">
                      <select aria-label={`${label} unit`} className={inputCls} value={r.unit} onChange={(e) => update(r.id, { unit: e.target.value as InteriorPricingUnit })}>
                        {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" aria-label={`Remove ${label}`} className={ghostIconBtn} onClick={() => write(rows.filter((x) => x.id !== r.id))}>
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
