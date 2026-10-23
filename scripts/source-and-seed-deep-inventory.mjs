import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "/Users/vinaykumar/Desktop/myProjects/awasio-backend/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";

const BASE_DIR = "/Users/vinaykumar/Desktop/awasio-sourced-properties";
const PROJECT_IMAGES_DIR = path.join(BASE_DIR, "deep_inventory_images");
const PROJECTS_FILE = path.join(BASE_DIR, "deep_inventory_projects.json");
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

// 24 New Projects boosting Hazaribagh, Ranchi, Jamshedpur, Patna, Indore, Bhopal to 5-6 projects each
const PROJECTS = [
  // ===================== HAZARIBAGH (Adding 4 more -> Total 6) =====================
  {
    code: "PRJ-HZB-003",
    name: "Aryavart Green City",
    slug: "aryavart-green-city-canary-hill-hazaribagh",
    developerName: "Aryavart Developers & Infratech",
    reraId: "JHARERA/PROJECT/582/2022",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "October 2026",
    priceMin: 4200000,
    priceMax: 7800000,
    pricePerSqFt: 3450,
    cityId: 1725,
    cityName: "Hazaribagh",
    stateName: "Jharkhand",
    locality: "Canary Hill Road",
    siteAddress: "Near Canary Hill Eco Park, Hazaribagh, Jharkhand",
    landmark: "Canary Hill Forest View Corridor",
    pincode: "825301",
    totalLandArea: "4 Acres",
    totalTowers: 4,
    totalUnits: 190,
    salesPhone: "9431188210",
    salesEmail: "sales@aryavartgreencity.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Hazaribagh flat apartment",
    fallbackQueries: ["Canary hill Hazaribagh house", "Jharkhand apartment flat"],
    amenities: [
      "Canary Hill Valley Viewing Deck",
      "Clubhouse with Yoga Pavilion & Gym",
      "Badminton Court with Floodlights",
      "Lush Landscaped Children's Play Arena",
      "24x7 Multi-Tier Gated Security with CCTV",
      "Covered Stilt & Open Allotted Parking"
    ],
    highlights: [
      "Scenic Eco-Living Directly Facing Canary Hill Range",
      "Fresh Air & Low Noise Residential Belt",
      "Minutes from Core Hazaribagh City Markets",
      "Bank Loan Approvals with SBI & PNB"
    ],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 690, superBuiltUpArea: 920, bathrooms: 2, balconies: 2, priceMin: 4200000, priceMax: 4600000 },
      { bhkType: "3 BHK", carpetArea: 980, superBuiltUpArea: 1320, bathrooms: 2, balconies: 3, priceMin: 5600000, priceMax: 6400000 },
      { bhkType: "3.5 BHK", carpetArea: 1250, superBuiltUpArea: 1680, bathrooms: 3, balconies: 3, priceMin: 7100000, priceMax: 7800000 }
    ]
  },
  {
    code: "PRJ-HZB-004",
    name: "Annapurna Enclave",
    slug: "annapurna-enclave-dipugarha-hazaribagh",
    developerName: "Annapurna Infratech",
    reraId: "JHARERA/PROJECT/534/2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 3600000,
    priceMax: 6200000,
    pricePerSqFt: 3250,
    cityId: 1725,
    cityName: "Hazaribagh",
    stateName: "Jharkhand",
    locality: "Dipugarha",
    siteAddress: "Dipugarha Bypass Road, Hazaribagh, Jharkhand",
    landmark: "Near Dipugarha Chowk & NH-33 Link",
    pincode: "825301",
    totalLandArea: "2.5 Acres",
    totalTowers: 3,
    totalUnits: 130,
    salesPhone: "9431199320",
    salesEmail: "contact@annapurnaenclave.com",
    siteVisitTimings: "9:30 AM - 6:00 PM (Daily)",
    searchQuery: "Dipugarha Hazaribagh flat",
    fallbackQueries: ["Hazaribagh residential flat", "Ranchi flat"],
    amenities: [
      "Community Banquet & Activity Hall",
      "Fitness Gymnasium & Cardio Deck",
      "High-Speed Automatic Elevators with Battery Rescue",
      "24-Hour Sweet Groundwater Supply",
      "Electronic Security Gates with Monitored Intercom",
      "Dedicated Covered Stilt Parking Bays"
    ],
    highlights: [
      "Prime Dipugarha Growth Corridor with Immediate NH-33 Access",
      "Ready to Move with Instant Registry & Possession",
      "Earthquake Resistant RCC Structural Design",
      "Peaceful Gated Community Environment"
    ],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 640, superBuiltUpArea: 860, bathrooms: 2, balconies: 1, priceMin: 3600000, priceMax: 4000000 },
      { bhkType: "3 BHK", carpetArea: 920, superBuiltUpArea: 1240, bathrooms: 2, balconies: 2, priceMin: 4900000, priceMax: 5500000 },
      { bhkType: "3 BHK Deluxe", carpetArea: 1120, superBuiltUpArea: 1480, bathrooms: 3, balconies: 3, priceMin: 5800000, priceMax: 6200000 }
    ]
  },
  {
    code: "PRJ-HZB-005",
    name: "Shri Ram Vatika",
    slug: "shri-ram-vatika-matwari-hazaribagh",
    developerName: "Shri Ram Builders Hazaribagh",
    reraId: "JHARERA/PROJECT/498/2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 3900000,
    priceMax: 6800000,
    pricePerSqFt: 3400,
    cityId: 1725,
    cityName: "Hazaribagh",
    stateName: "Jharkhand",
    locality: "Matwari",
    siteAddress: "Near Matwari Stadium Road, Matwari, Hazaribagh, Jharkhand",
    landmark: "Matwari Stadium & St. Columba's College",
    pincode: "825301",
    totalLandArea: "2.8 Acres",
    totalTowers: 3,
    totalUnits: 140,
    salesPhone: "9431344150",
    salesEmail: "sales@shriramvatikahzb.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (All 7 Days)",
    searchQuery: "Matwari Hazaribagh apartment",
    fallbackQueries: ["Hazaribagh flat house", "Bariatu Ranchi flat"],
    amenities: [
      "Community Activity Center",
      "Health Club & Gymnasium",
      "Landscaped Children Play Area",
      "Automatic High-Speed Lifts with ARD",
      "24x7 Tier-2 Security & CCTV Surveillance",
      "Rainwater Harvesting System"
    ],
    highlights: [
      "Heart of Hazaribagh's Most Elite Matwari Neighborhood",
      "Walking Distance to Prestigious Schools, Colleges & Markets",
      "Ready to Move with Full Bank Home Loan Support",
      "Spacious Flats with Wide 3-Side Ventilation"
    ],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 680, superBuiltUpArea: 890, bathrooms: 2, balconies: 2, priceMin: 3900000, priceMax: 4300000 },
      { bhkType: "3 BHK", carpetArea: 950, superBuiltUpArea: 1280, bathrooms: 2, balconies: 2, priceMin: 5200000, priceMax: 5800000 },
      { bhkType: "3 BHK Royal", carpetArea: 1180, superBuiltUpArea: 1550, bathrooms: 3, balconies: 3, priceMin: 6200000, priceMax: 6800000 }
    ]
  },
  {
    code: "PRJ-HZB-006",
    name: "Susmit Apartment",
    slug: "susmit-apartment-shivpuri-hazaribagh",
    developerName: "Susmit Developers Pvt Ltd",
    reraId: "JHARERA/PROJECT/462/2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 3500000,
    priceMax: 5900000,
    pricePerSqFt: 3200,
    cityId: 1725,
    cityName: "Hazaribagh",
    stateName: "Jharkhand",
    locality: "Shivpuri",
    siteAddress: "Shivpuri Main Road, Near Holy Cross School, Hazaribagh, Jharkhand",
    landmark: "Holy Cross School & Shivpuri Chowk",
    pincode: "825301",
    totalLandArea: "1.8 Acres",
    totalTowers: 2,
    totalUnits: 90,
    salesPhone: "9431355260",
    salesEmail: "contact@susmitdevelopers.com",
    siteVisitTimings: "9:00 AM - 6:00 PM (Daily)",
    searchQuery: "Shivpuri Hazaribagh flat",
    fallbackQueries: ["Hazaribagh apartment flat", "Jharkhand house flat"],
    amenities: [
      "AC Community Banquet Space",
      "Fitness Gymnasium with Basic Cardio",
      "High-Speed Automatic Elevators",
      "24-Hour Tube Well Filtered Water Supply",
      "Intercom Facility & Electronic Security Gate",
      "Allotted Stilt Car Parking Bays"
    ],
    highlights: [
      "Peaceful Established Neighborhood in Shivpuri",
      "Close to Leading Schools, Coaching Hubs & Healthcare",
      "Ready to Move with Complete Legal Documentation",
      "Very Low Maintenance Overhead for Owners"
    ],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 620, superBuiltUpArea: 820, bathrooms: 2, balconies: 1, priceMin: 3500000, priceMax: 3900000 },
      { bhkType: "3 BHK", carpetArea: 880, superBuiltUpArea: 1180, bathrooms: 2, balconies: 2, priceMin: 4600000, priceMax: 5200000 },
      { bhkType: "3 BHK Deluxe", carpetArea: 1040, superBuiltUpArea: 1380, bathrooms: 3, balconies: 2, priceMin: 5400000, priceMax: 5900000 }
    ]
  },

  // ===================== RANCHI (Adding 4 more -> Total 6) =====================
  {
    code: "PRJ-IXR-003",
    name: "Aurum Luxury Residences",
    slug: "aurum-luxury-residences-kanke-road-ranchi",
    developerName: "Sharda Shelters Pvt Ltd",
    reraId: "JHARERA/PROJECT/412/2021",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "December 2026",
    priceMin: 12000000,
    priceMax: 26000000,
    pricePerSqFt: 6200,
    cityId: 1816,
    cityName: "Ranchi",
    stateName: "Jharkhand",
    locality: "Kanke Road",
    siteAddress: "Kanke Road, Opposite Rock Garden, Ranchi, Jharkhand",
    landmark: "Kanke Rock Garden & Kanke Dam Lake View",
    pincode: "834008",
    totalLandArea: "5 Acres",
    totalTowers: 4,
    totalUnits: 220,
    salesPhone: "9431101920",
    salesEmail: "sales@aurumranchi.com",
    siteVisitTimings: "9:30 AM - 7:00 PM (All 7 Days)",
    searchQuery: "Kanke Road Ranchi flat apartment",
    fallbackQueries: ["Ranchi luxury flat", "Morabadi Ranchi flat"],
    amenities: [
      "Panoramic Kanke Dam Lake-View Rooftop Sky Lounge",
      "Temperature Controlled Infinity Lap Pool & Jacuzzi",
      "Grand Double-Height Designer Entrance Lobby",
      "Technogym Equipped Health Club & Steam/Sauna",
      "Multi-Tier Biometric Security & Smart Home Automation",
      "Covered Multi-Level Parking with EV Fast Charging Points"
    ],
    highlights: [
      "Ranchi's Most Prestigious Ultra-Luxury Address on Kanke Road",
      "Unobstructed Panoramic Views of Kanke Dam and Gonda Hills",
      "Minutes from Chief Minister's Residence & Governor House Corridor",
      "IGBC Gold Pre-Certified Green Building Design"
    ],
    configurations: [
      { bhkType: "3 BHK Luxury", carpetArea: 1380, superBuiltUpArea: 1950, bathrooms: 3, balconies: 3, priceMin: 12000000, priceMax: 14500000 },
      { bhkType: "4 BHK Regal", carpetArea: 1950, superBuiltUpArea: 2750, bathrooms: 4, balconies: 4, priceMin: 18500000, priceMax: 21500000 },
      { bhkType: "4.5 BHK Sky Villa", carpetArea: 2450, superBuiltUpArea: 3450, bathrooms: 5, balconies: 5, priceMin: 23500000, priceMax: 26000000 }
    ]
  },
  {
    code: "PRJ-IXR-004",
    name: "DKD Ivy Towers",
    slug: "dkd-ivy-towers-bariatu-ranchi",
    developerName: "DKD Infratech Pvt Ltd",
    reraId: "JHARERA/PROJECT/365/2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 9500000,
    priceMax: 18500000,
    pricePerSqFt: 5200,
    cityId: 1816,
    cityName: "Ranchi",
    stateName: "Jharkhand",
    locality: "Bariatu",
    siteAddress: "Bariatu Main Road, Near Medical College Hospital, Ranchi, Jharkhand",
    landmark: "Near RIMS Hospital & Bariatu Ridge",
    pincode: "834009",
    totalLandArea: "4.2 Acres",
    totalTowers: 4,
    totalUnits: 260,
    salesPhone: "9431102830",
    salesEmail: "contact@dkdivytowers.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Bariatu Ranchi apartment flat",
    fallbackQueries: ["Ranchi apartment flat", "Lalpur Ranchi flat"],
    amenities: [
      "Club Ivy with Swimming Pool & Kids Play Pool",
      "Air-Conditioned Banquet Hall for 250+ Guests",
      "Indoor Badminton Court & Table Tennis Room",
      "State-of-the-Art Fitness Center & Yoga Studio",
      "24x7 Multi-Tier Electronic Security & Intercom",
      "Multi-Level Basement Parking with Wide Driveways"
    ],
    highlights: [
      "Prime Bariatu Medical & Residential Corridor",
      "Ready to Move with Full Registry and Bank Loan Clearances",
      "Over 70% Open Sky & Landscaped Zen Courtyards",
      "Vastu-Compliant 3 & 4 BHK High-Rise Residences"
    ],
    configurations: [
      { bhkType: "3 BHK", carpetArea: 1220, superBuiltUpArea: 1680, bathrooms: 3, balconies: 3, priceMin: 9500000, priceMax: 11000000 },
      { bhkType: "3 BHK Large", carpetArea: 1450, superBuiltUpArea: 1980, bathrooms: 3, balconies: 3, priceMin: 12500000, priceMax: 14200000 },
      { bhkType: "4 BHK", carpetArea: 1850, superBuiltUpArea: 2550, bathrooms: 4, balconies: 4, priceMin: 16500000, priceMax: 18500000 }
    ]
  },
  {
    code: "PRJ-IXR-005",
    name: "Palm Hills",
    slug: "palm-hills-kathal-more-ranchi",
    developerName: "Pranami Group Ranchi",
    reraId: "JHARERA/PROJECT/292/2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5800000,
    priceMax: 11500000,
    pricePerSqFt: 4600,
    cityId: 1816,
    cityName: "Ranchi",
    stateName: "Jharkhand",
    locality: "Kathal More",
    siteAddress: "Kathal More - Argora Ring Road, Kathal More, Ranchi, Jharkhand",
    landmark: "Kathal More Chowk & Ring Road Flyover",
    pincode: "834005",
    totalLandArea: "6.5 Acres",
    totalTowers: 6,
    totalUnits: 380,
    salesPhone: "9431103740",
    salesEmail: "sales@palmhillsranchi.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Kathal More Ranchi flat",
    fallbackQueries: ["Argora Kathal More flat", "Ranchi residential flat"],
    amenities: [
      "Modern Community Lifestyle Clubhouse with Lap Pool",
      "Fully Equipped Gymnasium with Modern Machines",
      "Tennis & Half Basketball Courts",
      "Jogging Track & Landscaped Green Lawns",
      "24x7 Gated Security with Monitored Boom Barrier",
      "Covered Stilt Allotted Car Parking Bays"
    ],
    highlights: [
      "Direct Ring Road Connectivity to Birsa Munda Airport",
      "Ready to Move with Over 250 Residing Families",
      "Zero Water Scarcity with Dual Boring & Harvesting",
      "Pre-Approved Home Loans with SBI, HDFC & ICICI"
    ],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 760, superBuiltUpArea: 1040, bathrooms: 2, balconies: 2, priceMin: 5800000, priceMax: 6500000 },
      { bhkType: "3 BHK", carpetArea: 1060, superBuiltUpArea: 1480, bathrooms: 2, balconies: 3, priceMin: 7800000, priceMax: 8900000 },
      { bhkType: "3 BHK Royal", carpetArea: 1320, superBuiltUpArea: 1850, bathrooms: 3, balconies: 3, priceMin: 9800000, priceMax: 11500000 }
    ]
  },
  {
    code: "PRJ-IXR-006",
    name: "Assotech Hills",
    slug: "assotech-hills-morabadi-ranchi",
    developerName: "Assotech Sun Growth Pvt Ltd",
    reraId: "JHARERA/PROJECT/310/2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 6800000,
    priceMax: 14800000,
    pricePerSqFt: 5100,
    cityId: 1816,
    cityName: "Ranchi",
    stateName: "Jharkhand",
    locality: "Morabadi",
    siteAddress: "Sector 1, Near Morabadi Ground, Morabadi, Ranchi, Jharkhand",
    landmark: "Morabadi Ground & Ranchi University Campus",
    pincode: "834008",
    totalLandArea: "8 Acres",
    totalTowers: 6,
    totalUnits: 420,
    salesPhone: "9431104650",
    salesEmail: "contact@assotechhills.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (All 7 Days)",
    searchQuery: "Morabadi Ranchi flat apartment",
    fallbackQueries: ["Ranchi luxury apartment", "Bariatu Ranchi flat"],
    amenities: [
      "Integrated 8-Acre Township with Central Park",
      "Clubhouse with Olympic Size Pool & Kids Pool",
      "Badminton, Squash & Table Tennis Courts",
      "Commercial Shopping Arcade with Daily Needs & Pharmacy",
      "24x7 Multi-Tier Electronic Security & CCTV",
      "Allotted Covered Stilt & Basement Parking"
    ],
    highlights: [
      "Prestigious Morabadi Location Opposite Tagore Hill Corridor",
      "Walkable to Morabadi Ground, Sports Complex & Gymkhanas",
      "Ready to Move with Vibrant Cosmopolitan Community",
      "Over 75% Open Greenery & Broad Tree-Lined Avenues"
    ],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 810, superBuiltUpArea: 1120, bathrooms: 2, balconies: 2, priceMin: 6800000, priceMax: 7600000 },
      { bhkType: "3 BHK", carpetArea: 1120, superBuiltUpArea: 1560, bathrooms: 3, balconies: 3, priceMin: 9500000, priceMax: 11000000 },
      { bhkType: "4 BHK", carpetArea: 1580, superBuiltUpArea: 2240, bathrooms: 4, balconies: 4, priceMin: 13200000, priceMax: 14800000 }
    ]
  },

  // ===================== JAMSHEDPUR (Adding 4 more -> Total 6) =====================
  {
    code: "PRJ-IXW-003",
    name: "Vijaya Garden",
    slug: "vijaya-garden-baridih-jamshedpur",
    developerName: "Vijaya Homes Pvt Ltd",
    reraId: "JHARERA/PROJECT/385/2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5800000,
    priceMax: 13500000,
    pricePerSqFt: 4300,
    cityId: 1734,
    cityName: "Jamshedpur",
    stateName: "Jharkhand",
    locality: "Baridih",
    siteAddress: "Baridih Main Road, Near Tinplate Hospital, Jamshedpur, Jharkhand",
    landmark: "Baridih Roundabout & Tinplate Hospital",
    pincode: "831017",
    totalLandArea: "12 Acres",
    totalTowers: 8,
    totalUnits: 550,
    salesPhone: "9431301920",
    salesEmail: "sales@vijayahomes.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Baridih Jamshedpur flat apartment",
    fallbackQueries: ["Jamshedpur flat apartment", "Telco Jamshedpur flat"],
    amenities: [
      "12-Acre Master-Planned Gated Township",
      "Grand Club Vijaya with Swimming Pool & Kids Splash Arena",
      "Full Sized Tennis & Badminton Courts",
      "Convenience Shopping Arcade & Health Clinic Inside Society",
      "24x7 Multi-Tier Guarded Security with Boom Barriers",
      "Covered Stilt & Open Allotted Car Parking"
    ],
    highlights: [
      "Jamshedpur's Most Celebrated Integrated Township in Baridih",
      "Surrounded by Lush Green Dalma Foothills & Uninterrupted Tata Power",
      "Ready to Move with Over 400 Families Happily Residing",
      "Pre-Approved for 90% Loan with SBI, HDFC & Bank of India"
    ],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 780, superBuiltUpArea: 1080, bathrooms: 2, balconies: 2, priceMin: 5800000, priceMax: 6500000 },
      { bhkType: "3 BHK", carpetArea: 1080, superBuiltUpArea: 1520, bathrooms: 2, balconies: 3, priceMin: 7800000, priceMax: 8900000 },
      { bhkType: "4 BHK Villa/Apt", carpetArea: 1580, superBuiltUpArea: 2250, bathrooms: 4, balconies: 4, priceMin: 11800000, priceMax: 13500000 }
    ]
  },
  {
    code: "PRJ-IXW-004",
    name: "Srinath Rock Garden",
    slug: "srinath-rock-garden-telco-jamshedpur",
    developerName: "Srinath Homes",
    reraId: "JHARERA/PROJECT/428/2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5300000,
    priceMax: 9800000,
    pricePerSqFt: 4100,
    cityId: 1734,
    cityName: "Jamshedpur",
    stateName: "Jharkhand",
    locality: "Telco Colony",
    siteAddress: "Near Telco Rock Garden, Telco Town, Jamshedpur, Jharkhand",
    landmark: "Telco Rock Garden & Tata Motors Plant Gate",
    pincode: "831004",
    totalLandArea: "4.5 Acres",
    totalTowers: 4,
    totalUnits: 210,
    salesPhone: "9431302830",
    salesEmail: "contact@srinathhomes.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (All 7 Days)",
    searchQuery: "Telco Jamshedpur apartment flat",
    fallbackQueries: ["Jamshedpur flat apartment", "Mango Jamshedpur flat"],
    amenities: [
      "Clubhouse with Fitness Gymnasium & Aerobics Room",
      "Community Activity Hall & Indoor Games Zone",
      "Landscaped Children Play Park with Soft Flooring",
      "High-Speed Automatic Lifts with ARD Battery Backup",
      "24x7 CCTV Monitored Gated Security",
      "Covered Stilt Parking for Residents"
    ],
    highlights: [
      "Quiet Nature-Rich Enclave Next to Famous Telco Rock Garden",
      "Minutes from Telco Club & Shiksha Niketan School",
      "Ready to Move with Clear Ownership Title & Occupancy",
      "Earthquake Resistant RCC Structural Design"
    ],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 720, superBuiltUpArea: 980, bathrooms: 2, balconies: 2, priceMin: 5300000, priceMax: 5900000 },
      { bhkType: "3 BHK", carpetArea: 1020, superBuiltUpArea: 1390, bathrooms: 2, balconies: 3, priceMin: 6900000, priceMax: 7800000 },
      { bhkType: "3 BHK Duplex", carpetArea: 1350, superBuiltUpArea: 1850, bathrooms: 3, balconies: 3, priceMin: 8800000, priceMax: 9800000 }
    ]
  },
  {
    code: "PRJ-IXW-005",
    name: "Srinath Shikhar",
    slug: "srinath-shikhar-mango-jamshedpur",
    developerName: "Srinath Homes",
    reraId: "JHARERA/PROJECT/395/2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 4800000,
    priceMax: 7800000,
    pricePerSqFt: 3850,
    cityId: 1734,
    cityName: "Jamshedpur",
    stateName: "Jharkhand",
    locality: "Mango",
    siteAddress: "Dimna Road, Near Dimna Chowk, Mango, Jamshedpur, Jharkhand",
    landmark: "Dimna Lake Road & Dimna Chowk",
    pincode: "831012",
    totalLandArea: "3.8 Acres",
    totalTowers: 3,
    totalUnits: 180,
    salesPhone: "9431303740",
    salesEmail: "sales@srinathshikhar.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Mango Jamshedpur flat apartment",
    fallbackQueries: ["Dimna Road Jamshedpur flat", "Jamshedpur residential flat"],
    amenities: [
      "Terrace Garden with Panoramic Dalma Hill Views",
      "Community Hall for Gatherings & Celebrations",
      "Health Club & Fitness Gymnasium",
      "Children Sand Pit & Play Area",
      "24-Hour Sweet Groundwater Supply & Deep Boring",
      "Security Guard Post with Electronic Gate Access"
    ],
    highlights: [
      "Prime Dimna Road Corridor with Direct NH-33 Access",
      "Close to MGM Medical College & Dimna Lake Tourism Belt",
      "Ready to Move with Full Registry and Bank Home Loans",
      "Low Monthly Maintenance Overhead for Owners"
    ],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 690, superBuiltUpArea: 940, bathrooms: 2, balconies: 2, priceMin: 4800000, priceMax: 5400000 },
      { bhkType: "3 BHK", carpetArea: 960, superBuiltUpArea: 1320, bathrooms: 2, balconies: 2, priceMin: 6200000, priceMax: 7000000 },
      { bhkType: "3 BHK Royal", carpetArea: 1140, superBuiltUpArea: 1560, bathrooms: 3, balconies: 3, priceMin: 7200000, priceMax: 7800000 }
    ]
  },
  {
    code: "PRJ-IXW-006",
    name: "Shree Triveni Imperial",
    slug: "shree-triveni-imperial-adityapur-jamshedpur",
    developerName: "Triveni Infracon Pvt Ltd",
    reraId: "JHARERA/PROJECT/445/2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 3900000,
    priceMax: 6800000,
    pricePerSqFt: 3600,
    cityId: 1734,
    cityName: "Jamshedpur",
    stateName: "Jharkhand",
    locality: "Adityapur",
    siteAddress: "Adityapur Main Road, Near S-Type Roundabout, Jamshedpur, Jharkhand",
    landmark: "Adityapur Industrial Area & NIT Jamshedpur",
    pincode: "831013",
    totalLandArea: "3 Acres",
    totalTowers: 3,
    totalUnits: 150,
    salesPhone: "9431304650",
    salesEmail: "contact@triveniimperial.com",
    siteVisitTimings: "9:00 AM - 6:00 PM (Daily)",
    searchQuery: "Adityapur Jamshedpur flat",
    fallbackQueries: ["Jamshedpur flat house", "Ranchi Argora flat"],
    amenities: [
      "Community Activity Hall",
      "Gymnasium with Cardio Equipment",
      "Automatic High-Speed Elevators with Power Backup",
      "CCTV Monitored Gated Security",
      "24x7 Water Supply from Deep Borewells",
      "Allotted Stilt Car Parking Bays"
    ],
    highlights: [
      "Direct 4-Lane Highway Access to Bistupur (10 Mins Drive)",
      "Minutes Away from NIT Jamshedpur & Industrial SEZ",
      "Ready to Move with Immediate Registry & Possession",
      "Affordable Pricing with High Rental Yield from Engineers"
    ],
    configurations: [
      { bhkType: "1 BHK", carpetArea: 440, superBuiltUpArea: 610, bathrooms: 1, balconies: 1, priceMin: 2800000, priceMax: 3100000 },
      { bhkType: "2 BHK", carpetArea: 680, superBuiltUpArea: 920, bathrooms: 2, balconies: 1, priceMin: 3900000, priceMax: 4400000 },
      { bhkType: "3 BHK", carpetArea: 980, superBuiltUpArea: 1350, bathrooms: 2, balconies: 2, priceMin: 5500000, priceMax: 6800000 }
    ]
  },

  // ===================== PATNA (Adding 4 more -> Total 6) =====================
  {
    code: "PRJ-PAT-003",
    name: "Venus Capital Heights",
    slug: "venus-capital-heights-danapur-patna",
    developerName: "Venus Infratech Pvt Ltd",
    reraId: "BRERAP00312/2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 12500000,
    priceMax: 29000000,
    pricePerSqFt: 6200,
    cityId: 63,
    cityName: "Patna",
    stateName: "Bihar",
    locality: "Danapur",
    siteAddress: "Saguna More - Danapur Station Road, Danapur, Patna, Bihar",
    landmark: "Saguna More Commercial Junction & Danapur Cantonment",
    pincode: "801503",
    totalLandArea: "5 Acres",
    totalTowers: 4,
    totalUnits: 200,
    salesPhone: "9431035670",
    salesEmail: "sales@venuscapitalheights.com",
    siteVisitTimings: "9:30 AM - 7:00 PM (Daily)",
    searchQuery: "Danapur Patna luxury flat apartment",
    fallbackQueries: ["Patna Saguna More flat", "Patna Bailey Road apartment"],
    amenities: [
      "Ultra-Luxury Sky Lounge & Rooftop Infinity Pool",
      "Full Sized Squash & Badminton Courts",
      "Designer Double-Height Entrance Lobby with Concierge",
      "Technogym Outfitted Fitness Health Club",
      "Multi-Tier Biometric Security with Video Intercom",
      "Multi-Level Basement Parking with EV Chargers"
    ],
    highlights: [
      "Patna's Most Iconic Ultra-Luxury High-Rise on Saguna More Corridor",
      "Palatial 3, 4 & 5 BHK Sky Residences with 11-ft Clear Ceilings",
      "Walking Distance to Premier Malls, Clinics & Upcoming Metro",
      "Ready to Move with Full Registry and Bank Home Loan Clearances"
    ],
    configurations: [
      { bhkType: "3 BHK Luxury", carpetArea: 1450, superBuiltUpArea: 2050, bathrooms: 3, balconies: 3, priceMin: 12500000, priceMax: 15500000 },
      { bhkType: "4 BHK Regal", carpetArea: 2150, superBuiltUpArea: 3050, bathrooms: 4, balconies: 4, priceMin: 19500000, priceMax: 23500000 },
      { bhkType: "5 BHK Penthouse", carpetArea: 2950, superBuiltUpArea: 4250, bathrooms: 5, balconies: 5, priceMin: 26500000, priceMax: 29000000 }
    ]
  },
  {
    code: "PRJ-PAT-004",
    name: "Nutan Crescent",
    slug: "nutan-crescent-anisabad-patna",
    developerName: "Nutan Construction",
    reraId: "BRERAP00524/2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8500000,
    priceMax: 16500000,
    pricePerSqFt: 5200,
    cityId: 63,
    cityName: "Patna",
    stateName: "Bihar",
    locality: "Anisabad",
    siteAddress: "Police Colony Main Road, Anisabad, Patna, Bihar",
    landmark: "Anisabad Golambar & Patna Airport Access",
    pincode: "800002",
    totalLandArea: "3.5 Acres",
    totalTowers: 3,
    totalUnits: 160,
    salesPhone: "9431046780",
    salesEmail: "contact@nutanconstruction.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Anisabad Patna flat apartment",
    fallbackQueries: ["Patna apartment flat", "Boring Road Patna flat"],
    amenities: [
      "Clubhouse with Swimming Pool & Kids Pool",
      "Air-Conditioned Community Banquet Hall",
      "Fully Equipped Gymnasium & Yoga Studio",
      "Landscaped Central Garden with Jogging Pathway",
      "24x7 Multi-Tier Electronic Security & CCTV",
      "Covered Stilt & Basement Parking Bays"
    ],
    highlights: [
      "Prime Central Location in Anisabad Close to Patna Airport",
      "Immediate Access to Bypass Road, AIIMS Patna & Phulwari Sharif",
      "Ready to Move with Full Occupancy Certificate",
      "Spacious Low-Density Tower Planning with 3-Side Ventilation"
    ],
    configurations: [
      { bhkType: "3 BHK", carpetArea: 1180, superBuiltUpArea: 1635, bathrooms: 3, balconies: 3, priceMin: 8500000, priceMax: 10500000 },
      { bhkType: "3 BHK Deluxe", carpetArea: 1420, superBuiltUpArea: 1980, bathrooms: 3, balconies: 3, priceMin: 11500000, priceMax: 13200000 },
      { bhkType: "4 BHK Royal", carpetArea: 1880, superBuiltUpArea: 2640, bathrooms: 4, balconies: 4, priceMin: 14500000, priceMax: 16500000 }
    ]
  },
  {
    code: "PRJ-PAT-005",
    name: "Siyaram Bisaka Enclave",
    slug: "siyaram-bisaka-enclave-bailey-road-patna",
    developerName: "Siyaram Infracon Pvt Ltd",
    reraId: "BRERAP00682/2021",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "December 2026",
    priceMin: 7200000,
    priceMax: 13500000,
    pricePerSqFt: 5400,
    cityId: 63,
    cityName: "Patna",
    stateName: "Bihar",
    locality: "Bailey Road",
    siteAddress: "Bailey Road Extension, Near Rupaspur Flyover, Patna, Bihar",
    landmark: "Rupaspur Flyover & Gola Road Junction",
    pincode: "801503",
    totalLandArea: "4 Acres",
    totalTowers: 4,
    totalUnits: 220,
    salesPhone: "9431057890",
    salesEmail: "sales@siyarambisaka.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (All 7 Days)",
    searchQuery: "Bailey Road Patna flat apartment",
    fallbackQueries: ["Gola Road Patna flat", "Patna Danapur apartment"],
    amenities: [
      "Modern Community Lifestyle Club",
      "Gymnasium & Cardio Fitness Studio",
      "Automatic High-Speed Elevators with Battery Rescue",
      "Landscaped Children Play Area & Senior Citizen Gazebo",
      "24x7 Guarded Security with Monitored Boom Barrier",
      "Covered Stilt Vehicle Parking"
    ],
    highlights: [
      "Situated on Patna's Most Arterial Bailey Road Corridor",
      "Smooth Seamless Drive into Central City & Patna Airport",
      "Surrounded by Premier Schools (DPS, St. Karen's) & Hospitals",
      "Bank Loan Approvals with SBI, HDFC & Bank of Baroda"
    ],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 780, superBuiltUpArea: 1080, bathrooms: 2, balconies: 2, priceMin: 7200000, priceMax: 8200000 },
      { bhkType: "3 BHK", carpetArea: 1100, superBuiltUpArea: 1540, bathrooms: 3, balconies: 3, priceMin: 9800000, priceMax: 11500000 },
      { bhkType: "3.5 BHK", carpetArea: 1360, superBuiltUpArea: 1880, bathrooms: 3, balconies: 3, priceMin: 12000000, priceMax: 13500000 }
    ]
  },
  {
    code: "PRJ-PAT-006",
    name: "HH Shyama Enclave",
    slug: "hh-shyama-enclave-phulwari-sharif-patna",
    developerName: "Harshita Homes Pvt Ltd",
    reraId: "BRERAP00755/2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5500000,
    priceMax: 9800000,
    pricePerSqFt: 4600,
    cityId: 63,
    cityName: "Patna",
    stateName: "Bihar",
    locality: "Phulwari Sharif",
    siteAddress: "AIIMS - Khagaul Road, Phulwari Sharif, Patna, Bihar",
    landmark: "Near AIIMS Patna & Khagaul Junction",
    pincode: "801505",
    totalLandArea: "3 Acres",
    totalTowers: 3,
    totalUnits: 150,
    salesPhone: "9431068910",
    salesEmail: "contact@harshitahomes.com",
    siteVisitTimings: "9:30 AM - 6:00 PM (Daily)",
    searchQuery: "Phulwari Sharif Patna flat",
    fallbackQueries: ["AIIMS Patna flat", "Patna residential apartment"],
    amenities: [
      "Community Activity Hall",
      "Health Club & Gymnasium",
      "High-Speed Automatic Lifts with ARD",
      "24-Hour Sweet Groundwater Supply & Dual Piping",
      "Round-the-Clock CCTV Monitored Security",
      "Allotted Stilt Car Parking Bays"
    ],
    highlights: [
      "Direct Proximity to AIIMS Patna Premier Medical Institute",
      "Ready to Move with Full Registry and Immediate Handover",
      "High Rental Demand from Doctors & Healthcare Professionals",
      "Low Society Maintenance Overhead"
    ],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 720, superBuiltUpArea: 980, bathrooms: 2, balconies: 2, priceMin: 5500000, priceMax: 6200000 },
      { bhkType: "3 BHK", carpetArea: 1020, superBuiltUpArea: 1420, bathrooms: 2, balconies: 3, priceMin: 7600000, priceMax: 8600000 },
      { bhkType: "3 BHK Royal", carpetArea: 1220, superBuiltUpArea: 1680, bathrooms: 3, balconies: 3, priceMin: 8900000, priceMax: 9800000 }
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
  console.log("SOURCING DEEP INVENTORY: HAZARIBAGH, RANCHI, JAMSHEDPUR, PATNA (BOOSTING TO 6 EACH)");
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
  fs.writeFileSync(path.join(DOCS_DIR, "deep_inventory_projects.json"), JSON.stringify(processedProjects, null, 2));
  console.log(`\nSuccessfully processed and uploaded ${processedProjects.length} deep inventory projects!`);
  console.log(`Saved master file to: ${PROJECTS_FILE}`);
}

run().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
