import fs from "fs";
import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand } from "/Users/vinaykumar/Desktop/myProjects/awasio-backend/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";

const BASE_DIR = "/Users/vinaykumar/Desktop/awasio-sourced-properties";
const PROJECT_IMAGES_DIR = path.join(BASE_DIR, "bihar_project_images");
const PROJECTS_FILE = path.join(BASE_DIR, "bihar_projects.json");
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

// 11 Flagship Projects for Bihar's Top Cities
const BIHAR_PROJECTS = [
  // ===================== PATNA (id: 63) =====================
  {
    code: "PRJ-PAT-001",
    name: "Mundeshwari Megapolis",
    slug: "mundeshwari-megapolis-danapur-patna",
    developerName: "Mundeshwari Group",
    reraId: "BRERAP00012/2019",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 7800000,
    priceMax: 14500000,
    pricePerSqFt: 4900,
    cityId: 63,
    cityName: "Patna",
    stateName: "Bihar",
    locality: "Danapur",
    siteAddress: "Khagaul - Danapur Station Main Road, Danapur, Patna, Bihar",
    landmark: "Near Danapur Railway Junction & Saguna More",
    pincode: "801503",
    totalLandArea: "6.5 Acres",
    totalTowers: 6,
    totalUnits: 420,
    salesPhone: "9431012345",
    salesEmail: "sales@mundeshwarigroup.com",
    siteVisitTimings: "9:00 AM - 7:00 PM (All 7 Days)",
    searchQuery: "Danapur Patna flat apartment",
    fallbackQueries: ["Patna Saguna More apartment flat", "Patna Bailey Road flat"],
    amenities: [
      "Grand Air-Conditioned Community Clubhouse",
      "Half Olympic Size Swimming Pool & Kids Splash Pool",
      "Full Badminton & Squash Courts",
      "Fully Equipped Gymnasium with Modern Cardio Equipment",
      "Lush Landscaped Gardens with Walking Tracks",
      "24x7 Multi-Tier Electronic Security & CCTV",
      "Multi-Level Basement Parking with EV Points",
      "100% Automatic Generator Power Backup"
    ],
    highlights: [
      "Patna's Most Sought-After Gated Township on Danapur Corridor",
      "Over 70% Open Space with Tree Lined Avenues",
      "Walking Distance to Danapur Railway Junction & Metro Line",
      "Approved by State Bank of India, HDFC, and ICICI Bank"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 760,
        superBuiltUpArea: 1050,
        bathrooms: 2,
        balconies: 2,
        priceMin: 7800000,
        priceMax: 8500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1110,
        superBuiltUpArea: 1510,
        bathrooms: 3,
        balconies: 3,
        priceMin: 10500000,
        priceMax: 11800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "4 BHK",
        carpetArea: 1680,
        superBuiltUpArea: 2240,
        bathrooms: 4,
        balconies: 4,
        priceMin: 13500000,
        priceMax: 14500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },
  {
    code: "PRJ-PAT-002",
    name: "Chandra Kamla Binay Apartment",
    slug: "chandra-kamla-binay-apartment-boring-road-patna",
    developerName: "Chandra Construction Pvt Ltd",
    reraId: "BRERAP00485/2021",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "December 2026",
    priceMin: 9500000,
    priceMax: 22000000,
    pricePerSqFt: 6800,
    cityId: 63,
    cityName: "Patna",
    stateName: "Bihar",
    locality: "Boring Road",
    siteAddress: "Boring Canal Road, Near Panchmukhi Mandir, Boring Road, Patna, Bihar",
    landmark: "Panchmukhi Hanuman Mandir & Boring Canal Road",
    pincode: "800001",
    totalLandArea: "3 Acres",
    totalTowers: 3,
    totalUnits: 150,
    salesPhone: "9431024567",
    salesEmail: "inquiries@chandrakamla.com",
    siteVisitTimings: "9:30 AM - 6:30 PM (Daily)",
    searchQuery: "Boring Road Patna flat apartment",
    fallbackQueries: ["Patna Bailey Road luxury flat", "Patna residential apartment"],
    amenities: [
      "Signature Sky Deck with Open Air Seating",
      "State-of-the-Art Health Club & Yoga Studio",
      "High-Speed Automatic Elevators with ARD",
      "Grand Double-Height Entrance Lobby",
      "Biometric Access & Video Door Phone in All Flats",
      "Solar Water Heating & Rainwater Harvesting",
      "Dedicated Covered Parking Bays"
    ],
    highlights: [
      "Ultra-Prime Boring Road Heart-of-the-City Address",
      "Minutes from Premier Schools, Multi-Speciality Clinics & Malls",
      "Boutique Low-Density Living with Superior Privacy",
      "High Capital Appreciation & Strong Rental Yield"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 710,
        superBuiltUpArea: 980,
        bathrooms: 2,
        balconies: 2,
        priceMin: 9500000,
        priceMax: 10500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 1080,
        superBuiltUpArea: 1480,
        bathrooms: 3,
        balconies: 3,
        priceMin: 14200000,
        priceMax: 15500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "4 BHK",
        carpetArea: 1720,
        superBuiltUpArea: 2250,
        bathrooms: 4,
        balconies: 4,
        priceMin: 19500000,
        priceMax: 22000000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },

  // ===================== GAYA (id: 64) =====================
  {
    code: "PRJ-GAY-001",
    name: "Haywood Heights",
    slug: "haywood-heights-dobhi-road-gaya",
    developerName: "Haywood Infratech Pvt Ltd",
    reraId: "BRERAP01124/2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 3800000,
    priceMax: 7200000,
    pricePerSqFt: 3200,
    cityId: 64,
    cityName: "Gaya",
    stateName: "Bihar",
    locality: "Gaya - Dobhi Road",
    siteAddress: "NH-83 Gaya - Dobhi 4-Lane Highway, Near International Airport, Gaya, Bihar",
    landmark: "Gaya International Airport Corridor",
    pincode: "823001",
    totalLandArea: "4.5 Acres",
    totalTowers: 4,
    totalUnits: 220,
    salesPhone: "9431215430",
    salesEmail: "info@haywoodheights.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Gaya Bihar flat apartment",
    fallbackQueries: ["Bodh Gaya flat apartment", "Patna flat apartment"],
    amenities: [
      "Community Activity Hall & Celebration Lawn",
      "Modern Gymnasium & Indoor Games Zone",
      "Landscaped Children Play Park",
      "High-Speed Automatic Lifts with Backup",
      "24-Hour Sweet Groundwater Supply & Dual Piping",
      "24x7 Guarded Security with CCTV Surveillance",
      "Ample Open & Covered Car Parking"
    ],
    highlights: [
      "Strategic Position on 4-Lane Gaya-Dobhi Highway Corridor",
      "Just 10 Minutes from Gaya Airport & Bodh Gaya World Heritage Site",
      "Ready to Move with Full Registry and Electricity Connections",
      "Attractive Investment Potential Driven by International Tourism"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 650,
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
        superBuiltUpArea: 1280,
        bathrooms: 2,
        balconies: 2,
        priceMin: 5200000,
        priceMax: 5800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3 BHK Deluxe",
        carpetArea: 1180,
        superBuiltUpArea: 1580,
        bathrooms: 3,
        balconies: 3,
        priceMin: 6400000,
        priceMax: 7200000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-large.webp",
      }
    ]
  },
  {
    code: "PRJ-GAY-002",
    name: "Pashupati Leela Enclave",
    slug: "pashupati-leela-enclave-ap-colony-gaya",
    developerName: "Pashupati Developers",
    reraId: "BRERAP01489/2022",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "October 2026",
    priceMin: 3400000,
    priceMax: 6200000,
    pricePerSqFt: 2950,
    cityId: 64,
    cityName: "Gaya",
    stateName: "Bihar",
    locality: "AP Colony",
    siteAddress: "Chandauti Main Road, AP Colony Extension, Gaya, Bihar",
    landmark: "Near Army Cantonment & AP Colony Market",
    pincode: "823001",
    totalLandArea: "2.8 Acres",
    totalTowers: 3,
    totalUnits: 135,
    salesPhone: "9431238910",
    salesEmail: "sales@pashupatileela.com",
    siteVisitTimings: "9:00 AM - 6:00 PM (Monday - Sunday)",
    searchQuery: "AP Colony Gaya flat apartment",
    fallbackQueries: ["Chandauti Gaya flat", "Patna Danapur apartment"],
    amenities: [
      "Vastu Compliant High-Rise Architecture",
      "Clubhouse with Fitness Center",
      "Dedicated Senior Citizen Seating Gazebo",
      "Rainwater Harvesting System",
      "Intercom Facility from Security Gate",
      "Reserved Stilt Parking for Residents"
    ],
    highlights: [
      "Situated in Gaya's Most Prestigious AP Colony Residential Belt",
      "Safe and Secure Neighborhood Adjacent to Army Cantonment",
      "Smooth Connectivity to Gaya Railway Junction & Market Hubs",
      "Flexible Construction Linked Payment Schedule"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 610,
        superBuiltUpArea: 820,
        bathrooms: 2,
        balconies: 1,
        priceMin: 3400000,
        priceMax: 3800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 880,
        superBuiltUpArea: 1180,
        bathrooms: 2,
        balconies: 2,
        priceMin: 4600000,
        priceMax: 5200000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3 BHK Grand",
        carpetArea: 1090,
        superBuiltUpArea: 1450,
        bathrooms: 3,
        balconies: 3,
        priceMin: 5500000,
        priceMax: 6200000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-large.webp",
      }
    ]
  },

  // ===================== MUZAFFARPUR (id: 689) =====================
  {
    code: "PRJ-MFP-001",
    name: "Malhotra J S Abode",
    slug: "malhotra-j-s-abode-bela-road-muzaffarpur",
    developerName: "Malhotra Builders & Developers",
    reraId: "BRERAP00876/2021",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "March 2027",
    priceMin: 4200000,
    priceMax: 8500000,
    pricePerSqFt: 3450,
    cityId: 689,
    cityName: "Muzaffarpur",
    stateName: "Bihar",
    locality: "Bela Road",
    siteAddress: "Musahri Industrial Area Road, Bela Road, Muzaffarpur, Bihar",
    landmark: "Bela Industrial Area & NH-28 Bypass",
    pincode: "842002",
    totalLandArea: "4.2 Acres",
    totalTowers: 4,
    totalUnits: 200,
    salesPhone: "9431422340",
    salesEmail: "sales@malhotraabode.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (All 7 Days)",
    searchQuery: "Muzaffarpur flat apartment",
    fallbackQueries: ["Mithanpura Muzaffarpur flat", "Patna flat apartment"],
    amenities: [
      "Modern Community Clubhouse with Table Tennis & Billiards",
      "Fully Outfitted Fitness Center & Aerobics Room",
      "Swimming Pool with Dedicated Sun Deck",
      "Central Green Park with Jogging Pathway",
      "Automatic Passenger & Stretcher Lifts with Power Backup",
      "24x7 Gated Compound Security with Monitored Boom Barriers"
    ],
    highlights: [
      "North Bihar's Premier Gated Lifestyle Community",
      "Direct Proximity to NH-28 Highway Corridor and Bela Commercial Hub",
      "Spacious 3-Side Open Flats with Optimal Cross Ventilation",
      "Pre-Approved Home Loans with SBI, Bank of Baroda & PNB"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 690,
        superBuiltUpArea: 920,
        bathrooms: 2,
        balconies: 2,
        priceMin: 4200000,
        priceMax: 4700000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 990,
        superBuiltUpArea: 1340,
        bathrooms: 2,
        balconies: 3,
        priceMin: 5800000,
        priceMax: 6500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "4 BHK",
        carpetArea: 1390,
        superBuiltUpArea: 1850,
        bathrooms: 4,
        balconies: 4,
        priceMin: 7500000,
        priceMax: 8500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },
  {
    code: "PRJ-MFP-002",
    name: "Chandra Raj Prabha",
    slug: "chandra-raj-prabha-mithanpura-muzaffarpur",
    developerName: "Chandra Projects Muzaffarpur",
    reraId: "BRERAP00712/2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 3600000,
    priceMax: 6800000,
    pricePerSqFt: 3100,
    cityId: 689,
    cityName: "Muzaffarpur",
    stateName: "Bihar",
    locality: "Mithanpura",
    siteAddress: "Club Road, Mithanpura, Muzaffarpur, Bihar",
    landmark: "Near Mithanpura Chowk & City Club",
    pincode: "842002",
    totalLandArea: "2.5 Acres",
    totalTowers: 2,
    totalUnits: 110,
    salesPhone: "9431435670",
    salesEmail: "contact@chandrarajprabha.com",
    siteVisitTimings: "9:30 AM - 6:00 PM (Daily)",
    searchQuery: "Mithanpura Muzaffarpur apartment flat",
    fallbackQueries: ["Muzaffarpur house flat", "Patna residential flat"],
    amenities: [
      "AC Banquet Space for Family Celebrations",
      "Gymnasium & Yoga Terrace",
      "High-Speed Automatic Lifts",
      "Round-the-Clock Security Surveillance",
      "Uninterrupted Power Backup for Elevators & Water Pumps",
      "Covered Stilt Vehicle Parking"
    ],
    highlights: [
      "Prime Central Location in Muzaffarpur's Most Desirable Mithanpura",
      "Walking Distance to Leading Coaching Hubs, Banks & Markets",
      "Immediate Possession with Clean Ownership Registry",
      "Earthquake Resistant RCC Structural Design"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 640,
        superBuiltUpArea: 860,
        bathrooms: 2,
        balconies: 1,
        priceMin: 3600000,
        priceMax: 4000000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 910,
        superBuiltUpArea: 1220,
        bathrooms: 2,
        balconies: 2,
        priceMin: 4900000,
        priceMax: 5500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3 BHK Premium",
        carpetArea: 1140,
        superBuiltUpArea: 1520,
        bathrooms: 3,
        balconies: 3,
        priceMin: 6000000,
        priceMax: 6800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-large.webp",
      }
    ]
  },

  // ===================== BHAGALPUR (id: 65) =====================
  {
    code: "PRJ-BGP-001",
    name: "Ram Gita Aastha Life Style City",
    slug: "ram-gita-aastha-life-style-city-adampur-bhagalpur",
    developerName: "Aastha Lifestyle Infratech",
    reraId: "BRERAP00945/2021",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 3800000,
    priceMax: 7500000,
    pricePerSqFt: 3300,
    cityId: 65,
    cityName: "Bhagalpur",
    stateName: "Bihar",
    locality: "Adampur",
    siteAddress: "Nilkanth Nagar Main Road, Adampur, Bhagalpur, Bihar",
    landmark: "Near Tilkamanjhi Chowk & Sandis Compound",
    pincode: "812001",
    totalLandArea: "3.8 Acres",
    totalTowers: 4,
    totalUnits: 190,
    salesPhone: "9431612450",
    salesEmail: "contact@aasthalifestylebhagalpur.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Bhagalpur flat apartment",
    fallbackQueries: ["Adampur Bhagalpur flat", "Patna flat apartment"],
    amenities: [
      "Modern Community Lifestyle Club",
      "Gymnasium & Cardio Fitness Studio",
      "Open Green Lawns & Senior Citizen Seating",
      "Children Play Area with Modern Equipment",
      "24x7 Guarded Security with Multi-Floor CCTV",
      "Continuous Deep Borewell Filtered Water Supply"
    ],
    highlights: [
      "Silk City's Landmark Modern Lifestyle Residential Enclave",
      "Centrally Positioned in Elite Adampur Educational Belt",
      "Minutes Away from Sandis Compound Sports Arena & JLNMCH",
      "Bank Home Loans Available with Up to 85% Financing"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 670,
        superBuiltUpArea: 890,
        bathrooms: 2,
        balconies: 2,
        priceMin: 3800000,
        priceMax: 4300000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 960,
        superBuiltUpArea: 1290,
        bathrooms: 2,
        balconies: 3,
        priceMin: 5400000,
        priceMax: 6200000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3.5 BHK",
        carpetArea: 1260,
        superBuiltUpArea: 1680,
        bathrooms: 3,
        balconies: 3,
        priceMin: 6800000,
        priceMax: 7500000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },
  {
    code: "PRJ-BGP-002",
    name: "Chandreshwar Apartment",
    slug: "chandreshwar-apartment-zero-mile-bhagalpur",
    developerName: "Chandreshwar Builders",
    reraId: "BRERAP01088/2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 3200000,
    priceMax: 5800000,
    pricePerSqFt: 2900,
    cityId: 65,
    cityName: "Bhagalpur",
    stateName: "Bihar",
    locality: "Zero Mile",
    siteAddress: "Vikramshila Setu Road, Near Zero Mile Chowk, Bhagalpur, Bihar",
    landmark: "Zero Mile Chowk & Vikramshila Setu Access",
    pincode: "812001",
    totalLandArea: "2.2 Acres",
    totalTowers: 2,
    totalUnits: 96,
    salesPhone: "9431633780",
    salesEmail: "sales@chandreshwarapartment.com",
    siteVisitTimings: "9:30 AM - 6:00 PM (Monday - Sunday)",
    searchQuery: "Zero Mile Bhagalpur flat",
    fallbackQueries: ["Bhagalpur apartment flat", "Gaya apartment flat"],
    amenities: [
      "Community Activity Hall",
      "Automatic High-Speed Passenger Elevator",
      "24x7 Water Supply from Deep Tube Wells",
      "Complete CCTV Surveillance Across Common Areas",
      "Reserved Stilt Vehicle Parking",
      "Fire Fighting Safety Infrastructure"
    ],
    highlights: [
      "Direct Strategic Access to Vikramshila Setu & NH-80",
      "Ready to Move with Full Completion Certificate",
      "Low Monthly Maintenance Overhead for Residents",
      "Close Proximity to Engineering College & ITI Bhagalpur"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 610,
        superBuiltUpArea: 810,
        bathrooms: 2,
        balconies: 1,
        priceMin: 3200000,
        priceMax: 3600000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 860,
        superBuiltUpArea: 1150,
        bathrooms: 2,
        balconies: 2,
        priceMin: 4400000,
        priceMax: 4900000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3 BHK Royal",
        carpetArea: 1040,
        superBuiltUpArea: 1380,
        bathrooms: 3,
        balconies: 3,
        priceMin: 5200000,
        priceMax: 5800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-large.webp",
      }
    ]
  },

  // ===================== DARBHANGA (id: 615) =====================
  {
    code: "PRJ-DBG-001",
    name: "KKT Veena Vatika",
    slug: "kkt-veena-vatika-basdeopur-darbhanga",
    developerName: "KKT Infratech Pvt Ltd",
    reraId: "BRERAP01235/2021",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "August 2026",
    priceMin: 3500000,
    priceMax: 6800000,
    pricePerSqFt: 3150,
    cityId: 615,
    cityName: "Darbhanga",
    stateName: "Bihar",
    locality: "Basdeopur",
    siteAddress: "Dilli More Bypass Road, Basdeopur, Darbhanga, Bihar",
    landmark: "Dilli More Chowk & Darbhanga Airport Corridor",
    pincode: "846004",
    totalLandArea: "3.5 Acres",
    totalTowers: 3,
    totalUnits: 160,
    salesPhone: "9431718920",
    salesEmail: "info@kktveenavatika.com",
    siteVisitTimings: "9:00 AM - 6:30 PM (Daily)",
    searchQuery: "Darbhanga flat apartment",
    fallbackQueries: ["Basdeopur Darbhanga flat", "Muzaffarpur apartment flat"],
    amenities: [
      "Clubhouse with Indoor Badminton Court & Gym",
      "Celebration Banquet Hall for Community Gatherings",
      "Landscaped Children Play Arena",
      "High-Speed Automatic Lifts with ARD Battery Backup",
      "Round-the-Clock CCTV Monitored Security",
      "Spacious Covered Stilt Car Parking Bays"
    ],
    highlights: [
      "Darbhanga's Most Prominent Integrated High-Rise Society",
      "Quick 10-Minute Access to Darbhanga Airport & DMCH",
      "Wide 40-ft Paved Approach Road Directly from Highway",
      "Vastu-Compliant Apartments with Modern Modular Kitchens"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 640,
        superBuiltUpArea: 850,
        bathrooms: 2,
        balconies: 1,
        priceMin: 3500000,
        priceMax: 3900000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 940,
        superBuiltUpArea: 1250,
        bathrooms: 2,
        balconies: 2,
        priceMin: 5000000,
        priceMax: 5600000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3 BHK Deluxe",
        carpetArea: 1160,
        superBuiltUpArea: 1550,
        bathrooms: 3,
        balconies: 3,
        priceMin: 6200000,
        priceMax: 6800000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-large.webp",
      }
    ]
  },

  // ===================== PURNIA (id: 708) =====================
  {
    code: "PRJ-PRN-001",
    name: "E Homes Panorama",
    slug: "e-homes-panorama-belauri-purnia",
    developerName: "Panorama Group Bihar",
    reraId: "BRERAP00689/2020",
    reraStatus: "VERIFIED",
    status: "READY_TO_MOVE",
    possessionDate: "Ready to Move",
    priceMin: 3900000,
    priceMax: 8200000,
    pricePerSqFt: 3350,
    cityId: 708,
    cityName: "Purnia",
    stateName: "Bihar",
    locality: "Belauri",
    siteAddress: "Purnia - Katihar National Highway, Belauri, Purnia, Bihar",
    landmark: "Near Belauri Chowk & Gulabbagh Mandi",
    pincode: "854301",
    totalLandArea: "8 Acres",
    totalTowers: 6,
    totalUnits: 350,
    salesPhone: "9431814520",
    salesEmail: "contact@panoramagrouppurnia.com",
    siteVisitTimings: "9:00 AM - 7:00 PM (All Days)",
    searchQuery: "Purnia flat apartment",
    fallbackQueries: ["Belauri Purnia flat", "Bhagalpur residential flat"],
    amenities: [
      "Grand Panorama Club with Swimming Pool",
      "Multi-Purpose Sports Court for Badminton & Basketball",
      "Fully Equipped Health Club & Gymnasium",
      "Jogging Tracks & Beautiful Landscaped Gardens",
      "Commercial Shopping Arcade with Daily Needs Store",
      "24x7 Multi-Tier Security with Electronic Gate Passes"
    ],
    highlights: [
      "Seemanchal Region's Largest Gated Township Development",
      "Over 65% Open Greenery & Broad Tree-Lined Avenues",
      "Direct Highway Frontage on Purnia-Katihar Corridor",
      "Over 250 Residing Families with Active RWA Society"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 680,
        superBuiltUpArea: 900,
        bathrooms: 2,
        balconies: 2,
        priceMin: 3900000,
        priceMax: 4400000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/2bhk-compact.webp",
      },
      {
        bhkType: "3 BHK",
        carpetArea: 990,
        superBuiltUpArea: 1320,
        bathrooms: 2,
        balconies: 3,
        priceMin: 5600000,
        priceMax: 6400000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "4 BHK Villa/Apt",
        carpetArea: 1460,
        superBuiltUpArea: 1950,
        bathrooms: 4,
        balconies: 4,
        priceMin: 7400000,
        priceMax: 8200000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/4bhk-luxury.webp",
      }
    ]
  },
  {
    code: "PRJ-PRN-002",
    name: "Vikramshila Tejprabha Residency",
    slug: "vikramshila-tejprabha-residency-bhatta-bazar-purnia",
    developerName: "Vikramshila Developers",
    reraId: "BRERAP01314/2022",
    reraStatus: "VERIFIED",
    status: "UNDER_CONSTRUCTION",
    possessionDate: "November 2026",
    priceMin: 3200000,
    priceMax: 5900000,
    pricePerSqFt: 2950,
    cityId: 708,
    cityName: "Purnia",
    stateName: "Bihar",
    locality: "Bhatta Bazar",
    siteAddress: "Lalganj Main Road, Bhatta Bazar, Purnia, Bihar",
    landmark: "Near Bhatta Bazar Retail Market & Line Bazar",
    pincode: "854301",
    totalLandArea: "2 Acres",
    totalTowers: 2,
    totalUnits: 90,
    salesPhone: "9431835610",
    salesEmail: "sales@tejprabharesidency.com",
    siteVisitTimings: "9:30 AM - 6:00 PM (Daily)",
    searchQuery: "Bhatta Bazar Purnia flat",
    fallbackQueries: ["Lalganj Purnia apartment", "Patna Danapur apartment"],
    amenities: [
      "Community Activity Hall",
      "Gymnasium & Cardio Area",
      "Modern Automatic Elevators with Battery Rescue",
      "Round-the-Clock CCTV Security",
      "Dedicated Covered Parking Bays",
      "Rainwater Harvesting System"
    ],
    highlights: [
      "Located in Heart of Purnia's Core Retail & Medical Zone",
      "Walking Distance to Renowned Schools, Clinics & Line Bazar",
      "Vastu-Compliant Architecture with Wide Balconies",
      "Affordable Pricing with Easy Construction-Linked Payment"
    ],
    configurations: [
      {
        bhkType: "2 BHK",
        carpetArea: 620,
        superBuiltUpArea: 820,
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
        priceMin: 4500000,
        priceMax: 5000000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-standard.webp",
      },
      {
        bhkType: "3 BHK Royal",
        carpetArea: 1070,
        superBuiltUpArea: 1420,
        bathrooms: 3,
        balconies: 3,
        priceMin: 5300000,
        priceMax: 5900000,
        floorPlanImage: "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/floorplans/3bhk-large.webp",
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
  console.log("SOURCING BIHAR PROJECTS: PATNA, GAYA, MUZAFFARPUR, BHAGALPUR, DARBHANGA, PURNIA");
  console.log("================================================================================");

  const usedImageUrls = new Set();
  const processedProjects = [];

  for (let i = 0; i < BIHAR_PROJECTS.length; i++) {
    const p = BIHAR_PROJECTS[i];
    console.log(`\n[${i + 1}/${BIHAR_PROJECTS.length}] Processing ${p.name} in ${p.cityName}...`);

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
  fs.writeFileSync(path.join(DOCS_DIR, "bihar_projects.json"), JSON.stringify(processedProjects, null, 2));
  console.log(`\nSuccessfully processed and uploaded ${processedProjects.length} Bihar projects!`);
  console.log(`Saved master file to: ${PROJECTS_FILE}`);
}

run().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
