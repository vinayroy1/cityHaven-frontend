import { BedDouble, Building2, Castle, Home, Hotel, Landmark, Tent, Users } from "lucide-react";
import type { StayType } from "./types";

export const STAY_TYPES: Array<{ value: StayType; label: string; plural: string; blurb: string; icon: typeof Hotel }> = [
  { value: "HOTEL", label: "Hotel", plural: "Hotels", blurb: "Rooms with daily housekeeping", icon: Hotel },
  { value: "GUEST_HOUSE", label: "Guest House", plural: "Guest Houses", blurb: "Small, family-run, budget friendly", icon: Home },
  { value: "LODGE", label: "Lodge", plural: "Lodges", blurb: "Simple rooms near transit & markets", icon: Building2 },
  { value: "HOMESTAY", label: "Homestay", plural: "Homestays", blurb: "Live with a local family", icon: Users },
  { value: "HOSTEL", label: "Hostel", plural: "Hostels", blurb: "Dorm beds for solo travellers", icon: BedDouble },
  { value: "DHARAMSHALA", label: "Dharamshala", plural: "Dharamshalas", blurb: "Free or donation stays near temples", icon: Landmark },
  { value: "RESORT", label: "Resort", plural: "Resorts", blurb: "Leisure stays with amenities", icon: Castle },
  { value: "SERVICE_APARTMENT", label: "Service Apartment", plural: "Service Apartments", blurb: "Furnished flats by the night", icon: Tent },
];

export const stayTypeLabel = (t?: string | null) => STAY_TYPES.find((x) => x.value === t)?.label ?? "Stay";

export const FACILITIES: Array<{ value: string; label: string }> = [
  { value: "WIFI", label: "Free Wi-Fi" },
  { value: "PARKING", label: "Parking" },
  { value: "AC", label: "Air conditioning" },
  { value: "POWER_BACKUP", label: "Power backup" },
  { value: "LIFT", label: "Lift" },
  { value: "HOT_WATER", label: "24×7 hot water" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "BHOJANALAYA", label: "Bhojanalaya / meals" },
  { value: "ROOM_SERVICE", label: "Room service" },
  { value: "LAUNDRY", label: "Laundry" },
  { value: "CCTV", label: "CCTV & security" },
  { value: "RECEPTION_24H", label: "24-hour front desk" },
  { value: "LOCKERS", label: "Lockers" },
  { value: "WHEELCHAIR", label: "Wheelchair access" },
  { value: "TEMPLE_NEARBY", label: "Walk to temple" },
  { value: "AIRPORT_PICKUP", label: "Airport / station pickup" },
  { value: "KITCHEN", label: "Shared kitchen" },
  { value: "GARDEN", label: "Garden / terrace" },
];
export const facilityLabel = (v: string) => FACILITIES.find((f) => f.value === v)?.label ?? v;

export const ROOM_FEATURES = ["TV", "Balcony", "Hot water", "Wardrobe", "Work desk", "Kettle", "Mini fridge", "Kitchenette", "City view", "Mountain view"];

export const BED_TYPES = [
  { value: "DOUBLE", label: "Double bed" },
  { value: "QUEEN", label: "Queen bed" },
  { value: "KING", label: "King bed" },
  { value: "TWIN", label: "2 single beds" },
  { value: "SINGLE", label: "Single bed" },
  { value: "DORM", label: "Dorm bed" },
  { value: "FAMILY", label: "Family (3–4 beds)" },
  { value: "FLOOR_MATTRESS", label: "Floor mattress / hall" },
];
export const bedLabel = (v?: string | null) => BED_TYPES.find((b) => b.value === v)?.label ?? "";

/** Must match backend BOOKING_PLATFORMS (domain check happens server-side too). */
export const BOOKING_PLATFORMS: Array<{ value: string; label: string; domains: string[]; color: string }> = [
  { value: "WEBSITE", label: "Official website", domains: [], color: "bg-slate-900 text-white" },
  { value: "BOOKING_COM", label: "Booking.com", domains: ["booking.com"], color: "bg-[#003580] text-white" },
  { value: "AGODA", label: "Agoda", domains: ["agoda.com"], color: "bg-[#5392f9] text-white" },
  { value: "MAKEMYTRIP", label: "MakeMyTrip", domains: ["makemytrip.com"], color: "bg-[#e53935] text-white" },
  { value: "GOIBIBO", label: "Goibibo", domains: ["goibibo.com"], color: "bg-[#ff6d38] text-white" },
  { value: "AIRBNB", label: "Airbnb", domains: ["airbnb.com", "airbnb.co.in"], color: "bg-[#ff385c] text-white" },
  { value: "EXPEDIA", label: "Expedia", domains: ["expedia.com", "expedia.co.in"], color: "bg-[#1f2b6c] text-white" },
  { value: "OYO", label: "OYO", domains: ["oyorooms.com"], color: "bg-[#ee2a24] text-white" },
];
export const platformInfo = (v: string) => BOOKING_PLATFORMS.find((p) => p.value === v) ?? BOOKING_PLATFORMS[0];

export function bookingUrlError(platform: string, url: string): string | null {
  if (!url.trim()) return null;
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return "Enter a full link starting with https://";
  }
  if (u.protocol !== "https:") return "Use a secure https:// link";
  const p = platformInfo(platform);
  if (p.domains.length && !p.domains.some((d) => u.hostname === d || u.hostname.endsWith(`.${d}`)))
    return `This doesn't look like a ${p.label} link`;
  return null;
}
