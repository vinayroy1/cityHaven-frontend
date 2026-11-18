import type { ConsultMode, PanditLeadStatus, PanditSegment, ServiceKey } from "./types";
import { cityDetailPath } from "@/lib/seo/countryPath";
import { formatMoney } from "@/lib/money";

export type ServiceOption = { value: ServiceKey; label: string; hint: string; icon: string; group: "home" | "sanskar" | "katha" | "dosh" | "other" | "vastu" };

/** Labels for option keys. Keys must match backend pandit.constants.ts. */
export const PUJA_SERVICES: ServiceOption[] = [
  { value: "GRIHA_PRAVESH", label: "Griha pravesh", hint: "House-warming puja for a new home", icon: "🏠", group: "home" },
  { value: "BHOOMI_PUJAN", label: "Bhoomi pujan", hint: "Before starting construction", icon: "🪔", group: "home" },
  { value: "VASTU_SHANTI", label: "Vastu shanti puja", hint: "Remove vastu dosh of a home or office", icon: "🧭", group: "home" },
  { value: "OFFICE_SHOP_OPENING", label: "Office / shop opening", hint: "Muhurat puja for a new business", icon: "🏪", group: "home" },
  { value: "VEHICLE_PUJA", label: "Vehicle puja", hint: "New car, bike or truck", icon: "🚗", group: "home" },
  { value: "SATYANARAYAN_KATHA", label: "Satyanarayan katha", hint: "Katha and puja at home", icon: "📿", group: "katha" },
  { value: "SUNDERKAND_PATH", label: "Sunderkand path", hint: "Recitation with family", icon: "📖", group: "katha" },
  { value: "AKHAND_RAMAYAN", label: "Akhand Ramayan", hint: "24-hour Ramcharitmanas path", icon: "📜", group: "katha" },
  { value: "BHAGWAT_KATHA", label: "Bhagwat katha", hint: "7-day Shrimad Bhagwat katha", icon: "🕉️", group: "katha" },
  { value: "HAVAN", label: "Havan / yagya", hint: "Fire ritual for peace & prosperity", icon: "🔥", group: "katha" },
  { value: "RUDRABHISHEK", label: "Rudrabhishek", hint: "Abhishek of Lord Shiva", icon: "🔱", group: "katha" },
  { value: "LAKSHMI_PUJA", label: "Lakshmi puja", hint: "Diwali, Dhanteras, business", icon: "🪙", group: "katha" },
  { value: "GANESH_PUJA", label: "Ganesh puja", hint: "Ganesh Chaturthi & new beginnings", icon: "🐘", group: "katha" },
  { value: "NAVAGRAHA_SHANTI", label: "Navagraha shanti", hint: "Peace of the nine planets", icon: "🪐", group: "dosh" },
  { value: "MAHAMRITYUNJAY_JAAP", label: "Mahamrityunjay jaap", hint: "For health and long life", icon: "🙏", group: "dosh" },
  { value: "KAAL_SARP_DOSH", label: "Kaal sarp dosh puja", hint: "Dosh nivaran", icon: "🐍", group: "dosh" },
  { value: "MANGAL_DOSH", label: "Mangal dosh puja", hint: "Manglik dosh nivaran", icon: "♂️", group: "dosh" },
  { value: "PITRU_DOSH", label: "Pitru dosh / Narayan bali", hint: "Ancestral peace rituals", icon: "🌾", group: "dosh" },
  { value: "NAAMKARAN", label: "Naamkaran", hint: "Baby naming ceremony", icon: "👶", group: "sanskar" },
  { value: "ANNAPRASHAN", label: "Annaprashan", hint: "Baby's first rice", icon: "🍚", group: "sanskar" },
  { value: "MUNDAN", label: "Mundan", hint: "First haircut ceremony", icon: "✂️", group: "sanskar" },
  { value: "UPANAYANA", label: "Upanayana / janeu", hint: "Sacred thread ceremony", icon: "🧵", group: "sanskar" },
  { value: "SAGAI", label: "Sagai / engagement", hint: "Roka, tilak, engagement", icon: "💍", group: "sanskar" },
  { value: "VIVAH", label: "Vivah / wedding", hint: "Complete wedding rituals", icon: "💐", group: "sanskar" },
  { value: "SHRADDH", label: "Shraddh / tarpan", hint: "Pitru paksha and annual shraddh", icon: "🌼", group: "sanskar" },
  { value: "ANTYESHTI", label: "Antyeshti / last rites", hint: "Funeral and terahvi rituals", icon: "🕯️", group: "sanskar" },
  { value: "JAIN_VIDHI", label: "Jain vidhi", hint: "Jain pujas and ceremonies", icon: "🤚", group: "other" },
  { value: "AKHAND_PATH", label: "Akhand path / Sukhmani sahib", hint: "Sikh path at home or gurdwara", icon: "🪯", group: "other" },
  { value: "ONLINE_PUJA", label: "Online / e-puja", hint: "Live video puja for family far away", icon: "💻", group: "other" },
  { value: "MUHURAT", label: "Muhurat consultation", hint: "Auspicious date for griha pravesh, registry, shifting", icon: "📅", group: "other" },
  { value: "KUNDALI", label: "Kundali / horoscope", hint: "Kundali making and matching", icon: "✨", group: "other" },
];

export const VASTU_SERVICE_OPTIONS: ServiceOption[] = [
  { value: "VASTU_HOME", label: "Home vastu visit", hint: "On-site check of a house or flat", icon: "🏡", group: "vastu" },
  { value: "VASTU_FLAT_PURCHASE", label: "Before buying a flat / house", hint: "Check a property before you buy or rent", icon: "🔑", group: "vastu" },
  { value: "VASTU_PLOT", label: "Plot selection", hint: "Shape, slope, facing and surroundings", icon: "🗺️", group: "vastu" },
  { value: "VASTU_NEW_CONSTRUCTION", label: "New construction planning", hint: "Room placement before building", icon: "🏗️", group: "vastu" },
  { value: "VASTU_FLOOR_PLAN", label: "Floor plan review", hint: "Send a plan, get corrections", icon: "📐", group: "vastu" },
  { value: "VASTU_OFFICE", label: "Office vastu", hint: "Desks, cabins, entrance, cash", icon: "🏢", group: "vastu" },
  { value: "VASTU_SHOP", label: "Shop / showroom vastu", hint: "Counter, display and entrance", icon: "🛍️", group: "vastu" },
  { value: "VASTU_FACTORY", label: "Factory / industrial vastu", hint: "Machines, storage, dispatch", icon: "🏭", group: "vastu" },
  { value: "VASTU_REMEDIES", label: "Remedies without demolition", hint: "Colours, pyramids, placement fixes", icon: "🧿", group: "vastu" },
  { value: "VASTU_ONLINE", label: "Online consultation", hint: "Video call with photos and plan", icon: "💻", group: "vastu" },
];

export const ALL_SERVICE_OPTIONS = [...PUJA_SERVICES, ...VASTU_SERVICE_OPTIONS];

export const SERVICE_GROUPS: { key: ServiceOption["group"]; label: string }[] = [
  { key: "home", label: "Home & new beginnings" },
  { key: "katha", label: "Katha, path & puja" },
  { key: "sanskar", label: "Sanskars & life events" },
  { key: "dosh", label: "Shanti & dosh nivaran" },
  { key: "other", label: "More" },
  { key: "vastu", label: "Vastu consultation" },
];

export const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "HINDI", label: "Hindi" },
  { value: "SANSKRIT", label: "Sanskrit" },
  { value: "ENGLISH", label: "English" },
  { value: "BENGALI", label: "Bengali" },
  { value: "MARATHI", label: "Marathi" },
  { value: "GUJARATI", label: "Gujarati" },
  { value: "PUNJABI", label: "Punjabi" },
  { value: "TAMIL", label: "Tamil" },
  { value: "TELUGU", label: "Telugu" },
  { value: "KANNADA", label: "Kannada" },
  { value: "MALAYALAM", label: "Malayalam" },
  { value: "ODIA", label: "Odia" },
  { value: "MAITHILI", label: "Maithili" },
  { value: "BHOJPURI", label: "Bhojpuri" },
  { value: "ASSAMESE", label: "Assamese" },
  { value: "NEPALI", label: "Nepali" },
];

export const TRADITION_OPTIONS: { value: string; label: string }[] = [
  { value: "NORTH_INDIAN", label: "North Indian" },
  { value: "SOUTH_INDIAN", label: "South Indian" },
  { value: "BENGALI", label: "Bengali" },
  { value: "MARATHI", label: "Marathi" },
  { value: "GUJARATI", label: "Gujarati" },
  { value: "ODIA", label: "Odia" },
  { value: "MAITHIL", label: "Maithil" },
  { value: "MARWARI", label: "Marwari / Rajasthani" },
  { value: "PUNJABI", label: "Punjabi" },
  { value: "KASHMIRI", label: "Kashmiri" },
  { value: "JAIN", label: "Jain" },
  { value: "ARYA_SAMAJ", label: "Arya Samaj" },
];

export const CONSULT_MODE_OPTIONS: { value: ConsultMode; label: string; hint: string }[] = [
  { value: "IN_PERSON", label: "Visit in person", hint: "Home, office or site" },
  { value: "ONLINE", label: "Online / video call", hint: "Anywhere in India or abroad" },
  { value: "PLAN_REVIEW", label: "Floor plan review", hint: "Customer sends a plan" },
];

export const HONORIFIC_SUGGESTIONS = ["Pandit", "Acharya", "Shastri", "Purohit", "Pujari", "Jyotishacharya", "Vastu Acharya", "Dr."];

export const LEAD_STATUS_OPTIONS: { value: PanditLeadStatus; label: string; tone: string }[] = [
  { value: "NEW", label: "New", tone: "bg-sky-50 text-sky-700" },
  { value: "CONTACTED", label: "Contacted", tone: "bg-indigo-50 text-indigo-700" },
  { value: "CONFIRMED", label: "Confirmed", tone: "bg-amber-50 text-amber-700" },
  { value: "COMPLETED", label: "Completed", tone: "bg-emerald-50 text-emerald-700" },
  { value: "LOST", label: "Lost", tone: "bg-slate-100 text-slate-600" },
];

export const SEGMENT_LABEL: Record<PanditSegment, string> = { PANDIT: "Pandit / Purohit", VASTU: "Vastu consultant" };

export const label = (list: { value: string; label: string }[], v: string | null | undefined) => list.find((o) => o.value === v)?.label ?? v ?? "";
export const serviceLabel = (v: string | null | undefined) => label(ALL_SERVICE_OPTIONS, v);
export const isVastuService = (v: string) => v.startsWith("VASTU_") && v !== "VASTU_SHANTI";

/** Fee in the profile's currency (₹ for India, the default). */
export const formatInr = (n: number | null | undefined, countryCode?: string | null) => (n ? formatMoney(Math.round(n), countryCode || "IN") : "");

export const panditName = (p: { honorific?: string | null; displayName: string }) =>
  p.honorific && !p.displayName.toLowerCase().startsWith(p.honorific.toLowerCase()) ? `${p.honorific} ${p.displayName}` : p.displayName;

export const citySlug = (city: string) => city.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const PANDIT_BASE = "/pandit-vastu";
/** /pandit-vastu[/cc]/city/slug: non-India profiles carry their country code (see countryPath). */
export const panditProfilePath = (p: { slug: string; city: string; countryCode?: string | null }) => cityDetailPath(PANDIT_BASE, p.city, p.slug, p.countryCode);
