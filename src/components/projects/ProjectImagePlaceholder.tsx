import { Building2 } from "lucide-react";

// Most projects come from RERA records with no photos; give each a distinct, designed tile instead of grey.
const PALETTES = [
  "from-rose-600 via-rose-700 to-slate-900",
  "from-indigo-600 via-indigo-800 to-slate-900",
  "from-emerald-600 via-teal-700 to-slate-900",
  "from-amber-500 via-orange-700 to-slate-900",
  "from-sky-600 via-blue-800 to-slate-900",
  "from-fuchsia-600 via-purple-800 to-slate-900",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function ProjectImagePlaceholder({ name, developerName }: { name: string; developerName?: string | null }) {
  const palette = PALETTES[hash(name || "project") % PALETTES.length];
  return (
    <div className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${palette}`} aria-hidden>
      {/* Faint skyline */}
      <svg className="absolute inset-x-0 bottom-0 h-2/3 w-full text-white/10" viewBox="0 0 400 160" preserveAspectRatio="none" fill="currentColor">
        <path d="M0 160V96h28V70h22v26h18V50h30v46h16V30h34v66h14V62h26v34h20V44h30v52h16V20h36v76h18V58h24v38h22V76h26v84z" />
      </svg>
      <div className="relative flex flex-col items-center px-4 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
          <Building2 className="h-6 w-6 text-white" />
        </span>
        <span className="mt-2 line-clamp-2 max-w-[90%] text-sm font-extrabold leading-tight text-white drop-shadow">{name}</span>
        {developerName && <span className="mt-0.5 line-clamp-1 text-[11px] font-medium text-white/75">by {developerName}</span>}
        <span className="mt-1.5 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/85">Photos coming soon</span>
      </div>
    </div>
  );
}
