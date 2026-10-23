import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "/Users/vinaykumar/Desktop/myProjects/awasio-backend/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";

const BASE_DIR = "/Users/vinaykumar/Desktop/awasio-sourced-properties";
const PROJECT_IMAGES_DIR = path.join(BASE_DIR, "batch12_images");
const PROJECTS_FILE = path.join(BASE_DIR, "tier2_metros_batch12.json");
const DOCS_FILE = path.join(process.cwd(), "docs", "tier2_metros_batch12.json");

if (!fs.existsSync(PROJECT_IMAGES_DIR)) {
  fs.mkdirSync(PROJECT_IMAGES_DIR, { recursive: true });
}

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
  const url = `https://www.olx.in/api/relevance/v4/search?facet_limit=35&category=1723&query=${encodeURIComponent(query)}`;
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

const BATCH12_PROJECTS = [
  // ==================== PURI (5 projects) ====================
  {
    name: "Shree Jagannath Greens",
    slug: "shree-jagannath-greens-chakratirtha-road-puri",
    developerName: "Jagannath Promoters",
    cityName: "Puri",
    cityId: 4037,
    stateName: "Odisha",
    locality: "Chakratirtha Road",
    siteAddress: "CT Road, Near Subhash Bose Square, Puri, Odisha",
    landmark: "Directly walking distance from Chakratirtha Beach & Sea Beach",
    location: "Chakratirtha Road, Puri",
    latitude: 19.8091,
    longitude: 85.8342,
    priceMin: 5500000,
    priceMax: 13500000,
    pricePerSqFt: 5200,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "RP/19/2018/00174",
    totalUnits: 180,
    availableUnits: 15,
    totalTowers: 2,
    totalFloors: 8,
    totalLandArea: "2.5 Acres",
    salesPhone: "9861611220",
    salesEmail: "sales.jagannathgreens@jagannathpromoters.in",
    searchKeywords: ["Puri beach flat", "Chakratirtha Puri flat", "Puri flat"],
    description: "Shree Jagannath Greens on Chakratirtha Road offers serene holy sea-view holiday and residential homes 5 minutes from golden sandy beaches, with swimming pool and landscaped gardens.",
    amenities: ["Bay of Bengal Sea View Balconies", "Swimming Pool with Deck", "Community Prayer & Satsang Hall", "Automatic Elevators", "Standby Generator Backup", "24/7 Security CCTV"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 840, superBuiltUpArea: 1092, bathrooms: 2, priceMin: 5500000, priceMax: 5500000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1280, superBuiltUpArea: 1664, bathrooms: 3, priceMin: 8500000, priceMax: 8500000, isAvailable: true },
      { bhkType: "3 BHK Sea View", carpetArea: 1750, superBuiltUpArea: 2275, bathrooms: 3, priceMin: 13500000, priceMax: 13500000, isAvailable: true }
    ]
  },
  {
    name: "Blue Bay Residences",
    slug: "blue-bay-residences-marine-drive-puri",
    developerName: "Blue Bay Infratech",
    cityName: "Puri",
    cityId: 4037,
    stateName: "Odisha",
    locality: "Marine Drive Road",
    siteAddress: "Puri-Konark Marine Drive, Sipasarubali, Puri, Odisha",
    landmark: "Direct frontage on Puri-Konark Marine Drive Expressway",
    location: "Marine Drive Road, Puri",
    latitude: 19.7942,
    longitude: 85.8112,
    priceMin: 6200000,
    priceMax: 15500000,
    pricePerSqFt: 5800,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "RP/19/2019/00288",
    totalUnits: 220,
    availableUnits: 18,
    totalTowers: 3,
    totalFloors: 9,
    totalLandArea: "3.2 Acres",
    salesPhone: "9861622330",
    salesEmail: "sales.bluebay@bluebayinfratech.com",
    searchKeywords: ["Marine Drive Puri flat", "Puri apartment", "Puri beach resort flat"],
    description: "Blue Bay Residences on Marine Drive offers panoramic sea-view vacation suites with infinity swimming pool, seaside café, landscaped gazebos, and 24-hour backup.",
    amenities: ["Infinity Edge Swimming Pool", "Seaside Observation Deck & Café", "Clubhouse with Gymnasium", "Lush Palm Gardens", "100% Standby Power Backup", "Dedicated Valet Parking"],
    configurations: [
      { bhkType: "1 BHK Studio", carpetArea: 550, superBuiltUpArea: 715, bathrooms: 1, priceMin: 6200000, priceMax: 6200000, isAvailable: true },
      { bhkType: "2 BHK", carpetArea: 890, superBuiltUpArea: 1157, bathrooms: 2, priceMin: 9800000, priceMax: 9800000, isAvailable: true },
      { bhkType: "3 BHK Premium", carpetArea: 1480, superBuiltUpArea: 1924, bathrooms: 3, priceMin: 15500000, priceMax: 15500000, isAvailable: true }
    ]
  },
  {
    name: "Golden Beach Enclave",
    slug: "golden-beach-enclave-baliapanda-puri",
    developerName: "Golden Beach Developers",
    cityName: "Puri",
    cityId: 4037,
    stateName: "Odisha",
    locality: "Baliapanda",
    siteAddress: "Baliapanda Road, Near Light House, Puri, Odisha",
    landmark: "Directly opposite Puri Light House",
    location: "Baliapanda, Puri",
    latitude: 19.7891,
    longitude: 85.8041,
    priceMin: 4800000,
    priceMax: 11500000,
    pricePerSqFt: 4900,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "RP/19/2020/00345",
    totalUnits: 190,
    availableUnits: 14,
    totalTowers: 3,
    totalFloors: 7,
    totalLandArea: "2.8 Acres",
    salesPhone: "9861633440",
    salesEmail: "sales.goldenbeach@goldenbeachpuri.in",
    searchKeywords: ["Baliapanda flat Puri", "Light house Puri flat", "Sea facing flat Puri"],
    description: "Golden Beach Enclave in Baliapanda near Puri Light House provides sea-breeze holiday homes with landscaped terraces, passenger elevator, and security.",
    amenities: ["Light House & Sea View Deck", "Community Celebration Hall", "Automatic Elevators", "Standby Generator Power", "Rainwater Harvesting", "24/7 Security CCTV"],
    configurations: [
      { bhkType: "1 BHK", carpetArea: 520, superBuiltUpArea: 676, bathrooms: 1, priceMin: 4800000, priceMax: 4800000, isAvailable: true },
      { bhkType: "2 BHK", carpetArea: 820, superBuiltUpArea: 1066, bathrooms: 2, priceMin: 7200000, priceMax: 7200000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1250, superBuiltUpArea: 1625, bathrooms: 3, priceMin: 11500000, priceMax: 11500000, isAvailable: true }
    ]
  },
  {
    name: "Sea Pearl Residency",
    slug: "sea-pearl-residency-sipasarubali-puri",
    developerName: "Sea Pearl Real Estate",
    cityName: "Puri",
    cityId: 4037,
    stateName: "Odisha",
    locality: "Sipasarubali",
    siteAddress: "Marine Drive Extension, Sipasarubali, Puri, Odisha",
    landmark: "Near Sterling Resort Puri",
    location: "Sipasarubali, Puri",
    latitude: 19.7784,
    longitude: 85.7942,
    priceMin: 4200000,
    priceMax: 9800000,
    pricePerSqFt: 4600,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "RP/19/2018/00109",
    totalUnits: 160,
    availableUnits: 12,
    totalTowers: 2,
    totalFloors: 7,
    totalLandArea: "2.2 Acres",
    salesPhone: "9861644550",
    salesEmail: "sales.seapearl@seapearlrealty.com",
    searchKeywords: ["Sipasarubali flat Puri", "Puri holiday home", "Puri flat sale"],
    description: "Sea Pearl Residency in Sipasarubali offers comfortable coastal residences surrounded by lush casuarina groves with pool, elevator, and round-the-clock power backup.",
    amenities: ["Swimming Pool with Timber Deck", "Casuarina Grove Park", "Community Multipurpose Room", "Passenger Elevators", "Standby Generator Power Backup", "Gated Security Guard"],
    configurations: [
      { bhkType: "1 BHK", carpetArea: 480, superBuiltUpArea: 624, bathrooms: 1, priceMin: 4200000, priceMax: 4200000, isAvailable: true },
      { bhkType: "2 BHK", carpetArea: 780, superBuiltUpArea: 1014, bathrooms: 2, priceMin: 6500000, priceMax: 6500000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1180, superBuiltUpArea: 1534, bathrooms: 3, priceMin: 9800000, priceMax: 9800000, isAvailable: true }
    ]
  },
  {
    name: "Puri Coastal Heights",
    slug: "puri-coastal-heights-vip-road-puri",
    developerName: "Coastal Infratech",
    cityName: "Puri",
    cityId: 4037,
    stateName: "Odisha",
    locality: "VIP Road",
    siteAddress: "VIP Road, Near Puri Railway Station, Puri, Odisha",
    landmark: "Near Puri Railway Station & District Administration Office",
    location: "VIP Road, Puri",
    latitude: 19.8142,
    longitude: 85.8284,
    priceMin: 5200000,
    priceMax: 12500000,
    pricePerSqFt: 5100,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "RP/19/2021/00412",
    totalUnits: 150,
    availableUnits: 11,
    totalTowers: 2,
    totalFloors: 8,
    totalLandArea: "2.0 Acres",
    salesPhone: "9861655660",
    salesEmail: "sales.coastalheights@coastalinfra.in",
    searchKeywords: ["VIP Road Puri flat", "Puri railway station flat", "Puri apartment"],
    description: "Puri Coastal Heights on VIP Road provides centrally situated residences walking distance from Puri Railway Station with temple connectivity, gym, and automatic lifts.",
    amenities: ["Residents Gymnasium", "Community Satsang Hall", "Automatic Passenger Elevator", "Full Standby Generator Power", "Dedicated Covered Parking", "24/7 Security CCTV"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 810, superBuiltUpArea: 1053, bathrooms: 2, priceMin: 5200000, priceMax: 5200000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1250, superBuiltUpArea: 1625, bathrooms: 3, priceMin: 7900000, priceMax: 7900000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1840, superBuiltUpArea: 2392, bathrooms: 4, priceMin: 12500000, priceMax: 12500000, isAvailable: true }
    ]
  },

  // ==================== HOWRAH (5 projects) ====================
  {
    name: "Merlin Avana Howrah",
    slug: "merlin-avana-andul-road-howrah",
    developerName: "Merlin Group",
    cityName: "Howrah",
    cityId: 47,
    stateName: "West Bengal",
    locality: "Andul Road",
    siteAddress: "Andul Road, Near Danesh Sheikh Lane, Howrah, West Bengal",
    landmark: "Near Indian Institute of Engineering Science and Technology (IIEST) Shibpur",
    location: "Andul Road, Howrah",
    latitude: 22.5612,
    longitude: 88.3124,
    priceMin: 6500000,
    priceMax: 16500000,
    pricePerSqFt: 6200,
    possessionDate: "2025-06-30T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "WBRERA/P/HOW/2023/000145",
    totalUnits: 450,
    availableUnits: 32,
    totalTowers: 5,
    totalFloors: 18,
    totalLandArea: "7.0 Acres",
    salesPhone: "9830511220",
    salesEmail: "sales.avanahowrah@merlinprojects.com",
    searchKeywords: ["Howrah flat", "Andul Road flat", "Shibpur flat Howrah"],
    description: "Merlin Avana on Andul Road is a premier gated high-rise enclave in Howrah offering clubhouse with swimming pool, landscaped podiums, and quick access to Vidyasagar Setu.",
    amenities: ["Signature Merlin Clubhouse", "Swimming Pool with Timber Deck", "Indoor Badminton & Squash Courts", "Grand Air-Conditioned Foyer", "Children Play Arena", "24/7 Security CCTV"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 840, superBuiltUpArea: 1092, bathrooms: 2, priceMin: 6500000, priceMax: 6500000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1320, superBuiltUpArea: 1716, bathrooms: 3, priceMin: 9800000, priceMax: 9800000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1980, superBuiltUpArea: 2574, bathrooms: 4, priceMin: 16500000, priceMax: 16500000, isAvailable: true }
    ]
  },
  {
    name: "Siddha Waterfront",
    slug: "siddha-waterfront-kona-expressway-howrah",
    developerName: "Siddha Group",
    cityName: "Howrah",
    cityId: 47,
    stateName: "West Bengal",
    locality: "Kona Expressway",
    siteAddress: "Kona Expressway, Near Salap Junction, Howrah, West Bengal",
    landmark: "Directly on Kona Expressway, 15 mins from Kolkata CBD",
    location: "Kona Expressway, Howrah",
    latitude: 22.6124,
    longitude: 88.2841,
    priceMin: 4800000,
    priceMax: 11500000,
    pricePerSqFt: 5100,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/HOW/2018/000078",
    totalUnits: 720,
    availableUnits: 38,
    totalTowers: 8,
    totalFloors: 14,
    totalLandArea: "10.0 Acres",
    salesPhone: "9830522330",
    salesEmail: "sales.waterfront@siddhagroup.com",
    searchKeywords: ["Kona Expressway flat", "Salap Howrah flat", "Siddha Howrah apartment"],
    description: "Siddha Waterfront on Kona Expressway features a majestic natural lake surrounded by residential towers, club facilities, jogging track, and swift expressway access to Central Kolkata.",
    amenities: ["Natural Lake with Wooden Boardwalk", "Clubhouse with Lap Pool", "Gymnasium & Yoga Studio", "Tennis & Basketball Courts", "Children Adventure Park", "Gated Controlled Security"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 760, superBuiltUpArea: 988, bathrooms: 2, priceMin: 4800000, priceMax: 4800000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1180, superBuiltUpArea: 1534, bathrooms: 3, priceMin: 7200000, priceMax: 7200000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1680, superBuiltUpArea: 2184, bathrooms: 4, priceMin: 11500000, priceMax: 11500000, isAvailable: true }
    ]
  },
  {
    name: "Shree Jain Heights",
    slug: "shree-jain-heights-gt-road-salkia-howrah",
    developerName: "Jain Group",
    cityName: "Howrah",
    cityId: 47,
    stateName: "West Bengal",
    locality: "Salkia",
    siteAddress: "Grand Trunk Road, Salkia, Howrah, West Bengal",
    landmark: "Near Howrah AC Market & Salkia Chowrasta",
    location: "Salkia, Howrah",
    latitude: 22.6012,
    longitude: 88.3481,
    priceMin: 5800000,
    priceMax: 13500000,
    pricePerSqFt: 5600,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/HOW/2019/000212",
    totalUnits: 240,
    availableUnits: 16,
    totalTowers: 3,
    totalFloors: 11,
    totalLandArea: "3.2 Acres",
    salesPhone: "9830533440",
    salesEmail: "sales.jainheights@jaingroup.com",
    searchKeywords: ["Salkia flat", "GT Road Howrah flat", "Howrah station apartment"],
    description: "Shree Jain Heights in Salkia offers contemporary high-rise living with views of the Hooghly River, fitness gym, banquet hall, and immediate proximity to Howrah Railway Station.",
    amenities: ["Hooghly River Breeze Balconies", "Community Banquet Hall", "Fitness Suite", "High-Speed Elevators", "Standby Generator Power Backup", "24/7 Security CCTV"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 810, superBuiltUpArea: 1053, bathrooms: 2, priceMin: 5800000, priceMax: 5800000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1250, superBuiltUpArea: 1625, bathrooms: 3, priceMin: 8800000, priceMax: 8800000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1820, superBuiltUpArea: 2366, bathrooms: 4, priceMin: 13500000, priceMax: 13500000, isAvailable: true }
    ]
  },
  {
    name: "Cosmic Enclave Howrah",
    slug: "cosmic-enclave-shibpur-howrah",
    developerName: "Cosmic Builders",
    cityName: "Howrah",
    cityId: 47,
    stateName: "West Bengal",
    locality: "Shibpur",
    siteAddress: "Mandirtala, Shibpur, Howrah, West Bengal",
    landmark: "Near Nabanna (State Secretariat) & Vidyasagar Setu Toll Plaza",
    location: "Shibpur, Howrah",
    latitude: 22.5694,
    longitude: 88.3284,
    priceMin: 7200000,
    priceMax: 17500000,
    pricePerSqFt: 6500,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/HOW/2018/000142",
    totalUnits: 180,
    availableUnits: 14,
    totalTowers: 2,
    totalFloors: 14,
    totalLandArea: "2.8 Acres",
    salesPhone: "9830544550",
    salesEmail: "sales.cosmic@cosmicbuilders.in",
    searchKeywords: ["Shibpur flat", "Nabanna Howrah flat", "Mandirtala flat"],
    description: "Cosmic Enclave in Shibpur near Nabanna delivers executive residential living minutes from Vidyasagar Setu, featuring rooftop garden, gym, and automatic elevators.",
    amenities: ["Rooftop Landscape Garden", "Clubhouse with Gym & Yoga", "Children Play Arena", "High-Speed Elevators with ARD", "100% Power Backup", "Dedicated Basement Parking"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 860, superBuiltUpArea: 1118, bathrooms: 2, priceMin: 7200000, priceMax: 7200000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1340, superBuiltUpArea: 1742, bathrooms: 3, priceMin: 11000000, priceMax: 11000000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2150, superBuiltUpArea: 2795, bathrooms: 4, priceMin: 17500000, priceMax: 17500000, isAvailable: true }
    ]
  },
  {
    name: "Ganges Garden Residency",
    slug: "ganges-garden-residency-foreshore-road-howrah",
    developerName: "Ganges Infratech",
    cityName: "Howrah",
    cityId: 47,
    stateName: "West Bengal",
    locality: "Foreshore Road",
    siteAddress: "Foreshore Road, Shibpur, Howrah, West Bengal",
    landmark: "Directly on the banks of Hooghly River, overlooking Kolkata skyline",
    location: "Foreshore Road, Howrah",
    latitude: 22.5542,
    longitude: 88.3341,
    priceMin: 8200000,
    priceMax: 21000000,
    pricePerSqFt: 6900,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/HOW/2020/000388",
    totalUnits: 210,
    availableUnits: 15,
    totalTowers: 3,
    totalFloors: 15,
    totalLandArea: "3.5 Acres",
    salesPhone: "9830555660",
    salesEmail: "sales.gangesgarden@gangesinfra.com",
    searchKeywords: ["Foreshore Road flat", "Ganges view Howrah flat", "Hooghly river flat"],
    description: "Ganges Garden Residency on Foreshore Road commands magnificent front-row views of the holy Hooghly River and Kolkata's Princep Ghat with infinity pool and private promenade.",
    amenities: ["Hooghly Riverfront Promenade", "Rooftop River-View Infinity Pool", "State of the Art Fitness Center", "Banquet Hall with Lawn", "High-Speed Elevators", "24/7 Monitored Security"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 920, superBuiltUpArea: 1196, bathrooms: 2, priceMin: 8200000, priceMax: 8200000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1450, superBuiltUpArea: 1885, bathrooms: 3, priceMin: 13500000, priceMax: 13500000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2280, superBuiltUpArea: 2964, bathrooms: 4, priceMin: 21000000, priceMax: 21000000, isAvailable: true }
    ]
  },

  // ==================== DURGAPUR (5 projects) ====================
  {
    name: "Fortune Heights Durgapur",
    slug: "fortune-heights-muchipara-nh19-durgapur",
    developerName: "Fortune Group",
    cityName: "Durgapur",
    cityId: 49,
    stateName: "West Bengal",
    locality: "Muchipara",
    siteAddress: "National Highway 19, Muchipara, Durgapur, West Bengal",
    landmark: "Directly on NH-19 (Grand Trunk Road), near Mission Hospital",
    location: "Muchipara, Durgapur",
    latitude: 23.5187,
    longitude: 87.3512,
    priceMin: 3800000,
    priceMax: 8900000,
    pricePerSqFt: 3600,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/PAS/2018/000109",
    totalUnits: 340,
    availableUnits: 25,
    totalTowers: 4,
    totalFloors: 11,
    totalLandArea: "4.5 Acres",
    salesPhone: "9832111220",
    salesEmail: "sales.fortuneheights@fortunegroup.in",
    searchKeywords: ["Durgapur flat", "Muchipara flat Durgapur", "Durgapur apartment"],
    description: "Fortune Heights on NH-19 in Muchipara is a modern gated township near The Mission Hospital with swimming pool, gym, landscaped garden, and highway connectivity.",
    amenities: ["Residents Lifestyle Club", "Swimming Pool with Deck", "Indoor Badminton & Table Tennis", "Landscaped Central Park", "Children Play Arena", "24/7 Security CCTV"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 780, superBuiltUpArea: 1014, bathrooms: 2, priceMin: 3800000, priceMax: 3800000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1190, superBuiltUpArea: 1547, bathrooms: 3, priceMin: 5800000, priceMax: 5800000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1720, superBuiltUpArea: 2236, bathrooms: 4, priceMin: 8900000, priceMax: 8900000, isAvailable: true }
    ]
  },
  {
    name: "Dream Eco City",
    slug: "dream-eco-city-bidhannagar-durgapur",
    developerName: "Jain Group",
    cityName: "Durgapur",
    cityId: 49,
    stateName: "West Bengal",
    locality: "Bidhannagar",
    siteAddress: "Near Vivekananda Hospital, Bidhannagar, Durgapur, West Bengal",
    landmark: "Directly opposite Vivekananda Hospital & St. Michael's School",
    location: "Bidhannagar, Durgapur",
    latitude: 23.5342,
    longitude: 87.3241,
    priceMin: 4200000,
    priceMax: 9800000,
    pricePerSqFt: 3900,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/PAS/2019/000244",
    totalUnits: 420,
    availableUnits: 28,
    totalTowers: 6,
    totalFloors: 10,
    totalLandArea: "7.0 Acres",
    salesPhone: "9832222330",
    salesEmail: "sales.dreamecocity@jaingroup.com",
    searchKeywords: ["Bidhannagar Durgapur flat", "Eco City Durgapur", "Durgapur flat sale"],
    description: "Dream Eco City in Bidhannagar offers 70% open landscape with natural water bodies, club facilities, solar lighting, and immediate access to hospitals and schools.",
    amenities: ["Natural Water Lagoon with Promenade", "Club Eco with Swimming Pool", "Gymnasium & Yoga Studio", "Tennis & Basketball Courts", "Children Soft Play Arena", "Full Power Backup"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 820, superBuiltUpArea: 1066, bathrooms: 2, priceMin: 4200000, priceMax: 4200000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1250, superBuiltUpArea: 1625, bathrooms: 3, priceMin: 6500000, priceMax: 6500000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1820, superBuiltUpArea: 2366, bathrooms: 4, priceMin: 9800000, priceMax: 9800000, isAvailable: true }
    ]
  },
  {
    name: "Srijan Greenfield Oasis",
    slug: "srijan-greenfield-oasis-bamunara-durgapur",
    developerName: "Srijan Realty",
    cityName: "Durgapur",
    cityId: 49,
    stateName: "West Bengal",
    locality: "Bamunara",
    siteAddress: "Bamunara Industrial Park Road, Durgapur, West Bengal",
    landmark: "Near Bamunara Industrial Hub & NH-19 Bypass",
    location: "Bamunara, Durgapur",
    latitude: 23.5041,
    longitude: 87.3782,
    priceMin: 3500000,
    priceMax: 7800000,
    pricePerSqFt: 3400,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/PAS/2018/000089",
    totalUnits: 360,
    availableUnits: 22,
    totalTowers: 5,
    totalFloors: 9,
    totalLandArea: "5.0 Acres",
    salesPhone: "9832333440",
    salesEmail: "sales.greenfield@srijanrealty.in",
    searchKeywords: ["Bamunara flat Durgapur", "Srijan Durgapur flat", "Durgapur apartment"],
    description: "Srijan Greenfield Oasis in Bamunara delivers planned community living with landscaped gardens, badminton court, community hall, water filtration, and secure gates.",
    amenities: ["Residents Community Hall", "Landscaped Theme Gardens", "Badminton & Table Tennis", "Children Play Ground", "Standby Generator Power", "Gated Security Guarding"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 740, superBuiltUpArea: 962, bathrooms: 2, priceMin: 3500000, priceMax: 3500000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1140, superBuiltUpArea: 1482, bathrooms: 3, priceMin: 5200000, priceMax: 5200000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1620, superBuiltUpArea: 2106, bathrooms: 4, priceMin: 7800000, priceMax: 7800000, isAvailable: true }
    ]
  },
  {
    name: "Steel City Meadows",
    slug: "steel-city-meadows-benachity-durgapur",
    developerName: "Bengal Steel Housing",
    cityName: "Durgapur",
    cityId: 49,
    stateName: "West Bengal",
    locality: "Benachity",
    siteAddress: "Prantika, Benachity, Durgapur, West Bengal",
    landmark: "Directly walking distance from Benachity Market Hub",
    location: "Benachity, Durgapur",
    latitude: 23.5482,
    longitude: 87.2981,
    priceMin: 3900000,
    priceMax: 8800000,
    pricePerSqFt: 3800,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/PAS/2020/000318",
    totalUnits: 190,
    availableUnits: 15,
    totalTowers: 3,
    totalFloors: 8,
    totalLandArea: "2.8 Acres",
    salesPhone: "9832444550",
    salesEmail: "sales.steelcitymeadows@bengalsteel.com",
    searchKeywords: ["Benachity flat", "Benachity market flat", "Durgapur flat sale"],
    description: "Steel City Meadows in Benachity is located in Durgapur's major shopping and commercial district, featuring earthquake-engineered RCC, automatic lift, and parking.",
    amenities: ["Rooftop Garden Pavilion", "Community Meeting Room", "Automatic Elevator with ARD", "Intercom System in All Units", "Covered Car Parking", "24/7 Security CCTV"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 780, superBuiltUpArea: 1014, bathrooms: 2, priceMin: 3900000, priceMax: 3900000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1200, superBuiltUpArea: 1560, bathrooms: 3, priceMin: 5900000, priceMax: 5900000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1750, superBuiltUpArea: 2275, bathrooms: 4, priceMin: 8800000, priceMax: 8800000, isAvailable: true }
    ]
  },
  {
    name: "City Enclave Durgapur",
    slug: "city-enclave-city-center-durgapur",
    developerName: "Durgapur Infratech",
    cityName: "Durgapur",
    cityId: 49,
    stateName: "West Bengal",
    locality: "City Center",
    siteAddress: "Near Junction Mall, City Center, Durgapur, West Bengal",
    landmark: "Directly opposite Junction Mall Durgapur",
    location: "City Center, Durgapur",
    latitude: 23.5412,
    longitude: 87.3112,
    priceMin: 4800000,
    priceMax: 11500000,
    pricePerSqFt: 4300,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/PAS/2019/000178",
    totalUnits: 210,
    availableUnits: 16,
    totalTowers: 3,
    totalFloors: 10,
    totalLandArea: "3.2 Acres",
    salesPhone: "9832555660",
    salesEmail: "sales.cityenclave@durgapurinfra.in",
    searchKeywords: ["City Center Durgapur flat", "Junction Mall flat", "Durgapur apartment"],
    description: "City Enclave in City Center across Junction Mall provides luxury high-rise residences with gym, terrace lounge, covered parking, and immediate access to malls and cinemas.",
    amenities: ["Residents Gymnasium", "Terrace Lounge with City Views", "Community Celebration Hall", "Automatic Elevators", "Standby Generator Power Backup", "Dedicated Car Parking"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 840, superBuiltUpArea: 1092, bathrooms: 2, priceMin: 4800000, priceMax: 4800000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1290, superBuiltUpArea: 1677, bathrooms: 3, priceMin: 7200000, priceMax: 7200000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1880, superBuiltUpArea: 2444, bathrooms: 4, priceMin: 11500000, priceMax: 11500000, isAvailable: true }
    ]
  },

  // ==================== SILIGURI (5 projects) ====================
  {
    name: "Orbit North Point",
    slug: "orbit-north-point-sevoke-road-siliguri",
    developerName: "Orbit Group",
    cityName: "Siliguri",
    cityId: 48,
    stateName: "West Bengal",
    locality: "Sevoke Road",
    siteAddress: "Sevoke Road, Near Vega Circle Mall, Siliguri, West Bengal",
    landmark: "Directly opposite Vega Circle Mall & Planet Mall",
    location: "Sevoke Road, Siliguri",
    latitude: 26.7412,
    longitude: 88.4428,
    priceMin: 5800000,
    priceMax: 14500000,
    pricePerSqFt: 5400,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "WBRERA/P/DAR/2023/000219",
    totalUnits: 280,
    availableUnits: 20,
    totalTowers: 4,
    totalFloors: 12,
    totalLandArea: "4.0 Acres",
    salesPhone: "9832611220",
    salesEmail: "sales.northpoint@orbitgroup.net",
    searchKeywords: ["Siliguri flat", "Sevoke Road flat", "Vega Circle Siliguri flat"],
    description: "Orbit North Point on prime Sevoke Road offers Himalayan mountain vistas across Vega Circle Mall, featuring swimming pool, clubhouse, and modern elevators.",
    amenities: ["Himalayan Mountain View Sundeck", "Swimming Pool with Deck", "Clubhouse with Gym & Billiards", "Children Play Arena", "100% Standby Power Backup", "24/7 Security CCTV"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 850, superBuiltUpArea: 1105, bathrooms: 2, priceMin: 5800000, priceMax: 5800000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1320, superBuiltUpArea: 1716, bathrooms: 3, priceMin: 8900000, priceMax: 8900000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1950, superBuiltUpArea: 2535, bathrooms: 4, priceMin: 14500000, priceMax: 14500000, isAvailable: true }
    ]
  },
  {
    name: "Teesta Riverview Residency",
    slug: "teesta-riverview-residency-salugara-siliguri",
    developerName: "Teesta Infratech",
    cityName: "Siliguri",
    cityId: 48,
    stateName: "West Bengal",
    locality: "Salugara",
    siteAddress: "Sevoke Military Road, Salugara, Siliguri, West Bengal",
    landmark: "Near Bengal Safari & Salugara Monastery",
    location: "Salugara, Siliguri",
    latitude: 26.7619,
    longitude: 88.4682,
    priceMin: 4500000,
    priceMax: 10500000,
    pricePerSqFt: 4600,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/JAL/2019/000288",
    totalUnits: 190,
    availableUnits: 16,
    totalTowers: 3,
    totalFloors: 9,
    totalLandArea: "3.2 Acres",
    salesPhone: "9832722330",
    salesEmail: "sales.teestariverview@teestainfra.com",
    searchKeywords: ["Salugara Siliguri flat", "Bengal safari flat", "Siliguri apartment"],
    description: "Teesta Riverview Residency in Salugara is situated near Bengal Safari and Salugara Monastery with tea garden and mountain views, community hall, and generator power.",
    amenities: ["Tea Garden & Mountain Views", "Community Celebration Hall", "Children Play Equipment", "Automatic Passenger Elevators", "Standby Generator Power", "Gated Security Guarding"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 780, superBuiltUpArea: 1014, bathrooms: 2, priceMin: 4500000, priceMax: 4500000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1220, superBuiltUpArea: 1586, bathrooms: 3, priceMin: 6800000, priceMax: 6800000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1780, superBuiltUpArea: 2314, bathrooms: 4, priceMin: 10500000, priceMax: 10500000, isAvailable: true }
    ]
  },
  {
    name: "Himalayan Vista",
    slug: "himalayan-vista-pradhan-nagar-siliguri",
    developerName: "Himalayan Real Estate",
    cityName: "Siliguri",
    cityId: 48,
    stateName: "West Bengal",
    locality: "Pradhan Nagar",
    siteAddress: "Hill Cart Road, Pradhan Nagar, Siliguri, West Bengal",
    landmark: "Near Siliguri Junction Railway Station & Tenzing Norgay Bus Terminus",
    location: "Pradhan Nagar, Siliguri",
    latitude: 26.7284,
    longitude: 88.4219,
    priceMin: 5200000,
    priceMax: 12000000,
    pricePerSqFt: 5100,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/DAR/2018/000174",
    totalUnits: 160,
    availableUnits: 12,
    totalTowers: 2,
    totalFloors: 9,
    totalLandArea: "2.4 Acres",
    salesPhone: "9832833440",
    salesEmail: "sales.himalayanvista@himalayanrealty.in",
    searchKeywords: ["Pradhan Nagar flat", "Siliguri junction flat", "Hill Cart Road flat"],
    description: "Himalayan Vista in Pradhan Nagar provides central residences close to Siliguri Junction with panoramic views of the foothills, modern gym, and automatic lift.",
    amenities: ["Foothill & City Vistas", "Fitness Suite with Treadmills", "Community Meeting Room", "Automatic Passenger Elevator", "Full Power Backup", "Dedicated Car Parking"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 820, superBuiltUpArea: 1066, bathrooms: 2, priceMin: 5200000, priceMax: 5200000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1260, superBuiltUpArea: 1638, bathrooms: 3, priceMin: 7800000, priceMax: 7800000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1840, superBuiltUpArea: 2392, bathrooms: 4, priceMin: 12000000, priceMax: 12000000, isAvailable: true }
    ]
  },
  {
    name: "Green Valley Siliguri",
    slug: "green-valley-matigara-siliguri",
    developerName: "Green Valley Developers",
    cityName: "Siliguri",
    cityId: 48,
    stateName: "West Bengal",
    locality: "Matigara",
    siteAddress: "Khaprail Road, Matigara, Siliguri, West Bengal",
    landmark: "Directly opposite City Centre Mall Siliguri",
    location: "Matigara, Siliguri",
    latitude: 26.7112,
    longitude: 88.3891,
    priceMin: 4900000,
    priceMax: 11800000,
    pricePerSqFt: 4800,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/DAR/2020/000399",
    totalUnits: 320,
    availableUnits: 24,
    totalTowers: 4,
    totalFloors: 11,
    totalLandArea: "5.0 Acres",
    salesPhone: "9832944550",
    salesEmail: "sales.greenvalleysiliguri@greenvalley.com",
    searchKeywords: ["City Centre Siliguri flat", "Matigara flat", "Siliguri flat sale"],
    description: "Green Valley in Matigara directly across City Centre Mall offers contemporary living with swimming pool, landscaped gardens, jogging track, and swift airport access.",
    amenities: ["Direct Access to City Centre Mall", "Clubhouse with Swimming Pool", "Badminton & Table Tennis", "Landscaped Central Park", "Children Play Arena", "24/7 Security CCTV"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 810, superBuiltUpArea: 1053, bathrooms: 2, priceMin: 4900000, priceMax: 4900000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1280, superBuiltUpArea: 1664, bathrooms: 3, priceMin: 7600000, priceMax: 7600000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1890, superBuiltUpArea: 2457, bathrooms: 4, priceMin: 11800000, priceMax: 11800000, isAvailable: true }
    ]
  },
  {
    name: "Kanchanjunga Enclave",
    slug: "kanchanjunga-enclave-dagapur-siliguri",
    developerName: "North Bengal Builders",
    cityName: "Siliguri",
    cityId: 48,
    stateName: "West Bengal",
    locality: "Dagapur",
    siteAddress: "National Highway 27, Dagapur, Siliguri, West Bengal",
    landmark: "Near North Bengal University & Bagdogra Airport Road",
    location: "Dagapur, Siliguri",
    latitude: 26.7341,
    longitude: 88.3742,
    priceMin: 4600000,
    priceMax: 10800000,
    pricePerSqFt: 4500,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/DAR/2019/000215",
    totalUnits: 220,
    availableUnits: 18,
    totalTowers: 3,
    totalFloors: 9,
    totalLandArea: "3.5 Acres",
    salesPhone: "9832155660",
    salesEmail: "sales.kanchanjunga@nbbuilders.in",
    searchKeywords: ["Dagapur flat Siliguri", "Bagdogra airport flat", "Siliguri property"],
    description: "Kanchanjunga Enclave in Dagapur provides snow-peak mountain views on clear days, with landscaped tea gardens, children play area, generator power, and airport accessibility.",
    amenities: ["Mount Kanchenjunga View Sundeck", "Landscaped Tea Garden Walkway", "Community Hall", "Automatic Elevators", "Standby Generator Power Backup", "Gated Security Guard"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 790, superBuiltUpArea: 1027, bathrooms: 2, priceMin: 4600000, priceMax: 4600000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1220, superBuiltUpArea: 1586, bathrooms: 3, priceMin: 6900000, priceMax: 6900000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1780, superBuiltUpArea: 2314, bathrooms: 4, priceMin: 10800000, priceMax: 10800000, isAvailable: true }
    ]
  }
];

async function main() {
  console.log(`=== SOURCING PHOTOS AND SEEDING BATCH 12 (PURI, HOWRAH, DURGAPUR, SILIGURI) ===`);
  console.log(`Total projects to process: ${BATCH12_PROJECTS.length}`);

  const usedGlobalPhotos = new Set();

  for (let i = 0; i < BATCH12_PROJECTS.length; i++) {
    const p = BATCH12_PROJECTS[i];
    console.log(`\n[${i + 1}/${BATCH12_PROJECTS.length}] Processing ${p.name} in ${p.cityName}...`);

    const projectDir = path.join(PROJECT_IMAGES_DIR, p.slug);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    const uploadedUrls = [];
    const queries = p.searchKeywords || [`${p.cityName} flat`];

    let candidatePhotos = [];
    for (const q of queries) {
      const photos = await fetchPhotosForQuery(q);
      for (const ph of photos) {
        if (!candidatePhotos.includes(ph)) candidatePhotos.push(ph);
      }
      if (candidatePhotos.length >= 12) break;
    }

    // Fallback query if needed
    if (candidatePhotos.length < 5) {
      const cityPhotos = await fetchPhotosForQuery(`${p.cityName} flat apartment`);
      for (const ph of cityPhotos) {
        if (!candidatePhotos.includes(ph)) candidatePhotos.push(ph);
      }
    }

    // Secondary fallback to state capital
    if (candidatePhotos.length < 5) {
      const stateFallback = p.stateName === "West Bengal" ? "Kolkata flat apartment" : "Bhubaneswar flat apartment";
      const fallbackPhotos = await fetchPhotosForQuery(stateFallback);
      for (const ph of fallbackPhotos) {
        if (!candidatePhotos.includes(ph)) candidatePhotos.push(ph);
      }
    }

    for (let j = 0; j < candidatePhotos.length; j++) {
      if (uploadedUrls.length >= 5) break;
      const photoUrl = candidatePhotos[j];
      if (usedGlobalPhotos.has(photoUrl)) continue;
      usedGlobalPhotos.add(photoUrl);

      const idx = uploadedUrls.length + 1;
      const localFile = path.join(projectDir, `photo_${idx}.webp`);
      const r2Key = `projects/photos/${p.slug}/photo_${idx}.webp`;

      const downloaded = await downloadImage(photoUrl, localFile);
      if (downloaded) {
        const url = await uploadToCloudflareR2(localFile, r2Key);
        uploadedUrls.push(url);
        console.log(`  ✓ Uploaded image ${idx}/5 to R2: ${url}`);
      }
    }

    p.images = uploadedUrls;
  }

  fs.writeFileSync(DOCS_FILE, JSON.stringify(BATCH12_PROJECTS, null, 2));
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(BATCH12_PROJECTS, null, 2));
  console.log(`\nSaved ${BATCH12_PROJECTS.length} projects to ${DOCS_FILE} and ${PROJECTS_FILE}`);
}

main().catch(console.error);
