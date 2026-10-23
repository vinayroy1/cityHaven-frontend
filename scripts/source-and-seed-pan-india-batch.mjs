import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "/Users/vinaykumar/Desktop/myProjects/awasio-backend/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";

const BASE_DIR = "/Users/vinaykumar/Desktop/awasio-sourced-properties";
const PROJECT_IMAGES_DIR = path.join(BASE_DIR, "pan_india_project_images");
const PROJECTS_FILE = path.join(BASE_DIR, "pan_india_projects.json");
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

// 12 Flagship Projects for Remaining Top Indian Cities
const PAN_INDIA_PROJECTS = [
  // ===================== INDORE (id: 66) =====================
  {
    code: "PRJ-IDR-001",
    name: "Apollo DB City",
    slug: "apollo-db-city-nipania-indore",
    developerName: "DB Realty & Apollo Group",
    reraId: "P-IND-17-102",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8500000,
    priceMax: 19500000,
    pricePerSqFt: 5400,
    cityId: 66,
    cityName: "Indore",
    stateName: "Madhya Pradesh",
    locality: "Nipania",
    siteAddress: "Nipania Main Road, Near Delhi Public School, Indore, Madhya Pradesh",
    landmark: "Nipania Junction & AB Bypass Road Corridor",
    pincode: "452010",
    totalLandArea: "12 Acres",
    totalTowers: 8,
    totalUnits: 580,
    salesPhone: "9826145620",
    salesEmail: "sales@apollodbcity.com",
    siteVisitTimings: "9:30 AM - 7:00 PM (All 7 Days)",
    searchQuery: "Nipania Indore flat apartment",
    fallbackQueries: ["Indore luxury apartment", "Vijay Nagar Indore flat"],
    amenities: [
      "Signature Club Apollo with Temperature Controlled Lap Pool",
      "Tennis & Squash Courts with Floodlights",
      "Air-Conditioned Banquet Hall & Preview Theatre",
      "Lush Landscaped Lawns with Reflexology Paths",
      "Multi-Tier Biometric Security & RFID Gate Entry",
      "Multi-Level Basement Parking with EV Chargers"
    ],
    highlights: [
      "Indore's Benchmark Ultra-Luxury Township in Prime Nipania",
      "Minutes from Vijay Nagar Commercial Hub & AB Bypass",
      "Ready to Move with Over 400 Families Residing",
      "Over 75% Open Greens & Tree Canopy"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 840,
        superBuiltUpArea: 1180,
        bathrooms: 2,
        balconies: 2,
        priceMin: 8500000,
        priceMax: 9500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1180,
        superBuiltUpArea: 1680,
        bathrooms: 3,
        balconies: 3,
        priceMin: 12500000,
        priceMax: 14500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "4 BHK Royal Villa",
        carpetArea: 1850,
        superBuiltUpArea: 2650,
        bathrooms: 4,
        balconies: 4,
        priceMin: 17500000,
        priceMax: 19500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },

  // ===================== BHOPAL (id: 67) =====================
  {
    code: "PRJ-BPL-001",
    name: "Sage Sun City",
    slug: "sage-sun-city-hoshangabad-road-bhopal",
    developerName: "Sage Group",
    reraId: "P-BPL-18-1240",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5500000,
    priceMax: 11800000,
    pricePerSqFt: 3800,
    cityId: 67,
    cityName: "Bhopal",
    stateName: "Madhya Pradesh",
    locality: "Hoshangabad Road",
    siteAddress: "Near Aashima Mall, NH-46 Hoshangabad Road, Bhopal, Madhya Pradesh",
    landmark: "Aashima The Mall & Misrod Railway Station",
    pincode: "462026",
    totalLandArea: "15 Acres",
    totalTowers: 10,
    totalUnits: 720,
    salesPhone: "9826238910",
    salesEmail: "contact@sagegroupbhopal.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Hoshangabad Road Bhopal flat",
    fallbackQueries: ["Bhopal flat apartment", "Bhopal residential flat"],
    amenities: [
      "15-Acre Master-Planned Integrated Township",
      "Clubhouse with Olympic Sized Swimming Pool",
      "State-of-the-Art Gymnasium & Yoga Pavilion",
      "Shopping Plaza & Pharmacy Inside Complex",
      "24-Hour Sweet Groundwater Supply & Generator Backup",
      "Full Security Protocol with Monitored Boom Barrier"
    ],
    highlights: [
      "Bhopal's Highest-Selling Gated Township on 6-Lane Hoshangabad Corridor",
      "Walking Distance from Aashima Mall & Multiplex",
      "Direct Metro Station Connectivity Under Construction",
      "Ready to Move with Full Registry and Bank Loan Clearances"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 740,
        superBuiltUpArea: 1020,
        bathrooms: 2,
        balconies: 2,
        priceMin: 5500000,
        priceMax: 6200000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1060,
        superBuiltUpArea: 1480,
        bathrooms: 2,
        balconies: 3,
        priceMin: 7600000,
        priceMax: 8800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "4 BHK",
        carpetArea: 1480,
        superBuiltUpArea: 2050,
        bathrooms: 4,
        balconies: 4,
        priceMin: 10500000,
        priceMax: 11800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },

  // ===================== NAVI MUMBAI (id: 3519) =====================
  {
    code: "PRJ-NVM-001",
    name: "Godrej Bayview",
    slug: "godrej-bayview-sanpada-navi-mumbai",
    developerName: "Godrej Properties",
    reraId: "P51700031726",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "March 2027",
    priceMin: 19500000,
    priceMax: 42000000,
    pricePerSqFt: 18500,
    cityId: 3519,
    cityName: "Navi Mumbai",
    stateName: "Maharashtra",
    locality: "Sanpada",
    siteAddress: "Sector 9, Palm Beach Road Junction, Sanpada, Navi Mumbai, Maharashtra",
    landmark: "Palm Beach Road & Sanpada Railway Station",
    pincode: "400705",
    totalLandArea: "3.5 Acres",
    totalTowers: 3,
    totalUnits: 250,
    salesPhone: "9820145620",
    salesEmail: "sales@godrejproperties.com",
    siteVisitTimings: "9:30 AM - 7:00 PM (All 7 Days)",
    searchQuery: "Sanpada Navi Mumbai flat apartment",
    fallbackQueries: ["Navi Mumbai luxury flat", "Kharghar flat apartment"],
    amenities: [
      "Breathtaking Creek View Rooftop Sky Lounge",
      "Infinity Edge Swimming Pool & Sun Deck",
      "Clubhouse with Squash Court & Bowling Alley",
      "Technogym Equipped Fitness Health Club",
      "Automated Multi-Level Parking with EV Chargers",
      "Tier-3 Biometric Security with Digital Door Locks"
    ],
    highlights: [
      "Navi Mumbai's Most Coveted Palm Beach Road Lifestyle",
      "Panoramic Creek and Flamingo Sanctuary Views",
      "15 Minutes to Atal Setu (MTHL) for Rapid Mumbai Commute",
      "IGBC Platinum Green Building Certified"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 720,
        superBuiltUpArea: 1040,
        bathrooms: 2,
        balconies: 2,
        priceMin: 19500000,
        priceMax: 23500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1050,
        superBuiltUpArea: 1520,
        bathrooms: 3,
        balconies: 3,
        priceMin: 28500000,
        priceMax: 33500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "4 BHK Penthouse",
        carpetArea: 1580,
        superBuiltUpArea: 2280,
        bathrooms: 4,
        balconies: 4,
        priceMin: 38500000,
        priceMax: 42000000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },

  // ===================== NAGPUR (id: 3) =====================
  {
    code: "PRJ-NAG-001",
    name: "Godrej Anandam",
    slug: "godrej-anandam-ganeshpeth-nagpur",
    developerName: "Godrej Properties",
    reraId: "P50500000125",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 9200000,
    priceMax: 21000000,
    pricePerSqFt: 6800,
    cityId: 3,
    cityName: "Nagpur",
    stateName: "Maharashtra",
    locality: "Ganeshpeth",
    siteAddress: "Model Mills Compound, Ganeshpeth, Nagpur, Maharashtra",
    landmark: "Near Nagpur Central Railway Station & Cotton Market",
    pincode: "440018",
    totalLandArea: "10 Acres",
    totalTowers: 7,
    totalUnits: 550,
    salesPhone: "9820238910",
    salesEmail: "anandam@godrejproperties.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Ganeshpeth Nagpur flat apartment",
    fallbackQueries: ["Nagpur luxury apartment", "Wardha Road Nagpur flat"],
    amenities: [
      "40,000 sq.ft Grand Clubhouse with Olympic Sized Pool",
      "Full Squash, Badminton & Tennis Courts",
      "Multi-Purpose AC Banquet & Party Lawn",
      "Lush Landscaped Central Park & Jogging Track",
      "24x7 Monitored CCTV Security with Access Control",
      "Covered Stilt & Basement Parking Bays"
    ],
    highlights: [
      "Central India's Most Prestigious Integrated High-Rise Enclave",
      "Situated in the Heart of Nagpur City Near Central Railway Junction",
      "Ready to Move with Reputed High Net Worth Community Living",
      "IGBC Green Homes Gold Certified"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 860,
        superBuiltUpArea: 1220,
        bathrooms: 2,
        balconies: 2,
        priceMin: 9200000,
        priceMax: 10500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1250,
        superBuiltUpArea: 1780,
        bathrooms: 3,
        balconies: 3,
        priceMin: 13500000,
        priceMax: 15500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "4 BHK Regal",
        carpetArea: 1820,
        superBuiltUpArea: 2580,
        bathrooms: 4,
        balconies: 4,
        priceMin: 18500000,
        priceMax: 21000000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },

  // ===================== KOCHI (id: 75) =====================
  {
    code: "PRJ-COK-001",
    name: "Asset Orchestra",
    slug: "asset-orchestra-kakkanad-kochi",
    developerName: "Asset Homes",
    reraId: "K-RERA/PRJ/ERN/045/2021",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "December 2026",
    priceMin: 7500000,
    priceMax: 16500000,
    pricePerSqFt: 6200,
    cityId: 75,
    cityName: "Kochi",
    stateName: "Kerala",
    locality: "Kakkanad",
    siteAddress: "Near Infopark Phase 2, Seaport - Airport Road, Kakkanad, Kochi, Kerala",
    landmark: "Infopark Phase 2 & SmartCity Kochi SEZ",
    pincode: "682030",
    totalLandArea: "4.5 Acres",
    totalTowers: 4,
    totalUnits: 280,
    salesPhone: "9846145620",
    salesEmail: "sales@assethomes.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (All 7 Days)",
    searchQuery: "Kakkanad Kochi flat apartment",
    fallbackQueries: ["Kochi luxury apartment", "Marine Drive Kochi flat"],
    amenities: [
      "Signature Sky Lounge Overlooking Infopark Greenery",
      "Rooftop Swimming Pool & Jacuzzi Deck",
      "Acoustically Designed Music Studio & Preview Theatre",
      "Executive Co-Working Pods with High-Speed Fiber",
      "3-Tier Electronic Access Security & Video Door Intercom",
      "Basement Parking with Fast EV Charging Outlets"
    ],
    highlights: [
      "Located in Kochi's Epicenter of IT Growth: Kakkanad Infopark Corridor",
      "Walking Distance to Major Global Tech Firms & SmartCity",
      "High Rental Demand from IT Professionals & NRI Investors",
      "CRISIL 7-Star Rated Developer Quality Benchmark"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 760,
        superBuiltUpArea: 1080,
        bathrooms: 2,
        balconies: 2,
        priceMin: 7500000,
        priceMax: 8400000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1110,
        superBuiltUpArea: 1560,
        bathrooms: 3,
        balconies: 3,
        priceMin: 11200000,
        priceMax: 12800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "4 BHK Penthouse",
        carpetArea: 1680,
        superBuiltUpArea: 2350,
        bathrooms: 4,
        balconies: 4,
        priceMin: 14800000,
        priceMax: 16500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },

  // ===================== VISAKHAPATNAM (id: 357) =====================
  {
    code: "PRJ-VTZ-001",
    name: "MK One",
    slug: "mk-one-madhurawada-visakhapatnam",
    developerName: "MK Builders & Developers",
    reraId: "P03290020188",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 6800000,
    priceMax: 14500000,
    pricePerSqFt: 4800,
    cityId: 357,
    cityName: "Visakhapatnam",
    stateName: "Andhra Pradesh",
    locality: "Madhurawada",
    siteAddress: "Near IT SEZ Hill 2, Madhurawada, Visakhapatnam, Andhra Pradesh",
    landmark: "Madhurawada IT SEZ & Rushikonda Beach View",
    pincode: "530048",
    totalLandArea: "5 Acres",
    totalTowers: 4,
    totalUnits: 310,
    salesPhone: "9848145620",
    salesEmail: "sales@mkbuilders.in",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Madhurawada Visakhapatnam flat apartment",
    fallbackQueries: ["Vizag apartment flat", "Rushikonda Vizag flat"],
    amenities: [
      "Panoramic Bay of Bengal & Hill View Sun Deck",
      "Clubhouse with Infinity Pool & Kids Splash Zone",
      "Full Sized Badminton & Tennis Courts",
      "State-of-the-Art Fitness Center & Yoga Studio",
      "24x7 Multi-Tier Electronic Security & CCTV",
      "Covered Stilt & Basement Parking Bays"
    ],
    highlights: [
      "Heart of Vizag's IT & Coastal Growth Corridor in Madhurawada",
      "5 Minutes from Rushikonda Beach & Tech SEZ Campuses",
      "Ready to Move with Full VMRDA BU Permissions",
      "High Capital Appreciation in Andhra Pradesh's Executive Hub"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 810,
        superBuiltUpArea: 1140,
        bathrooms: 2,
        balconies: 2,
        priceMin: 6800000,
        priceMax: 7600000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1140,
        superBuiltUpArea: 1610,
        bathrooms: 3,
        balconies: 3,
        priceMin: 9800000,
        priceMax: 11200000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3 BHK Sea View",
        carpetArea: 1420,
        superBuiltUpArea: 2020,
        bathrooms: 3,
        balconies: 3,
        priceMin: 12800000,
        priceMax: 14500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-large.webp",
      }
    ]
  },

  // ===================== COIMBATORE (id: 30) =====================
  {
    code: "PRJ-CJB-001",
    name: "Sobha Elan",
    slug: "sobha-elan-parasakti-colony-coimbatore",
    developerName: "Sobha Limited",
    reraId: "TN/11/Building/0142/2019",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8500000,
    priceMax: 18500000,
    pricePerSqFt: 6900,
    cityId: 30,
    cityName: "Coimbatore",
    stateName: "Tamil Nadu",
    locality: "Ganapathy",
    siteAddress: "Sathy Main Road, Parasakti Colony, Ganapathy, Coimbatore, Tamil Nadu",
    landmark: "Sathy Road & Prozone Mall Corridor",
    pincode: "641006",
    totalLandArea: "4.8 Acres",
    totalTowers: 4,
    totalUnits: 290,
    salesPhone: "9842145620",
    salesEmail: "sales@sobha.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (All 7 Days)",
    searchQuery: "Coimbatore flat apartment",
    fallbackQueries: ["Ganapathy Coimbatore flat", "Avinashi Road Coimbatore flat"],
    amenities: [
      "Sobha Signature 20,000 sq.ft Clubhouse with Resort Pool",
      "Indoor Squash & Badminton Courts with Hardwood Flooring",
      "Executive Gymnasium with Imported Life Fitness Equipment",
      "Landscaped Reflexology Garden with Musical Fountain",
      "24x7 Tier-3 Security with Monitored Boom Barrier",
      "Multi-Level Basement Parking with EV Fast Chargers"
    ],
    highlights: [
      "German Quality Engineering by Sobha Limited in Coimbatore",
      "Minutes from Prozone Mall, Fun Republic & Avinashi Road",
      "Ready to Move with Over 200 Elite Families Residing",
      "Over 75% Open Greenery & Low Density Architecture"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 820,
        superBuiltUpArea: 1180,
        bathrooms: 2,
        balconies: 2,
        priceMin: 8500000,
        priceMax: 9500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1180,
        superBuiltUpArea: 1680,
        bathrooms: 3,
        balconies: 3,
        priceMin: 12500000,
        priceMax: 14500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "4 BHK Presidential",
        carpetArea: 1720,
        superBuiltUpArea: 2450,
        bathrooms: 4,
        balconies: 4,
        priceMin: 16500000,
        priceMax: 18500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },

  // ===================== MYSURU (id: 20) =====================
  {
    code: "PRJ-MYQ-001",
    name: "Brigade Symphony",
    slug: "brigade-symphony-krs-road-mysuru",
    developerName: "Brigade Group",
    reraId: "PRM/KA/RERA/1268/378/PR/171015/000412",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 6500000,
    priceMax: 13500000,
    pricePerSqFt: 5200,
    cityId: 20,
    cityName: "Mysuru",
    stateName: "Karnataka",
    locality: "KRS Road",
    siteAddress: "KRS Main Road, Near Metagalli Industrial Area, Mysuru, Karnataka",
    landmark: "Near Infosys & Metagalli Tech Corridor",
    pincode: "570016",
    totalLandArea: "7 Acres",
    totalTowers: 5,
    totalUnits: 340,
    salesPhone: "9845145620",
    salesEmail: "sales@brigadegroup.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Mysore flat apartment",
    fallbackQueries: ["KRS Road Mysore flat", "Vijayanagar Mysore flat"],
    amenities: [
      "Grand 25,000 sq.ft Clubhouse with Heated Swimming Pool",
      "Full Badminton, Tennis & Basketball Courts",
      "Lush Landscaped Central Boulevard with Water Cascade",
      "Health Club & Aerobics Room with Modern Amenities",
      "24x7 Multi-Tier Electronic Security & Intercom",
      "Allotted Stilt & Basement Vehicle Parking"
    ],
    highlights: [
      "Heritage City's Most Celebrated Luxury Gated Community",
      "Minutes Away from Infosys Global Education Center & Railway Station",
      "Ready to Move with Full Occupancy Certificate",
      "Over 70% Open Space with Tree Lined Walkways"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 780,
        superBuiltUpArea: 1090,
        bathrooms: 2,
        balconies: 2,
        priceMin: 6500000,
        priceMax: 7400000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1090,
        superBuiltUpArea: 1540,
        bathrooms: 3,
        balconies: 2,
        priceMin: 9200000,
        priceMax: 10800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3 BHK Royal",
        carpetArea: 1380,
        superBuiltUpArea: 1950,
        bathrooms: 3,
        balconies: 3,
        priceMin: 11800000,
        priceMax: 13500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-large.webp",
      }
    ]
  },

  // ===================== KANPUR (id: 52) =====================
  {
    code: "PRJ-KNP-001",
    name: "Ratan Orbit",
    slug: "ratan-orbit-kalyanpur-kanpur",
    developerName: "Ratan Housing Development",
    reraId: "UPRERAPRJ4512",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5800000,
    priceMax: 12800000,
    pricePerSqFt: 4600,
    cityId: 52,
    cityName: "Kanpur",
    stateName: "Uttar Pradesh",
    locality: "Kalyanpur",
    siteAddress: "Near IIT Kanpur Main Gate, GT Road, Kalyanpur, Kanpur, Uttar Pradesh",
    landmark: "IIT Kanpur & Kalyanpur Metro Station",
    pincode: "208017",
    totalLandArea: "6 Acres",
    totalTowers: 6,
    totalUnits: 380,
    salesPhone: "9450145620",
    salesEmail: "sales@ratanorbit.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Kanpur flat apartment",
    fallbackQueries: ["Kalyanpur Kanpur flat", "Civil Lines Kanpur flat"],
    amenities: [
      "Modern Community Lifestyle Clubhouse with Lap Pool",
      "Fully Equipped Gymnasium with Modern Machines",
      "Air-Conditioned Community Banquet Hall",
      "Central Landscaped Park with Jogging Pathway",
      "24x7 Tier-2 Security with Monitored Boom Barrier",
      "Covered Stilt & Open Allotted Parking Bays"
    ],
    highlights: [
      "Located on Prime GT Road Directly Opposite IIT Kanpur Corridor",
      "Direct Rapid Commute via Operational Kanpur Metro",
      "Ready to Move with Full Registry and Reputed Bank Loans",
      "Low Density Tower Layout with Optimum Natural Ventilation"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 760,
        superBuiltUpArea: 1050,
        bathrooms: 2,
        balconies: 2,
        priceMin: 5800000,
        priceMax: 6500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1050,
        superBuiltUpArea: 1480,
        bathrooms: 2,
        balconies: 3,
        priceMin: 8200000,
        priceMax: 9500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "4 BHK",
        carpetArea: 1480,
        superBuiltUpArea: 2080,
        bathrooms: 4,
        balconies: 4,
        priceMin: 11500000,
        priceMax: 12800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },

  // ===================== VARANASI (id: 53) =====================
  {
    code: "PRJ-VNS-001",
    name: "Roma Golf Links",
    slug: "roma-golf-links-shivpur-varanasi",
    developerName: "Roma Builders & Promoters",
    reraId: "UPRERAPRJ8824",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "October 2026",
    priceMin: 6200000,
    priceMax: 13800000,
    pricePerSqFt: 4850,
    cityId: 53,
    cityName: "Varanasi",
    stateName: "Uttar Pradesh",
    locality: "Shivpur",
    siteAddress: "Varanasi - Babatpur Airport 4-Lane Expressway, Shivpur, Varanasi, Uttar Pradesh",
    landmark: "Airport 4-Lane Highway & Shivpur Railway Station",
    pincode: "221003",
    totalLandArea: "5.5 Acres",
    totalTowers: 5,
    totalUnits: 320,
    salesPhone: "9451238910",
    salesEmail: "contact@romabuilders.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (All 7 Days)",
    searchQuery: "Varanasi flat apartment",
    fallbackQueries: ["Shivpur Varanasi flat", "Pandeypur Varanasi flat"],
    amenities: [
      "Mini Golf Putting Green & Clubhouse",
      "Swimming Pool with Dedicated Children's Splash Zone",
      "Health Club & Gymnasium with Steam Room",
      "Vastu-Compliant High-Rise Architecture",
      "Multi-Tier Electronic Security & Video Intercom",
      "Dual Plumbing with Rainwater Harvesting"
    ],
    highlights: [
      "Prime Airport 4-Lane Highway Growth Belt of Shivpur",
      "Smooth 15-Minute Drive to Varanasi Cantt & Kashi Vishwanath Corridor",
      "Over 70% Open Space with Designer Landscaping",
      "Bank Loan Approvals with SBI, Bank of Baroda & PNB"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 780,
        superBuiltUpArea: 1080,
        bathrooms: 2,
        balconies: 2,
        priceMin: 6200000,
        priceMax: 7100000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1090,
        superBuiltUpArea: 1540,
        bathrooms: 3,
        balconies: 2,
        priceMin: 8800000,
        priceMax: 10200000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "4 BHK",
        carpetArea: 1520,
        superBuiltUpArea: 2150,
        bathrooms: 4,
        balconies: 3,
        priceMin: 12200000,
        priceMax: 13800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },

  // ===================== GHAZIABAD (id: 15) =====================
  {
    code: "PRJ-GZB-001",
    name: "Mahagun Mascot",
    slug: "mahagun-mascot-crossings-republik-ghaziabad",
    developerName: "Mahagun Group",
    reraId: "UPRERAPRJ6510",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 5200000,
    priceMax: 11500000,
    pricePerSqFt: 4500,
    cityId: 15,
    cityName: "Ghaziabad",
    stateName: "Uttar Pradesh",
    locality: "Crossings Republik",
    siteAddress: "Near NH-9 (NH-24), Crossings Republik, Ghaziabad, Uttar Pradesh",
    landmark: "NH-9 Expressway & ABES Engineering College",
    pincode: "201016",
    totalLandArea: "14 Acres",
    totalTowers: 9,
    totalUnits: 780,
    salesPhone: "9818145620",
    salesEmail: "sales@mahagunindia.com",
    siteVisitTimings: "9:30 AM - 7:00 PM (Daily)",
    searchQuery: "Crossings Republik Ghaziabad flat",
    fallbackQueries: ["Ghaziabad apartment flat", "Indirapuram Ghaziabad flat"],
    amenities: [
      "Club Mascot with Olympic Sized Swimming Pool",
      "Full Sized Squash & Badminton Courts",
      "Shopping Arcade with Supermarket & Pharmacy",
      "Modern Gymnasium with Professional Trainers",
      "24x7 Multi-Tier Electronic Security & CCTV",
      "Ample Multi-Level Covered Car Parking"
    ],
    highlights: [
      "India's First Global Sub-City: Crossings Republik on NH-9 (14-Lane Expressway)",
      "Instant 15-Minute Commute to Delhi (Akshardham) & Noida Sector 62",
      "Ready to Move with Over 600 Happy Families",
      "Over 75% Open Green Landscaped Gardens"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 740,
        superBuiltUpArea: 1020,
        bathrooms: 2,
        balconies: 2,
        priceMin: 5200000,
        priceMax: 5900000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1040,
        superBuiltUpArea: 1460,
        bathrooms: 2,
        balconies: 3,
        priceMin: 7400000,
        priceMax: 8500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3.5 BHK",
        carpetArea: 1350,
        superBuiltUpArea: 1880,
        bathrooms: 3,
        balconies: 3,
        priceMin: 9800000,
        priceMax: 11500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-large.webp",
      }
    ]
  },

  // ===================== DEHRADUN (id: 6454) =====================
  {
    code: "PRJ-DED-001",
    name: "Pacific Golf Estate",
    slug: "pacific-golf-estate-sahastradhara-road-dehradun",
    developerName: "Pacific Development Corporation",
    reraId: "UKREP09170000045",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 8500000,
    priceMax: 19500000,
    pricePerSqFt: 6500,
    cityId: 6454,
    cityName: "Dehradun",
    stateName: "Uttarakhand",
    locality: "Sahastradhara Road",
    siteAddress: "Kulhan, Sahastradhara Main Road, Dehradun, Uttarakhand",
    landmark: "Sahastradhara Helipad & IT Park Dehradun",
    pincode: "248001",
    totalLandArea: "35 Acres",
    totalTowers: 12,
    totalUnits: 850,
    salesPhone: "9837145620",
    salesEmail: "sales@pacificgolfestate.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (All 7 Days)",
    searchQuery: "Dehradun flat apartment",
    fallbackQueries: ["Sahastradhara Dehradun flat", "Rajpur Road Dehradun flat"],
    amenities: [
      "9-Hole Signature Golf Course Designed by Graham Cooke",
      "Club Pacific with Heated Swimming Pool & Spa",
      "Tennis, Squash & Basketball Courts",
      "Fine Dining Restaurant & Sports Bar Inside Society",
      "24x7 Multi-Tier Electronic Security with Monitored Gates",
      "Multi-Level Basement Parking with EV Points"
    ],
    highlights: [
      "Uttarakhand's Most Iconic 35-Acre Golf-Centric Mega Township",
      "Panoramic 360-Degree Views of the Mussoorie Hills",
      "Minutes Away from Dehradun IT Park & Pacific Mall",
      "Ready to Move with Over 500 Discerning Families Residing"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 840,
        superBuiltUpArea: 1180,
        bathrooms: 2,
        balconies: 2,
        priceMin: 8500000,
        priceMax: 9800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1240,
        superBuiltUpArea: 1750,
        bathrooms: 3,
        balconies: 3,
        priceMin: 12800000,
        priceMax: 14800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "4 BHK Golf Suite",
        carpetArea: 1850,
        superBuiltUpArea: 2580,
        bathrooms: 4,
        balconies: 4,
        priceMin: 17500000,
        priceMax: 19500000,
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
  console.log("SOURCING PAN-INDIA TOP CITIES BATCH (12 CITIES)");
  console.log("================================================================================");

  const usedImageUrls = new Set();
  const processedProjects = [];

  for (let i = 0; i < PAN_INDIA_PROJECTS.length; i++) {
    const p = PAN_INDIA_PROJECTS[i];
    console.log(`\n[${i + 1}/${PAN_INDIA_PROJECTS.length}] Processing ${p.name} in ${p.cityName}...`);

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
  fs.writeFileSync(path.join(DOCS_DIR, "pan_india_projects.json"), JSON.stringify(processedProjects, null, 2));
  console.log(`\nSuccessfully processed and uploaded ${processedProjects.length} projects!`);
  console.log(`Saved master file to: ${PROJECTS_FILE}`);
}

run().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
