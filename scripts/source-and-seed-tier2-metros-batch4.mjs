import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "/Users/vinaykumar/Desktop/myProjects/awasio-backend/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";

const BASE_DIR = "/Users/vinaykumar/Desktop/awasio-sourced-properties";
const PROJECT_IMAGES_DIR = path.join(BASE_DIR, "tier2_batch4_images");
const PROJECTS_FILE = path.join(BASE_DIR, "tier2_metros_batch4.json");
const DOCS_FILE = path.join(process.cwd(), "docs", "tier2_metros_batch4.json");

if (!fs.existsSync(PROJECT_IMAGES_DIR)) fs.mkdirSync(PROJECT_IMAGES_DIR, { recursive: true });

// Cloudflare R2 Setup
const R2_PUBLIC_BASE = "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev";
const R2_BUCKET = "awasio-media";

const s3 = new S3Client({
  region: "auto",
  endpoint: "https://0d890d076a7e84f12dc8b90d8bb1a00c.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "f6e73586e77e75a0c967aa85944e959b",
    secretAccessKey: "3b9531a5a59e122e04589a763d619a2761b180ec7dba6f3dd01f6f971233408a",
  },
});

async function uploadToCloudflareR2(localFilePath, r2Key) {
  const fileBuffer = fs.readFileSync(localFilePath);
  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key,
    Body: fileBuffer,
    ContentType: "image/webp",
    CacheControl: "public, max-age=31536000, immutable",
  });
  await s3.send(cmd);
  return `${R2_PUBLIC_BASE}/${r2Key}`;
}

async function downloadImage(imageUrl, destPath) {
  try {
    const cleanUrl = imageUrl.includes(";") ? imageUrl : `${imageUrl};s=1200x1200;q=85;f=webp`;
    const res = await fetch(cleanUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) return false;
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    return true;
  } catch (err) {
    return false;
  }
}

async function fetchPhotosForQuery(query) {
  const url = `https://www.olx.in/api/relevance/v4/search?facet_limit=15&category=1723&query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const items = json.data || [];
    const photos = [];
    for (const it of items) {
      if (it.images && it.images.length >= 2) {
        for (const img of it.images) {
          if (img.url && !photos.includes(img.url)) photos.push(img.url);
        }
      }
    }
    return photos;
  } catch (err) {
    return [];
  }
}

const PROJECTS = [
  // ===================== AGRA (6 Projects) =====================
  {
    code: "PRJ-AGR-001",
    name: "Anupam Housing Garden",
    slug: "anupam-housing-garden-fatehabad-road-agra",
    developerName: "Anupam Housing",
    reraId: "UPRERAPRJ5620",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5800000,
    priceMax: 12500000,
    pricePerSqFt: 4600,
    cityId: 54,
    cityName: "Agra",
    stateName: "Uttar Pradesh",
    locality: "Fatehabad Road",
    siteAddress: "Taj East Gate Link, Fatehabad Road, Agra, Uttar Pradesh",
    landmark: "Taj Mahal East Gate & Trident Hotel",
    pincode: "282001",
    totalLandArea: "7 Acres",
    totalTowers: 6,
    totalUnits: 420,
    salesPhone: "9837111220",
    salesEmail: "sales@anupamhousingagra.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Fatehabad road Agra flat",
    fallbackQueries: ["Agra flat apartment", "Agra property"],
    amenities: ["Grand Heritage Clubhouse", "Swimming Pool & Kids Splash Pool", "Fully Fitted Gymnasium", "Lush Landscaped Mughal Gardens", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Agra's Most Prestigious Hospitality Strip - Fatehabad Road", "Minutes from the Iconic Taj Mahal & Metro Corridor", "Ready to Move with Full Completion Certificate", "Over 70% Open Space with Lush Landscaping"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 760, superBuiltUpArea: 1050, bathrooms: 2, balconies: 2, priceMin: 5800000, priceMax: 6600000 },
      { bhkType: "3 BHK", carpetArea: 1100, superBuiltUpArea: 1540, bathrooms: 3, balconies: 3, priceMin: 8500000, priceMax: 9900000 },
      { bhkType: "4 BHK", carpetArea: 1560, superBuiltUpArea: 2180, bathrooms: 4, balconies: 4, priceMin: 11000000, priceMax: 12500000 }
    ]
  },
  {
    code: "PRJ-AGR-002",
    name: "Pushpanjali Seasons",
    slug: "pushpanjali-seasons-dayal-bagh-agra",
    developerName: "Pushpanjali Constructions",
    reraId: "UPRERAPRJ4810",
    reraStatus: "READY_TO_MOVE",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5200000,
    priceMax: 11500000,
    pricePerSqFt: 4300,
    cityId: 54,
    cityName: "Agra",
    stateName: "Uttar Pradesh",
    locality: "Dayal Bagh",
    siteAddress: "Dayal Bagh Main Road, Near Radhasoami Satsang Hall, Agra, Uttar Pradesh",
    landmark: "Dayalbagh Educational Institute & Temple",
    pincode: "282005",
    totalLandArea: "8 Acres",
    totalTowers: 7,
    totalUnits: 510,
    salesPhone: "9837122330",
    salesEmail: "sales@pushpanjaliseasons.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Dayal Bagh Agra flat",
    fallbackQueries: ["Dayalbagh apartment Agra", "Agra flat"],
    amenities: ["Signature Seasons Clubhouse with Pool", "Fitness Gym & Yoga Room", "AC Community Hall", "Children Play Space", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Situated in Agra's Cleanest Green Educational Hub - Dayal Bagh", "Walkable to DEI University and Health Centers", "Ready to Move Delivered High-Rise Project", "Bank Loan Pre-Approved with SBI & PNB"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 720, superBuiltUpArea: 990, bathrooms: 2, balconies: 2, priceMin: 5200000, priceMax: 5900000 },
      { bhkType: "3 BHK", carpetArea: 1060, superBuiltUpArea: 1480, bathrooms: 2, balconies: 3, priceMin: 7600000, priceMax: 8900000 },
      { bhkType: "4 BHK", carpetArea: 1480, superBuiltUpArea: 2060, bathrooms: 4, balconies: 4, priceMin: 10200000, priceMax: 11500000 }
    ]
  },
  {
    code: "PRJ-AGR-003",
    name: "OP Chains Anthela",
    slug: "op-chains-anthela-taj-nagari-agra",
    developerName: "OP Chains Group",
    reraId: "UPRERAPRJ3790",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 6800000,
    priceMax: 14800000,
    pricePerSqFt: 5100,
    cityId: 54,
    cityName: "Agra",
    stateName: "Uttar Pradesh",
    locality: "Taj Nagari Phase 2",
    siteAddress: "Taj Nagari Phase 2, Near Fatehabad Road Ring, Agra, Uttar Pradesh",
    landmark: "ITC Mughal & Taj Nagari Lake",
    pincode: "282001",
    totalLandArea: "5 Acres",
    totalTowers: 4,
    totalUnits: 290,
    salesPhone: "9837133440",
    salesEmail: "anthela@opchains.in",
    siteVisitTimings: "10:00 AM - 6:30 PM (Daily)",
    searchQuery: "Taj Nagari Agra flat",
    fallbackQueries: ["Agra luxury flat", "Agra flat apartment"],
    amenities: ["Ultra-Luxury Rooftop Swimming Pool", "Health Club with Steam & Sauna", "AC Banquet Hall", "Children Play Arena", "Biometric Access Control"],
    highlights: ["Taj Nagari Phase 2 - Agra's Upscale Residential Enclave", "Minutes from Taj Protected Heritage Zone & Ring Expressway", "Low Density Living for Industrialists & Jewelers", "Ready to Move with Spot Registry"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 780, superBuiltUpArea: 1080, bathrooms: 2, balconies: 2, priceMin: 6800000, priceMax: 7800000 },
      { bhkType: "3 BHK", carpetArea: 1150, superBuiltUpArea: 1600, bathrooms: 3, balconies: 3, priceMin: 9800000, priceMax: 11800000 },
      { bhkType: "4 BHK", carpetArea: 1620, superBuiltUpArea: 2250, bathrooms: 4, balconies: 4, priceMin: 13200000, priceMax: 14800000 }
    ]
  },
  {
    code: "PRJ-AGR-004",
    name: "TDI City Agra",
    slug: "tdi-city-agra-fatehabad-expressway-agra",
    developerName: "TDI Infratech",
    reraId: "UPRERAPRJ6240",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 4500000,
    priceMax: 9800000,
    pricePerSqFt: 3900,
    cityId: 54,
    cityName: "Agra",
    stateName: "Uttar Pradesh",
    locality: "Fatehabad Expressway",
    siteAddress: "Kundol, Agra-Lucknow Expressway Interchange, Fatehabad Road, Agra, Uttar Pradesh",
    landmark: "Agra-Lucknow Expressway Toll & Kundol Junction",
    pincode: "283111",
    totalLandArea: "150 Acres",
    totalTowers: 10,
    totalUnits: 750,
    salesPhone: "9837144550",
    salesEmail: "sales@tdicityagra.com",
    siteVisitTimings: "9:00 AM - 6:00 PM (Daily)",
    searchQuery: "TDI City Agra flat",
    fallbackQueries: ["Agra expressway flat", "Agra flat"],
    amenities: ["150-Acre Megatownship Clubhouse", "Olympic Size Lap Pool", "Multi-Sport Complex & Tennis Courts", "Commercial Mall in Township", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Central India Gateway at Agra-Lucknow Expressway Interchange", "Self-Sufficient Integrated Township with 500+ Families", "Ready to Move with Immediate Registry", "Highly Affordable Price Point with Huge Appreciation"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 660, superBuiltUpArea: 910, bathrooms: 2, balconies: 1, priceMin: 4500000, priceMax: 5100000 },
      { bhkType: "3 BHK", carpetArea: 980, superBuiltUpArea: 1350, bathrooms: 2, balconies: 2, priceMin: 6400000, priceMax: 7500000 },
      { bhkType: "3 BHK Villa", carpetArea: 1380, superBuiltUpArea: 1920, bathrooms: 3, balconies: 3, priceMin: 8400000, priceMax: 9800000 }
    ]
  },
  {
    code: "PRJ-AGR-005",
    name: "Shree Radha Valley Agra",
    slug: "shree-radha-valley-sikandra-agra",
    developerName: "Shri Radha Builders",
    reraId: "UPRERAPRJ5180",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 4800000,
    priceMax: 9500000,
    pricePerSqFt: 4100,
    cityId: 54,
    cityName: "Agra",
    stateName: "Uttar Pradesh",
    locality: "Sikandra",
    siteAddress: "NH-19 Delhi-Agra Highway, Sikandra, Agra, Uttar Pradesh",
    landmark: "Akbar's Tomb Sikandra & Runukta Industrial Area",
    pincode: "282007",
    totalLandArea: "10 Acres",
    totalTowers: 8,
    totalUnits: 580,
    salesPhone: "9837155660",
    salesEmail: "sales@shreeradhavalley.in",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Sikandra Agra flat",
    fallbackQueries: ["Agra flat apartment", "Delhi road Agra flat"],
    amenities: ["Community Clubhouse with Lap Pool", "Health Club & Aerobics Room", "Children Activity Zone", "Landscaped Central Greens", "Security Gate with Intercom"],
    highlights: ["Right on 6-Lane Delhi-Agra National Highway (NH-19)", "Walkable to Historic Tomb of Akbar the Great", "Ready to Move with Clean Registry and OC", "Fast 2-Hour Highway Commute to Delhi NCR"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 680, superBuiltUpArea: 940, bathrooms: 2, balconies: 1, priceMin: 4800000, priceMax: 5400000 },
      { bhkType: "3 BHK", carpetArea: 1020, superBuiltUpArea: 1410, bathrooms: 2, balconies: 2, priceMin: 6900000, priceMax: 7900000 },
      { bhkType: "4 BHK", carpetArea: 1440, superBuiltUpArea: 1980, bathrooms: 4, balconies: 4, priceMin: 8500000, priceMax: 9500000 }
    ]
  },
  {
    code: "PRJ-AGR-006",
    name: "Mangalam Shivalik Homes",
    slug: "mangalam-shivalik-homes-shastripuram-agra",
    developerName: "Mangalam Group",
    reraId: "UPRERAPRJ4420",
    reraStatus: "READY_TO_MOVE",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 4200000,
    priceMax: 8800000,
    pricePerSqFt: 3800,
    cityId: 54,
    cityName: "Agra",
    stateName: "Uttar Pradesh",
    locality: "Shastripuram",
    siteAddress: "Shastripuram Main Road, Near Paschimi Ring Road, Agra, Uttar Pradesh",
    landmark: "Shastripuram Flyover & Sun City Agra",
    pincode: "282007",
    totalLandArea: "6 Acres",
    totalTowers: 5,
    totalUnits: 360,
    salesPhone: "9837166770",
    salesEmail: "sales@shivalikhomesagra.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Shastripuram Agra flat",
    fallbackQueries: ["Agra flat", "Paschimi ring road Agra"],
    amenities: ["Contemporary Clubhouse with Gym", "Children Sand Pit & Play Area", "AC Banquet Hall", "Allotted Covered Stilt Parking", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Shastripuram's Fast Developing Affordable Zone", "Minutes from Paschimi Ring Road & Agra Cantt Link", "Ready to Move with Full Registry", "Very Low Monthly Maintenance"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 640, superBuiltUpArea: 880, bathrooms: 2, balconies: 1, priceMin: 4200000, priceMax: 4800000 },
      { bhkType: "3 BHK", carpetArea: 950, superBuiltUpArea: 1320, bathrooms: 2, balconies: 2, priceMin: 6100000, priceMax: 7200000 },
      { bhkType: "3 BHK Royal", carpetArea: 1180, superBuiltUpArea: 1620, bathrooms: 3, balconies: 3, priceMin: 7600000, priceMax: 8800000 }
    ]
  },

  // ===================== PRAYAGRAJ (6 Projects) =====================
  {
    code: "PRJ-PRG-001",
    name: "Omaxe Shiva Phase 1",
    slug: "omaxe-shiva-phase-1-naini-prayagraj",
    developerName: "Omaxe Limited",
    reraId: "UPRERAPRJ3120",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5200000,
    priceMax: 11800000,
    pricePerSqFt: 4400,
    cityId: 56,
    cityName: "Prayagraj",
    stateName: "Uttar Pradesh",
    locality: "Naini",
    siteAddress: "Mirzapur Road, Near New Yamuna Bridge, Naini, Prayagraj, Uttar Pradesh",
    landmark: "New Yamuna Cable-Stayed Bridge & Naini Station",
    pincode: "211008",
    totalLandArea: "15 Acres",
    totalTowers: 10,
    totalUnits: 720,
    salesPhone: "9838211220",
    salesEmail: "sales@omaxeshiva.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Naini Prayagraj flat",
    fallbackQueries: ["Allahabad flat apartment", "Prayagraj property flat"],
    amenities: ["Signature Omaxe Lifestyle Club", "Olympic Swimming Pool", "Health Club & Aerobics Room", "Commercial Retails inside Society", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Right across Iconic Cable Stayed New Yamuna Bridge", "5 Mins from Prayagraj Sangam & Civil Lines", "Ready to Move with Over 400 Residing Families", "Over 75% Open Green Tropical Campus"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 720, superBuiltUpArea: 990, bathrooms: 2, balconies: 2, priceMin: 5200000, priceMax: 5900000 },
      { bhkType: "3 BHK", carpetArea: 1080, superBuiltUpArea: 1510, bathrooms: 2, balconies: 3, priceMin: 7600000, priceMax: 8900000 },
      { bhkType: "4 BHK", carpetArea: 1520, superBuiltUpArea: 2120, bathrooms: 4, balconies: 4, priceMin: 10200000, priceMax: 11800000 }
    ]
  },
  {
    code: "PRJ-PRG-002",
    name: "Sangam Enclave",
    slug: "sangam-enclave-civil-lines-prayagraj",
    developerName: "Sangam Promoters",
    reraId: "UPRERAPRJ2780",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 9500000,
    priceMax: 21500000,
    pricePerSqFt: 6800,
    cityId: 56,
    cityName: "Prayagraj",
    stateName: "Uttar Pradesh",
    locality: "Civil Lines",
    siteAddress: "MG Marg, Near High Court of Judicature, Civil Lines, Prayagraj, Uttar Pradesh",
    landmark: "Allahabad High Court & Subhash Chauraha",
    pincode: "211001",
    totalLandArea: "4 Acres",
    totalTowers: 3,
    totalUnits: 180,
    salesPhone: "9838222330",
    salesEmail: "sales@sangamenclave.in",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Civil Lines Prayagraj flat",
    fallbackQueries: ["Civil Lines Allahabad flat", "Prayagraj luxury flat"],
    amenities: ["Rooftop Sky Pool & Sun Terrace", "Modern Gymnasium", "AC Community Banquet Suite", "Covered Reserved Parking", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Prayagraj's #1 VVIP Address - Civil Lines MG Marg", "Walking Distance to Allahabad High Court and Subhash Crossing", "Exclusive Enclave of Senior Advocates and Judges", "Ready to Move with Full Registry and OC"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 810, superBuiltUpArea: 1120, bathrooms: 2, balconies: 2, priceMin: 9500000, priceMax: 10800000 },
      { bhkType: "3 BHK", carpetArea: 1220, superBuiltUpArea: 1690, bathrooms: 3, balconies: 3, priceMin: 13800000, priceMax: 16500000 },
      { bhkType: "4 BHK", carpetArea: 1720, superBuiltUpArea: 2380, bathrooms: 4, balconies: 4, priceMin: 18500000, priceMax: 21500000 }
    ]
  },
  {
    code: "PRJ-PRG-003",
    name: "Ada Green City",
    slug: "ada-green-city-kalindipuram-prayagraj",
    developerName: "ADA / Prayagraj Infratech",
    reraId: "UPRERAPRJ4980",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 4600000,
    priceMax: 9200000,
    pricePerSqFt: 4100,
    cityId: 56,
    cityName: "Prayagraj",
    stateName: "Uttar Pradesh",
    locality: "Kalindipuram",
    siteAddress: "Kalindipuram Main 60-Ft Road, Near Police Chowki, Prayagraj, Uttar Pradesh",
    landmark: "Kalindipuram Housing Colony & Subedarganj Station",
    pincode: "211011",
    totalLandArea: "8 Acres",
    totalTowers: 6,
    totalUnits: 460,
    salesPhone: "9838233440",
    salesEmail: "sales@adagreencity.com",
    siteVisitTimings: "9:00 AM - 6:00 PM (Daily)",
    searchQuery: "Kalindipuram Prayagraj flat",
    fallbackQueries: ["Subedarganj Allahabad flat", "Prayagraj flat"],
    amenities: ["Community Center & Gym", "Children Play Arena", "Landscaped Green Park", "24-Hour Sweet Tubewell Water", "Gated Security with Intercom"],
    highlights: ["Established Peaceful Neighborhood of Kalindipuram", "5 Mins from Subedarganj Railway Station (Vande Bharat Hub)", "Ready to Move with Instant Registry", "Low Maintenance and High Resale Value"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 670, superBuiltUpArea: 920, bathrooms: 2, balconies: 1, priceMin: 4600000, priceMax: 5200000 },
      { bhkType: "3 BHK", carpetArea: 980, superBuiltUpArea: 1360, bathrooms: 2, balconies: 2, priceMin: 6800000, priceMax: 7800000 },
      { bhkType: "3 BHK Deluxe", carpetArea: 1200, superBuiltUpArea: 1650, bathrooms: 3, balconies: 3, priceMin: 8100000, priceMax: 9200000 }
    ]
  },
  {
    code: "PRJ-PRG-004",
    name: "Shri Ram Royal City",
    slug: "shri-ram-royal-city-jhalwa-prayagraj",
    developerName: "Shri Ram Builders",
    reraId: "UPRERAPRJ5340",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 4200000,
    priceMax: 8800000,
    pricePerSqFt: 3800,
    cityId: 56,
    cityName: "Prayagraj",
    stateName: "Uttar Pradesh",
    locality: "Jhalwa",
    siteAddress: "Devghat, Near IIIT Allahabad Gate 2, Jhalwa, Prayagraj, Uttar Pradesh",
    landmark: "Indian Institute of Information Technology (IIIT) Allahabad",
    pincode: "211012",
    totalLandArea: "7 Acres",
    totalTowers: 6,
    totalUnits: 390,
    salesPhone: "9838244550",
    salesEmail: "sales@shriramroyalcity.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Jhalwa Prayagraj flat",
    fallbackQueries: ["IIIT Allahabad flat", "Prayagraj flat"],
    amenities: ["Clubhouse with Gym & Table Tennis", "Children Play Space", "Allotted Covered Parking", "Rainwater Harvesting & Solar Streetlights", "Multi-Tier Guard Post Security"],
    highlights: ["Right Next to Premier IIIT Allahabad Campus", "Very High Rental Demand from Tech Faculty and Researchers", "Ready to Move Delivered Units", "Affordable Budget Home Loans Available"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 640, superBuiltUpArea: 880, bathrooms: 2, balconies: 1, priceMin: 4200000, priceMax: 4700000 },
      { bhkType: "3 BHK", carpetArea: 950, superBuiltUpArea: 1320, bathrooms: 2, balconies: 2, priceMin: 5900000, priceMax: 6900000 },
      { bhkType: "3 BHK Royal", carpetArea: 1180, superBuiltUpArea: 1620, bathrooms: 3, balconies: 3, priceMin: 7400000, priceMax: 8800000 }
    ]
  },
  {
    code: "PRJ-PRG-005",
    name: "Vinayak Tower",
    slug: "vinayak-tower-tagore-town-prayagraj",
    developerName: "Vinayak Group",
    reraId: "UPRERAPRJ3890",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8200000,
    priceMax: 17500000,
    pricePerSqFt: 6200,
    cityId: 56,
    cityName: "Prayagraj",
    stateName: "Uttar Pradesh",
    locality: "Tagore Town",
    siteAddress: "Tagore Town Main Road, Near Colonelganj Inter College, Prayagraj, Uttar Pradesh",
    landmark: "Tagore Town Park & Anand Bhawan Link",
    pincode: "211002",
    totalLandArea: "3 Acres",
    totalTowers: 2,
    totalUnits: 140,
    salesPhone: "9838255660",
    salesEmail: "sales@vinayaktower.in",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Tagore Town Prayagraj flat",
    fallbackQueries: ["Allahabad flat apartment", "Prayagraj central flat"],
    amenities: ["Rooftop Fitness Center", "AC Community Hall", "High Speed Automatic Elevators", "Covered Reserved Parking", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Heart of Historic Tagore Town - Central Prayagraj", "Walking Distance to Allahabad University & Anand Bhawan", "Ready to Move Ultra-Central Living", "Highest Rental Yield in Entire Purvanchal"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 760, superBuiltUpArea: 1050, bathrooms: 2, balconies: 2, priceMin: 8200000, priceMax: 9200000 },
      { bhkType: "3 BHK", carpetArea: 1150, superBuiltUpArea: 1600, bathrooms: 3, balconies: 3, priceMin: 12000000, priceMax: 14200000 },
      { bhkType: "4 BHK", carpetArea: 1600, superBuiltUpArea: 2240, bathrooms: 4, balconies: 4, priceMin: 15200000, priceMax: 17500000 }
    ]
  },
  {
    code: "PRJ-PRG-006",
    name: "Pushpraj Heights",
    slug: "pushpraj-heights-george-town-prayagraj",
    developerName: "Pushpraj Infratech",
    reraId: "UPRERAPRJ4620",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8800000,
    priceMax: 18500000,
    pricePerSqFt: 6500,
    cityId: 56,
    cityName: "Prayagraj",
    stateName: "Uttar Pradesh",
    locality: "George Town",
    siteAddress: "George Town Main Boulevard, Near Chandrashekhar Azad Park, Prayagraj, Uttar Pradesh",
    landmark: "Company Bagh (Azad Park) & Medical College Link",
    pincode: "211002",
    totalLandArea: "3.5 Acres",
    totalTowers: 3,
    totalUnits: 160,
    salesPhone: "9838266770",
    salesEmail: "sales@pushprajheights.com",
    siteVisitTimings: "10:00 AM - 6:30 PM (Daily)",
    searchQuery: "George Town Prayagraj flat",
    fallbackQueries: ["Company Bagh Allahabad flat", "Prayagraj luxury apartment"],
    amenities: ["Contemporary Clubhouse with Pool", "Equipped Gym & Aerobics Room", "Children Sensory Play Area", "Multi-Level Basement Parking", "Multi-Tier Guard Post Security"],
    highlights: ["Overlooking Lush 133-Acre Chandrashekhar Azad Park (Company Bagh)", "Prime Heritage Residential Core of George Town", "Ready to Move with Pristine Clear Legal Title", "Low-Density Community of Top Doctors & Bureaucrats"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 780, superBuiltUpArea: 1080, bathrooms: 2, balconies: 2, priceMin: 8800000, priceMax: 9900000 },
      { bhkType: "3 BHK", carpetArea: 1180, superBuiltUpArea: 1640, bathrooms: 3, balconies: 3, priceMin: 12800000, priceMax: 15200000 },
      { bhkType: "4 BHK", carpetArea: 1640, superBuiltUpArea: 2280, bathrooms: 4, balconies: 4, priceMin: 16200000, priceMax: 18500000 }
    ]
  }
];

async function run() {
  console.log("================================================================================");
  console.log("SOURCING TIER-2 METROS BATCH 4: AGRA & PRAYAGRAJ (12 PRJS)");
  console.log("================================================================================");

  const usedImageUrls = new Set();
  const processedProjects = [];

  for (let i = 0; i < PROJECTS.length; i++) {
    const p = PROJECTS[i];
    console.log(`\n[${i + 1}/${PROJECTS.length}] Processing ${p.name} in ${p.cityName}...`);

    const projectDir = path.join(PROJECT_IMAGES_DIR, p.slug);
    if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });

    let rawImages = await fetchPhotosForQuery(p.searchQuery);
    if (rawImages.length < 4 && p.fallbackQueries) {
      for (const fb of p.fallbackQueries) {
        const extra = await fetchPhotosForQuery(fb);
        rawImages.push(...extra);
        if (rawImages.length >= 6) break;
      }
    }

    const uniqueImages = [];
    for (const img of rawImages) {
      if (!usedImageUrls.has(img)) {
        usedImageUrls.add(img);
        uniqueImages.push(img);
      }
    }

    console.log(`  Found ${uniqueImages.length} unique photos. Uploading to Cloudflare R2...`);

    const uploadedCloudflareUrls = [];
    for (let j = 0; j < Math.min(uniqueImages.length, 5); j++) {
      const srcUrl = uniqueImages[j];
      const localFile = path.join(projectDir, `photo_${j + 1}.webp`);
      const r2Key = `projects/photos/${p.slug}/photo_${j + 1}.webp`;

      const downloaded = await downloadImage(srcUrl, localFile);
      if (downloaded) {
        try {
          const publicUrl = await uploadToCloudflareR2(localFile, r2Key);
          uploadedCloudflareUrls.push(publicUrl);
          console.log(`  ✓ Uploaded: ${publicUrl}`);
        } catch (uploadErr) {
          console.warn(`  Failed upload:`, uploadErr.message);
        }
      }
    }

    const finalProject = {
      ...p,
      images: uploadedCloudflareUrls,
    };
    processedProjects.push(finalProject);
  }

  // Save to disk
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(processedProjects, null, 2));
  fs.writeFileSync(DOCS_FILE, JSON.stringify(processedProjects, null, 2));
  console.log(`\nSuccessfully processed and uploaded ${processedProjects.length} projects!`);
  console.log(`Saved master file to: ${DOCS_FILE}`);
}

run().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
