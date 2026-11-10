/** Category helpers shared by the locality guide (server + client). */
import {
  Baby,
  BookOpen,
  Briefcase,
  Bus,
  Clapperboard,
  Dumbbell,
  Flame,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Landmark,
  Library,
  Mail,
  Pill,
  Plane,
  Shield,
  Ship,
  ShoppingBag,
  ShoppingCart,
  Stethoscope,
  TrainFront,
  TrainTrack,
  TramFront,
  Trees,
  Waves,
  type LucideIcon,
} from "lucide-react";

export type ExplorerItem = { key?: string; name: string; distanceKm: number; type?: string; lat?: number | null; lng?: number | null };

export type CategoryKey =
  | "metro" | "rail" | "bus" | "hospital" | "school" | "college" | "mall" | "it" | "airport"
  | "ferry" | "tram" | "clinic" | "pharmacy" | "childcare" | "supermarket" | "park" | "beach"
  | "police" | "fire" | "bank" | "worship" | "sports" | "library" | "cinema" | "post";

/** LandmarkType -> category for the types that map 1:1 (SCHOOL_COLLEGE is split by name below). */
const TYPE_CATEGORY: Record<string, CategoryKey> = {
  METRO_STATION: "metro", RAILWAY_STATION: "rail", BUS_TERMINAL: "bus", HOSPITAL: "hospital", SHOPPING_MALL: "mall",
  IT_PARK: "it", AIRPORT: "airport", FERRY_TERMINAL: "ferry", TRAM_STOP: "tram", CLINIC: "clinic", PHARMACY: "pharmacy",
  KINDERGARTEN_CHILDCARE: "childcare", SUPERMARKET: "supermarket", PARK: "park", BEACH: "beach", POLICE_STATION: "police",
  FIRE_STATION: "fire", BANK: "bank", PLACE_OF_WORSHIP: "worship", SPORTS_FITNESS: "sports", LIBRARY: "library",
  CINEMA: "cinema", POST_OFFICE: "post",
};

const COLLEGE_RE = /\b(college|university|institute|iit|iim|nit|polytechnic|academy of|school of|faculty|campus)\b/i;

export function categoryOf(it: ExplorerItem): CategoryKey | null {
  if (it.type === "SCHOOL_COLLEGE") return COLLEGE_RE.test(it.name) ? "college" : "school";
  return (it.type && TYPE_CATEGORY[it.type]) || null;
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
  ferry: { label: "Ferries", icon: Ship, chip: "bg-sky-700", dot: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300" },
  tram: { label: "Trams", icon: TrainTrack, chip: "bg-cyan-700", dot: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300" },
  clinic: { label: "Clinics", icon: Stethoscope, chip: "bg-rose-500", dot: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" },
  pharmacy: { label: "Pharmacies", icon: Pill, chip: "bg-pink-600", dot: "bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300" },
  childcare: { label: "Childcare", icon: Baby, chip: "bg-orange-500", dot: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300" },
  supermarket: { label: "Supermarkets", icon: ShoppingCart, chip: "bg-lime-600", dot: "bg-lime-100 text-lime-700 dark:bg-lime-950/50 dark:text-lime-300" },
  park: { label: "Parks", icon: Trees, chip: "bg-green-600", dot: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300" },
  beach: { label: "Beaches", icon: Waves, chip: "bg-blue-500", dot: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" },
  police: { label: "Police", icon: Shield, chip: "bg-slate-700", dot: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  fire: { label: "Fire stations", icon: Flame, chip: "bg-red-600", dot: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300" },
  bank: { label: "Banks", icon: Landmark, chip: "bg-yellow-600", dot: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300" },
  worship: { label: "Places of worship", icon: HandHeart, chip: "bg-purple-600", dot: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300" },
  sports: { label: "Gyms & sports", icon: Dumbbell, chip: "bg-teal-700", dot: "bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300" },
  library: { label: "Libraries", icon: Library, chip: "bg-amber-700", dot: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" },
  cinema: { label: "Cinemas", icon: Clapperboard, chip: "bg-violet-700", dot: "bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300" },
  post: { label: "Post offices", icon: Mail, chip: "bg-stone-600", dot: "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300" },
};

export const ORDER: CategoryKey[] = [
  "metro", "hospital", "school", "college", "mall", "it", "rail", "bus", "airport",
  "supermarket", "park", "clinic", "pharmacy", "childcare", "tram", "ferry", "beach", "sports",
  "worship", "bank", "police", "fire", "post", "library", "cinema",
];

export const fmtKm = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

export function travel(km: number) {
  if (km <= 1.5) return `${Math.max(1, Math.round((km / 4.8) * 60))} min walk`;
  const min = Math.round((km / 22) * 60);
  return min < 60 ? `${min} min drive` : `${Math.floor(min / 60)} h ${min % 60} min drive`;
}

