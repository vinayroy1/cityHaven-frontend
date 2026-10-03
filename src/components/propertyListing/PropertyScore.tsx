"use client";

import React from "react";
import { panel } from "./theme";

export function PropertyScore({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const tone = clamped >= 80 ? "#059669" : clamped >= 45 ? "#0f172a" : "#f43f5e";
  const label = clamped >= 80 ? "Great" : clamped >= 45 ? "Getting there" : "Add more details";

  return (
    <div className={`${panel} flex items-center gap-3 p-4`}>
      <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 32 32)"
          style={{ transition: "stroke-dashoffset 0.45s ease" }}
        />
        <text x="32" y="37" textAnchor="middle" className="fill-slate-900 text-[13px] font-bold">
          {clamped}%
        </text>
      </svg>
      <div>
        <p className="text-sm font-semibold text-slate-900">Property score</p>
        <p className="text-xs text-slate-500">{label} — better score, greater visibility.</p>
      </div>
    </div>
  );
}
