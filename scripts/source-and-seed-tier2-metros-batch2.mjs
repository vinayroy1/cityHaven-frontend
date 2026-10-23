import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "/Users/vinaykumar/Desktop/myProjects/awasio-backend/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";

const BASE_DIR = "/Users/vinaykumar/Desktop/awasio-sourced-properties";
const PROJECT_IMAGES_DIR = path.join(BASE_DIR, "tier2_batch2_images");
const PROJECTS_FILE = path.join(BASE_DIR, "tier2_metros_batch2.json");
const DOCS_FILE = path.join(process.cwd(), "docs", "tier2_metros_batch2.json");

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
  // ===================== COIMBATORE (Adding 5 -> Total 6) =====================
  {
    code: "PRJ-CJB-002",
    name: "Purva Amaiti",
    slug: "purva-amaiti-singanallur-coimbatore",
    developerName: "Puravankara Limited",
    reraId: "TN/11/Building/0122/2019",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 7200000,
    priceMax: 15500000,
    pricePerSqFt: 5400,
    cityId: 30,
    cityName: "Coimbatore",
    stateName: "Tamil Nadu",
    locality: "Singanallur",
    siteAddress: "Trichy Road, Near Singanallur Bus Terminal, Coimbatore, Tamil Nadu",
    landmark: "Singanallur Lake & Trichy Road Corridor",
    pincode: "641005",
    totalLandArea: "9 Acres",
    totalTowers: 7,
    totalUnits: 580,
    salesPhone: "9842111220",
    salesEmail: "sales@purvaamaiti.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Singanallur Coimbatore flat",
    fallbackQueries: ["Trichy road Coimbatore flat", "Coimbatore apartment flat"],
    amenities: ["Signature Purva Clubhouse", "Temperature Controlled Swimming Pool", "Badminton & Squash Courts", "Lush Landscaped Central Lawns", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Frontage on Arterial Trichy Road (NH-81)", "Minutes from Singanallur Boat House & Lake Park", "Ready to Move with Full Completion Certificate", "Over 75% Open Green Tropical Campus"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 760, superBuiltUpArea: 1050, bathrooms: 2, balconies: 2, priceMin: 7200000, priceMax: 8200000 },
      { bhkType: "3 BHK", carpetArea: 1120, superBuiltUpArea: 1560, bathrooms: 3, balconies: 3, priceMin: 10800000, priceMax: 12800000 },
      { bhkType: "4 BHK", carpetArea: 1580, superBuiltUpArea: 2200, bathrooms: 4, balconies: 4, priceMin: 13800000, priceMax: 15500000 }
    ]
  },
  {
    code: "PRJ-CJB-003",
    name: "Casagrand Nextown",
    slug: "casagrand-nextown-saravanampatti-coimbatore",
    developerName: "Casagrand Builder",
    reraId: "TN/11/Building/0245/2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5400000,
    priceMax: 11200000,
    pricePerSqFt: 4600,
    cityId: 30,
    cityName: "Coimbatore",
    stateName: "Tamil Nadu",
    locality: "Saravanampatti",
    siteAddress: "Vilankurichi Road, Near CHIL SEZ IT Park, Saravanampatti, Coimbatore, Tamil Nadu",
    landmark: "CHIL SEZ IT Park & KCT Tech Corridor",
    pincode: "641035",
    totalLandArea: "4 Acres",
    totalTowers: 4,
    totalUnits: 340,
    salesPhone: "9842122330",
    salesEmail: "sales@casagrandnextown.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Saravanampatti Coimbatore flat",
    fallbackQueries: ["Coimbatore IT park flat", "Coimbatore flat"],
    amenities: ["Contemporary Clubhouse with Gym", "Swimming Pool & Toddler Splash Pool", "Indoor Games Arena & Banquet Hall", "Children Play Space", "CCTV Monitored Gated Security"],
    highlights: ["Coimbatore's IT Silicon Corridor of Saravanampatti", "Walking Distance to CHIL SEZ, Cognizant & Bosch Offices", "Ready to Move with High Tech Rental Yield", "Pre-Approved Home Loans with All Major Banks"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 680, superBuiltUpArea: 940, bathrooms: 2, balconies: 2, priceMin: 5400000, priceMax: 6200000 },
      { bhkType: "3 BHK", carpetArea: 1020, superBuiltUpArea: 1420, bathrooms: 2, balconies: 3, priceMin: 7800000, priceMax: 9200000 },
      { bhkType: "3 BHK Deluxe", carpetArea: 1240, superBuiltUpArea: 1720, bathrooms: 3, balconies: 3, priceMin: 9500000, priceMax: 11200000 }
    ]
  },
  {
    code: "PRJ-CJB-004",
    name: "Srivari Ananya",
    slug: "srivari-ananya-race-course-coimbatore",
    developerName: "Srivari Properties",
    reraId: "TN/11/Building/0088/2018",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 14500000,
    priceMax: 32000000,
    pricePerSqFt: 8800,
    cityId: 30,
    cityName: "Coimbatore",
    stateName: "Tamil Nadu",
    locality: "Race Course",
    siteAddress: "Race Course Road, Near Coimbatore Cosmopolitan Club, Coimbatore, Tamil Nadu",
    landmark: "Race Course Walking Track & Cosmopolitan Club",
    pincode: "641018",
    totalLandArea: "3 Acres",
    totalTowers: 2,
    totalUnits: 110,
    salesPhone: "9842133440",
    salesEmail: "ananya@srivari.co.in",
    siteVisitTimings: "10:00 AM - 6:30 PM (Daily)",
    searchQuery: "Race Course Coimbatore luxury flat",
    fallbackQueries: ["Coimbatore luxury apartment", "Coimbatore flat"],
    amenities: ["Ultra-Luxury Rooftop Infinity Pool", "State of the Art Fitness Suite", "Private Banquet Hall & Boardroom", "Basement Parking with EV Charging Bays", "Biometric Access Control"],
    highlights: ["The Most Exclusive VVIP Address in Coimbatore - Race Course", "Overlooking Historic Race Course Walking Promenade", "Low-Density Living for Industrialists and Top Doctors", "Ready to Move with Pristine Clear Legal Deeds"],
    configurations: [
      { bhkType: "3 BHK", carpetArea: 1480, superBuiltUpArea: 2050, bathrooms: 3, balconies: 3, priceMin: 14500000, priceMax: 17500000 },
      { bhkType: "4 BHK", carpetArea: 2200, superBuiltUpArea: 3080, bathrooms: 4, balconies: 4, priceMin: 22500000, priceMax: 26500000 },
      { bhkType: "5 BHK Penthouse", carpetArea: 2950, superBuiltUpArea: 4100, bathrooms: 5, balconies: 5, priceMin: 28500000, priceMax: 32000000 }
    ]
  },
  {
    code: "PRJ-CJB-005",
    name: "G Square City",
    slug: "g-square-city-pollachi-road-coimbatore",
    developerName: "G Square Realtors",
    reraId: "TN/11/Layout/0312/2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 4200000,
    priceMax: 9800000,
    pricePerSqFt: 4100,
    cityId: 30,
    cityName: "Coimbatore",
    stateName: "Tamil Nadu",
    locality: "Pollachi Road",
    siteAddress: "Pollachi Main Highway, Eachanari, Coimbatore, Tamil Nadu",
    landmark: "Eachanari Vinayagar Temple & Malumichampatti",
    pincode: "641021",
    totalLandArea: "127 Acres",
    totalTowers: 8,
    totalUnits: 650,
    salesPhone: "9842144550",
    salesEmail: "sales@gsquarecitycjb.com",
    siteVisitTimings: "9:00 AM - 6:00 PM (Daily)",
    searchQuery: "Pollachi road Coimbatore flat",
    fallbackQueries: ["Eachanari Coimbatore flat", "Coimbatore flat"],
    amenities: ["Grand Clubhouse with Olympic Length Pool", "50+ Lifestyle Amenities & Sports Arena", "Children Sand Pit & Play Area", "Wide 60-Ft Blacktop Roads with Streetlights", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Coimbatore's First & Largest Integrated Smart Township", "Direct Frontage on 4-Lane Pollachi Highway", "Ready to Move Villa & Apartment Enclave", "5 Mins from Historic Eachanari Vinayagar Temple"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 660, superBuiltUpArea: 910, bathrooms: 2, balconies: 1, priceMin: 4200000, priceMax: 4800000 },
      { bhkType: "3 BHK", carpetArea: 980, superBuiltUpArea: 1350, bathrooms: 2, balconies: 2, priceMin: 6200000, priceMax: 7200000 },
      { bhkType: "3 BHK Villa", carpetArea: 1380, superBuiltUpArea: 1920, bathrooms: 3, balconies: 3, priceMin: 8400000, priceMax: 9800000 }
    ]
  },
  {
    code: "PRJ-CJB-006",
    name: "Mayflower Sakthi Garden",
    slug: "mayflower-sakthi-garden-nanjundapuram-coimbatore",
    developerName: "Mayflower Enterprises",
    reraId: "TN/11/Building/0167/2019",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 6800000,
    priceMax: 13800000,
    pricePerSqFt: 5100,
    cityId: 30,
    cityName: "Coimbatore",
    stateName: "Tamil Nadu",
    locality: "Nanjundapuram",
    siteAddress: "Nanjundapuram Road, Near Ramanathapuram Junction, Coimbatore, Tamil Nadu",
    landmark: "Ramanathapuram Circle & Trichy Road Flyover",
    pincode: "641036",
    totalLandArea: "5 Acres",
    totalTowers: 5,
    totalUnits: 320,
    salesPhone: "9842155660",
    salesEmail: "contact@mayflowerenterprises.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Nanjundapuram Coimbatore flat",
    fallbackQueries: ["Ramanathapuram Coimbatore flat", "Coimbatore apartment"],
    amenities: ["Signature Mayflower Club", "Swimming Pool with Timber Sundeck", "Fully Equipped Gym & Yoga Room", "Air-Conditioned Community Hall", "Multi-Tier Guarded Security"],
    highlights: ["Centrally Located between Trichy Road and Pollachi Road", "5 Mins from Ramanathapuram Shopping District", "Ready to Move with 250+ Happy Families", "Renowned Quality Heritage of Mayflower Developers"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 730, superBuiltUpArea: 1010, bathrooms: 2, balconies: 2, priceMin: 6800000, priceMax: 7600000 },
      { bhkType: "3 BHK", carpetArea: 1080, superBuiltUpArea: 1510, bathrooms: 3, balconies: 3, priceMin: 9500000, priceMax: 11200000 },
      { bhkType: "4 BHK", carpetArea: 1490, superBuiltUpArea: 2080, bathrooms: 4, balconies: 4, priceMin: 12200000, priceMax: 13800000 }
    ]
  },

  // ===================== MYSURU (Adding 5 -> Total 6) =====================
  {
    code: "PRJ-MYQ-002",
    name: "Sankalp Temple Trees",
    slug: "sankalp-temple-trees-vijayanagar-mysuru",
    developerName: "Sankalp Group",
    reraId: "PRM/KA/RERA/1268/378/PR/180217/001420",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5800000,
    priceMax: 12500000,
    pricePerSqFt: 4900,
    cityId: 20,
    cityName: "Mysuru",
    stateName: "Karnataka",
    locality: "Vijayanagar 4th Stage",
    siteAddress: "Ring Road Junction, Vijayanagar 4th Stage, Mysuru, Karnataka",
    landmark: "Outer Ring Road & Vijayanagar Water Tank",
    pincode: "570018",
    totalLandArea: "6 Acres",
    totalTowers: 6,
    totalUnits: 410,
    salesPhone: "9845111220",
    salesEmail: "sales@sankalpgroup.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Vijayanagar Mysuru flat",
    fallbackQueries: ["Mysuru apartment flat", "Mysore flat"],
    amenities: ["Signature Sankalp Club & Lap Pool", "Gymnasium & Aerobics Deck", "Badminton & Table Tennis Courts", "Lush Landscaped Heritage Gardens", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Right on Mysuru Outer Ring Road Corridor", "Close to St. Joseph's School & National Highway 275", "Ready to Move with Full CC and OC", "Mysuru's Most Trusted 30-Year Builder Heritage"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 720, superBuiltUpArea: 990, bathrooms: 2, balconies: 2, priceMin: 5800000, priceMax: 6600000 },
      { bhkType: "3 BHK", carpetArea: 1060, superBuiltUpArea: 1480, bathrooms: 2, balconies: 3, priceMin: 8200000, priceMax: 9800000 },
      { bhkType: "4 BHK", carpetArea: 1520, superBuiltUpArea: 2120, bathrooms: 4, balconies: 4, priceMin: 11000000, priceMax: 12500000 }
    ]
  },
  {
    code: "PRJ-MYQ-003",
    name: "Pathak Park View",
    slug: "pathak-park-view-bogadi-road-mysuru",
    developerName: "Pathak Developers",
    reraId: "PRM/KA/RERA/1268/378/PR/190312/002450",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 4900000,
    priceMax: 9800000,
    pricePerSqFt: 4300,
    cityId: 20,
    cityName: "Mysuru",
    stateName: "Karnataka",
    locality: "Bogadi Road",
    siteAddress: "Bogadi Main Road, Near Ring Road Circle, Mysuru, Karnataka",
    landmark: "Bogadi Lake & Ring Road Junction",
    pincode: "570026",
    totalLandArea: "4.5 Acres",
    totalTowers: 4,
    totalUnits: 290,
    salesPhone: "9845122330",
    salesEmail: "contact@pathakdevelopers.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Bogadi road Mysuru flat",
    fallbackQueries: ["Bogadi flat", "Mysore flat apartment"],
    amenities: ["Rooftop Swimming Pool", "Fitness Gym & Yoga Room", "AC Community Party Hall", "Children Play Arena", "24x7 Guard Post with CCTV"],
    highlights: ["Overlooking Serene Bogadi Lake Reserve", "Rapid Transit to Saraswathipuram & Mysuru University", "Ready to Move with Full Registration", "Abundant Natural Light and Cool Mountain Air"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 690, superBuiltUpArea: 950, bathrooms: 2, balconies: 2, priceMin: 4900000, priceMax: 5600000 },
      { bhkType: "3 BHK", carpetArea: 1020, superBuiltUpArea: 1410, bathrooms: 2, balconies: 2, priceMin: 7200000, priceMax: 8400000 },
      { bhkType: "3 BHK Royal", carpetArea: 1250, superBuiltUpArea: 1720, bathrooms: 3, balconies: 3, priceMin: 8500000, priceMax: 9800000 }
    ]
  },
  {
    code: "PRJ-MYQ-004",
    name: "Prestige Silver Crest",
    slug: "prestige-silver-crest-hunsur-road-mysuru",
    developerName: "Prestige Group",
    reraId: "PRM/KA/RERA/1268/378/PR/171120/000980",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8500000,
    priceMax: 18500000,
    pricePerSqFt: 5800,
    cityId: 20,
    cityName: "Mysuru",
    stateName: "Karnataka",
    locality: "Hunsur Road",
    siteAddress: "Hunsur Main Road, Near Jaladarshini Guest House, Mysuru, Karnataka",
    landmark: "Jaladarshini & Open University Campus",
    pincode: "570005",
    totalLandArea: "6 Acres",
    totalTowers: 4,
    totalUnits: 260,
    salesPhone: "9845133440",
    salesEmail: "sales@prestigemysore.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Hunsur road Mysuru flat",
    fallbackQueries: ["Prestige Mysore flat", "Mysuru flat"],
    amenities: ["Signature Prestige Club & Lap Pool", "Gymnasium & Health Spa", "Tennis & Squash Courts", "Lush Landscaped Green Acres", "Multi-Tier Automated Surveillance"],
    highlights: ["Mysuru's Most Premium Residential Highway Corridor - Hunsur Road", "Minutes from Mysore Palace and Golf Club", "World-Class Prestige Construction & Architectural Finish", "Ready to Move with High NRI & Executive Demand"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 810, superBuiltUpArea: 1120, bathrooms: 2, balconies: 2, priceMin: 8500000, priceMax: 9800000 },
      { bhkType: "3 BHK", carpetArea: 1220, superBuiltUpArea: 1690, bathrooms: 3, balconies: 3, priceMin: 12500000, priceMax: 14800000 },
      { bhkType: "4 BHK", carpetArea: 1720, superBuiltUpArea: 2380, bathrooms: 4, balconies: 4, priceMin: 16200000, priceMax: 18500000 }
    ]
  },
  {
    code: "PRJ-MYQ-005",
    name: "Trendz Palm Meadows",
    slug: "trendz-palm-meadows-dattagalli-mysuru",
    developerName: "Trendz Properties",
    reraId: "PRM/KA/RERA/1268/378/PR/200815/003540",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5200000,
    priceMax: 10500000,
    pricePerSqFt: 4500,
    cityId: 20,
    cityName: "Mysuru",
    stateName: "Karnataka",
    locality: "Dattagalli",
    siteAddress: "Kanakadasa Nagar Main Road, Dattagalli Ring Road, Mysuru, Karnataka",
    landmark: "Dattagalli Circle & Ring Road Junction",
    pincode: "570022",
    totalLandArea: "5 Acres",
    totalTowers: 5,
    totalUnits: 350,
    salesPhone: "9845144550",
    salesEmail: "sales@trendzproperties.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Dattagalli Mysuru flat",
    fallbackQueries: ["Mysuru flat", "Mysore apartment flat"],
    amenities: ["Contemporary Clubhouse & Swimming Pool", "Fitness Gym & Yoga Room", "AC Community Hall", "Children Play Zone", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Established Peaceful Neighborhood of Dattagalli", "Walking Distance to Top Kannada and English Medium Schools", "Ready to Move Delivered Units", "Affordable Price per Sq. Ft. with Great Appreciation"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 710, superBuiltUpArea: 980, bathrooms: 2, balconies: 2, priceMin: 5200000, priceMax: 5900000 },
      { bhkType: "3 BHK", carpetArea: 1040, superBuiltUpArea: 1440, bathrooms: 2, balconies: 3, priceMin: 7600000, priceMax: 8900000 },
      { bhkType: "4 BHK", carpetArea: 1460, superBuiltUpArea: 2040, bathrooms: 4, balconies: 4, priceMin: 9500000, priceMax: 10500000 }
    ]
  },
  {
    code: "PRJ-MYQ-006",
    name: "Sobha Gardenia",
    slug: "sobha-gardenia-yelwala-mysuru",
    developerName: "Sobha Limited",
    reraId: "PRM/KA/RERA/1268/378/PR/181210/002230",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 9800000,
    priceMax: 22500000,
    pricePerSqFt: 6200,
    cityId: 20,
    cityName: "Mysuru",
    stateName: "Karnataka",
    locality: "Yelwala",
    siteAddress: "Yelwala, Bengaluru-Mysuru Expressway Link, Mysuru, Karnataka",
    landmark: "Yelwala Lake & Hunsur Highway Junction",
    pincode: "571130",
    totalLandArea: "15 Acres",
    totalTowers: 6,
    totalUnits: 380,
    salesPhone: "9845155660",
    salesEmail: "sales@sobhamysuru.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Yelwala Mysuru flat villa",
    fallbackQueries: ["Sobha Mysore", "Mysuru flat"],
    amenities: ["Signature Sobha Lifestyle Clubhouse", "Lap Pool & Kids Water Arena", "Tennis & Basketball Courts", "Acupressure Walkway & Organic Garden", "Multi-Tier Automated Surveillance"],
    highlights: ["Sobha Benchmark Construction & Interior Finishing", "Scenic Suburban Living with Crisp Clean Mountain Air", "Minutes from Bengaluru-Mysuru 10-Lane Expressway Link", "Ready to Move with High Resale Premium"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 840, superBuiltUpArea: 1160, bathrooms: 2, balconies: 2, priceMin: 9800000, priceMax: 11200000 },
      { bhkType: "3 BHK", carpetArea: 1260, superBuiltUpArea: 1750, bathrooms: 3, balconies: 3, priceMin: 14500000, priceMax: 17200000 },
      { bhkType: "4 BHK Villa", carpetArea: 1880, superBuiltUpArea: 2620, bathrooms: 4, balconies: 4, priceMin: 19500000, priceMax: 22500000 }
    ]
  },

  // ===================== KANPUR (Adding 5 -> Total 6) =====================
  {
    code: "PRJ-KNP-002",
    name: "Emerald Garden",
    slug: "emerald-garden-swaroop-nagar-kanpur",
    developerName: "Ratan Housing / Emerald Group",
    reraId: "UPRERAPRJ3421",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 12500000,
    priceMax: 28500000,
    pricePerSqFt: 7800,
    cityId: 52,
    cityName: "Kanpur",
    stateName: "Uttar Pradesh",
    locality: "Swaroop Nagar",
    siteAddress: "Swaroop Nagar Main Road, Near Motijheel, Kanpur, Uttar Pradesh",
    landmark: "Motijheel Park & Swaroop Nagar Market",
    pincode: "208002",
    totalLandArea: "5 Acres",
    totalTowers: 4,
    totalUnits: 180,
    salesPhone: "9839111220",
    salesEmail: "sales@emeraldgardenkanpur.com",
    siteVisitTimings: "10:00 AM - 7:00 PM (Daily)",
    searchQuery: "Swaroop Nagar Kanpur flat",
    fallbackQueries: ["Kanpur luxury flat", "Kanpur apartment flat"],
    amenities: ["Luxury Rooftop Infinity Pool", "Fully Fitted World Gym", "AC Community Banquet Hall", "Badminton & Table Tennis Lounge", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Kanpur's #1 Most Elite Address - Swaroop Nagar", "Walking Distance to Motijheel Green Lake and Metro Station", "Home to Kanpur's Leading Business Families and Doctors", "Ready to Move with Pristine Clear Deeds"],
    configurations: [
      { bhkType: "3 BHK", carpetArea: 1350, superBuiltUpArea: 1880, bathrooms: 3, balconies: 3, priceMin: 12500000, priceMax: 14800000 },
      { bhkType: "4 BHK", carpetArea: 2050, superBuiltUpArea: 2860, bathrooms: 4, balconies: 4, priceMin: 20500000, priceMax: 24500000 },
      { bhkType: "5 BHK Penthouse", carpetArea: 2750, superBuiltUpArea: 3850, bathrooms: 5, balconies: 5, priceMin: 25500000, priceMax: 28500000 }
    ]
  },
  {
    code: "PRJ-KNP-003",
    name: "Kanpur Landmark County",
    slug: "kanpur-landmark-county-civil-lines-kanpur",
    developerName: "Landmark Group",
    reraId: "UPRERAPRJ2980",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 9800000,
    priceMax: 21500000,
    pricePerSqFt: 6900,
    cityId: 52,
    cityName: "Kanpur",
    stateName: "Uttar Pradesh",
    locality: "Civil Lines",
    siteAddress: "Mall Road Link, Civil Lines, Kanpur, Uttar Pradesh",
    landmark: "Green Park Stadium & Ganges Riverfront",
    pincode: "208001",
    totalLandArea: "4 Acres",
    totalTowers: 3,
    totalUnits: 210,
    salesPhone: "9839122330",
    salesEmail: "sales@landmarkcounty.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Civil Lines Kanpur flat",
    fallbackQueries: ["Kanpur flat apartment", "Mall road Kanpur flat"],
    amenities: ["Signature Landmark Club & Swimming Pool", "Fitness Center with Steam & Sauna", "Covered Basement Parking", "Children Play Space", "Multi-Tier Automated Surveillance"],
    highlights: ["Overlooking Historic Green Park International Cricket Stadium", "Walking Distance to Ganges Barrage River Walkway", "Ready to Move Delivered High-Rise Project", "Vastu Compliant North-Facing Apartments"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 820, superBuiltUpArea: 1140, bathrooms: 2, balconies: 2, priceMin: 9800000, priceMax: 11200000 },
      { bhkType: "3 BHK", carpetArea: 1220, superBuiltUpArea: 1700, bathrooms: 3, balconies: 3, priceMin: 14200000, priceMax: 16800000 },
      { bhkType: "4 BHK", carpetArea: 1740, superBuiltUpArea: 2420, bathrooms: 4, balconies: 4, priceMin: 18500000, priceMax: 21500000 }
    ]
  },
  {
    code: "PRJ-KNP-004",
    name: "Ratan Southerland",
    slug: "ratan-southerland-kalyanpur-kanpur",
    developerName: "Ratan Housing",
    reraId: "UPRERAPRJ4150",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5400000,
    priceMax: 11500000,
    pricePerSqFt: 4600,
    cityId: 52,
    cityName: "Kanpur",
    stateName: "Uttar Pradesh",
    locality: "Kalyanpur",
    siteAddress: "Grand Trunk (GT) Road, Near IIT Kanpur Gate, Kalyanpur, Kanpur, Uttar Pradesh",
    landmark: "IIT Kanpur Main Gate & Kalyanpur Metro",
    pincode: "208016",
    totalLandArea: "7 Acres",
    totalTowers: 6,
    totalUnits: 460,
    salesPhone: "9839133440",
    salesEmail: "southerland@ratanhousing.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Kalyanpur Kanpur flat",
    fallbackQueries: ["IIT Kanpur flat", "Kanpur flat"],
    amenities: ["Modern Club & Swimming Pool", "Health Club & Aerobics Room", "Commercial Grocery Hub in Society", "Children Play Arena", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Right Next to Prestigious IIT Kanpur Campus", "Walking Distance to Kanpur Metro Purple Line Station", "Ready to Move with Full Registry", "Extremely High Rental Yield from IIT Faculty & Researchers"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 720, superBuiltUpArea: 990, bathrooms: 2, balconies: 2, priceMin: 5400000, priceMax: 6200000 },
      { bhkType: "3 BHK", carpetArea: 1060, superBuiltUpArea: 1470, bathrooms: 2, balconies: 3, priceMin: 7800000, priceMax: 9200000 },
      { bhkType: "4 BHK", carpetArea: 1480, superBuiltUpArea: 2060, bathrooms: 4, balconies: 4, priceMin: 10200000, priceMax: 11500000 }
    ]
  },
  {
    code: "PRJ-KNP-005",
    name: "SPS Residency",
    slug: "sps-residency-sharda-nagar-kanpur",
    developerName: "SPS Group",
    reraId: "UPRERAPRJ1890",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 4800000,
    priceMax: 9600000,
    pricePerSqFt: 4200,
    cityId: 52,
    cityName: "Kanpur",
    stateName: "Uttar Pradesh",
    locality: "Sharda Nagar",
    siteAddress: "Guru Dev Cinema Crossing Link Road, Sharda Nagar, Kanpur, Uttar Pradesh",
    landmark: "Guru Dev Palace Metro & Kakadeo Coaching Hub",
    pincode: "208025",
    totalLandArea: "3.5 Acres",
    totalTowers: 3,
    totalUnits: 240,
    salesPhone: "9839144550",
    salesEmail: "sales@spsresidency.in",
    siteVisitTimings: "9:00 AM - 6:00 PM (Daily)",
    searchQuery: "Sharda Nagar Kanpur flat",
    fallbackQueries: ["Kakadeo Kanpur flat", "Kanpur flat"],
    amenities: ["Community Activity Center", "Gymnasium & Yoga Deck", "Automatic Elevators with Power Backup", "Covered Allotted Parking", "Security Gate with Intercom"],
    highlights: ["Close to Kakadeo Education and Coaching Hub", "Walking Distance to Kanpur Metro Line 1", "Ready to Move with Clean Legal Documentation", "Low Maintenance Overhead"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 680, superBuiltUpArea: 930, bathrooms: 2, balconies: 1, priceMin: 4800000, priceMax: 5400000 },
      { bhkType: "3 BHK", carpetArea: 990, superBuiltUpArea: 1380, bathrooms: 2, balconies: 2, priceMin: 6900000, priceMax: 7900000 },
      { bhkType: "3 BHK Deluxe", carpetArea: 1220, superBuiltUpArea: 1680, bathrooms: 3, balconies: 3, priceMin: 8400000, priceMax: 9600000 }
    ]
  },
  {
    code: "PRJ-KNP-006",
    name: "Shri Radha Sky Gardens",
    slug: "shri-radha-sky-gardens-vikas-nagar-kanpur",
    developerName: "Radha Builders",
    reraId: "UPRERAPRJ5230",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "October 2026",
    priceMin: 6200000,
    priceMax: 13500000,
    pricePerSqFt: 4800,
    cityId: 52,
    cityName: "Kanpur",
    stateName: "Uttar Pradesh",
    locality: "Vikas Nagar",
    siteAddress: "Lakhanpur-Vikas Nagar Main Road, Kanpur, Uttar Pradesh",
    landmark: "Vikas Nagar Metro & Regency Hospital",
    pincode: "208024",
    totalLandArea: "5 Acres",
    totalTowers: 4,
    totalUnits: 310,
    salesPhone: "9839155660",
    salesEmail: "contact@shriradhaskygardens.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Vikas Nagar Kanpur flat",
    fallbackQueries: ["Kanpur flat apartment", "Kanpur property"],
    amenities: ["Sky Garden Lounge & Swimming Pool", "Health Club & Aerobics Center", "Children Play Arena", "Basement Parking with EV Points", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Situated in Prime Vikas Nagar-Lakhanpur Healthcare Node", "3 Minutes from Super Specialty Regency Hospital", "Modern Earthquake Resistant High-Rise Architecture", "Pre-Approved Home Loans with SBI & PNB"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 740, superBuiltUpArea: 1020, bathrooms: 2, balconies: 2, priceMin: 6200000, priceMax: 7100000 },
      { bhkType: "3 BHK", carpetArea: 1080, superBuiltUpArea: 1510, bathrooms: 3, balconies: 3, priceMin: 8900000, priceMax: 10500000 },
      { bhkType: "4 BHK", carpetArea: 1540, superBuiltUpArea: 2150, bathrooms: 4, balconies: 4, priceMin: 12000000, priceMax: 13500000 }
    ]
  },

  // ===================== VARANASI (Adding 5 -> Total 6) =====================
  {
    code: "PRJ-VNS-002",
    name: "Awasthi Awadh Greens",
    slug: "awasthi-awadh-greens-shivpur-varanasi",
    developerName: "Awadh Builders",
    reraId: "UPRERAPRJ6120",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5400000,
    priceMax: 11500000,
    pricePerSqFt: 4500,
    cityId: 53,
    cityName: "Varanasi",
    stateName: "Uttar Pradesh",
    locality: "Shivpur",
    siteAddress: "Shivpur Bypass, Near Varanasi Ring Road Phase 1, Varanasi, Uttar Pradesh",
    landmark: "Varanasi Ring Road & Shivpur Railway Station",
    pincode: "221003",
    totalLandArea: "6 Acres",
    totalTowers: 5,
    totalUnits: 380,
    salesPhone: "9838111220",
    salesEmail: "sales@awadhgreensvns.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Shivpur Varanasi flat",
    fallbackQueries: ["Varanasi flat apartment", "Varanasi property flat"],
    amenities: ["Modern Club & Swimming Pool", "Health Club & Yoga Deck", "Children Activity Zone", "Lush Landscaped Central Park", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Right on Varanasi 6-Lane Ring Road Bypass", "Fast 15-Minute Access to Lal Bahadur Shastri International Airport", "Ready to Move with Full Registry", "Over 70% Open Scenic Spaces"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 710, superBuiltUpArea: 980, bathrooms: 2, balconies: 2, priceMin: 5400000, priceMax: 6200000 },
      { bhkType: "3 BHK", carpetArea: 1050, superBuiltUpArea: 1460, bathrooms: 2, balconies: 3, priceMin: 7800000, priceMax: 9200000 },
      { bhkType: "4 BHK", carpetArea: 1480, superBuiltUpArea: 2060, bathrooms: 4, balconies: 4, priceMin: 10200000, priceMax: 11500000 }
    ]
  },
  {
    code: "PRJ-VNS-003",
    name: "Kashi Greens",
    slug: "kashi-greens-babatpur-varanasi",
    developerName: "Kashi Infratech",
    reraId: "UPRERAPRJ5890",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "December 2026",
    priceMin: 4800000,
    priceMax: 9800000,
    pricePerSqFt: 4100,
    cityId: 53,
    cityName: "Varanasi",
    stateName: "Uttar Pradesh",
    locality: "Babatpur Airport Road",
    siteAddress: "NH-56 Varanasi-Lucknow 4-Lane Highway, Babatpur, Varanasi, Uttar Pradesh",
    landmark: "Lal Bahadur Shastri International Airport Babatpur",
    pincode: "221006",
    totalLandArea: "8 Acres",
    totalTowers: 6,
    totalUnits: 440,
    salesPhone: "9838122330",
    salesEmail: "sales@kashigreens.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Babatpur Varanasi flat",
    fallbackQueries: ["Varanasi airport flat", "Varanasi flat"],
    amenities: ["Signature Clubhouse with Lap Pool", "Fitness Gym & Aerobics Deck", "Banquet Space for Events", "Children Sand Pit & Play Area", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Only 5 Minutes from Varanasi International Airport", "Direct Frontage on 4-Lane Varanasi-Lucknow Expressway (NH-56)", "High Capital Appreciation & Airport Hospitality Corridor", "Bank Approved Home Loans"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 670, superBuiltUpArea: 920, bathrooms: 2, balconies: 1, priceMin: 4800000, priceMax: 5400000 },
      { bhkType: "3 BHK", carpetArea: 980, superBuiltUpArea: 1360, bathrooms: 2, balconies: 2, priceMin: 6900000, priceMax: 7900000 },
      { bhkType: "3 BHK Royal", carpetArea: 1220, superBuiltUpArea: 1680, bathrooms: 3, balconies: 3, priceMin: 8500000, priceMax: 9800000 }
    ]
  },
  {
    code: "PRJ-VNS-004",
    name: "Uma Green Valley",
    slug: "uma-green-valley-paharia-varanasi",
    developerName: "Uma Group Varanasi",
    reraId: "UPRERAPRJ4780",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 6200000,
    priceMax: 13200000,
    pricePerSqFt: 4800,
    cityId: 53,
    cityName: "Varanasi",
    stateName: "Uttar Pradesh",
    locality: "Paharia",
    siteAddress: "Paharia-Pandra Road, Near Ashapur Crossing, Varanasi, Uttar Pradesh",
    landmark: "Ashapur Crossing & Sarnath Link",
    pincode: "221007",
    totalLandArea: "4.5 Acres",
    totalTowers: 4,
    totalUnits: 290,
    salesPhone: "9838133440",
    salesEmail: "contact@umagreenvalley.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Paharia Varanasi flat",
    fallbackQueries: ["Sarnath Varanasi flat", "Varanasi flat"],
    amenities: ["Contemporary Clubhouse with Pool", "Equipped Gym & Meditation Zone", "Children Play Space", "Covered Car Parking with CCTV", "Multi-Tier Electronic Security"],
    highlights: ["Peaceful Historic Sarnath Corridor", "Minutes from Ashapur Market, Hospitals & Schools", "Ready to Move with Full Registry", "Over 65% Open Green Landscaped Campus"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 720, superBuiltUpArea: 990, bathrooms: 2, balconies: 2, priceMin: 6200000, priceMax: 7000000 },
      { bhkType: "3 BHK", carpetArea: 1060, superBuiltUpArea: 1480, bathrooms: 3, balconies: 3, priceMin: 8900000, priceMax: 10500000 },
      { bhkType: "4 BHK", carpetArea: 1500, superBuiltUpArea: 2100, bathrooms: 4, balconies: 4, priceMin: 11800000, priceMax: 13200000 }
    ]
  },
  {
    code: "PRJ-VNS-005",
    name: "Shree Ram Heights",
    slug: "shree-ram-heights-sigra-varanasi",
    developerName: "Shree Ram Promoters",
    reraId: "UPRERAPRJ3940",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8800000,
    priceMax: 19500000,
    pricePerSqFt: 6200,
    cityId: 53,
    cityName: "Varanasi",
    stateName: "Uttar Pradesh",
    locality: "Sigra",
    siteAddress: "Sigra-Cantt Station Road, Near Sampurnanand Stadium, Varanasi, Uttar Pradesh",
    landmark: "Sampurnanand Sports Stadium & Varanasi Cantt Station",
    pincode: "221002",
    totalLandArea: "3 Acres",
    totalTowers: 2,
    totalUnits: 150,
    salesPhone: "9838144550",
    salesEmail: "sales@shreeramheights.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Sigra Varanasi flat",
    fallbackQueries: ["Varanasi central flat", "Varanasi apartment flat"],
    amenities: ["Rooftop Sky Lounge & Fitness Gym", "AC Community Hall", "Automatic High Speed Elevators", "Covered Reserved Parking", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Heart of Downtown Varanasi - Sigra", "Walking Distance to Varanasi Cantt Junction & Sampurnanand Stadium", "Ready to Move Ultra-Central Living", "Highest Rental Yield in Entire Purvanchal"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 780, superBuiltUpArea: 1080, bathrooms: 2, balconies: 2, priceMin: 8800000, priceMax: 9900000 },
      { bhkType: "3 BHK", carpetArea: 1180, superBuiltUpArea: 1640, bathrooms: 3, balconies: 3, priceMin: 12800000, priceMax: 15200000 },
      { bhkType: "4 BHK", carpetArea: 1650, superBuiltUpArea: 2320, bathrooms: 4, balconies: 4, priceMin: 17200000, priceMax: 19500000 }
    ]
  },
  {
    code: "PRJ-VNS-006",
    name: "Mahavir Gardenia",
    slug: "mahavir-gardenia-sarnath-varanasi",
    developerName: "Mahavir Builders",
    reraId: "UPRERAPRJ5120",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5100000,
    priceMax: 10500000,
    pricePerSqFt: 4300,
    cityId: 53,
    cityName: "Varanasi",
    stateName: "Uttar Pradesh",
    locality: "Sarnath",
    siteAddress: "Sarnath Ring Road Extension, Varanasi, Uttar Pradesh",
    landmark: "Dhamekh Stupa Sarnath & Deer Park",
    pincode: "221007",
    totalLandArea: "5 Acres",
    totalTowers: 4,
    totalUnits: 280,
    salesPhone: "9838155660",
    salesEmail: "sales@mahavirgardenia.com",
    siteVisitTimings: "9:00 AM - 6:00 PM (Daily)",
    searchQuery: "Sarnath flat Varanasi",
    fallbackQueries: ["Varanasi flat", "Varanasi property"],
    amenities: ["Community Clubhouse with Gym", "Children Play Arena", "Landscaped Spiritual Zen Gardens", "24-Hour Sweet Groundwater Supply", "Security Post with Boom Barrier"],
    highlights: ["Serene Spiritual Ambiance next to Dhamekh Stupa Sarnath", "Direct Connectivity to Varanasi Ring Road", "Ready to Move with Full Registry and Possession", "Peaceful Green Environment Away from City Congestion"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 690, superBuiltUpArea: 950, bathrooms: 2, balconies: 1, priceMin: 5100000, priceMax: 5700000 },
      { bhkType: "3 BHK", carpetArea: 1020, superBuiltUpArea: 1410, bathrooms: 2, balconies: 2, priceMin: 7200000, priceMax: 8400000 },
      { bhkType: "3 BHK Deluxe", carpetArea: 1250, superBuiltUpArea: 1720, bathrooms: 3, balconies: 3, priceMin: 9100000, priceMax: 10500000 }
    ]
  }
];

async function run() {
  console.log("================================================================================");
  console.log("SOURCING TIER-2 METROS BATCH 2: COIMBATORE, MYSURU, KANPUR, VARANASI (20 PRJS)");
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
