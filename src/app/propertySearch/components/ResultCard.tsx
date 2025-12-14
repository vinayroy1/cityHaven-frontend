import React from "react";
import { Heart, ImageIcon, Phone, Play } from "lucide-react";

type Props = { title?: string; subtitle?: string; price?: string; area?: string; age?: string; owner?: string; images?: string[] };
const FALLBACK_IMAGE = "/property-placeholder.svg";

export function ResultCard({ title, subtitle, price, area, age, owner, images = [] }: Props) {
  const safeImages = React.useMemo(() => {
    const unique = images.filter(Boolean);
    return unique.length ? unique : [FALLBACK_IMAGE];
  }, [images]);
  const [activeImage, setActiveImage] = React.useState(0);
  const [imgErrorMap, setImgErrorMap] = React.useState<Record<number, boolean>>({});
  const displayedImage = imgErrorMap[activeImage] ? FALLBACK_IMAGE : safeImages[activeImage];
  const isFallback = displayedImage === FALLBACK_IMAGE;

  React.useEffect(() => {
    setActiveImage(0);
    setImgErrorMap({});
  }, [safeImages]);

  React.useEffect(() => {
    if (safeImages.length <= 1) return;
    const id = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % safeImages.length);
    }, 2800);
    return () => clearInterval(id);
  }, [safeImages.length]);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100/80 bg-gradient-to-r from-white to-slate-50/80 shadow-xl shadow-slate-200/70 transition hover:-translate-y-1.5 hover:shadow-rose-100">
      <div className="absolute inset-0 pointer-events-none opacity-70" aria-hidden>
        <div className="h-full w-full bg-[radial-gradient(circle_at_10%_20%,rgba(244,63,94,0.06),transparent_28%),radial-gradient(circle_at_90%_15%,rgba(56,189,248,0.08),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.08),transparent_30%)]" />
      </div>
      <div className="relative w-full">
        <div className="flex h-full overflow-hidden rounded-2xl p-3">
          <div className="relative h-[200px] w-full overflow-hidden rounded-2xl bg-slate-100">
            <img
              src={displayedImage}
              alt={title || "property"}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              onError={() => {
                setImgErrorMap((prev) => {
                  if (prev[activeImage]) return prev;
                  return { ...prev, [activeImage]: true };
                });
              }}
            />
            <div className="absolute left-3 top-3 flex flex-row flex-wrap items-center gap-1 md:hidden">
              <span className="rounded-full bg-gradient-to-r from-emerald-500/90 to-teal-400/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow">
                Verified
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
                Featured
              </span>
            </div>
            <button
              type="button"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md transition hover:scale-105"
            >
              <Heart className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow">Request photos</span>
              {safeImages.length > 1 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-1 text-[11px] font-semibold text-white shadow">
                  <Play className="h-3 w-3" /> Auto
                </span>
              )}
            </div>
            {safeImages.length > 1 && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 shadow-sm">
                {safeImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`h-2 w-2 rounded-full ${idx === activeImage ? "bg-rose-500" : "bg-slate-300"}`}
                    aria-label={`Go to image ${idx + 1}`}
                    onClick={() => setActiveImage(idx)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col gap-1 md:gap-3 px-4 pt-2.5 pb-3 md:py-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-lg font-semibold text-slate-900">{title}</p>
            <p className="text-sm text-slate-600">{subtitle}</p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full bg-gradient-to-r from-emerald-500/90 to-teal-400/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow">
              Verified
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
              Featured
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="rounded-full bg-white/90 px-3 py-1 shadow-sm shadow-slate-200">{price}</span>
          <span className="text-slate-500">•</span>
          <span className="rounded-full bg-white/90 px-3 py-1 shadow-sm shadow-slate-200">{area}</span>
          <span className="text-slate-500">•</span>
          <span className="text-xs font-medium text-slate-600">{age} · {owner}</span>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm transition hover:-translate-y-0.5">
            View number
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5">
            <Phone className="h-4 w-4" /> Contact
          </button>
        </div>
      </div>
    </article>
  );
}
