import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "/Users/vinaykumar/Desktop/myProjects/awasio-backend/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";

const BASE_DIR = "/Users/vinaykumar/Desktop/awasio-sourced-properties";
const PROJECT_IMAGES_DIR = path.join(BASE_DIR, "tier2_batch6_images");
const PROJECTS_FILE = path.join(BASE_DIR, "tier2_metros_batch6.json");
const DOCS_FILE = path.join(process.cwd(), "docs", "tier2_metros_batch6.json");

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
  // ===================== VIJAYAWADA (6 Projects) =====================
  {
    code: "PRJ-VGA-001",
    name: "LEPL Mid Valley City",
    slug: "lepl-mid-valley-city-mangalagiri-vijayawada",
    developerName: "LEPL Projects",
    reraId: "P07200010145",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8500000,
    priceMax: 22500000,
    pricePerSqFt: 6200,
    cityId: 354,
    cityName: "Vijayawada",
    stateName: "Andhra Pradesh",
    locality: "Mangalagiri",
    siteAddress: "Kollanur Road, Near AIIMS Mangalagiri, Amaravati Capital Region, Vijayawada, Andhra Pradesh",
    landmark: "AIIMS Mangalagiri & Happy Resorts",
    pincode: "522503",
    totalLandArea: "15.5 Acres",
    totalTowers: 3,
    totalUnits: 550,
    salesPhone: "9848211220",
    salesEmail: "sales@leplmidvalley.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Mangalagiri Vijayawada flat",
    fallbackQueries: ["Vijayawada flat apartment", "Amaravati flat"],
    amenities: ["Signature Mid Valley Club & Olympic Pool", "Full Gymnasium & Aerobics Deck", "Squash & Badminton Courts", "Lush Landscaped Central Lawns", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Heart of Amaravati Capital Region overlooking Mangalagiri Hills", "Walking Distance to AIIMS Mangalagiri Super Specialty Campus", "Ready to Move with Full Registry and OC", "Over 75% Open Green Tropical Campus"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 790, superBuiltUpArea: 1090, bathrooms: 2, balconies: 2, priceMin: 8500000, priceMax: 9800000 },
      { bhkType: "3 BHK", carpetArea: 1240, superBuiltUpArea: 1720, bathrooms: 3, balconies: 3, priceMin: 12800000, priceMax: 15500000 },
      { bhkType: "4 BHK", carpetArea: 1780, superBuiltUpArea: 2480, bathrooms: 4, balconies: 4, priceMin: 18500000, priceMax: 22500000 }
    ]
  },
  {
    code: "PRJ-VGA-002",
    name: "Vertex Siris Capital",
    slug: "vertex-siris-capital-kunchanapalli-vijayawada",
    developerName: "Vertex Homes",
    reraId: "P07200020180",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 6800000,
    priceMax: 14500000,
    pricePerSqFt: 5100,
    cityId: 354,
    cityName: "Vijayawada",
    stateName: "Andhra Pradesh",
    locality: "Kunchanapalli",
    siteAddress: "NH-16 Kolkata-Chennai Highway, Kunchanapalli, Vijayawada, Andhra Pradesh",
    landmark: "Kunchanapalli Toll Plaza & Manipal Hospital",
    pincode: "522501",
    totalLandArea: "10 Acres",
    totalTowers: 8,
    totalUnits: 620,
    salesPhone: "9848222330",
    salesEmail: "sales@vertexsiris.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Kunchanapalli Vijayawada flat",
    fallbackQueries: ["Vijayawada highway flat", "Vijayawada flat"],
    amenities: ["Signature Vertex Lifestyle Club", "Swimming Pool & Toddler Splash Pool", "Fully Fitted Fitness Gym", "AC Community Banquet Hall", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Right on 6-Lane NH-16 connecting Vijayawada & Guntur", "Minutes from Manipal Hospital and Prakasam Barrage", "Ready to Move Delivered High-Rise Project", "Bank Loan Pre-Approved with SBI & HDFC"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 740, superBuiltUpArea: 1020, bathrooms: 2, balconies: 2, priceMin: 6800000, priceMax: 7800000 },
      { bhkType: "3 BHK", carpetArea: 1080, superBuiltUpArea: 1510, bathrooms: 3, balconies: 3, priceMin: 9800000, priceMax: 11800000 },
      { bhkType: "4 BHK", carpetArea: 1540, superBuiltUpArea: 2150, bathrooms: 4, balconies: 4, priceMin: 12800000, priceMax: 14500000 }
    ]
  },
  {
    code: "PRJ-VGA-003",
    name: "Jayabheri The Peak",
    slug: "jayabheri-the-peak-tadepalli-vijayawada",
    developerName: "Jayabheri Properties",
    reraId: "P07200010210",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 11000000,
    priceMax: 26500000,
    pricePerSqFt: 7200,
    cityId: 354,
    cityName: "Vijayawada",
    stateName: "Andhra Pradesh",
    locality: "Tadepalli",
    siteAddress: "Bypass Road, Tadepalli, Amaravati Capital Core, Vijayawada, Andhra Pradesh",
    landmark: "Prakasam Barrage & Krishna Canal Junction",
    pincode: "522501",
    totalLandArea: "7 Acres",
    totalTowers: 4,
    totalUnits: 280,
    salesPhone: "9848233440",
    salesEmail: "sales@jayabherithepeak.com",
    siteVisitTimings: "10:00 AM - 6:30 PM (Daily)",
    searchQuery: "Tadepalli Vijayawada flat",
    fallbackQueries: ["Vijayawada luxury flat", "Vijayawada flat"],
    amenities: ["Ultra-Luxury 35,000 Sq. Ft. Club Facility", "Temperature Controlled Swimming Pool", "Tennis & Squash Courts", "Lush Landscaped Central Lawns", "Biometric Access Control"],
    highlights: ["Vijayawada's Most Prestigious Landmark - Jayabheri The Peak", "Spectacular Krishna River & Amaravati Skyline Views", "Home to Ministers, Top Industrialists and NRI Families", "Ready to Move with Spot Registration"],
    configurations: [
      { bhkType: "3 BHK", carpetArea: 1350, superBuiltUpArea: 1880, bathrooms: 3, balconies: 3, priceMin: 11000000, priceMax: 13800000 },
      { bhkType: "4 BHK", carpetArea: 1980, superBuiltUpArea: 2750, bathrooms: 4, balconies: 4, priceMin: 18500000, priceMax: 22000000 },
      { bhkType: "5 BHK Sky Villa", carpetArea: 2800, superBuiltUpArea: 3900, bathrooms: 5, balconies: 5, priceMin: 23500000, priceMax: 26500000 }
    ]
  },
  {
    code: "PRJ-VGA-004",
    name: "Rain Tree Park",
    slug: "rain-tree-park-nagarjuna-nagar-vijayawada",
    developerName: "IJM Lingamaneni",
    reraId: "P07200010098",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 7500000,
    priceMax: 16500000,
    pricePerSqFt: 5400,
    cityId: 354,
    cityName: "Vijayawada",
    stateName: "Andhra Pradesh",
    locality: "Nagarjuna Nagar",
    siteAddress: "Opposite Acharya Nagarjuna University, NH-16, Vijayawada, Andhra Pradesh",
    landmark: "Acharya Nagarjuna University (ANU) Campus",
    pincode: "522510",
    totalLandArea: "130 Acres",
    totalTowers: 14,
    totalUnits: 1100,
    salesPhone: "9848244550",
    salesEmail: "sales@raintreepark.in",
    siteVisitTimings: "9:00 AM - 6:00 PM (Daily)",
    searchQuery: "Rain Tree Park Vijayawada",
    fallbackQueries: ["Nagarjuna Nagar flat", "Vijayawada flat"],
    amenities: ["Malaysian International Standard Club", "Olympic Size Lap Pool", "Multi-Sport Complex & Tennis Courts", "Commercial Mall in Township", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Over 1,000 Families Residing in Andhra's Landmark Township", "Right Opposite Prestigious Acharya Nagarjuna University", "World-Class Infrastructure Built by IJM Malaysia", "Ready to Move Delivered High-Rise Living"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 760, superBuiltUpArea: 1050, bathrooms: 2, balconies: 2, priceMin: 7500000, priceMax: 8600000 },
      { bhkType: "3 BHK", carpetArea: 1140, superBuiltUpArea: 1580, bathrooms: 3, balconies: 3, priceMin: 11200000, priceMax: 13500000 },
      { bhkType: "4 BHK Villa", carpetArea: 1680, superBuiltUpArea: 2350, bathrooms: 4, balconies: 4, priceMin: 14500000, priceMax: 16500000 }
    ]
  },
  {
    code: "PRJ-VGA-005",
    name: "DNR Cascades",
    slug: "dnr-cascades-benz-circle-vijayawada",
    developerName: "DNR Corp",
    reraId: "P07200030112",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 9800000,
    priceMax: 21500000,
    pricePerSqFt: 6900,
    cityId: 354,
    cityName: "Vijayawada",
    stateName: "Andhra Pradesh",
    locality: "Benz Circle",
    siteAddress: "MG Road, Near Benz Circle Flyover, Vijayawada, Andhra Pradesh",
    landmark: "Benz Circle Flyover & Trendset Mall",
    pincode: "520010",
    totalLandArea: "4 Acres",
    totalTowers: 3,
    totalUnits: 210,
    salesPhone: "9848255660",
    salesEmail: "sales@dnrcascades.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Benz Circle Vijayawada flat",
    fallbackQueries: ["MG Road Vijayawada flat", "Vijayawada flat"],
    amenities: ["Rooftop Sky Pool & Sun Terrace", "Modern Gymnasium", "AC Community Banquet Suite", "Covered Reserved Parking", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Heart of Commercial Vijayawada - Benz Circle MG Road", "Walkable to Trendset Mall, Top Jewelry Showrooms & Multiplexes", "Ready to Move Ultra-Central Living", "Highest Rental Yield in Entire Krishna District"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 810, superBuiltUpArea: 1120, bathrooms: 2, balconies: 2, priceMin: 9800000, priceMax: 11200000 },
      { bhkType: "3 BHK", carpetArea: 1220, superBuiltUpArea: 1690, bathrooms: 3, balconies: 3, priceMin: 14200000, priceMax: 16800000 },
      { bhkType: "4 BHK", carpetArea: 1720, superBuiltUpArea: 2380, bathrooms: 4, balconies: 4, priceMin: 18500000, priceMax: 21500000 }
    ]
  },
  {
    code: "PRJ-VGA-006",
    name: "Subhagruha Sukrithi Towers",
    slug: "subhagruha-sukrithi-towers-gannavaram-vijayawada",
    developerName: "Subhagruha Projects",
    reraId: "P07200040150",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5200000,
    priceMax: 10800000,
    pricePerSqFt: 4600,
    cityId: 354,
    cityName: "Vijayawada",
    stateName: "Andhra Pradesh",
    locality: "Gannavaram",
    siteAddress: "Vijayawada Airport Link, NH-16, Gannavaram, Vijayawada, Andhra Pradesh",
    landmark: "Vijayawada International Airport & HCL Tech Park",
    pincode: "521101",
    totalLandArea: "8 Acres",
    totalTowers: 6,
    totalUnits: 440,
    salesPhone: "9848266770",
    salesEmail: "sales@subhagruha.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Gannavaram Vijayawada flat",
    fallbackQueries: ["Vijayawada airport flat", "Vijayawada flat"],
    amenities: ["Contemporary Clubhouse with Pool", "Fitness Gym & Yoga Room", "AC Community Hall", "Children Play Space", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Right Next to Vijayawada International Airport & HCL Campus", "High Rental Demand from IT Professionals & Aviation Crew", "Ready to Move with Full Registry and Possession", "Direct Frontage on 6-Lane NH-16"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 690, superBuiltUpArea: 950, bathrooms: 2, balconies: 1, priceMin: 5200000, priceMax: 5900000 },
      { bhkType: "3 BHK", carpetArea: 1020, superBuiltUpArea: 1410, bathrooms: 2, balconies: 2, priceMin: 7600000, priceMax: 8900000 },
      { bhkType: "4 BHK", carpetArea: 1460, superBuiltUpArea: 2040, bathrooms: 4, balconies: 4, priceMin: 9500000, priceMax: 10800000 }
    ]
  },

  // ===================== THIRUVANANTHAPURAM (6 Projects) =====================
  {
    code: "PRJ-TRV-001",
    name: "Nikunjam iPark",
    slug: "nikunjam-ipark-kazhakkoottam-thiruvananthapuram",
    developerName: "Nikunjam Constructions",
    reraId: "K-RERA/PRJ/TVM/012/2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 7200000,
    priceMax: 15500000,
    pricePerSqFt: 5800,
    cityId: 76,
    cityName: "Thiruvananthapuram",
    stateName: "Kerala",
    locality: "Kazhakkoottam",
    siteAddress: "Near Technopark Phase 1 Main Gate, Kazhakkoottam, Thiruvananthapuram, Kerala",
    landmark: "Technopark Phase 1 & Kariavattom University Campus",
    pincode: "695581",
    totalLandArea: "6 Acres",
    totalTowers: 4,
    totalUnits: 340,
    salesPhone: "9847211220",
    salesEmail: "sales@nikunjamipark.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Kazhakkoottam Trivandrum flat",
    fallbackQueries: ["Technopark Trivandrum flat", "Thiruvananthapuram flat"],
    amenities: ["Signature Nikunjam Club & Swimming Pool", "Health Club & Aerobics Deck", "Billiards & Indoor Games Lounge", "Children Play Arena", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Heart of Kerala's Tech Capital - Walking Distance to Technopark", "High Rental Yield from Top Tech Firm Executives", "Ready to Move Delivered High-Rise Project", "Close to Greenfield International Stadium"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 760, superBuiltUpArea: 1050, bathrooms: 2, balconies: 2, priceMin: 7200000, priceMax: 8200000 },
      { bhkType: "3 BHK", carpetArea: 1120, superBuiltUpArea: 1560, bathrooms: 3, balconies: 3, priceMin: 10800000, priceMax: 12800000 },
      { bhkType: "4 BHK", carpetArea: 1560, superBuiltUpArea: 2180, bathrooms: 4, balconies: 4, priceMin: 13500000, priceMax: 15500000 }
    ]
  },
  {
    code: "PRJ-TRV-002",
    name: "Cordus Crest",
    slug: "cordus-crest-vazhuthacaud-thiruvananthapuram",
    developerName: "Cordial Homes",
    reraId: "K-RERA/PRJ/TVM/034/2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 9800000,
    priceMax: 22500000,
    pricePerSqFt: 6900,
    cityId: 76,
    cityName: "Thiruvananthapuram",
    stateName: "Kerala",
    locality: "Vazhuthacaud",
    siteAddress: "Vazhuthacaud Main Road, Near Tagore Theatre, Thiruvananthapuram, Kerala",
    landmark: "Tagore Theatre & Women's College Vazhuthacaud",
    pincode: "695014",
    totalLandArea: "3.5 Acres",
    totalTowers: 3,
    totalUnits: 180,
    salesPhone: "9847222330",
    salesEmail: "sales@cordialhomes.in",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Vazhuthacaud Trivandrum flat",
    fallbackQueries: ["Trivandrum luxury flat", "Thiruvananthapuram flat"],
    amenities: ["Rooftop Sky Pool & Sun Terrace", "Modern Gymnasium", "AC Community Banquet Suite", "Covered Reserved Parking", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Trivandrum's Most Prestigious VVIP Residential Node", "Walking Distance to Tagore Theatre, Gymkhana Club & Top Schools", "Low-Density Community of Senior IAS Officers & Doctors", "Ready to Move with Full Registry and OC"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 810, superBuiltUpArea: 1120, bathrooms: 2, balconies: 2, priceMin: 9800000, priceMax: 11200000 },
      { bhkType: "3 BHK", carpetArea: 1220, superBuiltUpArea: 1690, bathrooms: 3, balconies: 3, priceMin: 14200000, priceMax: 16800000 },
      { bhkType: "4 BHK", carpetArea: 1720, superBuiltUpArea: 2380, bathrooms: 4, balconies: 4, priceMin: 18500000, priceMax: 22500000 }
    ]
  },
  {
    code: "PRJ-TRV-003",
    name: "Heather Magnum",
    slug: "heather-magnum-sasthamangalam-thiruvananthapuram",
    developerName: "Heather Homes",
    reraId: "K-RERA/PRJ/TVM/056/2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8800000,
    priceMax: 19500000,
    pricePerSqFt: 6500,
    cityId: 76,
    cityName: "Thiruvananthapuram",
    stateName: "Kerala",
    locality: "Sasthamangalam",
    siteAddress: "Pipinmoodu Road, Sasthamangalam, Thiruvananthapuram, Kerala",
    landmark: "Sasthamangalam Junction & RKM Hospital",
    pincode: "695010",
    totalLandArea: "4 Acres",
    totalTowers: 3,
    totalUnits: 210,
    salesPhone: "9847233440",
    salesEmail: "sales@heatherhomes.in",
    siteVisitTimings: "10:00 AM - 6:30 PM (Daily)",
    searchQuery: "Sasthamangalam Trivandrum flat",
    fallbackQueries: ["Sasthamangalam flat", "Thiruvananthapuram apartment"],
    amenities: ["Signature Heather Lifestyle Club", "Swimming Pool & Timber Sun Deck", "Health Club & Aerobics Center", "Children Sensory Play Area", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Quiet Residential Haven of Sasthamangalam", "Minutes from Sri Ramakrishna Mission Hospital & Kowdiar Palace", "Ready to Move Delivered High-Rise Living", "Pre-Approved Loans with State Bank of India"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 780, superBuiltUpArea: 1080, bathrooms: 2, balconies: 2, priceMin: 8800000, priceMax: 9900000 },
      { bhkType: "3 BHK", carpetArea: 1180, superBuiltUpArea: 1640, bathrooms: 3, balconies: 3, priceMin: 12500000, priceMax: 14800000 },
      { bhkType: "4 BHK", carpetArea: 1640, superBuiltUpArea: 2280, bathrooms: 4, balconies: 4, priceMin: 16200000, priceMax: 19500000 }
    ]
  },
  {
    code: "PRJ-TRV-004",
    name: "Artech Lake Gardens",
    slug: "artech-lake-gardens-akkulam-thiruvananthapuram",
    developerName: "Artech Realtors",
    reraId: "K-RERA/PRJ/TVM/078/2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 7800000,
    priceMax: 17200000,
    pricePerSqFt: 6100,
    cityId: 76,
    cityName: "Thiruvananthapuram",
    stateName: "Kerala",
    locality: "Akkulam",
    siteAddress: "Akkulam Lake Road, Near LuLu Mall Trivandrum, Thiruvananthapuram, Kerala",
    landmark: "LuLu Mall Trivandrum & Akkulam Tourist Village",
    pincode: "695017",
    totalLandArea: "7 Acres",
    totalTowers: 5,
    totalUnits: 390,
    salesPhone: "9847244550",
    salesEmail: "sales@artechrealtors.com",
    siteVisitTimings: "9:00 AM - 6:00 PM (Daily)",
    searchQuery: "Akkulam Trivandrum flat",
    fallbackQueries: ["Lulu mall Trivandrum flat", "Thiruvananthapuram flat"],
    amenities: ["Signature Lake View Clubhouse", "Infinity Swimming Pool Facing Lake", "Tennis & Basketball Arena", "Lush Landscaped Central Lawns", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Overlooking Picturesque Akkulam Lake", "Walking Distance to Asia's Grand LuLu Mall Trivandrum", "5 Mins from Technopark Phase 3", "Ready to Move with Full Completion Certificate"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 740, superBuiltUpArea: 1020, bathrooms: 2, balconies: 2, priceMin: 7800000, priceMax: 8800000 },
      { bhkType: "3 BHK", carpetArea: 1100, superBuiltUpArea: 1520, bathrooms: 3, balconies: 3, priceMin: 11200000, priceMax: 13200000 },
      { bhkType: "4 BHK", carpetArea: 1540, superBuiltUpArea: 2150, bathrooms: 4, balconies: 4, priceMin: 14500000, priceMax: 17200000 }
    ]
  },
  {
    code: "PRJ-TRV-005",
    name: "Asset Orchestra Trivandrum",
    slug: "asset-orchestra-pattom-thiruvananthapuram",
    developerName: "Asset Homes",
    reraId: "K-RERA/PRJ/TVM/090/2022",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "October 2026",
    priceMin: 8500000,
    priceMax: 18500000,
    pricePerSqFt: 6400,
    cityId: 76,
    cityName: "Thiruvananthapuram",
    stateName: "Kerala",
    locality: "Pattom",
    siteAddress: "Pattom-Marappalam Road, Near Kendriya Vidyalaya, Thiruvananthapuram, Kerala",
    landmark: "Kendriya Vidyalaya Pattom & St. Mary's School",
    pincode: "695004",
    totalLandArea: "3.8 Acres",
    totalTowers: 3,
    totalUnits: 220,
    salesPhone: "9847255660",
    salesEmail: "orchestra@assethomes.in",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Pattom Trivandrum flat",
    fallbackQueries: ["Thiruvananthapuram flat", "Trivandrum apartment"],
    amenities: ["Contemporary Clubhouse with Sky Pool", "Fitness Gym & Yoga Room", "AC Community Hall", "Children Play Space", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Central Education & Healthcare Hub - Pattom", "Minutes from Top Medical Colleges, CBSE Schools & Secretariat", "Modern Eco-Friendly IGBC Certified Architecture", "Pre-Approved Home Loans with All Major Banks"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 760, superBuiltUpArea: 1050, bathrooms: 2, balconies: 2, priceMin: 8500000, priceMax: 9600000 },
      { bhkType: "3 BHK", carpetArea: 1140, superBuiltUpArea: 1580, bathrooms: 3, balconies: 3, priceMin: 12200000, priceMax: 14500000 },
      { bhkType: "4 BHK", carpetArea: 1600, superBuiltUpArea: 2240, bathrooms: 4, balconies: 4, priceMin: 15800000, priceMax: 18500000 }
    ]
  },
  {
    code: "PRJ-TRV-006",
    name: "Skyline Cambridge",
    slug: "skyline-cambridge-kowdiar-thiruvananthapuram",
    developerName: "Skyline Builders",
    reraId: "K-RERA/PRJ/TVM/045/2019",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 12500000,
    priceMax: 29500000,
    pricePerSqFt: 8200,
    cityId: 76,
    cityName: "Thiruvananthapuram",
    stateName: "Kerala",
    locality: "Kowdiar",
    siteAddress: "Kowdiar Main Palace Avenue, Thiruvananthapuram, Kerala",
    landmark: "Kowdiar Palace & Trivandrum Golf Club",
    pincode: "695003",
    totalLandArea: "4.5 Acres",
    totalTowers: 3,
    totalUnits: 160,
    salesPhone: "9847266770",
    salesEmail: "sales@skylinecambridge.com",
    siteVisitTimings: "10:00 AM - 6:30 PM (Daily)",
    searchQuery: "Kowdiar Trivandrum luxury flat",
    fallbackQueries: ["Kowdiar palace flat", "Trivandrum luxury flat"],
    amenities: ["Skyline Imperial Club & Lap Pool", "State of the Art Fitness Suite", "Private Banquet Hall & Boardroom", "Basement Parking with EV Bays", "Biometric Access Control"],
    highlights: ["The Most Royal VVIP Address in Kerala - Kowdiar Palace Avenue", "Overlooking Historic Kowdiar Palace & Golf Course", "Ultra-Low Density Community of Top Dignitaries & Industrialists", "Ready to Move with Pristine Clear Deeds"],
    configurations: [
      { bhkType: "3 BHK", carpetArea: 1450, superBuiltUpArea: 2020, bathrooms: 3, balconies: 3, priceMin: 12500000, priceMax: 15500000 },
      { bhkType: "4 BHK", carpetArea: 2150, superBuiltUpArea: 3020, bathrooms: 4, balconies: 4, priceMin: 21500000, priceMax: 25500000 },
      { bhkType: "5 BHK Penthouse", carpetArea: 2850, superBuiltUpArea: 3980, bathrooms: 5, balconies: 5, priceMin: 26500000, priceMax: 29500000 }
    ]
  },

  // ===================== MANGALURU (6 Projects) =====================
  {
    code: "PRJ-IXE-001",
    name: "Rohan Corporation City Square",
    slug: "rohan-corporation-city-square-lalbagh-mangaluru",
    developerName: "Rohan Corporation",
    reraId: "PRM/KA/RERA/1257/334/PR/180512/001680",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8500000,
    priceMax: 18500000,
    pricePerSqFt: 6200,
    cityId: 21,
    cityName: "Mangaluru",
    stateName: "Karnataka",
    locality: "Lalbagh",
    siteAddress: "MG Road, Near Mangalore City Corporation, Lalbagh, Mangaluru, Karnataka",
    landmark: "Mangalore City Corporation & Saibeen Complex",
    pincode: "575003",
    totalLandArea: "4.5 Acres",
    totalTowers: 3,
    totalUnits: 240,
    salesPhone: "9845211220",
    salesEmail: "sales@rohancorporation.in",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Lalbagh Mangalore flat",
    fallbackQueries: ["Mangalore flat apartment", "Mangaluru property"],
    amenities: ["Signature Rohan Club & Swimming Pool", "Health Club & Aerobics Deck", "Billiards & Table Tennis Lounge", "Children Play Arena", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Heart of Mangalore City - Lalbagh MG Road", "Walkable to City Corporation, Malls, Hospitals & Colleges", "Ready to Move Delivered High-Rise Project", "Mangalore's Leading 30-Year Builder Heritage"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 780, superBuiltUpArea: 1080, bathrooms: 2, balconies: 2, priceMin: 8500000, priceMax: 9600000 },
      { bhkType: "3 BHK", carpetArea: 1180, superBuiltUpArea: 1640, bathrooms: 3, balconies: 3, priceMin: 12500000, priceMax: 14800000 },
      { bhkType: "4 BHK", carpetArea: 1650, superBuiltUpArea: 2320, bathrooms: 4, balconies: 4, priceMin: 16200000, priceMax: 18500000 }
    ]
  },
  {
    code: "PRJ-IXE-002",
    name: "Inland Windsors",
    slug: "inland-windsors-maryhill-mangaluru",
    developerName: "IN-LAND Builders",
    reraId: "PRM/KA/RERA/1257/334/PR/171015/000450",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 9800000,
    priceMax: 22500000,
    pricePerSqFt: 6800,
    cityId: 21,
    cityName: "Mangaluru",
    stateName: "Karnataka",
    locality: "Maryhill",
    siteAddress: "Airport Road, Maryhill, Mangaluru, Karnataka",
    landmark: "Helipad Maryhill & Bondel Junction",
    pincode: "575008",
    totalLandArea: "6 Acres",
    totalTowers: 4,
    totalUnits: 280,
    salesPhone: "9845222330",
    salesEmail: "sales@inlandbuilders.net",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Maryhill Mangalore flat",
    fallbackQueries: ["Airport road Mangalore flat", "Mangalore luxury flat"],
    amenities: ["Signature Windsors Club with Infinity Pool", "State of the Art Fitness Suite", "Private Mini Theatre", "Lush Landscaped Valley Greens", "Biometric Access Control"],
    highlights: ["Mangalore's Most Iconic Sea & Valley Facing Landmark - Windsors", "Direct Access on Airport Highway Corridor", "Award-Winning Wave-Shaped Architectural Marvel", "Ready to Move with Full Registry and OC"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 820, superBuiltUpArea: 1140, bathrooms: 2, balconies: 2, priceMin: 9800000, priceMax: 11200000 },
      { bhkType: "3 BHK", carpetArea: 1240, superBuiltUpArea: 1720, bathrooms: 3, balconies: 3, priceMin: 14200000, priceMax: 16800000 },
      { bhkType: "4 BHK", carpetArea: 1780, superBuiltUpArea: 2480, bathrooms: 4, balconies: 4, priceMin: 18500000, priceMax: 22500000 }
    ]
  },
  {
    code: "PRJ-IXE-003",
    name: "Land Trades Solitaire",
    slug: "land-trades-solitaire-hat-hill-mangaluru",
    developerName: "Land Trades Builders",
    reraId: "PRM/KA/RERA/1257/334/PR/180320/001120",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 11500000,
    priceMax: 27500000,
    pricePerSqFt: 7400,
    cityId: 21,
    cityName: "Mangaluru",
    stateName: "Karnataka",
    locality: "Hat Hill",
    siteAddress: "Hat Hill Road, Near Ladyhill, Mangaluru, Karnataka",
    landmark: "Hat Hill Tower & Ladyhill Victoria Church",
    pincode: "575006",
    totalLandArea: "5 Acres",
    totalTowers: 2,
    totalUnits: 140,
    salesPhone: "9845233440",
    salesEmail: "sales@landtrades.in",
    siteVisitTimings: "10:00 AM - 6:30 PM (Daily)",
    searchQuery: "Hat Hill Mangalore flat",
    fallbackQueries: ["Mangalore luxury apartment", "Mangalore flat"],
    amenities: ["Ultra-Luxury 32nd-Floor Sky Club", "Infinity Edge Pool Overlooking Arabian Sea", "Health Club & Aerobics Deck", "Covered Reserved Parking with EV Bays", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Mangalore's Tallest 32-Storey Skyscraper Landmark - Solitaire", "Spectacular 360-Degree Panoramic Views of Arabian Sea", "Home to Top NRI Business Leaders & Doctors", "Ready to Move with Full Registry and OC"],
    configurations: [
      { bhkType: "3 BHK", carpetArea: 1380, superBuiltUpArea: 1920, bathrooms: 3, balconies: 3, priceMin: 11500000, priceMax: 14500000 },
      { bhkType: "4 BHK", carpetArea: 2100, superBuiltUpArea: 2950, bathrooms: 4, balconies: 4, priceMin: 19500000, priceMax: 23500000 },
      { bhkType: "5 BHK Penthouse", carpetArea: 2850, superBuiltUpArea: 3980, bathrooms: 5, balconies: 5, priceMin: 24500000, priceMax: 27500000 }
    ]
  },
  {
    code: "PRJ-IXE-004",
    name: "Northernsky City",
    slug: "northernsky-city-pumpwell-mangaluru",
    developerName: "NorthernSky Properties",
    reraId: "PRM/KA/RERA/1257/334/PR/190810/002780",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 7200000,
    priceMax: 15800000,
    pricePerSqFt: 5400,
    cityId: 21,
    cityName: "Mangaluru",
    stateName: "Karnataka",
    locality: "Pumpwell",
    siteAddress: "Pumpwell Junction, NH-66, Mangaluru, Karnataka",
    landmark: "Pumpwell Circle & Father Muller Medical Hospital",
    pincode: "575002",
    totalLandArea: "8 Acres",
    totalTowers: 6,
    totalUnits: 480,
    salesPhone: "9845244550",
    salesEmail: "sales@northernsky.in",
    siteVisitTimings: "9:00 AM - 6:00 PM (Daily)",
    searchQuery: "Pumpwell Mangalore flat",
    fallbackQueries: ["Mangalore flat apartment", "Mangalore flat"],
    amenities: ["Signature NorthernSky Club & Pool", "Full Gymnasium & Yoga Room", "AC Community Banquet Hall", "Children Play Arena", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Situated at Mangalore's Prime Highway Junction - Pumpwell Circle", "Direct Connectivity to NH-66 and Bengaluru Highway (NH-75)", "Ready to Move Delivered High-Rise Living", "Over 70% Open Space with Lush Greens"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 740, superBuiltUpArea: 1020, bathrooms: 2, balconies: 2, priceMin: 7200000, priceMax: 8200000 },
      { bhkType: "3 BHK", carpetArea: 1080, superBuiltUpArea: 1510, bathrooms: 3, balconies: 3, priceMin: 9800000, priceMax: 11800000 },
      { bhkType: "4 BHK", carpetArea: 1540, superBuiltUpArea: 2150, bathrooms: 4, balconies: 4, priceMin: 13200000, priceMax: 15800000 }
    ]
  },
  {
    code: "PRJ-IXE-005",
    name: "Mohtisham Canopy",
    slug: "mohtisham-canopy-urwa-store-mangaluru",
    developerName: "Mohtisham Complexes",
    reraId: "PRM/KA/RERA/1257/334/PR/181105/002130",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 6800000,
    priceMax: 14500000,
    pricePerSqFt: 5100,
    cityId: 21,
    cityName: "Mangaluru",
    stateName: "Karnataka",
    locality: "Urwa Store",
    siteAddress: "Urwa Store Main Road, Near Infosys Kottara, Mangaluru, Karnataka",
    landmark: "Infosys Mangalore Kottara & Urwa Market",
    pincode: "575006",
    totalLandArea: "5 Acres",
    totalTowers: 4,
    totalUnits: 320,
    salesPhone: "9845255660",
    salesEmail: "sales@mohtisham.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Urwa Mangalore flat",
    fallbackQueries: ["Mangalore flat", "Kottara Mangalore flat"],
    amenities: ["Contemporary Clubhouse with Pool", "Fitness Gym & Yoga Room", "AC Community Hall", "Children Play Space", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Established Peaceful Neighborhood of Urwa Store", "Walking Distance to Infosys Tech Campus & Top Schools", "Ready to Move with Full Completion Certificate", "High Rental Demand from IT Professionals"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 720, superBuiltUpArea: 990, bathrooms: 2, balconies: 2, priceMin: 6800000, priceMax: 7800000 },
      { bhkType: "3 BHK", carpetArea: 1060, superBuiltUpArea: 1480, bathrooms: 2, balconies: 3, priceMin: 9500000, priceMax: 11200000 },
      { bhkType: "4 BHK", carpetArea: 1490, superBuiltUpArea: 2080, bathrooms: 4, balconies: 4, priceMin: 12200000, priceMax: 14500000 }
    ]
  },
  {
    code: "PRJ-IXE-006",
    name: "Bhandary Heights",
    slug: "bhandary-heights-kottara-chowki-mangaluru",
    developerName: "Bhandary Builders",
    reraId: "PRM/KA/RERA/1257/334/PR/180110/000920",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5800000,
    priceMax: 12500000,
    pricePerSqFt: 4800,
    cityId: 21,
    cityName: "Mangaluru",
    stateName: "Karnataka",
    locality: "Kottara Chowki",
    siteAddress: "NH-66 Highway, Kottara Chowki, Mangaluru, Karnataka",
    landmark: "Kottara Chowki Flyover & D-Mart",
    pincode: "575006",
    totalLandArea: "4.5 Acres",
    totalTowers: 3,
    totalUnits: 260,
    salesPhone: "9845266770",
    salesEmail: "sales@bhandarybuilders.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Kottara chowki Mangalore flat",
    fallbackQueries: ["Mangalore highway flat", "Mangalore flat"],
    amenities: ["Signature Clubhouse with Rooftop Pool", "Health Club & Aerobics Deck", "Children Activity Zone", "Multi-Tier Automated Surveillance", "Sweet Groundwater Supply"],
    highlights: ["Right on 6-Lane NH-66 Coastal Highway", "Minutes from D-Mart Supermarket & Major Commercial Hubs", "Ready to Move with Full Registry and Possession", "Pre-Approved Home Loans with All Major Banks"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 690, superBuiltUpArea: 950, bathrooms: 2, balconies: 1, priceMin: 5800000, priceMax: 6600000 },
      { bhkType: "3 BHK", carpetArea: 1020, superBuiltUpArea: 1410, bathrooms: 2, balconies: 2, priceMin: 7900000, priceMax: 9400000 },
      { bhkType: "4 BHK", carpetArea: 1450, superBuiltUpArea: 2020, bathrooms: 4, balconies: 4, priceMin: 10500000, priceMax: 12500000 }
    ]
  },

  // ===================== GUWAHATI (6 Projects) =====================
  {
    code: "PRJ-GAU-001",
    name: "Protech Tara Hira",
    slug: "protech-tara-hira-six-mile-guwahati",
    developerName: "Protech Group",
    reraId: "RERA-ASSAM-2018-0012",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 7200000,
    priceMax: 15500000,
    pricePerSqFt: 5800,
    cityId: 73,
    cityName: "Guwahati",
    stateName: "Assam",
    locality: "Six Mile",
    siteAddress: "VIP Road, Near Chachwal, Six Mile, Guwahati, Assam",
    landmark: "Six Mile Flyover & GNRC Hospital",
    pincode: "781022",
    totalLandArea: "5 Acres",
    totalTowers: 4,
    totalUnits: 290,
    salesPhone: "9854111220",
    salesEmail: "sales@protechtarahira.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Six Mile Guwahati flat",
    fallbackQueries: ["Guwahati flat apartment", "Guwahati property flat"],
    amenities: ["Signature Protech Club & Swimming Pool", "Health Club & Aerobics Deck", "AC Community Banquet Hall", "Children Play Arena", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Guwahati's Most Prime Residential Corridor - Six Mile VIP Road", "Minutes from GNRC Multi-Specialty Hospital and GS Road", "Ready to Move Delivered High-Rise Project", "Northeast's Most Reputed Builder Group - Protech"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 760, superBuiltUpArea: 1050, bathrooms: 2, balconies: 2, priceMin: 7200000, priceMax: 8200000 },
      { bhkType: "3 BHK", carpetArea: 1120, superBuiltUpArea: 1560, bathrooms: 3, balconies: 3, priceMin: 10500000, priceMax: 12500000 },
      { bhkType: "4 BHK", carpetArea: 1560, superBuiltUpArea: 2180, bathrooms: 4, balconies: 4, priceMin: 13500000, priceMax: 15500000 }
    ]
  },
  {
    code: "PRJ-GAU-002",
    name: "Subham Diamond",
    slug: "subham-diamond-zoo-road-guwahati",
    developerName: "Subham Group",
    reraId: "RERA-ASSAM-2019-0034",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 9800000,
    priceMax: 22500000,
    pricePerSqFt: 6900,
    cityId: 73,
    cityName: "Guwahati",
    stateName: "Assam",
    locality: "Zoo Road",
    siteAddress: "R.G. Baruah Road, Near Assam State Zoo, Guwahati, Assam",
    landmark: "Assam State Zoo & Commerce College Link",
    pincode: "781005",
    totalLandArea: "4 Acres",
    totalTowers: 3,
    totalUnits: 180,
    salesPhone: "9854122330",
    salesEmail: "sales@subhamdiamond.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Zoo road Guwahati flat",
    fallbackQueries: ["RG Baruah road Guwahati flat", "Guwahati luxury flat"],
    amenities: ["Rooftop Sky Pool & Sun Terrace", "Modern Gymnasium", "AC Community Banquet Suite", "Covered Reserved Parking", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Guwahati's #1 Most Prestigious Core - Zoo Road (R.G. Baruah Road)", "Overlooking Lush Green Reserve of Assam State Zoo", "Exclusive Enclave of Senior Industrialists & Doctors", "Ready to Move with Full Registry and OC"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 810, superBuiltUpArea: 1120, bathrooms: 2, balconies: 2, priceMin: 9800000, priceMax: 11200000 },
      { bhkType: "3 BHK", carpetArea: 1220, superBuiltUpArea: 1690, bathrooms: 3, balconies: 3, priceMin: 14200000, priceMax: 16800000 },
      { bhkType: "4 BHK", carpetArea: 1720, superBuiltUpArea: 2380, bathrooms: 4, balconies: 4, priceMin: 18500000, priceMax: 22500000 }
    ]
  },
  {
    code: "PRJ-GAU-003",
    name: "Dona Planet",
    slug: "dona-planet-gs-road-guwahati",
    developerName: "Dona Builders",
    reraId: "RERA-ASSAM-2018-0045",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8800000,
    priceMax: 19500000,
    pricePerSqFt: 6500,
    cityId: 73,
    cityName: "Guwahati",
    stateName: "Assam",
    locality: "GS Road",
    siteAddress: "Christian Basti, GS Road Main Highway, Guwahati, Assam",
    landmark: "City Centre Mall & Apollo Hospital Guwahati Link",
    pincode: "781005",
    totalLandArea: "4.5 Acres",
    totalTowers: 3,
    totalUnits: 220,
    salesPhone: "9854133440",
    salesEmail: "sales@donaplanet.com",
    siteVisitTimings: "10:00 AM - 6:30 PM (Daily)",
    searchQuery: "GS road Guwahati flat",
    fallbackQueries: ["Christian Basti flat", "Guwahati flat"],
    amenities: ["Signature Dona Lifestyle Club", "Swimming Pool & Timber Sun Deck", "Health Club & Aerobics Center", "Children Sensory Play Area", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Situated on Arterial GS Road - Commercial Backbone of Northeast", "Walking Distance to City Centre Mall, Multiplexes & Cafes", "Ready to Move Delivered High-Rise Living", "Highest Rental Yield in Entire Assam"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 780, superBuiltUpArea: 1080, bathrooms: 2, balconies: 2, priceMin: 8800000, priceMax: 9900000 },
      { bhkType: "3 BHK", carpetArea: 1180, superBuiltUpArea: 1640, bathrooms: 3, balconies: 3, priceMin: 12500000, priceMax: 14800000 },
      { bhkType: "4 BHK", carpetArea: 1640, superBuiltUpArea: 2280, bathrooms: 4, balconies: 4, priceMin: 16200000, priceMax: 19500000 }
    ]
  },
  {
    code: "PRJ-GAU-004",
    name: "Shine Heaven",
    slug: "shine-heaven-khanapara-guwahati",
    developerName: "Shine Real Estate",
    reraId: "RERA-ASSAM-2020-0067",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5800000,
    priceMax: 12800000,
    pricePerSqFt: 4900,
    cityId: 73,
    cityName: "Guwahati",
    stateName: "Assam",
    locality: "Khanapara",
    siteAddress: "VIP Road, Near Khanapara Veterinary Field, Guwahati, Assam",
    landmark: "Khanapara Veterinary Ground & Administrative Staff College",
    pincode: "781022",
    totalLandArea: "6 Acres",
    totalTowers: 5,
    totalUnits: 360,
    salesPhone: "9854144550",
    salesEmail: "sales@shineheaven.in",
    siteVisitTimings: "9:00 AM - 6:00 PM (Daily)",
    searchQuery: "Khanapara Guwahati flat",
    fallbackQueries: ["Guwahati flat apartment", "Guwahati flat"],
    amenities: ["Contemporary Clubhouse with Pool", "Fitness Gym & Yoga Room", "AC Community Hall", "Children Play Space", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Gateway to Northeast at Khanapara Interchange", "Close to Assam Administrative College and Top Schools", "Ready to Move Delivered Units", "Affordable Price per Sq. Ft. with Great Appreciation"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 720, superBuiltUpArea: 990, bathrooms: 2, balconies: 2, priceMin: 5800000, priceMax: 6600000 },
      { bhkType: "3 BHK", carpetArea: 1060, superBuiltUpArea: 1480, bathrooms: 2, balconies: 3, priceMin: 8200000, priceMax: 9600000 },
      { bhkType: "4 BHK", carpetArea: 1480, superBuiltUpArea: 2060, bathrooms: 4, balconies: 4, priceMin: 11000000, priceMax: 12800000 }
    ]
  },
  {
    code: "PRJ-GAU-005",
    name: "Greenwood Resort & Residences",
    slug: "greenwood-residences-khanapara-guwahati",
    developerName: "Greenwood Promoters",
    reraId: "RERA-ASSAM-2019-0056",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8200000,
    priceMax: 17800000,
    pricePerSqFt: 6200,
    cityId: 73,
    cityName: "Guwahati",
    stateName: "Assam",
    locality: "Khanapara",
    siteAddress: "GS Road Highway, Khanapara Hills, Guwahati, Assam",
    landmark: "Greenwood Resort & Meghalaya Border Corridor",
    pincode: "781022",
    totalLandArea: "10 Acres",
    totalTowers: 6,
    totalUnits: 380,
    salesPhone: "9854155660",
    salesEmail: "sales@greenwoodresidences.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Greenwood Khanapara flat",
    fallbackQueries: ["Khanapara flat", "Guwahati flat"],
    amenities: ["Signature Resort-Style Clubhouse", "Infinity Swimming Pool Facing Green Hills", "Health Club & Aerobics Deck", "Landscaped Pine Forest Walkway", "24x7 Multi-Tier Electronic Security"],
    highlights: ["Scenic Hill-View Living at Khanapara Foothills", "Adjacent to Iconic Greenwood Resort", "Ready to Move with Full Registry and OC", "Pure Mountain Air with Zero Pollution"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 760, superBuiltUpArea: 1050, bathrooms: 2, balconies: 2, priceMin: 8200000, priceMax: 9200000 },
      { bhkType: "3 BHK", carpetArea: 1140, superBuiltUpArea: 1580, bathrooms: 3, balconies: 3, priceMin: 11800000, priceMax: 13800000 },
      { bhkType: "4 BHK", carpetArea: 1580, superBuiltUpArea: 2200, bathrooms: 4, balconies: 4, priceMin: 15200000, priceMax: 17800000 }
    ]
  },
  {
    code: "PRJ-GAU-006",
    name: "Uttarayan Vistas",
    slug: "uttarayan-vistas-lokhra-guwahati",
    developerName: "Uttarayan Group",
    reraId: "RERA-ASSAM-2020-0089",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5200000,
    priceMax: 10800000,
    pricePerSqFt: 4500,
    cityId: 73,
    cityName: "Guwahati",
    stateName: "Assam",
    locality: "Lokhra",
    siteAddress: "Borusojai Main Road, Near Sarusajai Stadium, Lokhra, Guwahati, Assam",
    landmark: "Sarusajai National Stadium & ISBT Guwahati Link",
    pincode: "781034",
    totalLandArea: "7 Acres",
    totalTowers: 5,
    totalUnits: 340,
    salesPhone: "9854166770",
    salesEmail: "sales@uttarayanvistas.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Lokhra Guwahati flat",
    fallbackQueries: ["Sarusajai Guwahati flat", "Guwahati flat"],
    amenities: ["Community Clubhouse with Pool", "Gymnasium & Yoga Terrace", "Children Play Arena", "Allotted Covered Stilt Parking", "Multi-Tier Guard Post Security"],
    highlights: ["Right Next to Sarusajai International Sports Complex", "5 Mins from Inter-State Bus Terminus (ISBT) Guwahati", "Ready to Move with Full Registry and Possession", "Pre-Approved Home Loans with SBI & PNB"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 690, superBuiltUpArea: 950, bathrooms: 2, balconies: 1, priceMin: 5200000, priceMax: 5900000 },
      { bhkType: "3 BHK", carpetArea: 1020, superBuiltUpArea: 1410, bathrooms: 2, balconies: 2, priceMin: 7600000, priceMax: 8900000 },
      { bhkType: "4 BHK", carpetArea: 1460, superBuiltUpArea: 2040, bathrooms: 4, balconies: 4, priceMin: 9500000, priceMax: 10800000 }
    ]
  }
];

async function run() {
  console.log("================================================================================");
  console.log("SOURCING TIER-2 METROS BATCH 6: VIJAYAWADA, TRIVANDRUM, MANGALURU, GUWAHATI (24 PRJS)");
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
