"use client";

import Image from "next/image";
import { isOptimizableImage } from "../../lib/image";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, ImageIcon, Images, Maximize2, Ruler, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InteriorProject } from "@/types/interior.types";
import {
  MATERIAL_CATEGORY_LABEL,
  nonEmpty,
  projectBudget,
  projectGalleries,
  projectMeta,
} from "./utils";

/* -------------------------------------------------------------------------- */
/*                                Project grid                                */
/* -------------------------------------------------------------------------- */

export function PortfolioGrid({ projects }: { projects: InteriorProject[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const active = projects.find((p) => p.id === openId) ?? null;

  return (
    <>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {projects.map((project) => {
          const cover = project.coverImage || project.afterImages?.[0] || project.images?.[0];
          const photoCount = projectGalleries(project)[0]?.images.length ?? 0;
          const budget = projectBudget(project);
          return (
            <li key={project.id}>
              <button
                type="button"
                onClick={() => setOpenId(project.id)}
                className="group block w-full overflow-hidden rounded-2xl border border-stone-200 bg-white text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-slate-800">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={`${project.title} – cover photo`}
                      fill
                      sizes="(min-width: 1024px) 340px, (min-width: 640px) 45vw, 92vw"
                      unoptimized={!isOptimizableImage(cover)}
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-stone-400">
                      <ImageIcon className="h-10 w-10" aria-hidden />
                    </div>
                  )}
                  {project.isFeatured && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-rose-700 shadow-sm">
                      Featured
                    </span>
                  )}
                  {photoCount > 1 && (
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                      <Images className="h-3.5 w-3.5" aria-hidden />
                      {photoCount}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 text-base font-bold text-slate-900 dark:text-white">
                    {project.title}
                  </h3>
                  {projectMeta(project) && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
                      {projectMeta(project)}
                    </p>
                  )}
                  {budget && (
                    <p className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                      Budget: {budget}
                    </p>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {active && <ProjectDetailDialog key={active.id} project={active} onClose={() => setOpenId(null)} />}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Project detail dialog                           */
/* -------------------------------------------------------------------------- */

function ProjectDetailDialog({ project, onClose }: { project: InteriorProject | null; onClose: () => void }) {
  const [tab, setTab] = useState("ALL");
  const [mode, setMode] = useState<"after" | "before">("after");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const galleries = useMemo(() => (project ? projectGalleries(project) : []), [project]);
  const beforeImages = useMemo(() => nonEmpty(project?.beforeImages), [project]);

  if (!project) return null;

  const activeGroup = galleries.find((g) => g.key === tab) ?? galleries[0];
  const images = mode === "before" ? beforeImages : activeGroup?.images ?? [];
  const duration = project.durationDays ?? project.executionDurationDays;
  const area = project.areaSqft ?? project.carpetAreaSqft;
  const budget = projectBudget(project);
  const materials = nonEmpty(project.materialsUsed);
  const legacySpecs = nonEmpty([
    project.actualBoardSpec && `Board: ${project.actualBoardSpec}`,
    project.actualFinishSpec && `Finish: ${project.actualFinishSpec}`,
    project.actualHardwareSpec && `Hardware: ${project.actualHardwareSpec}`,
    project.actualCountertopSpec && `Countertop: ${project.actualCountertopSpec}`,
  ]);
  const facts = [
    { icon: Ruler, label: "Area", value: area ? `${area.toLocaleString("en-IN")} sq.ft` : "" },
    { icon: Clock, label: "Duration", value: duration ? `${duration} days` : "" },
    { icon: null, label: "Budget", value: budget },
    { icon: null, label: "Property", value: project.propertyType || project.projectCategory || "" },
  ].filter((f) => f.value);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => {
          if (lightboxIndex != null) {
            e.preventDefault();
            setLightboxIndex(null);
          }
        }}
        className="flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:h-[90vh] sm:max-w-4xl sm:rounded-2xl sm:border"
      >
        <div className="flex items-start justify-between gap-3 border-b border-stone-200 px-4 py-3 sm:px-6 dark:border-slate-800">
          <div className="min-w-0">
            <DialogTitle className="truncate text-lg font-bold text-slate-900 dark:text-white">
              {project.title}
            </DialogTitle>
            <DialogDescription className="truncate text-sm text-slate-500">
              {projectMeta(project) || "Completed project"}
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-100 text-slate-700 hover:bg-stone-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-slate-800 dark:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-6">
          {/* Before/after toggle */}
          {beforeImages.length > 0 && (
            <div role="group" aria-label="Before or after photos" className="mb-3 inline-flex rounded-full bg-stone-100 p-1 dark:bg-slate-800">
              {(["after", "before"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                  className={`min-h-11 rounded-full px-5 text-sm font-semibold transition ${
                    mode === m ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-500"
                  }`}
                >
                  {m === "after" ? "After" : "Before"}
                </button>
              ))}
            </div>
          )}

          {/* Room tabs */}
          {mode === "after" && galleries.length > 1 && (
            <div role="tablist" aria-label="Rooms" className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {galleries.map((g) => (
                <button
                  key={g.key}
                  role="tab"
                  type="button"
                  aria-selected={tab === g.key}
                  onClick={() => setTab(g.key)}
                  className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${
                    tab === g.key
                      ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                      : "border-stone-200 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  {g.label} <span className="opacity-60">({g.images.length})</span>
                </button>
              ))}
            </div>
          )}

          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`Open photo ${i + 1} of ${images.length}`}
                  className={`group relative overflow-hidden rounded-xl bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-slate-800 ${
                    i === 0 ? "col-span-2 aspect-[16/10] sm:row-span-2 sm:aspect-auto" : "aspect-[4/3]"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${project.title} – ${mode === "before" ? "before" : activeGroup?.label ?? ""} photo ${i + 1}`}
                    fill
                    sizes={i === 0 ? "(min-width: 640px) 66vw, 100vw" : "(min-width: 640px) 33vw, 50vw"}
                    unoptimized={!isOptimizableImage(src)}
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                  <Maximize2 className="absolute right-2 top-2 h-4 w-4 text-white opacity-0 drop-shadow transition group-hover:opacity-100" aria-hidden />
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-stone-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-800/40">
              No photos uploaded for this project yet.
            </p>
          )}

          {facts.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className="rounded-xl border border-stone-200 p-3 dark:border-slate-800">
                  <dt className="text-xs font-medium text-slate-500">{f.label}</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {project.description?.trim() && (
            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {project.description}
            </p>
          )}

          {nonEmpty(project.servicesPerformed).length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Services performed</h4>
              <ul className="mt-2 flex flex-wrap gap-2">
                {nonEmpty(project.servicesPerformed).map((s) => (
                  <li key={s} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(materials.length > 0 || legacySpecs.length > 0) && (
            <div className="mt-6">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Materials used</h4>
              <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {materials.map((m) => (
                  <li key={m.id} className="rounded-xl border border-stone-200 px-3 py-2 text-sm dark:border-slate-800">
                    <span className="block text-xs text-slate-500">{MATERIAL_CATEGORY_LABEL[m.category] ?? m.category}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {nonEmpty([m.brand, m.material, m.grade]).join(" · ")}
                    </span>
                  </li>
                ))}
                {legacySpecs.map((s) => (
                  <li key={s} className="rounded-xl border border-stone-200 px-3 py-2 text-sm text-slate-800 dark:border-slate-800 dark:text-slate-200">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {lightboxIndex != null && images.length > 0 && (
          <Lightbox
            images={images}
            index={lightboxIndex}
            title={project.title}
            onIndex={setLightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*                         Work gallery (no project)                          */
/* -------------------------------------------------------------------------- */

export function WorkGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {images.map((src, i) => (
          <li key={`${src}-${i}`}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Open photo ${i + 1} of ${images.length}`}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-slate-800"
            >
              <Image
                src={src}
                alt={`${title} – work photo ${i + 1}`}
                fill
                sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw"
                unoptimized={!isOptimizableImage(src)}
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>
      {index != null && (
        <Lightbox images={images} index={index} title={title} onIndex={setIndex} onClose={() => setIndex(null)} />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Lightbox                                  */
/* -------------------------------------------------------------------------- */

function Lightbox({
  images,
  index,
  title,
  onIndex,
  onClose,
}: {
  images: string[];
  index: number;
  title: string;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const touchX = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const count = images.length;
  const go = useCallback((delta: number) => onIndex((index + delta + count) % count), [index, count, onIndex]);

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photo viewer`}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        else if (e.key === "ArrowLeft") go(-1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
      className="absolute inset-0 z-10 flex flex-col bg-black/95 outline-none"
    >
      <div className="flex items-center justify-between px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2 text-white">
        <span className="text-sm font-medium" aria-live="polite">
          {index + 1} / {count}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt={`${title} – photo ${index + 1} of ${count}`}
          className="max-h-full max-w-full select-none rounded-lg object-contain"
          draggable={false}
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
