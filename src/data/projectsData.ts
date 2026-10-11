import type { ProjectListing } from "@/types/project.types";

export const INITIAL_VERIFIED_PROJECTS: ProjectListing[] = [
  {
    id: "proj-godrej-woods-01",
    slug: "godrej-woods-noida",
    name: "Godrej Woods",
    developerName: "Godrej Properties",
    reraId: "UPRERAPRJ704730",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "December 2026",
    priceMin: 19500000, // ₹1.95 Cr
    priceMax: 45000000, // ₹4.50 Cr
    pricePerSqFt: 18500,
    city: "Noida",
    locality: "Sector 43",
    siteAddress: "Plot GH-01, Sector 43, Next to Noida Golf Course",
    landmark: "Opposite Golf Course Metro Station",
    pincode: "201301",
    latitude: 28.5614,
    longitude: 77.3482,
    totalLandArea: "11.0 Acres",
    totalTowers: 10,
    totalUnits: 1200,
    configurations: [
      {
        id: "gw-2bhk",
        bhkType: "2 BHK",
        carpetArea: 1055,
        superBuiltUpArea: 1420,
        bathrooms: 2,
        balconies: 2,
        priceMin: 19500000,
        priceMax: 22000000,
        isAvailable: true,
      },
      {
        id: "gw-3bhk",
        bhkType: "3 BHK",
        carpetArea: 1525,
        superBuiltUpArea: 2050,
        bathrooms: 3,
        balconies: 3,
        priceMin: 28500000,
        priceMax: 32500000,
        isAvailable: true,
      },
      {
        id: "gw-4bhk",
        bhkType: "4 BHK",
        carpetArea: 2250,
        superBuiltUpArea: 3100,
        bathrooms: 4,
        balconies: 4,
        priceMin: 39500000,
        priceMax: 45000000,
        isAvailable: true,
      },
    ],
    amenities: [
      "Urban Forest Theme with 600+ Trees",
      "Grand 35,000 sq.ft Clubhouse",
      "Infinity Edge Swimming Pool",
      "Elevated Forest Walkway",
      "World-class Gymnasium & Yoga Deck",
      "EV Charging Stations in Basement",
      "Multi-tier 24/7 Smart Security & CCTV",
      "Dedicated Children’s Adventure Play Area",
      "Full Power Backup & Rainwater Harvesting",
    ],
    highlights: [
      "Nestled amidst 600+ natural trees with 80% open greens",
      "Just 3 mins from Noida-Greater Noida Expressway",
      "5 mins drive to Noida Golf Course and Botanical Garden Metro",
      "RERA verified with clear legal encumbrance certificate",
    ],
    paymentPlans: [
      "Construction Linked Plan (CLP)",
      "25:25:25:25 Flexi Payment Scheme",
      "Special Festival Home Loan Offers via HDFC & SBI",
    ],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80",
    ],
    salesPhone: "+91-8848510629",
    salesEmail: "contact@awasio.com",
    siteVisitTimings: "9:30 AM – 6:30 PM (Mon – Sun)",
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "proj-mayfair-vishwaraja-02",
    slug: "mayfair-vishwaraja-titwala",
    name: "Mayfair Vishwaraja",
    developerName: "Mayfair Housing",
    reraId: "P51700000001",
    status: "READY_TO_MOVE",
    possessionDate: "Ready for Possession",
    priceMin: 2200000, // ₹22 L
    priceMax: 4800000, // ₹48 L
    pricePerSqFt: 6200,
    city: "Mumbai MMR",
    locality: "Titwala East (Kalyan Region)",
    siteAddress: "Survey No 45, Near Ganpati Temple Road, Titwala East",
    landmark: "1.2 km from Titwala Railway Station",
    pincode: "421605",
    latitude: 19.3005,
    longitude: 73.2085,
    totalLandArea: "4.5 Acres",
    totalTowers: 6,
    totalUnits: 480,
    configurations: [
      {
        id: "mv-1rk",
        bhkType: "1 RK",
        carpetArea: 260,
        superBuiltUpArea: 375,
        bathrooms: 1,
        balconies: 1,
        priceMin: 2200000,
        priceMax: 2450000,
        isAvailable: true,
      },
      {
        id: "mv-1bhk",
        bhkType: "1 BHK",
        carpetArea: 410,
        superBuiltUpArea: 590,
        bathrooms: 2,
        balconies: 1,
        priceMin: 3200000,
        priceMax: 3500000,
        isAvailable: true,
      },
      {
        id: "mv-2bhk",
        bhkType: "2 BHK",
        carpetArea: 615,
        superBuiltUpArea: 885,
        bathrooms: 2,
        balconies: 2,
        priceMin: 4400000,
        priceMax: 4800000,
        isAvailable: true,
      },
    ],
    amenities: [
      "Ready Clubhouse with Indoor Games Room",
      "Landscaped Garden with Walking Track",
      "Children’s Play Park with Rubberized Flooring",
      "24/7 Security Cabin with CCTV Surveillance",
      "High-speed Passenger Elevators with Battery Backup",
      "Borewell & Corporation Treated Water Supply",
    ],
    highlights: [
      "Ready to move with full Occupancy Certificate (OC)",
      "Zero GST on ready-to-move homes",
      "Only 5 mins auto ride from Titwala Suburban Train Station",
      "Approved by all leading nationalized banks for up to 90% loan",
    ],
    paymentPlans: [
      "Ready Possession: 10% Down Payment + Bank Loan",
      "Pradhan Mantri Awas Yojana (PMAY) Interest Subsidy Eligible",
    ],
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80",
    ],
    salesPhone: "+91-8848510629",
    salesEmail: "contact@awasio.com",
    siteVisitTimings: "10:00 AM – 6:00 PM (All 7 Days)",
    createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "proj-dlf-the-arbour-03",
    slug: "dlf-the-arbour-gurugram",
    name: "DLF The Arbour",
    developerName: "DLF Homes",
    reraId: "HRERA-PKL-GGM-1473-2023",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "March 2028",
    priceMin: 78000000, // ₹7.8 Cr
    priceMax: 95000000, // ₹9.5 Cr
    pricePerSqFt: 21500,
    city: "Gurugram",
    locality: "Sector 63, Golf Course Extension",
    siteAddress: "Golf Course Extension Road, Sector 63",
    landmark: "Adjacent to DLF Cyber City 2 Corridor",
    pincode: "122002",
    latitude: 28.4068,
    longitude: 77.0855,
    totalLandArea: "25.8 Acres",
    totalTowers: 5,
    totalUnits: 1137,
    configurations: [
      {
        id: "dlf-4bhk",
        bhkType: "4 BHK",
        carpetArea: 2950,
        superBuiltUpArea: 3950,
        bathrooms: 5,
        balconies: 4,
        priceMin: 78000000,
        priceMax: 95000000,
        isAvailable: true,
      },
    ],
    amenities: [
      "Ultra-Luxury 1.25 Lakh sq.ft Club House",
      "All-Weather Temperature Controlled Indoor Pool",
      "Private High-Speed Elevators with Access Control",
      "Grand Double-Height Entrance Lobbies",
      "Full Concierge Desk & Valet Parking",
      "Dedicated Butler Quarters & Private Servant Entries",
      "85% Central Green Landscape Designed by MPFP New York",
    ],
    highlights: [
      "Ultra-luxury 4 BHK residences with 3.4m floor-to-ceiling heights",
      "Direct signal-free connectivity to Cyber Hub & IGI Airport T3",
      "Low-density living with only 2 apartments per core",
      "Pre-certified IGBC Platinum Green Building",
    ],
    paymentPlans: [
      "30:40:30 Milestone Linked Luxury Plan",
    ],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80",
    ],
    salesPhone: "+91-8848510629",
    salesEmail: "contact@awasio.com",
    siteVisitTimings: "10:00 AM – 7:00 PM (By Appointment)",
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "proj-prestige-park-grove-04",
    slug: "prestige-park-grove-bengaluru",
    name: "Prestige Park Grove",
    developerName: "Prestige Group",
    reraId: "PRM/KA/RERA/1251/446/PR/100823/006141",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "June 2027",
    priceMin: 6800000, // ₹68 L
    priceMax: 24000000, // ₹2.40 Cr
    pricePerSqFt: 10200,
    city: "Bengaluru",
    locality: "Whitefield",
    siteAddress: "Chikka Banahalli Road, Kadugodi, Whitefield",
    landmark: "10 Mins from Hope Farm Junction Metro Station",
    pincode: "560067",
    latitude: 12.9981,
    longitude: 77.7634,
    totalLandArea: "71.0 Acres",
    totalTowers: 19,
    totalUnits: 3856,
    configurations: [
      {
        id: "ppg-1bhk",
        bhkType: "1 BHK",
        carpetArea: 480,
        superBuiltUpArea: 650,
        bathrooms: 1,
        balconies: 1,
        priceMin: 6800000,
        priceMax: 7500000,
        isAvailable: true,
      },
      {
        id: "ppg-2bhk",
        bhkType: "2 BHK",
        carpetArea: 780,
        superBuiltUpArea: 1080,
        bathrooms: 2,
        balconies: 2,
        priceMin: 11500000,
        priceMax: 13000000,
        isAvailable: true,
      },
      {
        id: "ppg-3bhk",
        bhkType: "3 BHK",
        carpetArea: 1190,
        superBuiltUpArea: 1650,
        bathrooms: 3,
        balconies: 2,
        priceMin: 17500000,
        priceMax: 19800000,
        isAvailable: true,
      },
    ],
    amenities: [
      "Twin Clubhouses spanning 80,000 sq.ft",
      "Olympic-size 50m Swimming Pool & Kids Splash Pool",
      "Floodlit Tennis, Basketball & Squash Courts",
      "Pet Park, Butterfly Garden & Amphitheatre",
      "Co-working Lounge & Private Meeting Pods",
      "Convenience Retail Plaza & Supermarket on premise",
    ],
    highlights: [
      "Integrated township with 71 acres master planning",
      "7 mins from Kadugodi Tree Park Metro Station",
      "Close to ITPL, Brigade Tech Gardens, and top international schools",
      "High rental yield corridor with strong IT professional demand",
    ],
    paymentPlans: [
      "Construction Linked Plan (CLP)",
      "Bank Home Loan assistance with Pre-approved Sanctions",
    ],
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&auto=format&fit=crop&q=80",
    ],
    salesPhone: "+91-8848510629",
    salesEmail: "contact@awasio.com",
    siteVisitTimings: "9:00 AM – 7:00 PM (Daily)",
    createdAt: "2026-01-20T10:00:00.000Z",
  },
  {
    id: "proj-unnathi-woods-05",
    slug: "unnathi-woods-thane",
    name: "Unnathi Woods",
    developerName: "Raunak Group",
    reraId: "P51700000002",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5200000, // ₹52 L
    priceMax: 9200000, // ₹92 L
    pricePerSqFt: 11500,
    city: "Mumbai MMR",
    locality: "Ghodbunder Road, Thane West",
    siteAddress: "Kasarvadavali, Off Ghodbunder Road, Thane West",
    landmark: "Behind Hypercity / Big Shopping Centre",
    pincode: "400615",
    latitude: 19.2687,
    longitude: 72.9664,
    totalLandArea: "15.0 Acres",
    totalTowers: 14,
    totalUnits: 1450,
    configurations: [
      {
        id: "uw-1bhk",
        bhkType: "1 BHK",
        carpetArea: 445,
        superBuiltUpArea: 610,
        bathrooms: 2,
        balconies: 1,
        priceMin: 5200000,
        priceMax: 5800000,
        isAvailable: true,
      },
      {
        id: "uw-2bhk",
        bhkType: "2 BHK",
        carpetArea: 690,
        superBuiltUpArea: 950,
        bathrooms: 2,
        balconies: 2,
        priceMin: 8200000,
        priceMax: 9200000,
        isAvailable: true,
      },
    ],
    amenities: [
      "Functional Gymnasium & Aerobics Room",
      "Landscaped Podium Gardens with Gazebos",
      "Senior Citizen Sit-out Pavilion",
      "Solar Water Heating & Rainwater Harvesting",
      "Fire Fighting Systems with Smoke Detectors",
      "Intercom Facility with Main Security Gate",
    ],
    highlights: [
      "Ready homes with OC received — Move in within 15 days",
      "Direct connectivity to Eastern Express Highway & Western Express Highway",
      "Upcoming Metro Line 4 station at 500 meters walking distance",
      "Top schools like EuroSchool & Singhania School nearby",
    ],
    paymentPlans: [
      "Ready to Move: 10% Booking + 90% Bank Loan",
    ],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80",
    ],
    salesPhone: "+91-8848510629",
    salesEmail: "contact@awasio.com",
    siteVisitTimings: "9:30 AM – 6:30 PM (All 7 Days)",
    createdAt: "2026-01-05T10:00:00.000Z",
  },
];

const LOCAL_STORAGE_KEY = "awasio_custom_posted_projects";

// Global server-side singleton for API route persistence
const globalForProjects = globalThis as unknown as {
  serverProjectsStore?: ProjectListing[];
};

export function getServerProjects(): ProjectListing[] {
  if (!globalForProjects.serverProjectsStore) {
    globalForProjects.serverProjectsStore = [];
  }
  return [...globalForProjects.serverProjectsStore, ...INITIAL_VERIFIED_PROJECTS];
}

export function saveServerProject(project: ProjectListing): void {
  if (!globalForProjects.serverProjectsStore) {
    globalForProjects.serverProjectsStore = [];
  }
  const filtered = globalForProjects.serverProjectsStore.filter(
    (p) => p.id !== project.id && p.slug !== project.slug
  );
  globalForProjects.serverProjectsStore = [project, ...filtered];
}

export function getAllProjects(): ProjectListing[] {
  if (typeof window === "undefined") {
    return getServerProjects();
  }
  try {
    const customJson = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!customJson) return INITIAL_VERIFIED_PROJECTS;
    const customProjects: ProjectListing[] = JSON.parse(customJson);
    return [...customProjects, ...INITIAL_VERIFIED_PROJECTS];
  } catch (err) {
    console.error("Failed to read custom projects from storage", err);
    return INITIAL_VERIFIED_PROJECTS;
  }
}

export function getProjectBySlug(slug: string): ProjectListing | undefined {
  const all = getAllProjects();
  return all.find((p) => p.slug === slug || p.id === slug);
}

export async function saveNewProject(project: ProjectListing): Promise<void> {
  // 1. Client-side persistence in localStorage
  if (typeof window !== "undefined") {
    try {
      const existing = getAllProjects().filter(
        (p) => !INITIAL_VERIFIED_PROJECTS.some((init) => init.id === p.id)
      );
      const updated = [project, ...existing.filter((p) => p.id !== project.id)];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to persist new project to localStorage", err);
    }
  }

  // 2. Server-side REST API sync
  try {
    if (typeof window !== "undefined") {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
    } else {
      saveServerProject(project);
    }
  } catch (err) {
    console.warn("Could not sync project with /api/projects endpoint", err);
  }
}
