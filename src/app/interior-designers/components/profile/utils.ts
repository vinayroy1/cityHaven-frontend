import type {
  InteriorPricingUnit,
  InteriorProfile,
  InteriorProject,
  MaterialCategory,
} from "@/types/interior.types";

export const humanize = (value?: string | null) =>
  (value ?? "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

export const inr = (n?: number | null) =>
  n == null || Number.isNaN(Number(n)) ? "" : `₹${Number(n).toLocaleString("en-IN")}`;

export const unitLabel = (unit?: InteriorPricingUnit | string | null) => {
  switch (unit) {
    case "PER_SQFT":
      return "/sq.ft";
    case "PER_ROOM":
      return "/room";
    case "PER_UNIT":
      return "/unit";
    case "PER_PROJECT":
      return "/project";
    case "FIXED_PRICE":
      return " fixed";
    case "CUSTOM_QUOTATION":
      return "";
    default:
      return unit ? ` ${humanize(unit).toLowerCase()}` : "";
  }
};

export const priceRange = (min?: number | null, max?: number | null, unit?: string | null) => {
  if (min == null && max == null) return "";
  const base = min != null && max != null && max > min ? `${inr(min)} – ${inr(max)}` : inr(min ?? max);
  return `${base}${unitLabel(unit)}`;
};

export const nonEmpty = <T>(arr?: (T | null | undefined)[] | null): T[] =>
  (arr ?? []).filter((x): x is T => x != null && (typeof x !== "string" || x.trim() !== ""));

export const profileName = (p: InteriorProfile) =>
  p.businessName?.trim() || p.displayName?.trim() || p.fullName?.trim() || "Interior Designer";

export const MATERIAL_CATEGORY_LABEL: Record<MaterialCategory, string> = {
  BOARD: "Boards & Ply",
  SURFACE_FINISH: "Surface finishes",
  HARDWARE: "Hardware & fittings",
  COUNTERTOP: "Countertops",
  FLOORING: "Flooring",
  WALL_FINISH: "Wall finishes",
  LIGHTING: "Lighting",
  SANITARY: "Sanitary",
  OTHER: "Others",
};

export interface GalleryGroup {
  key: string;
  label: string;
  images: string[];
}

/** Room-wise galleries for a project, de-duplicated, with an "All" fallback. */
export function projectGalleries(project: InteriorProject): GalleryGroup[] {
  const groups: GalleryGroup[] = [];
  if (project.roomGalleriesV2?.length) {
    project.roomGalleriesV2.forEach((g, i) => {
      const images = nonEmpty(g.images);
      if (images.length)
        groups.push({ key: `${g.room}-${i}`, label: g.customLabel || humanize(g.room), images });
    });
  } else if (project.roomGalleries) {
    Object.entries(project.roomGalleries).forEach(([room, imgs]) => {
      const images = nonEmpty(imgs);
      if (images.length) groups.push({ key: room, label: humanize(room), images });
    });
  }
  const all = Array.from(
    new Set(
      nonEmpty([
        project.coverImage,
        ...(project.afterImages ?? []),
        ...(project.images ?? []),
        ...groups.flatMap((g) => g.images),
      ]),
    ),
  );
  return all.length ? [{ key: "ALL", label: "All", images: all }, ...groups] : groups;
}

export const projectMeta = (p: InteriorProject) =>
  nonEmpty([p.bhk || p.propertyConfig, p.locality || p.cityName, p.designStyle]).join(" · ");

export const projectBudget = (p: InteriorProject) =>
  p.budgetRange || (p.projectBudget ? `₹${(p.projectBudget / 100000).toFixed(1)}L` : "");

export const telHref = (phone?: string | null) => (phone ? `tel:+91${phone.replace(/\D/g, "").slice(-10)}` : "");
export const waHref = (phone?: string | null, text?: string) =>
  phone
    ? `https://wa.me/91${phone.replace(/\D/g, "").slice(-10)}${text ? `?text=${encodeURIComponent(text)}` : ""}`
    : "";

/**
 * Years in practice. Companies don't fill "Years of experience" in the wizard (the DB defaults it to 1),
 * so for them it's derived from the founding year.
 */
export const experienceYearsOf = (p: Pick<InteriorProfile, "providerType" | "experienceYears" | "yearEstablished">): number => {
  if (p.providerType === "COMPANY" && p.yearEstablished) return Math.max(0, new Date().getFullYear() - p.yearEstablished);
  return p.experienceYears || 0;
};
