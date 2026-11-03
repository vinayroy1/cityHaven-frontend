/** Category helpers shared by the locality guide (server + client). */
import {
  BookOpen,
  Briefcase,
  Bus,
  GraduationCap,
  HeartPulse,
  Plane,
  ShoppingBag,
  TrainFront,
  TramFront,
  type LucideIcon,
} from "lucide-react";

export type ExplorerItem = { key?: string; name: string; distanceKm: number; type?: string; lat?: number | null; lng?: number | null };

export type CategoryKey = "metro" | "rail" | "bus" | "hospital" | "school" | "college" | "mall" | "it" | "airport";

const COLLEGE_RE = /\b(college|university|institute|iit|iim|nit|polytechnic|academy of|school of|faculty|campus)\b/i;

export function categoryOf(it: ExplorerItem): CategoryKey | null {
  switch (it.type) {
    case "METRO_STATION":
      return "metro";
    case "RAILWAY_STATION":
      return "rail";
    case "BUS_TERMINAL":
      return "bus";
    case "HOSPITAL":
      return "hospital";
    case "SCHOOL_COLLEGE":
      return COLLEGE_RE.test(it.name) ? "college" : "school";
    case "SHOPPING_MALL":
      return "mall";
    case "IT_PARK":
      return "it";
    case "AIRPORT":
      return "airport";
    default:
      return null;
  }
}

export const CATEGORY_META: Record<CategoryKey, { label: string; icon: LucideIcon; chip: string; dot: string }> = {
  metro: { label: "Metro", icon: TramFront, chip: "bg-sky-600", dot: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300" },
  rail: { label: "Railway", icon: TrainFront, chip: "bg-cyan-600", dot: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300" },
  bus: { label: "Bus", icon: Bus, chip: "bg-teal-600", dot: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300" },
  hospital: { label: "Hospitals", icon: HeartPulse, chip: "bg-rose-600", dot: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" },
  school: { label: "Schools", icon: GraduationCap, chip: "bg-amber-600", dot: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
  college: { label: "Colleges", icon: BookOpen, chip: "bg-emerald-600", dot: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" },
  mall: { label: "Malls", icon: ShoppingBag, chip: "bg-violet-600", dot: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300" },
  it: { label: "IT parks", icon: Briefcase, chip: "bg-indigo-600", dot: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300" },
  airport: { label: "Airports", icon: Plane, chip: "bg-fuchsia-600", dot: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300" },
};

export const ORDER: CategoryKey[] = ["metro", "hospital", "school", "college", "mall", "it", "rail", "bus", "airport"];

export const fmtKm = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

export function travel(km: number) {
  if (km <= 1.5) return `${Math.max(1, Math.round((km / 4.8) * 60))} min walk`;
  const min = Math.round((km / 22) * 60);
  return min < 60 ? `${min} min drive` : `${Math.floor(min / 60)} h ${min % 60} min drive`;
}

