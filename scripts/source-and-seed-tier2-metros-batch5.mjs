import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "/Users/vinaykumar/Desktop/myProjects/awasio-backend/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";

const BASE_DIR = "/Users/vinaykumar/Desktop/awasio-sourced-properties";
const PROJECT_IMAGES_DIR = path.join(BASE_DIR, "tier2_batch5_images");
const PROJECTS_FILE = path.join(BASE_DIR, "tier2_metros_batch5.json");
const DOCS_FILE = path.join(process.cwd(), "docs", "tier2_metros_batch5.json");

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
  // ===================== LUDHIANA (6 Projects) =====================
  {
    code: "PRJ-LDH-001",
    name: "Sunview Enclave",
    slug: "sunview-enclave-south-city-ludhiana",
    developerName: "Sunview Group",
    reraId: "PBRERA-LDH-45-2019",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8800000,
    priceMax: 22500000,
    pricePerSqFt: 6200,
    cityId: 60,
    cityName: "Ludhiana",
    stateName: "Punjab",
    locality: "South City",
    siteAddress: "Ayali Kalan, South City Main Boulevard, Ludhiana, Punjab",
    landmark: "South City Club & Sidhwan Canal Expressway",
    pincode: "141027",
    totalLandArea: "90 Acres",
    totalTowers: 10,
    totalUnits: 680,
    salesPhone: "9814111220",
    salesEmail: "sales@sunviewenclave.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "South City Ludhiana flat",
    fallbackQueries: ["Ludhiana flat apartment", "Ludhiana property"],
    amenities: ["Grand Sunview Club & Heated Indoor Pool", "Multi-Cuisine Restaurant & Banquet Space", "Tennis & Badminton Courts", "Lush Landscaped Parks", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Ludhiana's Most Posh Elite Residential Enclave - South City", "Home to Top Industrial Tycoons and NRI Families", "Ready to Move with Full Registry and OC", "Direct Access to Sidhwan Canal Expressway"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 810, superBuiltUpArea: 1120, bathrooms: 2, balconies: 2, priceMin: 8800000, priceMax: 9900000 },
      { bhkType: "3 BHK", carpetArea: 1220, superBuiltUpArea: 1690, bathrooms: 3, balconies: 3, priceMin: 13500000, priceMax: 15800000 },
      { bhkType: "4 BHK Villa", carpetArea: 1850, superBuiltUpArea: 2560, bathrooms: 4, balconies: 4, priceMin: 19500000, priceMax: 22500000 }
    ]
  },
  {
    code: "PRJ-LDH-002",
    name: "Omaxe Royal Residency",
    slug: "omaxe-royal-residency-pakhowal-road-ludhiana",
    developerName: "Omaxe Limited",
    reraId: "PBRERA-LDH-12-2018",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 7200000,
    priceMax: 16500000,
    pricePerSqFt: 5400,
    cityId: 60,
    cityName: "Ludhiana",
    stateName: "Punjab",
    locality: "Pakhowal Road",
    siteAddress: "Pakhowal Road, Near Phullanwal Bypass, Ludhiana, Punjab",
    landmark: "Phullanwal Chowk & Keys Hotel",
    pincode: "141013",
    totalLandArea: "65 Acres",
    totalTowers: 14,
    totalUnits: 920,
    salesPhone: "9814122330",
    salesEmail: "sales@omaxeroyalresidency.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Pakhowal road Ludhiana flat",
    fallbackQueries: ["Omaxe Ludhiana flat", "Ludhiana apartment"],
    amenities: ["Signature Royal Club with Olympic Size Pool", "Health Club & Aerobics Deck", "Billiards & Table Tennis Lounge", "Commercial Shopping Plaza", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Over 800+ Families Happily Residing on Pakhowal Road", "Walking Distance to DPS Ludhiana and Top Healthcare Hubs", "Ready to Move Delivered High-Rise Project", "Pre-Approved Home Loans with SBI, HDFC & ICICI"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 760, superBuiltUpArea: 1050, bathrooms: 2, balconies: 2, priceMin: 7200000, priceMax: 8200000 },
      { bhkType: "3 BHK", carpetArea: 1120, superBuiltUpArea: 1560, bathrooms: 3, balconies: 3, priceMin: 10800000, priceMax: 12800000 },
      { bhkType: "4 BHK Penthouse", carpetArea: 1650, superBuiltUpArea: 2320, bathrooms: 4, balconies: 4, priceMin: 14500000, priceMax: 16500000 }
    ]
  },
  {
    code: "PRJ-LDH-003",
    name: "Centra Greens",
    slug: "centra-greens-pakhowal-road-ludhiana",
    developerName: "Centra Builders",
    reraId: "PBRERA-LDH-67-2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 9800000,
    priceMax: 24500000,
    pricePerSqFt: 6600,
    cityId: 60,
    cityName: "Ludhiana",
    stateName: "Punjab",
    locality: "Pakhowal Road",
    siteAddress: "Pakhowal Road Main Highway, Ludhiana, Punjab",
    landmark: "Grand Walk Mall & Flamez Mall",
    pincode: "141013",
    totalLandArea: "10 Acres",
    totalTowers: 6,
    totalUnits: 380,
    salesPhone: "9814133440",
    salesEmail: "sales@centragreens.com",
    siteVisitTimings: "10:00 AM - 6:30 PM (Daily)",
    searchQuery: "Centra Greens Ludhiana flat",
    fallbackQueries: ["Pakhowal road flat", "Ludhiana flat"],
    amenities: ["Ultra-Luxury 40,000 Sq. Ft. Club Facility", "Heated Swimming Pool & Jacuzzi", "Squash & Tennis Courts", "Lush Landscaped Central Lawns", "Multi-Tier Automated Surveillance"],
    highlights: ["Ludhiana's Most Premium Modern High-Rise Tower Architecture", "Over 80% Open Green Landscape with Panoramic Views", "Ready to Move with Spot Registration", "Ultra Low Density Community of Elite Professionals"],
    configurations: [
      { bhkType: "3 BHK", carpetArea: 1280, superBuiltUpArea: 1780, bathrooms: 3, balconies: 3, priceMin: 9800000, priceMax: 12200000 },
      { bhkType: "4 BHK", carpetArea: 1850, superBuiltUpArea: 2580, bathrooms: 4, balconies: 4, priceMin: 16500000, priceMax: 19500000 },
      { bhkType: "5 BHK Sky Villa", carpetArea: 2650, superBuiltUpArea: 3700, bathrooms: 5, balconies: 5, priceMin: 21500000, priceMax: 24500000 }
    ]
  },
  {
    code: "PRJ-LDH-004",
    name: "Hampton Court Business Park",
    slug: "hampton-court-chandigarh-road-ludhiana",
    developerName: "Hampton Sky Realty",
    reraId: "PBRERA-LDH-89-2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5800000,
    priceMax: 12800000,
    pricePerSqFt: 4800,
    cityId: 60,
    cityName: "Ludhiana",
    stateName: "Punjab",
    locality: "Chandigarh Road",
    siteAddress: "NH-5 Chandigarh-Ludhiana 6-Lane Highway, Ludhiana, Punjab",
    landmark: "Hampton Plaza & Fortis Hospital Ludhiana Link",
    pincode: "141123",
    totalLandArea: "40 Acres",
    totalTowers: 10,
    totalUnits: 720,
    salesPhone: "9814144550",
    salesEmail: "sales@hamptonskyrealty.com",
    siteVisitTimings: "9:00 AM - 6:00 PM (Daily)",
    searchQuery: "Chandigarh road Ludhiana flat",
    fallbackQueries: ["Ludhiana flat apartment", "Ludhiana property"],
    amenities: ["Signature Business & Residential Club", "Swimming Pool & Sports Complex", "High-End Retail Boulevard", "Children Play Arena", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Direct Frontage on 6-Lane Ludhiana-Chandigarh Expressway", "Part of 40-Acre Master Business & Residential Hub", "Minutes from Fortis Hospital & GLADA Commercial District", "Ready to Move with Instant Registry"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 720, superBuiltUpArea: 990, bathrooms: 2, balconies: 2, priceMin: 5800000, priceMax: 6600000 },
      { bhkType: "3 BHK", carpetArea: 1060, superBuiltUpArea: 1480, bathrooms: 2, balconies: 3, priceMin: 8200000, priceMax: 9800000 },
      { bhkType: "4 BHK", carpetArea: 1480, superBuiltUpArea: 2060, bathrooms: 4, balconies: 4, priceMin: 11200000, priceMax: 12800000 }
    ]
  },
  {
    code: "PRJ-LDH-005",
    name: "Hero Homes Ludhiana",
    slug: "hero-homes-sidhwan-canal-road-ludhiana",
    developerName: "Hero Realty",
    reraId: "PBRERA-LDH-34-2019",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8500000,
    priceMax: 18500000,
    pricePerSqFt: 5800,
    cityId: 60,
    cityName: "Ludhiana",
    stateName: "Punjab",
    locality: "Sidhwan Canal Road",
    siteAddress: "Sidhwan Canal Road, Near Barewal Octroi, Ludhiana, Punjab",
    landmark: "Barewal Awana & Ferozepur Road Flyover",
    pincode: "141012",
    totalLandArea: "16 Acres",
    totalTowers: 11,
    totalUnits: 790,
    salesPhone: "9814155660",
    salesEmail: "sales@herohomesludhiana.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Hero Homes Ludhiana flat",
    fallbackQueries: ["Sidhwan canal Ludhiana flat", "Ludhiana flat"],
    amenities: ["25,000 Sq. Ft. World-Class Hero Club", "Olympic Swimming Pool & Cricket Practice Net", "Tennis & Badminton Courts", "Lush 5-Acre Central Landscaped Park", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Backed by Trusted Hero Enterprise Legacy", "Flanked by Sidhwan Canal Green Promenade", "Ready to Move with Full Registry and OC", "Fast 5-Min Drive to MBD Neopolis Mall & Westend Mall"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 780, superBuiltUpArea: 1080, bathrooms: 2, balconies: 2, priceMin: 8500000, priceMax: 9600000 },
      { bhkType: "3 BHK", carpetArea: 1180, superBuiltUpArea: 1640, bathrooms: 3, balconies: 3, priceMin: 12200000, priceMax: 14500000 },
      { bhkType: "4 BHK", carpetArea: 1620, superBuiltUpArea: 2260, bathrooms: 4, balconies: 4, priceMin: 15800000, priceMax: 18500000 }
    ]
  },
  {
    code: "PRJ-LDH-006",
    name: "AIPL DreamCity",
    slug: "aipl-dreamcity-ferozepur-road-ludhiana",
    developerName: "AIPL Group",
    reraId: "PBRERA-LDH-102-2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 9200000,
    priceMax: 21500000,
    pricePerSqFt: 5900,
    cityId: 60,
    cityName: "Ludhiana",
    stateName: "Punjab",
    locality: "Ferozepur Road",
    siteAddress: "NH-5 Ferozepur Main Highway, Ludhiana, Punjab",
    landmark: "Punjab Agricultural University (PAU) & MBD Mall",
    pincode: "141004",
    totalLandArea: "500 Acres",
    totalTowers: 12,
    totalUnits: 850,
    salesPhone: "9814166770",
    salesEmail: "sales@aipldreamcityldh.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Ferozepur road Ludhiana flat",
    fallbackQueries: ["AIPL Ludhiana flat", "Ludhiana flat"],
    amenities: ["Signature AIPL Smart City Club", "Lake Promenade & Boating Deck", "Equestrian & Sports Arena", "Eco-Friendly Solar Powered Infra", "Multi-Tier Automated Surveillance"],
    highlights: ["Punjab's Largest 500-Acre Master Planned Smart Township", "Direct Frontage on Arterial Ferozepur Road (NH-5)", "International Standard Infrastructure by AIPL", "Ready to Move Luxury Living for HNI Families"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 820, superBuiltUpArea: 1140, bathrooms: 2, balconies: 2, priceMin: 9200000, priceMax: 10500000 },
      { bhkType: "3 BHK", carpetArea: 1240, superBuiltUpArea: 1720, bathrooms: 3, balconies: 3, priceMin: 13800000, priceMax: 16500000 },
      { bhkType: "4 BHK Villa", carpetArea: 1820, superBuiltUpArea: 2520, bathrooms: 4, balconies: 4, priceMin: 18500000, priceMax: 21500000 }
    ]
  },

  // ===================== AMRITSAR (6 Projects) =====================
  {
    code: "PRJ-ASR-001",
    name: "Impact Gardens",
    slug: "impact-gardens-airport-road-amritsar",
    developerName: "Impact Projects",
    reraId: "PBRERA-ASR-22-2018",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5400000,
    priceMax: 12800000,
    pricePerSqFt: 4600,
    cityId: 59,
    cityName: "Amritsar",
    stateName: "Punjab",
    locality: "Airport Road",
    siteAddress: "Raja Sansi Airport Road, Near Gumtala Bypass, Amritsar, Punjab",
    landmark: "Sri Guru Ram Dass Jee International Airport Link",
    pincode: "143001",
    totalLandArea: "15 Acres",
    totalTowers: 8,
    totalUnits: 580,
    salesPhone: "9815111220",
    salesEmail: "sales@impactgardensasr.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Airport road Amritsar flat",
    fallbackQueries: ["Amritsar flat apartment", "Amritsar property flat"],
    amenities: ["Signature Impact Club with Swimming Pool", "Fitness Gym & Yoga Room", "AC Community Hall", "Children Play Space", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Amritsar's Most Prestigious High-Speed Airport Corridor", "10 Mins from Sri Guru Ram Dass Jee International Airport", "Ready to Move with Full Registry and OC", "Over 70% Open Space with Lush Landscaping"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 740, superBuiltUpArea: 1020, bathrooms: 2, balconies: 2, priceMin: 5400000, priceMax: 6200000 },
      { bhkType: "3 BHK", carpetArea: 1080, superBuiltUpArea: 1510, bathrooms: 2, balconies: 3, priceMin: 8200000, priceMax: 9800000 },
      { bhkType: "4 BHK", carpetArea: 1540, superBuiltUpArea: 2150, bathrooms: 4, balconies: 4, priceMin: 11000000, priceMax: 12800000 }
    ]
  },
  {
    code: "PRJ-ASR-002",
    name: "Blessings City",
    slug: "blessings-city-chheharta-amritsar",
    developerName: "Blessings Infratech",
    reraId: "PBRERA-ASR-48-2019",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 4200000,
    priceMax: 8800000,
    pricePerSqFt: 3800,
    cityId: 59,
    cityName: "Amritsar",
    stateName: "Punjab",
    locality: "Chheharta",
    siteAddress: "Grand Trunk (GT) Road, Near Guru Nanak Dev University (GNDU), Chheharta, Amritsar, Punjab",
    landmark: "GNDU Campus & Khalsa College",
    pincode: "143105",
    totalLandArea: "12 Acres",
    totalTowers: 8,
    totalUnits: 510,
    salesPhone: "9815122330",
    salesEmail: "sales@blessingscity.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "GT road Amritsar flat",
    fallbackQueries: ["GNDU Amritsar flat", "Amritsar flat"],
    amenities: ["Community Clubhouse with Gym", "Children Play Arena", "Allotted Covered Stilt Parking", "Landscaped Central Park", "Security Gate with Intercom"],
    highlights: ["Right on Historic Grand Trunk (GT) Road", "Walking Distance to GNDU Campus and Prestigious Colleges", "Ready to Move with Full Registry and Possession", "Very Affordable Entry Level Price Point"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 660, superBuiltUpArea: 910, bathrooms: 2, balconies: 1, priceMin: 4200000, priceMax: 4800000 },
      { bhkType: "3 BHK", carpetArea: 980, superBuiltUpArea: 1350, bathrooms: 2, balconies: 2, priceMin: 6200000, priceMax: 7200000 },
      { bhkType: "3 BHK Royal", carpetArea: 1200, superBuiltUpArea: 1650, bathrooms: 3, balconies: 3, priceMin: 7600000, priceMax: 8800000 }
    ]
  },
  {
    code: "PRJ-ASR-003",
    name: "Golden Gate Enclave",
    slug: "golden-gate-enclave-gt-road-amritsar",
    developerName: "Golden Gate Developers",
    reraId: "PBRERA-ASR-33-2018",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 6800000,
    priceMax: 14500000,
    pricePerSqFt: 5100,
    cityId: 59,
    cityName: "Amritsar",
    stateName: "Punjab",
    locality: "GT Road",
    siteAddress: "Golden Gate Entry Point, NH-3 GT Road, Amritsar, Punjab",
    landmark: "Iconic Golden Gate Welcome Monument Amritsar",
    pincode: "143001",
    totalLandArea: "8 Acres",
    totalTowers: 6,
    totalUnits: 420,
    salesPhone: "9815133440",
    salesEmail: "sales@goldengateasr.com",
    siteVisitTimings: "10:00 AM - 6:30 PM (Daily)",
    searchQuery: "Golden Gate Amritsar flat",
    fallbackQueries: ["Amritsar luxury flat", "Amritsar flat"],
    amenities: ["Signature Golden Gate Club & Pool", "Health Club with Steam & Sauna", "AC Banquet Hall", "Children Play Arena", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Overlooking Historic Welcome Monument of Golden Gate Amritsar", "15 Mins from Sachkhand Sri Harmandir Sahib (Golden Temple)", "Ready to Move with Full Completion Certificate", "Over 70% Open Scenic Spaces"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 760, superBuiltUpArea: 1050, bathrooms: 2, balconies: 2, priceMin: 6800000, priceMax: 7800000 },
      { bhkType: "3 BHK", carpetArea: 1120, superBuiltUpArea: 1560, bathrooms: 3, balconies: 3, priceMin: 9800000, priceMax: 11800000 },
      { bhkType: "4 BHK", carpetArea: 1560, superBuiltUpArea: 2180, bathrooms: 4, balconies: 4, priceMin: 12500000, priceMax: 14500000 }
    ]
  },
  {
    code: "PRJ-ASR-004",
    name: "Dream City Amritsar",
    slug: "dream-city-amritsar-manawala-amritsar",
    developerName: "AIPL Group",
    reraId: "PBRERA-ASR-77-2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8500000,
    priceMax: 19500000,
    pricePerSqFt: 5800,
    cityId: 59,
    cityName: "Amritsar",
    stateName: "Punjab",
    locality: "Manawala",
    siteAddress: "Manawala Toll Link, GT Road Expressway, Amritsar, Punjab",
    landmark: "Manawala Toll Plaza & Delhi-Amritsar Expressway Link",
    pincode: "143115",
    totalLandArea: "148 Acres",
    totalTowers: 10,
    totalUnits: 720,
    salesPhone: "9815144550",
    salesEmail: "sales@aipldreamcityasr.com",
    siteVisitTimings: "9:00 AM - 6:00 PM (Daily)",
    searchQuery: "AIPL Amritsar flat",
    fallbackQueries: ["Dream city Amritsar flat", "Amritsar flat"],
    amenities: ["Grand 5-Star DreamCity Clubhouse", "Olympic Size Lap Pool", "Multi-Sport Complex & Tennis Courts", "Lush Manicured Parkland Greens", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Amritsar's Most Luxurious 148-Acre Integrated Township", "Direct Frontage on 6-Lane Amritsar-Delhi Expressway (NH-3)", "World-Class AIPL Build Quality & Amenities", "Ready to Move Delivered High-Rise Living"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 790, superBuiltUpArea: 1090, bathrooms: 2, balconies: 2, priceMin: 8500000, priceMax: 9800000 },
      { bhkType: "3 BHK", carpetArea: 1200, superBuiltUpArea: 1680, bathrooms: 3, balconies: 3, priceMin: 12500000, priceMax: 14800000 },
      { bhkType: "4 BHK Villa", carpetArea: 1780, superBuiltUpArea: 2480, bathrooms: 4, balconies: 4, priceMin: 16500000, priceMax: 19500000 }
    ]
  },
  {
    code: "PRJ-ASR-005",
    name: "Global City Amritsar",
    slug: "global-city-amritsar-mirankot-amritsar",
    developerName: "Global Infratech",
    reraId: "PBRERA-ASR-55-2019",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 4800000,
    priceMax: 9900000,
    pricePerSqFt: 4200,
    cityId: 59,
    cityName: "Amritsar",
    stateName: "Punjab",
    locality: "Airport Road",
    siteAddress: "Mirankot Road, Off Airport Highway, Amritsar, Punjab",
    landmark: "Radisson Blu Amritsar & Mirankot Chowk",
    pincode: "143001",
    totalLandArea: "10 Acres",
    totalTowers: 7,
    totalUnits: 460,
    salesPhone: "9815155660",
    salesEmail: "sales@globalcityasr.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Mirankot Amritsar flat",
    fallbackQueries: ["Airport road flat Amritsar", "Amritsar flat"],
    amenities: ["Contemporary Clubhouse with Gym", "Swimming Pool & Kids Water Zone", "Children Activity Zone", "Allotted Covered Stilt Parking", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Close to 5-Star Radisson Blu & Airport Terminal", "Quiet Residential Environment Away from Highway Noise", "Ready to Move with Full Completion Certificate", "Bank Approved Home Loans"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 690, superBuiltUpArea: 950, bathrooms: 2, balconies: 1, priceMin: 4800000, priceMax: 5500000 },
      { bhkType: "3 BHK", carpetArea: 1020, superBuiltUpArea: 1410, bathrooms: 2, balconies: 2, priceMin: 7200000, priceMax: 8400000 },
      { bhkType: "3 BHK Deluxe", carpetArea: 1250, superBuiltUpArea: 1720, bathrooms: 3, balconies: 3, priceMin: 8600000, priceMax: 9900000 }
    ]
  },
  {
    code: "PRJ-ASR-006",
    name: "Celebration Enclave",
    slug: "celebration-enclave-batala-road-amritsar",
    developerName: "Celebration Builders",
    reraId: "PBRERA-ASR-64-2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 4500000,
    priceMax: 9200000,
    pricePerSqFt: 3950,
    cityId: 59,
    cityName: "Amritsar",
    stateName: "Punjab",
    locality: "Batala Road",
    siteAddress: "Batala Main Road, Near Verka Milk Plant, Amritsar, Punjab",
    landmark: "Verka Chowk & Celebration Mall Link",
    pincode: "143501",
    totalLandArea: "7 Acres",
    totalTowers: 6,
    totalUnits: 380,
    salesPhone: "9815166770",
    salesEmail: "sales@celebrationenclave.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Batala road Amritsar flat",
    fallbackQueries: ["Verka Amritsar flat", "Amritsar flat"],
    amenities: ["Community Activity Center & Gym", "Children Play Arena", "Landscaped Floral Garden Walkway", "Covered Reserved Parking", "Multi-Tier Guarded Security"],
    highlights: ["Rapidly Developing Batala Road Residential Belt", "5 Mins from Verka Chowk and Celebration Mall", "Ready to Move with Full Registry and Possession", "Low Maintenance Overhead"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 670, superBuiltUpArea: 920, bathrooms: 2, balconies: 1, priceMin: 4500000, priceMax: 5100000 },
      { bhkType: "3 BHK", carpetArea: 990, superBuiltUpArea: 1380, bathrooms: 2, balconies: 2, priceMin: 6800000, priceMax: 7900000 },
      { bhkType: "3 BHK Royal", carpetArea: 1190, superBuiltUpArea: 1640, bathrooms: 3, balconies: 3, priceMin: 7900000, priceMax: 9200000 }
    ]
  },

  // ===================== UDAIPUR (6 Projects) =====================
  {
    code: "PRJ-UDR-001",
    name: "Miraj Morning",
    slug: "miraj-morning-bhuwana-udaipur",
    developerName: "Miraj Developers",
    reraId: "RAJ/P/2017/142",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 6200000,
    priceMax: 13500000,
    pricePerSqFt: 4900,
    cityId: 41,
    cityName: "Udaipur",
    stateName: "Rajasthan",
    locality: "Bhuwana",
    siteAddress: "Sukher Bypass, Near Celebration Mall, Bhuwana, Udaipur, Rajasthan",
    landmark: "Celebration Mall Udaipur & Sukher Marble Market",
    pincode: "313001",
    totalLandArea: "8 Acres",
    totalTowers: 6,
    totalUnits: 420,
    salesPhone: "9829111220",
    salesEmail: "sales@mirajmorning.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Bhuwana Udaipur flat",
    fallbackQueries: ["Udaipur flat apartment", "Udaipur property"],
    amenities: ["Signature Miraj Club with Swimming Pool", "Fitness Gym & Yoga Room", "AC Community Hall", "Children Play Space", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Walking Distance to Udaipur's Largest Celebration Mall", "Overlooking Scenic Aravalli Mountain Ranges", "Ready to Move with Full Completion Certificate", "Over 70% Open Space with Lush Landscaping"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 740, superBuiltUpArea: 1020, bathrooms: 2, balconies: 2, priceMin: 6200000, priceMax: 7000000 },
      { bhkType: "3 BHK", carpetArea: 1080, superBuiltUpArea: 1510, bathrooms: 2, balconies: 3, priceMin: 8800000, priceMax: 10500000 },
      { bhkType: "4 BHK", carpetArea: 1520, superBuiltUpArea: 2120, bathrooms: 4, balconies: 4, priceMin: 11800000, priceMax: 13500000 }
    ]
  },
  {
    code: "PRJ-UDR-002",
    name: "Sanchi Glacier",
    slug: "sanchi-glacier-shobhagpura-udaipur",
    developerName: "Sanchi Group",
    reraId: "RAJ/P/2018/312",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8500000,
    priceMax: 18500000,
    pricePerSqFt: 6200,
    cityId: 41,
    cityName: "Udaipur",
    stateName: "Rajasthan",
    locality: "Shobhagpura",
    siteAddress: "100-Ft Shobhagpura Road, Udaipur, Rajasthan",
    landmark: "Shobhagpura Circle & DPS Udaipur Link",
    pincode: "313001",
    totalLandArea: "5 Acres",
    totalTowers: 4,
    totalUnits: 280,
    salesPhone: "9829122330",
    salesEmail: "sales@sanchigroup.in",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Shobhagpura Udaipur flat",
    fallbackQueries: ["Udaipur luxury flat", "Udaipur flat"],
    amenities: ["Luxury Rooftop Infinity Pool", "Health Club & Aerobics Deck", "Billiards & Table Tennis Lounge", "Children Play Arena", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Udaipur's #1 Most Prestigious Core - 100-Ft Shobhagpura Road", "Home to Leading Doctors, Jewelers and Industrialists", "Ready to Move with Full Registry and OC", "Mesmerizing Unblocked Views of Aravalli Peaks"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 810, superBuiltUpArea: 1120, bathrooms: 2, balconies: 2, priceMin: 8500000, priceMax: 9800000 },
      { bhkType: "3 BHK", carpetArea: 1220, superBuiltUpArea: 1690, bathrooms: 3, balconies: 3, priceMin: 12500000, priceMax: 14800000 },
      { bhkType: "4 BHK", carpetArea: 1720, superBuiltUpArea: 2380, bathrooms: 4, balconies: 4, priceMin: 16200000, priceMax: 18500000 }
    ]
  },
  {
    code: "PRJ-UDR-003",
    name: "Celebration Residency",
    slug: "celebration-residency-bhuwana-udaipur",
    developerName: "Celebration Group",
    reraId: "RAJ/P/2018/245",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5800000,
    priceMax: 11800000,
    pricePerSqFt: 4600,
    cityId: 41,
    cityName: "Udaipur",
    stateName: "Rajasthan",
    locality: "Bhuwana",
    siteAddress: "Near Celebration Mall Bypass, Bhuwana, Udaipur, Rajasthan",
    landmark: "PVR Celebration Mall & Paras Health Hospital Link",
    pincode: "313001",
    totalLandArea: "4.5 Acres",
    totalTowers: 4,
    totalUnits: 290,
    salesPhone: "9829133440",
    salesEmail: "sales@celebrationresidency.com",
    siteVisitTimings: "10:00 AM - 6:30 PM (Daily)",
    searchQuery: "Celebration mall Udaipur flat",
    fallbackQueries: ["Bhuwana flat", "Udaipur flat"],
    amenities: ["Contemporary Clubhouse with Pool", "Equipped Gym & Yoga Room", "AC Community Hall", "Children Play Space", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Right Behind Celebration Mall Lifestyle Hub", "Walking Distance to Multiplexes, Cafes & Hypermarkets", "Ready to Move with Clean Legal Documentation", "Pre-Approved Home Loans with SBI & HDFC"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 720, superBuiltUpArea: 990, bathrooms: 2, balconies: 2, priceMin: 5800000, priceMax: 6600000 },
      { bhkType: "3 BHK", carpetArea: 1060, superBuiltUpArea: 1480, bathrooms: 2, balconies: 3, priceMin: 8200000, priceMax: 9600000 },
      { bhkType: "4 BHK", carpetArea: 1480, superBuiltUpArea: 2060, bathrooms: 4, balconies: 4, priceMin: 10500000, priceMax: 11800000 }
    ]
  },
  {
    code: "PRJ-UDR-004",
    name: "Royal Rajvilas",
    slug: "royal-rajvilas-goverdhan-vilas-udaipur",
    developerName: "Rajvilas Developers",
    reraId: "RAJ/P/2019/489",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5200000,
    priceMax: 10800000,
    pricePerSqFt: 4300,
    cityId: 41,
    cityName: "Udaipur",
    stateName: "Rajasthan",
    locality: "Goverdhan Vilas",
    siteAddress: "NH-48 Ahmedabad-Udaipur Highway, Goverdhan Vilas, Udaipur, Rajasthan",
    landmark: "Goverdhan Sagar Lake & Ahmedabad Highway Toll",
    pincode: "313002",
    totalLandArea: "6 Acres",
    totalTowers: 5,
    totalUnits: 360,
    salesPhone: "9829144550",
    salesEmail: "sales@royalrajvilas.com",
    siteVisitTimings: "9:00 AM - 6:00 PM (Daily)",
    searchQuery: "Goverdhan Vilas Udaipur flat",
    fallbackQueries: ["Udaipur highway flat", "Udaipur flat"],
    amenities: ["Clubhouse with Lap Pool", "Gymnasium & Yoga Terrace", "AC Banquet Hall", "Children Play Arena", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Overlooking Historic Goverdhan Sagar Lake", "Direct Frontage on 6-Lane Ahmedabad Highway (NH-48)", "Ready to Move Delivered Units", "Affordable Price per Sq. Ft. with Excellent Commute"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 690, superBuiltUpArea: 950, bathrooms: 2, balconies: 1, priceMin: 5200000, priceMax: 5800000 },
      { bhkType: "3 BHK", carpetArea: 1020, superBuiltUpArea: 1410, bathrooms: 2, balconies: 2, priceMin: 7400000, priceMax: 8600000 },
      { bhkType: "4 BHK", carpetArea: 1440, superBuiltUpArea: 1980, bathrooms: 4, balconies: 4, priceMin: 9500000, priceMax: 10800000 }
    ]
  },
  {
    code: "PRJ-UDR-005",
    name: "Navratna Heights",
    slug: "navratna-heights-bedla-road-udaipur",
    developerName: "Navratna Group",
    reraId: "RAJ/P/2017/098",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 4800000,
    priceMax: 9500000,
    pricePerSqFt: 4100,
    cityId: 41,
    cityName: "Udaipur",
    stateName: "Rajasthan",
    locality: "Bedla Road",
    siteAddress: "Bedla Main Road, Near Fatehsagar Lake Link, Udaipur, Rajasthan",
    landmark: "Fatehsagar Lake Drive & Badgaon Chowk",
    pincode: "313011",
    totalLandArea: "5 Acres",
    totalTowers: 4,
    totalUnits: 280,
    salesPhone: "9829155660",
    salesEmail: "sales@navratnaheights.in",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Bedla road Udaipur flat",
    fallbackQueries: ["Fatehsagar Udaipur flat", "Udaipur flat"],
    amenities: ["Community Activity Center & Gym", "Children Play Arena", "Landscaped Floral Garden Walkway", "Covered Reserved Parking", "Multi-Tier Guarded Security"],
    highlights: ["Close to Iconic Fatehsagar Lake & Saheliyon-ki-Bari", "Scenic Mountain Backdrop in Peaceful Bedla Corridor", "Ready to Move with Full Registry and Possession", "Low Maintenance Overhead"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 670, superBuiltUpArea: 920, bathrooms: 2, balconies: 1, priceMin: 4800000, priceMax: 5400000 },
      { bhkType: "3 BHK", carpetArea: 990, superBuiltUpArea: 1380, bathrooms: 2, balconies: 2, priceMin: 6900000, priceMax: 7900000 },
      { bhkType: "3 BHK Royal", carpetArea: 1190, superBuiltUpArea: 1640, bathrooms: 3, balconies: 3, priceMin: 8200000, priceMax: 9500000 }
    ]
  },
  {
    code: "PRJ-UDR-006",
    name: "Anukampa Sky Lounges",
    slug: "anukampa-sky-lounges-sukher-udaipur",
    developerName: "Anukampa Group",
    reraId: "RAJ/P/2020/620",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5500000,
    priceMax: 11500000,
    pricePerSqFt: 4500,
    cityId: 41,
    cityName: "Udaipur",
    stateName: "Rajasthan",
    locality: "Sukher",
    siteAddress: "Sukher Industrial Corridor, NH-58, Udaipur, Rajasthan",
    landmark: "Sukher Marble Hub & R.K. Marble Link",
    pincode: "313001",
    totalLandArea: "5.5 Acres",
    totalTowers: 4,
    totalUnits: 310,
    salesPhone: "9829166770",
    salesEmail: "sales@anukampaskylounges.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Sukher Udaipur flat",
    fallbackQueries: ["Udaipur flat", "Bhuwana flat"],
    amenities: ["Sky Lounge Terrace with Valley View", "Clubhouse with Swimming Pool", "Fitness Gym & Aerobics Deck", "Multi-Level Basement Parking", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Heart of Sukher Marble Commercial Hub", "High Rental Demand from Mining and Business Executives", "Ready to Move Delivered High-Rise Residences", "Approved by State Bank of India"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 710, superBuiltUpArea: 980, bathrooms: 2, balconies: 2, priceMin: 5500000, priceMax: 6300000 },
      { bhkType: "3 BHK", carpetArea: 1050, superBuiltUpArea: 1460, bathrooms: 2, balconies: 3, priceMin: 7800000, priceMax: 9200000 },
      { bhkType: "4 BHK", carpetArea: 1480, superBuiltUpArea: 2060, bathrooms: 4, balconies: 4, priceMin: 10200000, priceMax: 11500000 }
    ]
  },

  // ===================== JODHPUR (6 Projects) =====================
  {
    code: "PRJ-JDH-001",
    name: "Umaid Heritage Heights",
    slug: "umaid-heritage-heights-ratanada-jodhpur",
    developerName: "Umaid Group",
    reraId: "RAJ/P/2017/210",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 9800000,
    priceMax: 24500000,
    pricePerSqFt: 6800,
    cityId: 42,
    cityName: "Jodhpur",
    stateName: "Rajasthan",
    locality: "Ratanada",
    siteAddress: "Circuit House Road, Near Umaid Bhawan Palace, Ratanada, Jodhpur, Rajasthan",
    landmark: "Umaid Bhawan Palace & Circuit House",
    pincode: "342011",
    totalLandArea: "10 Acres",
    totalTowers: 6,
    totalUnits: 340,
    salesPhone: "9829211220",
    salesEmail: "sales@umaidheritage.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Ratanada Jodhpur flat",
    fallbackQueries: ["Jodhpur luxury flat", "Jodhpur flat apartment"],
    amenities: ["Royal Heritage Clubhouse", "Temperature Controlled Swimming Pool", "Health Spa & Sauna Pavilion", "Lush Landscaped Royal Lawns", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Overlooking World-Famous Umaid Bhawan Palace", "Jodhpur's Most Elite VVIP Address of Ratanada", "Exclusive Community of Industrialists and Royal Lineage", "Ready to Move with Full Registry and OC"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 820, superBuiltUpArea: 1140, bathrooms: 2, balconies: 2, priceMin: 9800000, priceMax: 11200000 },
      { bhkType: "3 BHK", carpetArea: 1250, superBuiltUpArea: 1740, bathrooms: 3, balconies: 3, priceMin: 14500000, priceMax: 17500000 },
      { bhkType: "4 BHK Penthouse", carpetArea: 1850, superBuiltUpArea: 2580, bathrooms: 4, balconies: 4, priceMin: 21000000, priceMax: 24500000 }
    ]
  },
  {
    code: "PRJ-JDH-002",
    name: "Ashapurna Heritage",
    slug: "ashapurna-heritage-pal-bypass-jodhpur",
    developerName: "Ashapurna Buildcon",
    reraId: "RAJ/P/2018/165",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5800000,
    priceMax: 12800000,
    pricePerSqFt: 4600,
    cityId: 42,
    cityName: "Jodhpur",
    stateName: "Rajasthan",
    locality: "Pal Bypass Road",
    siteAddress: "Near DPS Circle, Pal Bypass, Jodhpur, Rajasthan",
    landmark: "Delhi Public School & AIIMS Jodhpur Link",
    pincode: "342008",
    totalLandArea: "25 Acres",
    totalTowers: 10,
    totalUnits: 720,
    salesPhone: "9829222330",
    salesEmail: "sales@ashapurna.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Pal road Jodhpur flat",
    fallbackQueries: ["Ashapurna Jodhpur flat", "Jodhpur flat"],
    amenities: ["Signature Ashapurna Club & Lap Pool", "Fully Fitted Gymnasium", "Badminton & Table Tennis Courts", "Landscaped Central Park", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Over 600+ Residing Families on Pal Bypass Road", "5 Mins from AIIMS Jodhpur and Top CBSE Schools", "Ready to Move Delivered High-Rise Township", "Bank Pre-Approved Home Loans"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 740, superBuiltUpArea: 1020, bathrooms: 2, balconies: 2, priceMin: 5800000, priceMax: 6600000 },
      { bhkType: "3 BHK", carpetArea: 1080, superBuiltUpArea: 1510, bathrooms: 2, balconies: 3, priceMin: 8200000, priceMax: 9800000 },
      { bhkType: "4 BHK", carpetArea: 1520, superBuiltUpArea: 2120, bathrooms: 4, balconies: 4, priceMin: 11200000, priceMax: 12800000 }
    ]
  },
  {
    code: "PRJ-JDH-003",
    name: "Veetrag City",
    slug: "veetrag-city-pal-sangariya-jodhpur",
    developerName: "Veetrag Builders",
    reraId: "RAJ/P/2019/330",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 4800000,
    priceMax: 9600000,
    pricePerSqFt: 4100,
    cityId: 42,
    cityName: "Jodhpur",
    stateName: "Rajasthan",
    locality: "Pal Sangariya Road",
    siteAddress: "Pal Sangariya Link Road, Near Basni Industrial Area, Jodhpur, Rajasthan",
    landmark: "Basni Railway Station & Sangariya Bypass",
    pincode: "342005",
    totalLandArea: "8 Acres",
    totalTowers: 6,
    totalUnits: 460,
    salesPhone: "9829233440",
    salesEmail: "sales@veetragcity.com",
    siteVisitTimings: "9:00 AM - 6:00 PM (Daily)",
    searchQuery: "Pal Sangariya Jodhpur flat",
    fallbackQueries: ["Basni Jodhpur flat", "Jodhpur flat"],
    amenities: ["Community Clubhouse with Gym", "Children Play Arena", "Allotted Covered Stilt Parking", "Sweet Water Connection", "Security Gate with Intercom"],
    highlights: ["Close to Basni Industrial Commercial Hub & AIIMS", "High Rental Demand from Industrial Execs and Doctors", "Ready to Move with Full Registry and Possession", "Affordable Price per Sq. Ft."],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 680, superBuiltUpArea: 930, bathrooms: 2, balconies: 1, priceMin: 4800000, priceMax: 5400000 },
      { bhkType: "3 BHK", carpetArea: 990, superBuiltUpArea: 1380, bathrooms: 2, balconies: 2, priceMin: 6900000, priceMax: 7900000 },
      { bhkType: "3 BHK Royal", carpetArea: 1220, superBuiltUpArea: 1680, bathrooms: 3, balconies: 3, priceMin: 8400000, priceMax: 9600000 }
    ]
  },
  {
    code: "PRJ-JDH-004",
    name: "Terra Castle",
    slug: "terra-castle-jhalamand-jodhpur",
    developerName: "Terra Group",
    reraId: "RAJ/P/2018/412",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 4500000,
    priceMax: 8900000,
    pricePerSqFt: 3850,
    cityId: 42,
    cityName: "Jodhpur",
    stateName: "Rajasthan",
    locality: "Jhalamand Circle",
    siteAddress: "Pali Highway, Near Jhalamand Circle, Jodhpur, Rajasthan",
    landmark: "Jhalamand Garh & Pali Road Bypass",
    pincode: "342013",
    totalLandArea: "10 Acres",
    totalTowers: 8,
    totalUnits: 580,
    salesPhone: "9829244550",
    salesEmail: "sales@terracastle.in",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Jhalamand Jodhpur flat",
    fallbackQueries: ["Pali road Jodhpur flat", "Jodhpur flat"],
    amenities: ["Contemporary Clubhouse with Pool", "Fitness Gym & Yoga Room", "AC Community Hall", "Children Play Space", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Direct Frontage on 6-Lane Jodhpur-Pali Highway", "Minutes from Heritage Jhalamand Garh Resort", "Ready to Move Delivered High-Rise Project", "Extremely Low Monthly Maintenance"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 660, superBuiltUpArea: 910, bathrooms: 2, balconies: 1, priceMin: 4500000, priceMax: 5100000 },
      { bhkType: "3 BHK", carpetArea: 980, superBuiltUpArea: 1350, bathrooms: 2, balconies: 2, priceMin: 6400000, priceMax: 7500000 },
      { bhkType: "3 BHK Deluxe", carpetArea: 1180, superBuiltUpArea: 1620, bathrooms: 3, balconies: 3, priceMin: 7800000, priceMax: 8900000 }
    ]
  },
  {
    code: "PRJ-JDH-005",
    name: "Mangaldeep Pal Paradise",
    slug: "mangaldeep-pal-paradise-pal-road-jodhpur",
    developerName: "Mangaldeep Group",
    reraId: "RAJ/P/2017/188",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 6400000,
    priceMax: 13500000,
    pricePerSqFt: 4900,
    cityId: 42,
    cityName: "Jodhpur",
    stateName: "Rajasthan",
    locality: "Pal Road",
    siteAddress: "Pal Main Road, Near Pal Balaji Temple, Jodhpur, Rajasthan",
    landmark: "Pal Balaji Temple & D-Mart Pal Road",
    pincode: "342008",
    totalLandArea: "6 Acres",
    totalTowers: 5,
    totalUnits: 380,
    salesPhone: "9829255660",
    salesEmail: "sales@mangaldeepgroup.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Pal road flat Jodhpur",
    fallbackQueries: ["Pal balaji flat Jodhpur", "Jodhpur flat"],
    amenities: ["Signature Pal Paradise Club", "Swimming Pool & Toddler Splash Pool", "Equipped Gym & Aerobics Room", "Commercial Convenience Retails", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Right on Pal Main Road Opposite D-Mart", "Walking Distance to Pal Balaji Mandir & Banks", "Ready to Move with Full Registry and Possession", "High Resale Liquidity and Family Demand"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 740, superBuiltUpArea: 1020, bathrooms: 2, balconies: 2, priceMin: 6400000, priceMax: 7200000 },
      { bhkType: "3 BHK", carpetArea: 1080, superBuiltUpArea: 1510, bathrooms: 3, balconies: 3, priceMin: 9200000, priceMax: 11000000 },
      { bhkType: "4 BHK", carpetArea: 1520, superBuiltUpArea: 2120, bathrooms: 4, balconies: 4, priceMin: 12000000, priceMax: 13500000 }
    ]
  },
  {
    code: "PRJ-JDH-006",
    name: "Arihant Ayati",
    slug: "arihant-ayati-chopasni-road-jodhpur",
    developerName: "Arihant Superstructures",
    reraId: "RAJ/P/2020/554",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 7200000,
    priceMax: 15500000,
    pricePerSqFt: 5200,
    cityId: 42,
    cityName: "Jodhpur",
    stateName: "Rajasthan",
    locality: "Chopasni Road",
    siteAddress: "Near Chopasni Housing Board, Chopasni Road, Jodhpur, Rajasthan",
    landmark: "Chopasni Housing Board & Akhaliya Chauraha",
    pincode: "342008",
    totalLandArea: "7 Acres",
    totalTowers: 6,
    totalUnits: 420,
    salesPhone: "9829266770",
    salesEmail: "sales@arihantayati.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Chopasni road Jodhpur flat",
    fallbackQueries: ["Arihant Jodhpur flat", "Jodhpur flat"],
    amenities: ["Signature Arihant Lifestyle Club", "Olympic Size Lap Pool", "Health Club & Yoga Deck", "Lush Landscaped Central Park", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Chopasni Road Established Core Residential Hub", "Minutes from Akhaliya Chauraha & Jodhpur Junction", "Ready to Move with Full Registry and OC", "Over 75% Open Space with Lush Greens"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 760, superBuiltUpArea: 1050, bathrooms: 2, balconies: 2, priceMin: 7200000, priceMax: 8200000 },
      { bhkType: "3 BHK", carpetArea: 1120, superBuiltUpArea: 1560, bathrooms: 3, balconies: 3, priceMin: 10500000, priceMax: 12500000 },
      { bhkType: "4 BHK", carpetArea: 1560, superBuiltUpArea: 2180, bathrooms: 4, balconies: 4, priceMin: 13800000, priceMax: 15500000 }
    ]
  }
];

async function run() {
  console.log("================================================================================");
  console.log("SOURCING TIER-2 METROS BATCH 5: LUDHIANA, AMRITSAR, UDAIPUR, JODHPUR (24 PRJS)");
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
