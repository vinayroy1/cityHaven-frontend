import fs from "fs";
import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand } from "/Users/vinaykumar/Desktop/myProjects/awasio-backend/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";

const BASE_DIR = "/Users/vinaykumar/Desktop/awasio-sourced-properties";
const PROJECT_IMAGES_DIR = path.join(BASE_DIR, "jharkhand_project_images");
const PROJECTS_FILE = path.join(BASE_DIR, "jharkhand_projects.json");
const DOCS_DIR = path.join(process.cwd(), "docs");

if (!fs.existsSync(PROJECT_IMAGES_DIR)) fs.mkdirSync(PROJECT_IMAGES_DIR, { recursive: true });
if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });

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
    console.error(`  Failed to download image:`, err.message);
    return false;
  }
}

// 11 Flagship Projects for Jharkhand Cities
const JHARKHAND_PROJECTS = [
  // ===================== HAZARIBAGH (id: 1725) =====================
  {
    code: "PRJ-HZB-001",
    name: "Lalchand Eco Heights",
    slug: "lalchand-eco-heights-hazaribagh",
    developerName: "Lalchand Promoters & Builders",
    reraId: "JHARERA/PROJECT/512/2022",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "March 2027",
    priceMin: 4500000,
    priceMax: 8200000,
    pricePerSqFt: 3600,
    cityId: 1725,
    cityName: "Hazaribagh",
    stateName: "Jharkhand",
    locality: "New Forest Colony",
    siteAddress: "Near Canary Hill Road, New Forest Colony, Hazaribagh, Jharkhand",
    landmark: "Canary Hill Forest View Corridor",
    pincode: "825301",
    totalLandArea: "3.5 Acres",
    totalTowers: 3,
    totalUnits: 180,
    salesPhone: "9431145620",
    salesEmail: "sales@lalchandecoheights.com",
    siteVisitTimings: "9:00 AM - 6:00 PM (Monday - Sunday)",
    searchQuery: "Hazaribagh residential flat apartment",
    fallbackQueries: ["Ranchi luxury apartment flat", "Jharkhand residential flat"],
    amenities: [
      "Platinum Green Building Certification",
      "Panoramic Canary Hill Terrace Lounge",
      "Clubhouse with Indoor Badminton Court",
      "Solar Powered Common Lighting",
      "Dedicated Children Play Zone",
      "24x7 Tier-2 Gated Security",
      "Covered Stilt & Open Parking",
      "100% Power Backup for Lifts & Common Areas"
    ],
    highlights: [
      "Hazaribagh's First Platinum Green High-Rise",
      "67% Open Landscape & Tree Plantation",
      "Scenic Unobstructed Views of Canary Hills",
      "Wide 40-ft Access Road from Main Highway"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 720,
        superBuiltUpArea: 950,
        bathrooms: 2,
        balconies: 2,
        priceMin: 4500000,
        priceMax: 4800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1040,
        superBuiltUpArea: 1380,
        bathrooms: 2,
        balconies: 3,
        priceMin: 5800000,
        priceMax: 6500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3.5 BHK",
        carpetArea: 1320,
        superBuiltUpArea: 1750,
        bathrooms: 3,
        balconies: 3,
        priceMin: 7400000,
        priceMax: 8200000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },
  {
    code: "PRJ-HZB-002",
    name: "Kanha Residency",
    slug: "kanha-residency-matwari-hazaribagh",
    developerName: "Kanha Builders & Developers",
    reraId: "JHARERA/PROJECT/489/2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 3800000,
    priceMax: 6500000,
    pricePerSqFt: 3350,
    cityId: 1725,
    cityName: "Hazaribagh",
    stateName: "Jharkhand",
    locality: "Matwari",
    siteAddress: "Opposite St. Columba's Ground, Matwari, Hazaribagh, Jharkhand",
    landmark: "St. Columba's College Campus",
    pincode: "825301",
    totalLandArea: "2 Acres",
    totalTowers: 2,
    totalUnits: 120,
    salesPhone: "9431328910",
    salesEmail: "kanha.residency@hazaribaghrealestate.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Matwari Hazaribagh flat",
    fallbackQueries: ["Hazaribagh house flat", "Ranchi Bariatu apartment"],
    amenities: [
      "Community Banquet Hall",
      "Modern Gymnasium & Yoga Deck",
      "High-Speed Automatic Elevators",
      "CCTV Surveillance Across All Floors",
      "Underground & Overhead Reservoir Water Supply",
      "Rainwater Harvesting System",
      "Visitor Car Parking Space"
    ],
    highlights: [
      "Situated in Prime Educational & Retail Hub of Matwari",
      "Ready to Move with Immediate Registry & Possession",
      "Zero Water Scarcity with Deep Boring & Municipal Line",
      "Walking Distance from Leading Colleges & Clinics"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 680,
        superBuiltUpArea: 880,
        bathrooms: 2,
        balconies: 1,
        priceMin: 3800000,
        priceMax: 4200000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 950,
        superBuiltUpArea: 1260,
        bathrooms: 2,
        balconies: 2,
        priceMin: 5200000,
        priceMax: 5600000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3 BHK Deluxe",
        carpetArea: 1120,
        superBuiltUpArea: 1450,
        bathrooms: 3,
        balconies: 3,
        priceMin: 6000000,
        priceMax: 6500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-large.webp",
      }
    ]
  },

  // ===================== RANCHI (id: 1816) =====================
  {
    code: "PRJ-IXR-001",
    name: "Estate Sky Vue",
    slug: "estate-sky-vue-bariatu-ranchi",
    developerName: "Estate Group Ranchi",
    reraId: "JHARERA/PROJECT/335/2021",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "June 2026",
    priceMin: 8500000,
    priceMax: 17500000,
    pricePerSqFt: 5400,
    cityId: 1816,
    cityName: "Ranchi",
    stateName: "Jharkhand",
    locality: "Bariatu Road",
    siteAddress: "Bariatu Road, Opposite RIMS Hospital Doctors Colony, Ranchi, Jharkhand",
    landmark: "Near RIMS Hospital Medical Hub",
    pincode: "834009",
    totalLandArea: "4.8 Acres",
    totalTowers: 4,
    totalUnits: 280,
    salesPhone: "9431108742",
    salesEmail: "sales@estateskyvue.com",
    siteVisitTimings: "9:00 AM - 7:00 PM (All Days)",
    searchQuery: "Bariatu Ranchi flat apartment",
    fallbackQueries: ["Ranchi luxury apartment", "Kanke road flat ranchi"],
    amenities: [
      "Rooftop Sky Lounge with Panoramic City Views",
      "Temperature Controlled Infinity Lap Pool",
      "Double Height Air Conditioned Entrance Lobby",
      "State-of-the-Art Fitness Center & Steam Room",
      "Squash & Indoor Badminton Arena",
      "3-Tier Biometric Security & Smart Video Intercom",
      "Multi-Level Basement Parking with EV Chargers",
      "100% DG Power Backup for Whole Complex"
    ],
    highlights: [
      "Bariatu Road's Most Iconic Luxury High-Rise Address",
      "Over 75% Open Sky & Landscaped Zen Gardens",
      "Close Proximity to RIMS, Morabadi Ground & Kanke",
      "Vastu-Compliant 3 & 4 BHK Designer Residences"
    ],
    configurations: [
      {
        bhkType: "3 BHK",
        carpetArea: 1180,
        superBuiltUpArea: 1580,
        bathrooms: 3,
        balconies: 3,
        priceMin: 8500000,
        priceMax: 9500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3 BHK Luxury",
        carpetArea: 1420,
        superBuiltUpArea: 1890,
        bathrooms: 3,
        balconies: 4,
        priceMin: 10500000,
        priceMax: 11800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-large.webp",
      },
      {
        bhkType: "4 BHK Sky Villa",
        carpetArea: 1980,
        superBuiltUpArea: 2650,
        bathrooms: 4,
        balconies: 4,
        priceMin: 15500000,
        priceMax: 17500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },
  {
    code: "PRJ-IXR-002",
    name: "NK Oak Forest",
    slug: "nk-oak-forest-argora-ranchi",
    developerName: "NK Construction Pvt Ltd",
    reraId: "JHARERA/PROJECT/278/2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 6200000,
    priceMax: 12800000,
    pricePerSqFt: 4850,
    cityId: 1816,
    cityName: "Ranchi",
    stateName: "Jharkhand",
    locality: "Argora",
    siteAddress: "Argora - Kathal More Ring Road, Argora, Ranchi, Jharkhand",
    landmark: "Near Argora Chowk Flyover",
    pincode: "834002",
    totalLandArea: "8 Acres",
    totalTowers: 6,
    totalUnits: 450,
    salesPhone: "9431176230",
    salesEmail: "inquiries@nkoakforest.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Argora Ranchi apartment flat",
    fallbackQueries: ["Kathal More Ranchi flat", "Ranchi residential flat"],
    amenities: [
      "8-Acre Integrated Forest-Themed Township",
      "Clubhouse with Olympic Size Pool",
      "Tennis & Basketball Courts",
      "Lush Jogging Tracks & Reflexology Pathways",
      "Dedicated Senior Citizen Park & Library",
      "Convenience Shopping Arcade Inside Society",
      "24x7 Multi-Tier Surveillance & RFID Boom Barriers"
    ],
    highlights: [
      "Over 70% Lush Greenery & Dense Tree Canopy",
      "Immediate Ring Road Access to Airport & Railway Station",
      "Spacious Low-Density Tower Planning",
      "Bank Approved for 90% Loan with SBI, HDFC, ICICI"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 840,
        superBuiltUpArea: 1120,
        bathrooms: 2,
        balconies: 2,
        priceMin: 6200000,
        priceMax: 6800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1120,
        superBuiltUpArea: 1490,
        bathrooms: 2,
        balconies: 3,
        priceMin: 8200000,
        priceMax: 9200000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "4 BHK",
        carpetArea: 1650,
        superBuiltUpArea: 2180,
        bathrooms: 4,
        balconies: 4,
        priceMin: 11800000,
        priceMax: 12800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },

  // ===================== JAMSHEDPUR (id: 1734) =====================
  {
    code: "PRJ-IXW-001",
    name: "ATC Ultima",
    slug: "atc-ultima-telco-jamshedpur",
    developerName: "ATC Builders & Promoters",
    reraId: "JHARERA/PROJECT/410/2021",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "December 2026",
    priceMin: 7500000,
    priceMax: 16500000,
    pricePerSqFt: 4900,
    cityId: 1734,
    cityName: "Jamshedpur",
    stateName: "Jharkhand",
    locality: "Telco Colony",
    siteAddress: "Telco Town Main Road, Telco Colony, Jamshedpur, Jharkhand",
    landmark: "Near Tata Motors Ground & Telco Club",
    pincode: "831004",
    totalLandArea: "5 Acres",
    totalTowers: 4,
    totalUnits: 240,
    salesPhone: "9431342150",
    salesEmail: "sales@atcultima.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (All Days)",
    searchQuery: "Telco Jamshedpur flat apartment",
    fallbackQueries: ["Jamshedpur flat apartment", "Mango Jamshedpur flat"],
    amenities: [
      "Ultra-Modern Club Ultima with Temperature Controlled Pool",
      "Full Sized Squash Court & Indoor Table Tennis",
      "Dedicated Banquet Space for 300+ Guests",
      "High-Tech Gym with Professional Fitness Trainers",
      "24x7 Uninterrupted Tata Power & Water Supply",
      "Multi-Tier Security with Facial Recognition Access"
    ],
    highlights: [
      "Located in Jamshedpur's Most Elite Industrial Township",
      "Walking Distance from Telco Club & Shiksha Niketan School",
      "Exceptional High-Quality RCC Seismic Zone Construction",
      "Panoramic Views of Dalma Hill Ranges"
    ],
    configurations: [
      {
        bhkType: "3 BHK",
        carpetArea: 1110,
        superBuiltUpArea: 1480,
        bathrooms: 3,
        balconies: 2,
        priceMin: 7500000,
        priceMax: 8500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3.5 BHK",
        carpetArea: 1350,
        superBuiltUpArea: 1790,
        bathrooms: 3,
        balconies: 3,
        priceMin: 9500000,
        priceMax: 10800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-large.webp",
      },
      {
        bhkType: "4 BHK Luxury",
        carpetArea: 1840,
        superBuiltUpArea: 2450,
        bathrooms: 4,
        balconies: 4,
        priceMin: 14500000,
        priceMax: 16500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },
  {
    code: "PRJ-IXW-002",
    name: "Aastha The Watermark",
    slug: "aastha-the-watermark-adityapur-jamshedpur",
    developerName: "Aastha Group",
    reraId: "JHARERA/PROJECT/362/2022",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "September 2027",
    priceMin: 5200000,
    priceMax: 13500000,
    pricePerSqFt: 4200,
    cityId: 1734,
    cityName: "Jamshedpur",
    stateName: "Jharkhand",
    locality: "Adityapur",
    siteAddress: "Tata Kandra 4-Lane Highway, Adityapur Phase 2, Jamshedpur, Jharkhand",
    landmark: "Subarnarekha Riverfront Promenade",
    pincode: "831013",
    totalLandArea: "7.5 Acres",
    totalTowers: 5,
    totalUnits: 380,
    salesPhone: "9431189560",
    salesEmail: "info@aasthawatermark.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Adityapur Jamshedpur apartment flat",
    fallbackQueries: ["Jamshedpur luxury flat", "Sonari Jamshedpur flat"],
    amenities: [
      "Subarnarekha Riverview Viewing Deck",
      "Grand 25,000 sq.ft Clubhouse with Resort Amenities",
      "Tennis, Badminton & Half Basketball Courts",
      "Dedicated Creche & Daycare Facility",
      "Reflexology Walkway & Aromatherapy Garden",
      "EV Fast Charging Stations in Covered Basements"
    ],
    highlights: [
      "Direct Connectivity via 4-Lane Tata Kandra Expressway",
      "Subarnarekha Riverfront Waterfront Lifestyle Living",
      "Zero Traffic Pedestrian-First Podium Design",
      "Proximity to NIT Jamshedpur & Industrial Corridors"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 780,
        superBuiltUpArea: 1050,
        bathrooms: 2,
        balconies: 2,
        priceMin: 5200000,
        priceMax: 5800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1090,
        superBuiltUpArea: 1450,
        bathrooms: 2,
        balconies: 3,
        priceMin: 6800000,
        priceMax: 7800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "4 BHK Duplex Villa",
        carpetArea: 1820,
        superBuiltUpArea: 2400,
        bathrooms: 4,
        balconies: 4,
        priceMin: 12500000,
        priceMax: 13500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },

  // ===================== BOKARO STEEL CITY (id: 1674) =====================
  {
    code: "PRJ-BKR-001",
    name: "La Elixir Aashiyana Garden",
    slug: "la-elixir-aashiyana-garden-chira-chas-bokaro",
    developerName: "La Elixir Real Estate & Infra",
    reraId: "JHARERA/PROJECT/295/2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 3600000,
    priceMax: 7800000,
    pricePerSqFt: 3200,
    cityId: 1674,
    cityName: "Bokaro Steel City",
    stateName: "Jharkhand",
    locality: "Chira Chas",
    siteAddress: "Near Bokaro Golf Club Road, Chira Chas, Bokaro Steel City, Jharkhand",
    landmark: "Bokaro Golf Course & Sector 4 Access",
    pincode: "827013",
    totalLandArea: "15 Acres",
    totalTowers: 8,
    totalUnits: 650,
    salesPhone: "9431123789",
    salesEmail: "contact@laelixirbokaro.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Chira Chas Bokaro flat apartment",
    fallbackQueries: ["Bokaro Steel City residential flat", "Dhanbad apartment flat"],
    amenities: [
      "15-Acre Gated Master-Planned Community",
      "Clubhouse with Olympic Sized Swimming Pool",
      "Full Cricket Pitch & Football Play Field",
      "Commercial Shopping Complex with Pharmacy & Supermarket",
      "24-Hour Filtered Water & Uninterrupted Power Backup",
      "Dedicated School Bus Pick-up/Drop Bay"
    ],
    highlights: [
      "Bokaro Steel City's Largest Self-Contained Township",
      "Over 65% Open Landscaped Green Lawns",
      "Minutes Away from DPS Bokaro, Chinmaya Vidyalaya & St. Xavier's",
      "Ready to Move with Over 400 Happy Residing Families"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 690,
        superBuiltUpArea: 920,
        bathrooms: 2,
        balconies: 2,
        priceMin: 3600000,
        priceMax: 4100000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 960,
        superBuiltUpArea: 1280,
        bathrooms: 2,
        balconies: 2,
        priceMin: 4800000,
        priceMax: 5400000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3 BHK Premium",
        carpetArea: 1220,
        superBuiltUpArea: 1620,
        bathrooms: 3,
        balconies: 3,
        priceMin: 6200000,
        priceMax: 7800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-large.webp",
      }
    ]
  },
  {
    code: "PRJ-BKR-002",
    name: "Triveni Grand",
    slug: "triveni-grand-chas-bokaro",
    developerName: "Triveni Infrastructure",
    reraId: "JHARERA/PROJECT/318/2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 3200000,
    priceMax: 5800000,
    pricePerSqFt: 2950,
    cityId: 1674,
    cityName: "Bokaro Steel City",
    stateName: "Jharkhand",
    locality: "Chas",
    siteAddress: "Solagidih Main Road, Chas, Bokaro Steel City, Jharkhand",
    landmark: "Near Chas Railway Crossing & Bypass",
    pincode: "827013",
    totalLandArea: "3 Acres",
    totalTowers: 3,
    totalUnits: 160,
    salesPhone: "9431355410",
    salesEmail: "sales@trivenigrandbokaro.com",
    siteVisitTimings: "9:30 AM - 6:00 PM (Daily)",
    searchQuery: "Chas Bokaro apartment flat",
    fallbackQueries: ["Bokaro Chas flat", "Ranchi Argora flat"],
    amenities: [
      "Community Activity Hall & Indoor Games",
      "Well-Equipped Gymnasium",
      "Automatic High-Speed Elevators with ARD",
      "Children Sand Pit & Play Area",
      "Rainwater Harvesting System",
      "Secure Stilt Parking for Residents & Visitors"
    ],
    highlights: [
      "Prime Urban Connectivity on Chas - Purulia Highway Belt",
      "Certified Earthquake Resistant RCC Structure",
      "Clear Title with Instant Registration & Bank Home Loans",
      "Very Low Society Maintenance Overhead"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 640,
        superBuiltUpArea: 850,
        bathrooms: 2,
        balconies: 1,
        priceMin: 3200000,
        priceMax: 3600000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 890,
        superBuiltUpArea: 1180,
        bathrooms: 2,
        balconies: 2,
        priceMin: 4200000,
        priceMax: 4800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3 BHK Royal",
        carpetArea: 1050,
        superBuiltUpArea: 1390,
        bathrooms: 3,
        balconies: 3,
        priceMin: 5200000,
        priceMax: 5800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-large.webp",
      }
    ]
  },

  // ===================== DEOGHAR (id: 1699) =====================
  {
    code: "PRJ-DGH-001",
    name: "Keshavam Apartments",
    slug: "keshavam-apartments-jhoushagari-deoghar",
    developerName: "Keshavam Infratech Pvt Ltd",
    reraId: "JHARERA/PROJECT/525/2022",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "August 2026",
    priceMin: 3400000,
    priceMax: 6800000,
    pricePerSqFt: 3150,
    cityId: 1699,
    cityName: "Deoghar",
    stateName: "Jharkhand",
    locality: "Jhoushagari",
    siteAddress: "Castairs Town Extension, Jhoushagari, Deoghar, Jharkhand",
    landmark: "3 Km from Baba Baidyanath Jyotirlinga Temple",
    pincode: "814112",
    totalLandArea: "2.5 Acres",
    totalTowers: 3,
    totalUnits: 140,
    salesPhone: "9431168240",
    salesEmail: "contact@keshavaminfratech.com",
    siteVisitTimings: "8:30 AM - 6:30 PM (All 7 Days)",
    searchQuery: "Deoghar apartment flat",
    fallbackQueries: ["Castairs Town Deoghar flat", "Dhanbad residential flat"],
    amenities: [
      "Vastu-Compliant Peaceful Residential Layout",
      "Rooftop Meditation & Yoga Pavilion",
      "Clubhouse with AC Banquet Hall",
      "Children Play Area with Soft Rubberized Flooring",
      "Dedicated 24x7 Security & Guard Room",
      "Solar Water Heating Integration for Top Floors"
    ],
    highlights: [
      "Prime Central Location in Deoghar's Elite Residential Zone",
      "Quick 10-Minute Drive to Baba Baidyanath Dham & Deoghar Airport",
      "Wide 50-ft Concrete Approach Road",
      "High Rental Demand from Temple Pilgrims & Healthcare Professionals"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 670,
        superBuiltUpArea: 890,
        bathrooms: 2,
        balconies: 2,
        priceMin: 3400000,
        priceMax: 3800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 940,
        superBuiltUpArea: 1240,
        bathrooms: 2,
        balconies: 2,
        priceMin: 4600000,
        priceMax: 5200000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3 BHK Penthouse",
        carpetArea: 1300,
        superBuiltUpArea: 1720,
        bathrooms: 3,
        balconies: 3,
        priceMin: 6400000,
        priceMax: 6800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-large.webp",
      }
    ]
  },
  {
    code: "PRJ-DGH-002",
    name: "Ishaan Ashok Residences",
    slug: "ishaan-ashok-residences-bilasi-town-deoghar",
    developerName: "Ishaan Group Developers",
    reraId: "JHARERA/PROJECT/490/2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 3000000,
    priceMax: 5500000,
    pricePerSqFt: 2900,
    cityId: 1699,
    cityName: "Deoghar",
    stateName: "Jharkhand",
    locality: "Bilasi Town",
    siteAddress: "Near VIP Chowk, Bilasi Town, Deoghar, Jharkhand",
    landmark: "VIP Chowk & Bilasi Town Market",
    pincode: "814112",
    totalLandArea: "1.8 Acres",
    totalTowers: 2,
    totalUnits: 96,
    salesPhone: "9431389020",
    salesEmail: "sales@ishaanashokdeoghar.com",
    siteVisitTimings: "9:00 AM - 6:00 PM (Monday - Sunday)",
    searchQuery: "Bilasi Town Deoghar flat",
    fallbackQueries: ["Deoghar flat house", "Hazaribagh flat"],
    amenities: [
      "Community Activity Center",
      "Fitness Gymnasium & Aerobics Room",
      "High-Speed Automatic Lifts with Battery Backup",
      "24x7 Water Supply with Deep Tube Well & Filtration",
      "Intercom Facility & Electronic Security Gate",
      "Reserved Stilt Parking Bays"
    ],
    highlights: [
      "Situated in Established Bilasi Town Neighborhood",
      "Ready to Move with Full Occupancy Certificate",
      "Peaceful Residential Ambience Close to Prominent Schools",
      "Transparent Pricing with Zero Hidden Developer Charges"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 610,
        superBuiltUpArea: 810,
        bathrooms: 2,
        balconies: 1,
        priceMin: 3000000,
        priceMax: 3400000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 870,
        superBuiltUpArea: 1150,
        bathrooms: 2,
        balconies: 2,
        priceMin: 4000000,
        priceMax: 4500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3 BHK Grand",
        carpetArea: 1040,
        superBuiltUpArea: 1380,
        bathrooms: 3,
        balconies: 3,
        priceMin: 4900000,
        priceMax: 5500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-large.webp",
      }
    ]
  },

  // ===================== DHANBAD (id: 1701) =====================
  {
    code: "PRJ-DHN-001",
    name: "Kailash Vatika",
    slug: "kailash-vatika-saraidhela-dhanbad",
    developerName: "Kailash Realcon Pvt Ltd",
    reraId: "JHARERA/PROJECT/388/2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 4200000,
    priceMax: 8800000,
    pricePerSqFt: 3500,
    cityId: 1701,
    cityName: "Dhanbad",
    stateName: "Jharkhand",
    locality: "Saraidhela",
    siteAddress: "Saraidhela Main Road, Near Ozone Galleria Mall, Dhanbad, Jharkhand",
    landmark: "Opposite Ozone Galleria Mall",
    pincode: "828127",
    totalLandArea: "4.2 Acres",
    totalTowers: 4,
    totalUnits: 210,
    salesPhone: "9431190450",
    salesEmail: "sales@kailashvatikadhanbad.com",
    siteVisitTimings: "9:00 AM - 7:00 PM (All 7 Days)",
    searchQuery: "Saraidhela Dhanbad flat apartment",
    fallbackQueries: ["Dhanbad luxury flat", "Ranchi Bariatu apartment"],
    amenities: [
      "Modern Clubhouse with Swimming Pool & Kids Splash Pool",
      "Fully Equipped Health Club & Cardio Gymnasium",
      "Jogging Track & Landscaped Flower Gardens",
      "Multi-Purpose AC Banquet Hall",
      "24x7 Tier-2 Security with Monitored CCTV",
      "Multi-Level Covered Car Parking"
    ],
    highlights: [
      "Heart of Dhanbad's Most Prestigious Saraidhela Corridor",
      "Walking Distance from Ozone Galleria Mall & Cinepolis",
      "Quick Access to ISM Dhanbad (IIT) & Central Hospital",
      "Ready to Move with Reputed Bank Home Loan Tie-Ups"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 720,
        superBuiltUpArea: 960,
        bathrooms: 2,
        balconies: 2,
        priceMin: 4200000,
        priceMax: 4700000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1020,
        superBuiltUpArea: 1350,
        bathrooms: 2,
        balconies: 3,
        priceMin: 5600000,
        priceMax: 6500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "4 BHK",
        carpetArea: 1450,
        superBuiltUpArea: 1920,
        bathrooms: 4,
        balconies: 4,
        priceMin: 7800000,
        priceMax: 8800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  }
];

// Helper to fetch photos from real listings
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

async function run() {
  console.log("================================================================================");
  console.log("SOURCING JHARKHAND PROJECTS: HAZARIBAGH, RANCHI, JAMSHEDPUR, BOKARO, DEOGHAR, DHANBAD");
  console.log("================================================================================");

  const usedImageUrls = new Set();
  const processedProjects = [];

  for (let i = 0; i < JHARKHAND_PROJECTS.length; i++) {
    const p = JHARKHAND_PROJECTS[i];
    console.log(`\n[${i + 1}/${JHARKHAND_PROJECTS.length}] Processing ${p.name} in ${p.cityName}...`);

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
  fs.writeFileSync(path.join(DOCS_DIR, "jharkhand_projects.json"), JSON.stringify(processedProjects, null, 2));
  console.log(`\nSuccessfully processed and uploaded ${processedProjects.length} Jharkhand projects!`);
  console.log(`Saved master file to: ${PROJECTS_FILE}`);
}

run().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
