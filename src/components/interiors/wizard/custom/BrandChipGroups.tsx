"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { MaterialCategory, MaterialSpecRow } from "@/types/interior.types";
import { Chip, inputCls, newId, secondaryBtn } from "./ui";

const GROUPS: { title: string; category: MaterialCategory; material: string; brands: string[] }[] = [
  { title: "Hardware", category: "HARDWARE", material: "Hinges & channels", brands: ["Hettich", "Hafele", "Blum", "Ebco", "Godrej"] },
  { title: "Boards", category: "BOARD", material: "Plywood / board", brands: ["Greenply", "CenturyPly", "Merino", "Action TESA", "Kitply"] },
  { title: "Laminates & finishes", category: "SURFACE_FINISH", material: "Laminate", brands: ["Merino Laminates", "Greenlam", "Royale Touche", "Century Laminates"] },
  { title: "Paint", category: "WALL_FINISH", material: "Paint", brands: ["Asian Paints", "Nippon Paint", "Berger", "Dulux"] },
  { title: "Appliances", category: "OTHER", material: "Appliances", brands: ["Bosch", "Elica", "Faber", "Hindware", "Siemens"] },
];

/** One-tap brand logos-as-chips grouped by category, plus "+ Other" per group. */
export function BrandChipGroups({ rows, onChange }: { rows: MaterialSpecRow[]; onChange: (next: MaterialSpecRow[]) => void }) {
  const [other, setOther] = useState<Record<string, string>>({});
  const has = (c: MaterialCategory, b: string) => rows.some((r) => r.category === c && (r.brand ?? "").toLowerCase().startsWith(b.toLowerCase()));
  const toggle = (g: (typeof GROUPS)[number], brand: string) =>
    onChange(
      has(g.category, brand)
        ? rows.filter((r) => !(r.category === g.category && (r.brand ?? "").toLowerCase().startsWith(brand.toLowerCase())))
        : [...rows, { id: newId("spec"), category: g.category, material: g.material, brand, isCustom: !g.brands.includes(brand) }],
    );

  return (
    <div className="space-y-4">
      {GROUPS.map((g) => {
        const custom = rows.filter((r) => r.category === g.category && r.brand && !g.brands.some((b) => r.brand!.toLowerCase().startsWith(b.toLowerCase())));
        return (
          <section key={g.title} className="space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{g.title}</p>
            <div className="flex flex-wrap gap-2">
              {g.brands.map((b) => (
                <Chip key={b} active={has(g.category, b)} onClick={() => toggle(g, b)}>{b}</Chip>
              ))}
              {custom.map((r) => (
                <Chip key={r.id} active onClick={() => onChange(rows.filter((x) => x.id !== r.id))}>{r.brand}</Chip>
              ))}
              <span className="inline-flex items-center gap-1">
                <input
                  aria-label={`Other ${g.title} brand`}
                  className={`${inputCls} h-9 w-32 rounded-full`}
                  placeholder="+ Other"
                  value={other[g.title] ?? ""}
                  onChange={(e) => setOther((o) => ({ ...o, [g.title]: e.target.value }))}
                  onKeyDown={(e) => {
                    const v = (other[g.title] ?? "").trim();
                    if (e.key === "Enter" && v) {
                      e.preventDefault();
                      if (!has(g.category, v)) toggle(g, v);
                      setOther((o) => ({ ...o, [g.title]: "" }));
                    }
                  }}
                />
                {(other[g.title] ?? "").trim() && (
                  <button
                    type="button"
                    aria-label={`Add ${other[g.title]}`}
                    className={`${secondaryBtn} h-9 px-2`}
                    onClick={() => {
                      const v = other[g.title].trim();
                      if (!has(g.category, v)) toggle(g, v);
                      setOther((o) => ({ ...o, [g.title]: "" }));
                    }}
                  >
                    <Plus className="size-4" />
                  </button>
                )}
              </span>
            </div>
          </section>
        );
      })}
    </div>
  );
}
