import { Home, Building, Building2 } from "lucide-react";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";

export type SubTypeOption = {
  id: string;
  label: string;
  categories?: string[];
  locatedInsideOptions?: string[];
};

export type PropertyTypeOption = {
  id: string;
  label: string;
  resCom: "RESIDENTIAL" | "COMMERCIAL";
  icon: typeof Home;
  accent: string;
  subTypes: SubTypeOption[];
};

export const propertyTypeCatalog: PropertyTypeOption[] = [
  {
    id: "residential",
    label: "Residential",
    resCom: "RESIDENTIAL",
    icon: Home,
    accent: "from-emerald-400 to-teal-500",
    subTypes: [
      { id: "apartment", label: "Apartment" },
      { id: "independent-house", label: "Independent House" },
      { id: "villa", label: "Villa" },
      { id: "builder-floor", label: "Builder Floor" },
      { id: "plot-res", label: "Plot / Land (Res)", categories: ["Corner", "Gated", "Developer plot"] },
    ],
  },
  {
    id: "commercial",
    label: "Commercial",
    resCom: "COMMERCIAL",
    icon: Building,
    accent: "from-amber-500 to-orange-400",
    subTypes: [
      { id: "office", label: "Office", categories: ["Ready to move", "Bare shell", "Co-working"], locatedInsideOptions: ["Business park", "Tech park", "Standalone tower"] },
      { id: "retail", label: "Retail / Showroom", categories: ["Shop", "Showroom"], locatedInsideOptions: ["Mall", "High street", "Retail hub"] },
      { id: "warehouse", label: "Storage / Warehouse" },
      { id: "industry", label: "Industry / Factory" },
      { id: "hospitality", label: "Hospitality" },
      { id: "plot-commercial", label: "Plot / Land (Com)", categories: ["Commercial Land", "Industrial", "Agricultural (Com)"] },
    ],
  },
  {
    id: "pg",
    label: "PG / Co-living",
    resCom: "RESIDENTIAL",
    icon: Building2,
    accent: "from-sky-500 to-indigo-400",
    subTypes: [
      { id: "private-room", label: "Private Room" },
      { id: "shared-room", label: "Shared Room" },
      { id: "bed", label: "Bed" },
    ],
  },
];

export const cityOptions = [
  { id: "1", name: "Bengaluru" },
  { id: "2", name: "Mumbai" },
  { id: "3", name: "Delhi NCR" },
  { id: "4", name: "Hyderabad" },
];

export const localityOptions: Record<string, { id: string; name: string }[]> = {
  "1": [
    { id: "11", name: "HSR Layout" },
    { id: "12", name: "Whitefield" },
    { id: "13", name: "Indiranagar" },
  ],
  "2": [
    { id: "21", name: "Bandra" },
    { id: "22", name: "Andheri" },
    { id: "23", name: "Powai" },
  ],
  "3": [
    { id: "31", name: "Gurgaon" },
    { id: "32", name: "Noida" },
    { id: "33", name: "South Delhi" },
  ],
  "4": [
    { id: "41", name: "Hitech City" },
    { id: "42", name: "Kondapur" },
  ],
};

export const projectOptions = [
  { id: "701", cityId: "1", label: "Skyline Residences" },
  { id: "702", cityId: "1", label: "Lakeside Habitat" },
  { id: "801", cityId: "2", label: "Oceanic Heights" },
  { id: "901", cityId: "3", label: "Capital Greens" },
];

export const amenityOptions = [
  { id: 1, label: "Gym", group: "Society" },
  { id: 2, label: "Pool", group: "Society" },
  { id: 3, label: "Clubhouse", group: "Society" },
  { id: 4, label: "Power Backup", group: "Safety" },
  { id: 5, label: "24x7 Security", group: "Safety" },
  { id: 6, label: "CCTV", group: "Safety" },
  { id: 7, label: "Garden", group: "Lifestyle" },
  { id: 8, label: "Play Area", group: "Lifestyle" },
  { id: 9, label: "Lift", group: "Convenience" },
  { id: 10, label: "EV Charging", group: "Convenience" },
];

export const authorityOptions = [
  { id: 1, label: "RERA" },
  { id: 2, label: "Development Authority" },
  { id: 3, label: "Fire NOC" },
];

export const furnishingItems = ["Wardrobe", "Geyser", "Modular Kitchen", "Air Conditioning", "Fans & Lights"];

export const stepList = [
  { id: 1, label: "Basic & Context", caption: "Listing type & classification" },
  { id: 2, label: "Location & Project", caption: "City, locality, project" },
  { id: 3, label: "Property Details", caption: "Structure & layout" },
  { id: 4, label: "Price & Availability", caption: "Commercials & timeline" },
  { id: 5, label: "Amenities & Legal", caption: "Features, ownership" },
  { id: 6, label: "Media + Review", caption: "Photos, story & publish" },
];

export const stepValidations: Record<number, (keyof PropertyListingFormValues | string)[]> = {
  1: ["context.listingType", "context.propertyTypeId", "context.propertySubTypeId"],
  2: ["location.cityId", "location.localityId"],
  3: ["details.carpetArea", "details.bathrooms"],
  4: ["pricing.price", "availability.availabilityStatus"],
  5: ["amenities.ownershipType"],
  6: ["meta.title"],
};
