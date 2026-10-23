import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "/Users/vinaykumar/Desktop/myProjects/awasio-backend/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";

const BASE_DIR = "/Users/vinaykumar/Desktop/awasio-sourced-properties";
const PROJECT_IMAGES_DIR = path.join(BASE_DIR, "batch9_images");
const PROJECTS_FILE = path.join(BASE_DIR, "tier2_metros_batch9.json");
const DOCS_FILE = path.join(process.cwd(), "docs", "tier2_metros_batch9.json");

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

const BATCH9_PROJECTS = [
  // ==================== KOLKATA (4 projects) ====================
  {
    name: "Urbana Kolkata",
    slug: "urbana-kolkata-anandapur-em-bypass",
    developerName: "Bengal NRI Complex",
    cityName: "Kolkata",
    cityId: 46,
    stateName: "West Bengal",
    locality: "Anandapur",
    siteAddress: "783 Anandapur, EM Bypass, Kolkata, West Bengal",
    landmark: "Behind Ruby General Hospital & Urbana NRI Complex",
    location: "Anandapur, Kolkata",
    latitude: 22.5187,
    longitude: 88.4061,
    priceMin: 21000000,
    priceMax: 65000000,
    pricePerSqFt: 10800,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/SOU/2018/000085",
    totalUnits: 1170,
    availableUnits: 35,
    totalTowers: 7,
    totalFloors: 46,
    totalLandArea: "66.0 Acres",
    salesPhone: "9830111220",
    salesEmail: "sales.urbana@bengalnri.com",
    searchKeywords: ["Urbana Kolkata flat", "Anandapur flat", "EM Bypass Kolkata flat"],
    description: "Urbana Kolkata is an acclaimed 66-acre mega luxury township in South-East Kolkata with 46-storey residential towers, 100,000 sq.ft Club Urbana, heated pool, and private NRI community facilities.",
    amenities: ["100,000 Sq.Ft Club Urbana", "Temperature-Controlled Heated Pool", "Olympic Outdoor Pool", "Squash & Tennis Courts", "Fine Dining Restaurant", "Helipad & 24/7 Monitored Surveillance"],
    configurations: [
      { bhkType: "3 BHK", carpetArea: 1980, superBuiltUpArea: 2574, bathrooms: 3, priceMin: 21000000, priceMax: 21000000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2850, superBuiltUpArea: 3705, bathrooms: 4, priceMin: 38000000, priceMax: 38000000, isAvailable: true },
      { bhkType: "5 BHK Duplex", carpetArea: 4800, superBuiltUpArea: 6240, bathrooms: 5, priceMin: 65000000, priceMax: 65000000, isAvailable: true }
    ]
  },
  {
    name: "South City Kolkata",
    slug: "south-city-kolkata-prince-anwar-shah-road",
    developerName: "South City Projects",
    cityName: "Kolkata",
    cityId: 46,
    stateName: "West Bengal",
    locality: "Prince Anwar Shah Road",
    siteAddress: "375 Prince Anwar Shah Road, Jadavpur, Kolkata, West Bengal",
    landmark: "Directly adjoining South City Mall",
    location: "Prince Anwar Shah Road, Kolkata",
    latitude: 22.5012,
    longitude: 88.3619,
    priceMin: 18500000,
    priceMax: 42000000,
    pricePerSqFt: 9800,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/KOL/2018/000021",
    totalUnits: 1700,
    availableUnits: 18,
    totalTowers: 5,
    totalFloors: 35,
    totalLandArea: "31.0 Acres",
    salesPhone: "9830222330",
    salesEmail: "sales.southcity@southcityprojects.com",
    searchKeywords: ["South City Kolkata flat", "Prince Anwar Shah flat", "Jadavpur apartment"],
    description: "South City Kolkata is an iconic residential landmark in South Kolkata integrated with eastern India's flagship South City Mall, South City International School, and an exclusive residents club.",
    amenities: ["Private Walkway to South City Mall", "Grand Club South City", "Multiple Swimming Pools", "Squash & Badminton Courts", "Banquet Hall with Lawns", "Full Power Backup"],
    configurations: [
      { bhkType: "3 BHK", carpetArea: 1680, superBuiltUpArea: 2184, bathrooms: 3, priceMin: 18500000, priceMax: 18500000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2450, superBuiltUpArea: 3185, bathrooms: 4, priceMin: 28500000, priceMax: 28500000, isAvailable: true },
      { bhkType: "4 BHK Penthouse", carpetArea: 3600, superBuiltUpArea: 4680, bathrooms: 5, priceMin: 42000000, priceMax: 42000000, isAvailable: true }
    ]
  },
  {
    name: "Ambuja Utalika The Luxury",
    slug: "ambuja-utalika-the-luxury-mukundapur-em-bypass",
    developerName: "Ambuja Neotia",
    cityName: "Kolkata",
    cityId: 46,
    stateName: "West Bengal",
    locality: "Mukundapur",
    siteAddress: "405 Barakhola, Mukundapur, EM Bypass, Kolkata, West Bengal",
    landmark: "Directly opposite Peerless Hospital",
    location: "Mukundapur, Kolkata",
    latitude: 22.4984,
    longitude: 88.3982,
    priceMin: 14500000,
    priceMax: 36000000,
    pricePerSqFt: 8900,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/SOU/2018/000043",
    totalUnits: 1045,
    availableUnits: 25,
    totalTowers: 16,
    totalFloors: 25,
    totalLandArea: "20.0 Acres",
    salesPhone: "9830333440",
    salesEmail: "sales.utalika@ambujaneotia.com",
    searchKeywords: ["Utalika Kolkata flat", "Mukundapur flat", "EM Bypass Kolkata apartment"],
    description: "Ambuja Utalika The Luxury is a serene 20-acre eco-luxury haven centered around a majestic 2.6-acre natural lake, offering lakefront promenade living with signature Ambuja Neotia hospitality.",
    amenities: ["2.6-Acre Natural Lake & Promenade", "Club De Ville with Infinity Pool", "Floating Deck & Fishing Pier", "Squash & Billiards Room", "Amphitheatre by the Lake", "Solar Powered Lighting"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 1020, superBuiltUpArea: 1326, bathrooms: 2, priceMin: 14500000, priceMax: 14500000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1620, superBuiltUpArea: 2106, bathrooms: 3, priceMin: 21500000, priceMax: 21500000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2550, superBuiltUpArea: 3315, bathrooms: 4, priceMin: 36000000, priceMax: 36000000, isAvailable: true }
    ]
  },
  {
    name: "Tata Avenida",
    slug: "tata-avenida-new-town-action-area-2-kolkata",
    developerName: "Tata Housing",
    cityName: "Kolkata",
    cityId: 46,
    stateName: "West Bengal",
    locality: "New Town Action Area II",
    siteAddress: "Street No. 372, Action Area II, New Town, Kolkata, West Bengal",
    landmark: "Near Eco Park & Mother's Wax Museum",
    location: "New Town Action Area II, Kolkata",
    latitude: 22.6041,
    longitude: 88.4682,
    priceMin: 11000000,
    priceMax: 28500000,
    pricePerSqFt: 7800,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "HIRA/P/NOR/2018/000030",
    totalUnits: 700,
    availableUnits: 30,
    totalTowers: 7,
    totalFloors: 29,
    totalLandArea: "13.0 Acres",
    salesPhone: "9830444550",
    salesEmail: "sales.avenida@tatahousing.com",
    searchKeywords: ["Tata Avenida Kolkata flat", "New Town Kolkata flat", "Action Area 2 apartment"],
    description: "Tata Avenida is a contemporary 13-acre residential community in New Town Action Area II, designed with an open boulevard lifestyle, sprawling clubhouse, and quick connectivity to Kolkata Airport.",
    amenities: ["Grand Central Boulevard", "28,000 Sq.Ft Clubhouse", "Swimming Pool & Kid's Pool", "Tennis & Squash Courts", "Tea Lounge & Library", "24/7 Gated Security"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 980, superBuiltUpArea: 1274, bathrooms: 2, priceMin: 11000000, priceMax: 11000000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1540, superBuiltUpArea: 2002, bathrooms: 3, priceMin: 16500000, priceMax: 16500000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2350, superBuiltUpArea: 3055, bathrooms: 4, priceMin: 28500000, priceMax: 28500000, isAvailable: true }
    ]
  },

  // ==================== AHMEDABAD (4 projects) ====================
  {
    name: "Sun South Park",
    slug: "sun-south-park-south-bopal-ahmedabad",
    developerName: "Sun Builders",
    cityName: "Ahmedabad",
    cityId: 1021,
    stateName: "Gujarat",
    locality: "South Bopal",
    siteAddress: "Near Gala Gymkhana Road, South Bopal, Ahmedabad, Gujarat",
    landmark: "Near TRP Mall & SP Ring Road",
    location: "South Bopal, Ahmedabad",
    latitude: 23.0187,
    longitude: 72.4842,
    priceMin: 5800000,
    priceMax: 14500000,
    pricePerSqFt: 5400,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "PR/GJ/AHMEDABAD/DASKROI/AUDA/RAA00124/150917",
    totalUnits: 840,
    availableUnits: 32,
    totalTowers: 8,
    totalFloors: 14,
    totalLandArea: "9.0 Acres",
    salesPhone: "9879111220",
    salesEmail: "sales.southpark@sunbuilders.in",
    searchKeywords: ["South Bopal flat", "Bopal Ahmedabad flat", "SP Ring Road apartment"],
    description: "Sun South Park is a benchmark residential community in South Bopal with 70% open green expanses, double-height entrance foyers, and a comprehensive leisure club.",
    amenities: ["Residents Clubhouse", "Swimming Pool with Deck", "Indoor Games Arena", "Children Play Park", "Senior Citizen Sit-Out", "CCTV & Security Control"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 840, superBuiltUpArea: 1092, bathrooms: 2, priceMin: 5800000, priceMax: 5800000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1320, superBuiltUpArea: 1716, bathrooms: 3, priceMin: 8900000, priceMax: 8900000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1980, superBuiltUpArea: 2574, bathrooms: 4, priceMin: 14500000, priceMax: 14500000, isAvailable: true }
    ]
  },
  {
    name: "Goyal Orchid Whitefield",
    slug: "goyal-orchid-whitefield-makarba-ahmedabad",
    developerName: "Goyal & Co",
    cityName: "Ahmedabad",
    cityId: 1021,
    stateName: "Gujarat",
    locality: "Makarba",
    siteAddress: "Behind Safal Parisar, Makarba, Prahlad Nagar Ext., Ahmedabad, Gujarat",
    landmark: "Close to Prahlad Nagar Corporate Road & SG Highway",
    location: "Makarba, Ahmedabad",
    latitude: 22.9984,
    longitude: 72.5021,
    priceMin: 8200000,
    priceMax: 19500000,
    pricePerSqFt: 6200,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "PR/GJ/AHMEDABAD/AHMEDABAD-CITY/AUDA/RAA00412/111017",
    totalUnits: 460,
    availableUnits: 20,
    totalTowers: 6,
    totalFloors: 14,
    totalLandArea: "5.5 Acres",
    salesPhone: "9879222330",
    salesEmail: "sales.orchid@goyalco.com",
    searchKeywords: ["Makarba flat", "Prahlad Nagar flat", "SG Highway Ahmedabad flat"],
    description: "Orchid Whitefield by Goyal & Co in Makarba delivers refined urban residences minutes from Prahlad Nagar corporate hubs, with landscaped sit-outs and high-spec vitrified finishes.",
    amenities: ["Signature Goyal Clubhouse", "Swimming Pool with Gazebo", "Gymnasium & Yoga Hall", "Multipurpose Court", "Landscape Garden with Water Body", "Automated Security"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 950, superBuiltUpArea: 1235, bathrooms: 2, priceMin: 8200000, priceMax: 8200000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1480, superBuiltUpArea: 1924, bathrooms: 3, priceMin: 12500000, priceMax: 12500000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2250, superBuiltUpArea: 2925, bathrooms: 4, priceMin: 19500000, priceMax: 19500000, isAvailable: true }
    ]
  },
  {
    name: "Adani Shantigram Water Lily",
    slug: "adani-shantigram-water-lily-sg-highway-ahmedabad",
    developerName: "Adani Realty",
    cityName: "Ahmedabad",
    cityId: 1021,
    stateName: "Gujarat",
    locality: "SG Highway",
    siteAddress: "Shantigram Township, Near Vaishno Devi Circle, SG Highway, Ahmedabad, Gujarat",
    landmark: "Directly on SG Highway, near Nirma University",
    location: "SG Highway, Ahmedabad",
    latitude: 23.1482,
    longitude: 72.5481,
    priceMin: 16500000,
    priceMax: 45000000,
    pricePerSqFt: 7900,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "PR/GJ/AHMEDABAD/AHMEDABAD-CITY/AUDA/RAA00045/050817",
    totalUnits: 720,
    availableUnits: 28,
    totalTowers: 8,
    totalFloors: 16,
    totalLandArea: "600.0 Acres Township",
    salesPhone: "9879333440",
    salesEmail: "sales.waterlily@adani.com",
    searchKeywords: ["Shantigram flat", "Vaishno Devi Circle flat", "Adani Ahmedabad apartment"],
    description: "Adani Shantigram Water Lily is an elite lakeside condominium within Gujarat's largest 600-acre integrated township, featuring 7-acre lakefront views, Belvedere Golf and Country Club access, and musical fountains.",
    amenities: ["Belvedere Golf & Country Club Access", "Lakeside Promenade & Deck", "Heated Swimming Pool", "Squash & Tennis Academies", "Private Theatrette", "Multi-Tier Smart Security"],
    configurations: [
      { bhkType: "3 BHK", carpetArea: 1650, superBuiltUpArea: 2145, bathrooms: 3, priceMin: 16500000, priceMax: 16500000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2540, superBuiltUpArea: 3302, bathrooms: 4, priceMin: 28500000, priceMax: 28500000, isAvailable: true },
      { bhkType: "5 BHK Penthouse", carpetArea: 3950, superBuiltUpArea: 5135, bathrooms: 5, priceMin: 45000000, priceMax: 45000000, isAvailable: true }
    ]
  },
  {
    name: "Pacifica Green Acres",
    slug: "pacifica-green-acres-prahlad-nagar-ext-ahmedabad",
    developerName: "Pacifica Companies",
    cityName: "Ahmedabad",
    cityId: 1021,
    stateName: "Gujarat",
    locality: "Prahlad Nagar Extension",
    siteAddress: "Near Club O7, Shela, Prahlad Nagar Extension, Ahmedabad, Gujarat",
    landmark: "Directly opposite Club O7",
    location: "Prahlad Nagar Extension, Ahmedabad",
    latitude: 22.9981,
    longitude: 72.4682,
    priceMin: 4800000,
    priceMax: 11500000,
    pricePerSqFt: 4900,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "PR/GJ/AHMEDABAD/SANAND/AUDA/RAA00287/270917",
    totalUnits: 980,
    availableUnits: 36,
    totalTowers: 10,
    totalFloors: 14,
    totalLandArea: "12.0 Acres",
    salesPhone: "9879444550",
    salesEmail: "sales.greenacres@pacificacompanies.com",
    searchKeywords: ["Shela flat", "Prahlad Nagar Ext flat", "Club O7 flat Ahmedabad"],
    description: "Pacifica Green Acres in Shela / Prahlad Nagar Extension offers affordable luxury homes across 12 acres with landscaped podiums, swimming pool, and immediate access to Club O7 and SP Ring Road.",
    amenities: ["Residents Clubhouse", "Swimming Pool with Deck", "Indoor Games Room", "Landscaped Theme Gardens", "Children Play Zone", "Gated Controlled Security"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 810, superBuiltUpArea: 1053, bathrooms: 2, priceMin: 4800000, priceMax: 4800000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1220, superBuiltUpArea: 1586, bathrooms: 3, priceMin: 7400000, priceMax: 7400000, isAvailable: true },
      { bhkType: "3 BHK Large", carpetArea: 1650, superBuiltUpArea: 2145, bathrooms: 3, priceMin: 11500000, priceMax: 11500000, isAvailable: true }
    ]
  },

  // ==================== SURAT (4 projects) ====================
  {
    name: "Raghuvir Symphony",
    slug: "raghuvir-symphony-vesu-surat",
    developerName: "Raghuvir Developers",
    cityName: "Surat",
    cityId: 36,
    stateName: "Gujarat",
    locality: "Vesu",
    siteAddress: "VIP Road, Vesu, Surat, Gujarat",
    landmark: "Near Shyam Baba Temple & Vesu Canal Road",
    location: "Vesu, Surat",
    latitude: 21.1428,
    longitude: 72.7781,
    priceMin: 9800000,
    priceMax: 24500000,
    pricePerSqFt: 6200,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "PR/GJ/SURAT/SURAT-CITY/SUDA/RAA01201/050118",
    totalUnits: 320,
    availableUnits: 18,
    totalTowers: 4,
    totalFloors: 14,
    totalLandArea: "4.0 Acres",
    salesPhone: "9879511220",
    salesEmail: "sales.symphony@raghuvir.com",
    searchKeywords: ["Vesu Surat flat", "VIP Road Surat flat", "Surat luxury apartment"],
    description: "Raghuvir Symphony in prime Vesu offers luxurious 3 and 4 BHK residential apartments with imported Italian marble, banquet hall, swimming pool, and high-speed elevators.",
    amenities: ["Grand Clubhouse with Banquet", "Swimming Pool & Jacuzzi", "State-of-the-Art Gymnasium", "Indoor Badminton & Squash", "Landscaped Garden with Fountain", "Basement Parking"],
    configurations: [
      { bhkType: "3 BHK", carpetArea: 1450, superBuiltUpArea: 1885, bathrooms: 3, priceMin: 9800000, priceMax: 9800000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2150, superBuiltUpArea: 2795, bathrooms: 4, priceMin: 16500000, priceMax: 16500000, isAvailable: true },
      { bhkType: "4 BHK Penthouse", carpetArea: 3100, superBuiltUpArea: 4030, bathrooms: 5, priceMin: 24500000, priceMax: 24500000, isAvailable: true }
    ]
  },
  {
    name: "Ascon Era",
    slug: "ascon-era-piplod-surat",
    developerName: "Ascon Group",
    cityName: "Surat",
    cityId: 36,
    stateName: "Gujarat",
    locality: "Piplod",
    siteAddress: "Dumas Road, Piplod, Surat, Gujarat",
    landmark: "Directly opposite VR Mall Surat",
    location: "Piplod, Surat",
    latitude: 21.1542,
    longitude: 72.7619,
    priceMin: 13500000,
    priceMax: 32000000,
    pricePerSqFt: 7500,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "PR/GJ/SURAT/SURAT-CITY/SUDA/RAA02341/140418",
    totalUnits: 180,
    availableUnits: 12,
    totalTowers: 2,
    totalFloors: 14,
    totalLandArea: "2.5 Acres",
    salesPhone: "9879522330",
    salesEmail: "sales.era@ascon.co.in",
    searchKeywords: ["Piplod flat Surat", "VR Mall Surat flat", "Dumas Road apartment"],
    description: "Ascon Era in Piplod is an exclusive boutique residential high-rise directly across VR Mall Surat, offering grand sundecks, Italian marble floors, and private concierge.",
    amenities: ["Infinity Edge Rooftop Pool", "Sky Lounge with Dumas Road Views", "Fully Equipped Fitness Suite", "Children Play Arena", "Air-Conditioned Entrance Lobby", "Valet Parking"],
    configurations: [
      { bhkType: "3 BHK", carpetArea: 1650, superBuiltUpArea: 2145, bathrooms: 3, priceMin: 13500000, priceMax: 13500000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2550, superBuiltUpArea: 3315, bathrooms: 4, priceMin: 21500000, priceMax: 21500000, isAvailable: true },
      { bhkType: "5 BHK Duplex", carpetArea: 3800, superBuiltUpArea: 4940, bathrooms: 5, priceMin: 32000000, priceMax: 32000000, isAvailable: true }
    ]
  },
  {
    name: "Rajhans Synfonia",
    slug: "rajhans-synfonia-vesu-surat",
    developerName: "Rajhans (Desai-Jain) Group",
    cityName: "Surat",
    cityId: 36,
    stateName: "Gujarat",
    locality: "Vesu",
    siteAddress: "Vesu Canal Road, Near GD Goenka School, Vesu, Surat, Gujarat",
    landmark: "Near GD Goenka International School",
    location: "Vesu, Surat",
    latitude: 21.1398,
    longitude: 72.7845,
    priceMin: 8800000,
    priceMax: 21000000,
    pricePerSqFt: 5800,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "PR/GJ/SURAT/SURAT-CITY/SUDA/RAA03112/080718",
    totalUnits: 420,
    availableUnits: 22,
    totalTowers: 6,
    totalFloors: 14,
    totalLandArea: "5.0 Acres",
    salesPhone: "9879533440",
    salesEmail: "sales.synfonia@rajhans.co.in",
    searchKeywords: ["Vesu apartment Surat", "Rajhans Surat flat", "Canal Road Vesu flat"],
    description: "Rajhans Synfonia in Vesu provides resort-inspired luxury living with European architectural aesthetics, lush central gardens, swimming pool, and dedicated banquet amenities.",
    amenities: ["Resort Style Swimming Pool", "Clubhouse with Steam & Sauna", "Indoor Games Room", "Tennis Court", "Jogging Track in Landscaped Green", "24/7 Security"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 1050, superBuiltUpArea: 1365, bathrooms: 2, priceMin: 8800000, priceMax: 8800000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1540, superBuiltUpArea: 2002, bathrooms: 3, priceMin: 13500000, priceMax: 13500000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2250, superBuiltUpArea: 2925, bathrooms: 4, priceMin: 21000000, priceMax: 21000000, isAvailable: true }
    ]
  },
  {
    name: "Green City Surat",
    slug: "green-city-pal-surat",
    developerName: "Green Group",
    cityName: "Surat",
    cityId: 36,
    stateName: "Gujarat",
    locality: "Pal",
    siteAddress: "Pal-Bhatha Road, Pal, Surat, Gujarat",
    landmark: "Near Galaxy Circle & Pal Lake",
    location: "Pal, Surat",
    latitude: 21.1984,
    longitude: 72.7721,
    priceMin: 6500000,
    priceMax: 15500000,
    pricePerSqFt: 5100,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "PR/GJ/SURAT/SURAT-CITY/SUDA/RAA04101/180918",
    totalUnits: 650,
    availableUnits: 28,
    totalTowers: 8,
    totalFloors: 14,
    totalLandArea: "7.0 Acres",
    salesPhone: "9879544550",
    salesEmail: "sales.greencity@greengroup.in",
    searchKeywords: ["Pal Surat flat", "Galaxy Circle flat", "Adajan flat Surat"],
    description: "Green City in Pal offers tranquil family living close to Pal Lake and Galaxy Circle with wide landscaped boulevards, children park, clubhouse, and modern elevators.",
    amenities: ["Residents Clubhouse", "Swimming Pool", "Table Tennis & Snooker", "Jogging Track", "Lush Landscaped Central Garden", "Gated Security Guarding"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 880, superBuiltUpArea: 1144, bathrooms: 2, priceMin: 6500000, priceMax: 6500000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1350, superBuiltUpArea: 1755, bathrooms: 3, priceMin: 9800000, priceMax: 9800000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1950, superBuiltUpArea: 2535, bathrooms: 4, priceMin: 15500000, priceMax: 15500000, isAvailable: true }
    ]
  },

  // ==================== VADODARA (4 projects) ====================
  {
    name: "Samruddhi Skyline",
    slug: "samruddhi-skyline-vasna-bhayli-vadodara",
    developerName: "Samruddhi Group",
    cityName: "Vadodara",
    cityId: 37,
    stateName: "Gujarat",
    locality: "Vasna-Bhayli Road",
    siteAddress: "Vasna-Bhayli Main Road, Bhayli, Vadodara, Gujarat",
    landmark: "Near DPS School & Nilamber Bellissimo",
    location: "Vasna-Bhayli Road, Vadodara",
    latitude: 22.2842,
    longitude: 73.1245,
    priceMin: 5200000,
    priceMax: 12500000,
    pricePerSqFt: 4400,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "PR/GJ/VADODARA/VADODARA/VUDA/RAA02012/120318",
    totalUnits: 380,
    availableUnits: 20,
    totalTowers: 5,
    totalFloors: 12,
    totalLandArea: "4.5 Acres",
    salesPhone: "9879611220",
    salesEmail: "sales.skyline@samruddhigroup.com",
    searchKeywords: ["Bhayli Vadodara flat", "Vasna Bhayli apartment", "Vadodara flat"],
    description: "Samruddhi Skyline on Vasna-Bhayli Road provides contemporary high-rise apartments in Vadodara's prime residential hub, featuring club facilities, double-height foyer, and landscaped courtyards.",
    amenities: ["Clubhouse with Gymnasium", "Swimming Pool with Deck", "Indoor Games Room", "Kids Play Area", "Central Garden Sit-Out", "24/7 Security Intercom"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 850, superBuiltUpArea: 1105, bathrooms: 2, priceMin: 5200000, priceMax: 5200000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1280, superBuiltUpArea: 1664, bathrooms: 3, priceMin: 7800000, priceMax: 7800000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1890, superBuiltUpArea: 2457, bathrooms: 4, priceMin: 12500000, priceMax: 12500000, isAvailable: true }
    ]
  },
  {
    name: "Atlantis Kaze",
    slug: "atlantis-kaze-atladra-vadodara",
    developerName: "Pawan Group",
    cityName: "Vadodara",
    cityId: 37,
    stateName: "Gujarat",
    locality: "Atladra",
    siteAddress: "Near BAPS Swaminarayan Mandir, Atladra, Vadodara, Gujarat",
    landmark: "Directly opposite BAPS Swaminarayan Temple Atladra",
    location: "Atladra, Vadodara",
    latitude: 22.2612,
    longitude: 73.1518,
    priceMin: 6800000,
    priceMax: 16500000,
    pricePerSqFt: 4800,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "PR/GJ/VADODARA/VADODARA/VUDA/RAA03451/220818",
    totalUnits: 280,
    availableUnits: 16,
    totalTowers: 4,
    totalFloors: 14,
    totalLandArea: "3.5 Acres",
    salesPhone: "9879622330",
    salesEmail: "sales.kaze@atlantisgroup.in",
    searchKeywords: ["Atladra Vadodara flat", "Swaminarayan Temple flat", "Atlantis Vadodara flat"],
    description: "Atlantis Kaze is a Japanese-inspired minimalist architectural marvel near Atladra Swaminarayan Mandir, featuring Zen water gardens, infinity pool, and expansive sundecks.",
    amenities: ["Japanese Zen Water Gardens", "Rooftop Infinity Swimming Pool", "Modern Fitness Center", "Banquet Hall with Lawn", "Children Soft Play Area", "Controlled Gated Access"],
    configurations: [
      { bhkType: "3 BHK", carpetArea: 1350, superBuiltUpArea: 1755, bathrooms: 3, priceMin: 6800000, priceMax: 6800000, isAvailable: true },
      { bhkType: "3 BHK Luxury", carpetArea: 1680, superBuiltUpArea: 2184, bathrooms: 3, priceMin: 9800000, priceMax: 9800000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2450, superBuiltUpArea: 3185, bathrooms: 4, priceMin: 16500000, priceMax: 16500000, isAvailable: true }
    ]
  },
  {
    name: "Nilamber Palms",
    slug: "nilamber-palms-gotri-sevasi-vadodara",
    developerName: "Nilamber Group",
    cityName: "Vadodara",
    cityId: 37,
    stateName: "Gujarat",
    locality: "Gotri-Sevasi Road",
    siteAddress: "Gotri-Sevasi Canal Road, Gotri, Vadodara, Gujarat",
    landmark: "Near Sevasi Canal & Gotri Hospital",
    location: "Gotri-Sevasi Road, Vadodara",
    latitude: 22.3142,
    longitude: 73.1287,
    priceMin: 8500000,
    priceMax: 22000000,
    pricePerSqFt: 5200,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "PR/GJ/VADODARA/VADODARA/VUDA/RAA01980/040318",
    totalUnits: 220,
    availableUnits: 14,
    totalTowers: 3,
    totalFloors: 12,
    totalLandArea: "3.8 Acres",
    salesPhone: "9879633440",
    salesEmail: "sales.palms@nilamber.com",
    searchKeywords: ["Gotri flat Vadodara", "Sevasi flat", "Nilamber Vadodara flat"],
    description: "Nilamber Palms is a premium villa and luxury apartment sanctuary along Gotri-Sevasi Road featuring tropical landscaped palm trees, clubhouse, and superior Italian tile craftsmanship.",
    amenities: ["Tropical Palm Landscaping", "Clubhouse with Lap Pool", "Tennis & Basketball Courts", "Library & Co-Working Lounge", "Senior Citizen Pergola", "Covered Car Parking"],
    configurations: [
      { bhkType: "3 BHK", carpetArea: 1540, superBuiltUpArea: 2002, bathrooms: 3, priceMin: 8500000, priceMax: 8500000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2350, superBuiltUpArea: 3055, bathrooms: 4, priceMin: 14500000, priceMax: 14500000, isAvailable: true },
      { bhkType: "4 BHK Penthouse", carpetArea: 3200, superBuiltUpArea: 4160, bathrooms: 5, priceMin: 22000000, priceMax: 22000000, isAvailable: true }
    ]
  },
  {
    name: "Takshashila Air",
    slug: "takshashila-air-vasna-main-road-vadodara",
    developerName: "Takshashila Developers",
    cityName: "Vadodara",
    cityId: 37,
    stateName: "Gujarat",
    locality: "Vasna Main Road",
    siteAddress: "Vasna Main Road, Near Reliance Mega Mall, Vadodara, Gujarat",
    landmark: "Directly opposite Reliance Mega Mall",
    location: "Vasna Main Road, Vadodara",
    latitude: 22.2891,
    longitude: 73.1612,
    priceMin: 6200000,
    priceMax: 14000000,
    pricePerSqFt: 4600,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "PR/GJ/VADODARA/VADODARA/VUDA/RAA04812/281118",
    totalUnits: 340,
    availableUnits: 19,
    totalTowers: 4,
    totalFloors: 14,
    totalLandArea: "3.2 Acres",
    salesPhone: "9879644550",
    salesEmail: "sales.air@takshashila.in",
    searchKeywords: ["Vasna flat Vadodara", "Reliance Mall Vadodara flat", "Old Padra Road apartment"],
    description: "Takshashila Air on Vasna Main Road is an urban luxury residential tower overlooking green parks, offering state-of-the-art gym, rooftop infinity pool, and immediate walking access to shopping malls.",
    amenities: ["Rooftop Infinity Pool", "Sky Lounge with City Views", "Modern Fitness Suite", "Children Play Arena", "Air-Conditioned Banquet", "High-Tech Security"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 920, superBuiltUpArea: 1196, bathrooms: 2, priceMin: 6200000, priceMax: 6200000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1420, superBuiltUpArea: 1846, bathrooms: 3, priceMin: 8900000, priceMax: 8900000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2150, superBuiltUpArea: 2795, bathrooms: 4, priceMin: 14000000, priceMax: 14000000, isAvailable: true }
    ]
  },

  // ==================== BHUBANESWAR (4 projects) ====================
  {
    name: "Falcon Crest",
    slug: "falcon-crest-chandrasekharpur-bhubaneswar",
    developerName: "Falcon Real Estate",
    cityName: "Bhubaneswar",
    cityId: 71,
    stateName: "Odisha",
    locality: "Chandrasekharpur",
    siteAddress: "Damana Square, Chandrasekharpur, Bhubaneswar, Odisha",
    landmark: "Near Infosys Campus & Care Hospital",
    location: "Chandrasekharpur, Bhubaneswar",
    latitude: 20.3284,
    longitude: 85.8198,
    priceMin: 8500000,
    priceMax: 21000000,
    pricePerSqFt: 6400,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "RP/19/2018/00145",
    totalUnits: 360,
    availableUnits: 20,
    totalTowers: 4,
    totalFloors: 14,
    totalLandArea: "4.5 Acres",
    salesPhone: "9861111220",
    salesEmail: "sales.falconcrest@falconrealestate.in",
    searchKeywords: ["Chandrasekharpur flat", "Damana Bhubaneswar flat", "Infosys Bhubaneswar flat"],
    description: "Falcon Crest in Chandrasekharpur is an elite gated community located minutes away from the IT Hub and Infosys campus, featuring landscaped parks, swimming pool, and community club.",
    amenities: ["Residents Lifestyle Club", "Swimming Pool with Sundeck", "Badminton & Table Tennis", "Landscaped Central Park", "Children Play Arena", "24/7 Security Surveillance"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 950, superBuiltUpArea: 1235, bathrooms: 2, priceMin: 8500000, priceMax: 8500000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1480, superBuiltUpArea: 1924, bathrooms: 3, priceMin: 13500000, priceMax: 13500000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2200, superBuiltUpArea: 2860, bathrooms: 4, priceMin: 21000000, priceMax: 21000000, isAvailable: true }
    ]
  },
  {
    name: "Evos Sea Rose",
    slug: "evos-sea-rose-patia-bhubaneswar",
    developerName: "Evos Buildcon",
    cityName: "Bhubaneswar",
    cityId: 71,
    stateName: "Odisha",
    locality: "Patia",
    siteAddress: "KIIT Square, Patia, Bhubaneswar, Odisha",
    landmark: "Directly adjoining KIIT University Campus",
    location: "Patia, Bhubaneswar",
    latitude: 20.3541,
    longitude: 85.8182,
    priceMin: 9800000,
    priceMax: 24000000,
    pricePerSqFt: 6800,
    possessionDate: "2025-06-30T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "RP/19/2020/00382",
    totalUnits: 280,
    availableUnits: 24,
    totalTowers: 3,
    totalFloors: 16,
    totalLandArea: "3.2 Acres",
    salesPhone: "9861222330",
    salesEmail: "sales.searose@evosbuildcon.com",
    searchKeywords: ["Patia Bhubaneswar flat", "KIIT Bhubaneswar flat", "Evos Bhubaneswar apartment"],
    description: "Evos Sea Rose in Patia is a boutique luxury high-rise development next to KIIT University offering European-style balconies, rooftop infinity swimming pool, and dedicated executive lounges.",
    amenities: ["Rooftop Infinity Pool", "Sky Garden & Observation Deck", "Gymnasium & Yoga Studio", "Banquet Hall with Kitchen", "High Speed Schindler Elevators", "Automated Security"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 1040, superBuiltUpArea: 1352, bathrooms: 2, priceMin: 9800000, priceMax: 9800000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1560, superBuiltUpArea: 2028, bathrooms: 3, priceMin: 15500000, priceMax: 15500000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2350, superBuiltUpArea: 3055, bathrooms: 4, priceMin: 24000000, priceMax: 24000000, isAvailable: true }
    ]
  },
  {
    name: "Z1 Apartments",
    slug: "z1-apartments-nandankanan-road-patia-bhubaneswar",
    developerName: "Z Estates",
    cityName: "Bhubaneswar",
    cityId: 71,
    stateName: "Odisha",
    locality: "Nandankanan Road",
    siteAddress: "Nandankanan Road, Patia, Bhubaneswar, Odisha",
    landmark: "Near Nandankanan Zoological Park & DLF Cybercity",
    location: "Nandankanan Road, Bhubaneswar",
    latitude: 20.3684,
    longitude: 73.1287,
    priceMin: 12500000,
    priceMax: 28000000,
    pricePerSqFt: 7200,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "RP/19/2018/00088",
    totalUnits: 450,
    availableUnits: 15,
    totalTowers: 6,
    totalFloors: 18,
    totalLandArea: "10.0 Acres",
    salesPhone: "9861333440",
    salesEmail: "sales.z1@zestates.in",
    searchKeywords: ["Nandankanan Road flat", "Z1 Bhubaneswar flat", "Patia luxury flat"],
    description: "Z1 Apartments by Z Estates is an iconic gated township on Nandankanan Road offering ultra-luxury apartments with forest green views, Olympic-length swimming pool, and tennis courts.",
    amenities: ["Olympic Length Swimming Pool", "Club Z1 with Spa & Jacuzzi", "Tennis & Squash Courts", "Lush Landscaped Lawns", "Children Soft Play Arena", "24/7 Security with Intercom"],
    configurations: [
      { bhkType: "3 BHK", carpetArea: 1650, superBuiltUpArea: 2145, bathrooms: 3, priceMin: 12500000, priceMax: 12500000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 2480, superBuiltUpArea: 3224, bathrooms: 4, priceMin: 19500000, priceMax: 19500000, isAvailable: true },
      { bhkType: "4 BHK Penthouse", carpetArea: 3400, superBuiltUpArea: 4420, bathrooms: 5, priceMin: 28000000, priceMax: 28000000, isAvailable: true }
    ]
  },
  {
    name: "Assotech Pride",
    slug: "assotech-pride-rudrapur-bhubaneswar",
    developerName: "Assotech Group",
    cityName: "Bhubaneswar",
    cityId: 71,
    stateName: "Odisha",
    locality: "Rudrapur",
    siteAddress: "Near NH-16, Rudrapur, Bhubaneswar, Odisha",
    landmark: "Directly abutting NH-16 (Kolkata-Chennai Highway)",
    location: "Rudrapur, Bhubaneswar",
    latitude: 20.2981,
    longitude: 85.8945,
    priceMin: 5500000,
    priceMax: 13500000,
    pricePerSqFt: 5100,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "RP/19/2019/00234",
    totalUnits: 720,
    availableUnits: 30,
    totalTowers: 8,
    totalFloors: 14,
    totalLandArea: "12.0 Acres",
    salesPhone: "9861444550",
    salesEmail: "sales.pride@assotechcp.com",
    searchKeywords: ["Rudrapur flat Bhubaneswar", "NH 16 Bhubaneswar flat", "Assotech flat"],
    description: "Assotech Pride on NH-16 is a master-planned 12-acre township delivering modern residences with central green parks, sports facilities, clubhouse, and seamless highway connectivity.",
    amenities: ["Residents Clubhouse", "Swimming Pool & Kid's Splash Pool", "Cricket Pitch & Basketball Court", "Gymnasium & Yoga Deck", "Convenience Commercial Stores", "Gated Security Guarding"],
    configurations: [
      { bhkType: "2 BHK", carpetArea: 860, superBuiltUpArea: 1118, bathrooms: 2, priceMin: 5500000, priceMax: 5500000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1290, superBuiltUpArea: 1677, bathrooms: 3, priceMin: 8500000, priceMax: 8500000, isAvailable: true },
      { bhkType: "4 BHK", carpetArea: 1880, superBuiltUpArea: 2444, bathrooms: 4, priceMin: 13500000, priceMax: 13500000, isAvailable: true }
    ]
  },

  // ==================== THANE (4 projects) ====================
  {
    name: "Lodha Amāra",
    slug: "lodha-amara-kolshet-road-thane-west",
    developerName: "Macrotech Developers (Lodha)",
    cityName: "Thane",
    cityId: 5,
    stateName: "Maharashtra",
    locality: "Kolshet Road",
    siteAddress: "Kolshet Road, Thane West, Maharashtra",
    landmark: "Near Grand Central Park & Kolshet Creek",
    location: "Kolshet Road, Thane",
    latitude: 19.2312,
    longitude: 72.9984,
    priceMin: 8200000,
    priceMax: 24500000,
    pricePerSqFt: 12800,
    possessionDate: "Ready to Move",
    status: "READY_TO_MOVE",
    reraStatus: "VERIFIED",
    reraId: "P51700001096",
    totalUnits: 3500,
    availableUnits: 45,
    totalTowers: 30,
    totalFloors: 30,
    totalLandArea: "40.0 Acres",
    salesPhone: "9820511220",
    salesEmail: "sales.amara@lodhagroup.com",
    searchKeywords: ["Lodha Amara flat", "Kolshet Road Thane flat", "Thane West apartment"],
    description: "Lodha Amāra is a grand 40-acre residential oasis on Kolshet Road featuring a 2-acre private forest, 6 clubhouses, grand sports arena, and 25,000 sq.ft main clubhouse.",
    amenities: ["2-Acre Private Forest with Tree House", "6 Distinct Clubhouses", "Multiple Olympic-Length Pools", "Full Size Football Turf & Cricket Ground", "Ganesh Temple on Campus", "Automated Security"],
    configurations: [
      { bhkType: "1 BHK", carpetArea: 446, superBuiltUpArea: 580, bathrooms: 1, priceMin: 8200000, priceMax: 8200000, isAvailable: true },
      { bhkType: "2 BHK", carpetArea: 722, superBuiltUpArea: 938, bathrooms: 2, priceMin: 13500000, priceMax: 13500000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1100, superBuiltUpArea: 1430, bathrooms: 3, priceMin: 24500000, priceMax: 24500000, isAvailable: true }
    ]
  },
  {
    name: "Dosti West County",
    slug: "dosti-west-county-balkum-thane-west",
    developerName: "Dosti Realty",
    cityName: "Thane",
    cityId: 5,
    stateName: "Maharashtra",
    locality: "Balkum",
    siteAddress: "Old Mumbai-Agra Road, Balkum, Thane West, Maharashtra",
    landmark: "Near Balkum Naka & Viviana Mall",
    location: "Balkum, Thane",
    latitude: 19.2241,
    longitude: 72.9892,
    priceMin: 7800000,
    priceMax: 19500000,
    pricePerSqFt: 11900,
    possessionDate: "2025-06-30T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "P51700015258",
    totalUnits: 2200,
    availableUnits: 55,
    totalTowers: 16,
    totalFloors: 33,
    totalLandArea: "100.0 Acres Masterplan",
    salesPhone: "9820522330",
    salesEmail: "sales.westcounty@dostirealty.com",
    searchKeywords: ["Dosti West County flat", "Balkum Thane flat", "Thane flat apartment"],
    description: "Dosti West County is a 100-acre master-planned county in Balkum, Thane West offering European countryside lifestyle with Olympic sports coaching, swimming pool, and gardens.",
    amenities: ["County Clubhouse & Spa", "Olympic Size Lap Pool", "Cricket Pitch & Tennis Court", "Shiamak Davar Dance Academy", "Lush Landscaped Podium", "24/7 Monitored CCTV"],
    configurations: [
      { bhkType: "1 BHK", carpetArea: 425, superBuiltUpArea: 552, bathrooms: 1, priceMin: 7800000, priceMax: 7800000, isAvailable: true },
      { bhkType: "2 BHK", carpetArea: 685, superBuiltUpArea: 890, bathrooms: 2, priceMin: 12500000, priceMax: 12500000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1045, superBuiltUpArea: 1358, bathrooms: 3, priceMin: 19500000, priceMax: 19500000, isAvailable: true }
    ]
  },
  {
    name: "Piramal Vaikunth",
    slug: "piramal-vaikunth-balkum-thane-west",
    developerName: "Piramal Realty",
    cityName: "Thane",
    cityId: 5,
    stateName: "Maharashtra",
    locality: "Balkum",
    siteAddress: "Old Mumbai-Agra Road, Balkum, Thane West, Maharashtra",
    landmark: "Directly opposite ISKCON Temple Thane",
    location: "Balkum, Thane",
    latitude: 19.2198,
    longitude: 72.9845,
    priceMin: 9500000,
    priceMax: 32000000,
    pricePerSqFt: 13900,
    possessionDate: "2025-09-30T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "P51700003535",
    totalUnits: 1800,
    availableUnits: 38,
    totalTowers: 14,
    totalFloors: 32,
    totalLandArea: "32.0 Acres",
    salesPhone: "9820533440",
    salesEmail: "sales.vaikunth@piramal.com",
    searchKeywords: ["Piramal Vaikunth flat", "ISKCON Thane flat", "Balkum luxury flat"],
    description: "Piramal Vaikunth is a 32-acre spiritual and nature sanctuary in Balkum, Thane West housing an authentic ISKCON temple within the grounds, 40% green cover, and biophilic homes.",
    amenities: ["On-Campus ISKCON Temple", "60,000 Sq.Ft Clubhouse", "Swimming Pool with Timber Deck", "Squash & Badminton Courts", "Organic Farming Zone", "High-Tech Biometric Access"],
    configurations: [
      { bhkType: "1.5 BHK", carpetArea: 510, superBuiltUpArea: 663, bathrooms: 2, priceMin: 9500000, priceMax: 9500000, isAvailable: true },
      { bhkType: "2 BHK", carpetArea: 780, superBuiltUpArea: 1014, bathrooms: 2, priceMin: 14800000, priceMax: 14800000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1320, superBuiltUpArea: 1716, bathrooms: 3, priceMin: 26500000, priceMax: 26500000, isAvailable: true }
    ]
  },
  {
    name: "Kalpataru Parkcity",
    slug: "kalpataru-parkcity-kolshet-road-thane-west",
    developerName: "Kalpataru Limited",
    cityName: "Thane",
    cityId: 5,
    stateName: "Maharashtra",
    locality: "Kolshet Road",
    siteAddress: "Kolshet Road, Thane West, Maharashtra",
    landmark: "Directly adjoining 20+ Acre Grand Central Park",
    location: "Kolshet Road, Thane",
    latitude: 22.2384,
    longitude: 72.9912,
    priceMin: 8900000,
    priceMax: 28000000,
    pricePerSqFt: 13200,
    possessionDate: "2025-12-31T00:00:00.000Z",
    status: "UNDER_CONSTRUCTION",
    reraStatus: "VERIFIED",
    reraId: "P51700020175",
    totalUnits: 2500,
    availableUnits: 42,
    totalTowers: 20,
    totalFloors: 30,
    totalLandArea: "108.0 Acres Township",
    salesPhone: "9820544550",
    salesEmail: "sales.parkcity@kalpataru.com",
    searchKeywords: ["Kalpataru Parkcity flat", "Grand Central Park Thane flat", "Kolshet flat"],
    description: "Kalpataru Parkcity is a premier 108-acre integrated township centered around Thane's famous 20+ acre Grand Central Park, featuring lakefront gardens, Olympic sports facilities, and shopping boulevards.",
    amenities: ["Direct Access to 20-Acre Grand Central Park", "Lake Zone & Themed Botanical Gardens", "Olympic Size Pool with Sunken Deck", "Indoor Sports Pavilion", "Skating Rink & Jogging Trails", "24/7 Security"],
    configurations: [
      { bhkType: "1 BHK", carpetArea: 465, superBuiltUpArea: 605, bathrooms: 1, priceMin: 8900000, priceMax: 8900000, isAvailable: true },
      { bhkType: "2 BHK", carpetArea: 745, superBuiltUpArea: 968, bathrooms: 2, priceMin: 14200000, priceMax: 14200000, isAvailable: true },
      { bhkType: "3 BHK", carpetArea: 1220, superBuiltUpArea: 1586, bathrooms: 3, priceMin: 24500000, priceMax: 24500000, isAvailable: true }
    ]
  }
];

async function main() {
  console.log(`=== SOURCING PHOTOS AND SEEDING TIER-2 METROS BATCH 9 ===`);
  console.log(`Total projects to process: ${BATCH9_PROJECTS.length}`);

  const usedGlobalPhotos = new Set();

  for (let i = 0; i < BATCH9_PROJECTS.length; i++) {
    const p = BATCH9_PROJECTS[i];
    console.log(`\n[${i + 1}/${BATCH9_PROJECTS.length}] Processing ${p.name} in ${p.cityName}...`);

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

  fs.writeFileSync(DOCS_FILE, JSON.stringify(BATCH9_PROJECTS, null, 2));
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(BATCH9_PROJECTS, null, 2));
  console.log(`\nSaved ${BATCH9_PROJECTS.length} projects to ${DOCS_FILE} and ${PROJECTS_FILE}`);
}

main().catch(console.error);
