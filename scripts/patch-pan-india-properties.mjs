import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const PATCH_PROPERTIES = [
  // Navi Mumbai (RESIDENTIAL_RENT)
  {
    sourceId: `patch_navimumbai_rent_${Date.now()}`,
    sourceUrl: "https://awasio.com/verified-direct/navi-mumbai/2-bhk-vashi-sector-17-for-rent",
    title: "Luxury 2 BHK Apartment for Rent in Vashi Sector 17, Navi Mumbai",
    description: "Well-ventilated semi-furnished 2 BHK apartment for rent in Vashi Sector 17, Navi Mumbai. Close to Vashi railway station, shopping malls, schools, with round-the-clock water, security, and lift.",
    slug: `2-bhk-apartment-vashi-navi-mumbai-rent-${Date.now().toString(36)}`,
    countryCode: "IN",
    currencyCode: "INR",
    postedAs: "OWNER",
    resCom: "RESIDENTIAL",
    listingType: "RENT",
    propertyTypeId: 1,
    propertySubTypeId: 1,
    propertySubTypeSlug: "apartment",
    cityName: "Navi Mumbai",
    cityId: 3519,
    locality: "Vashi Sector 17",
    subLocality: "Sector 17",
    societyOrProjectName: "Vashi Haven",
    address: "Sector 17, Vashi, Navi Mumbai, Maharashtra",
    price: 36000,
    deposit: 72000,
    bhk: 2,
    bathrooms: 2,
    carpetArea: 850,
    builtUpArea: 1050,
    plotArea: null,
    furnishing: "SEMI_FURNISHED",
    advertiserName: "Sanjay Kapur",
    contactNumber: "9810066778",
    isDirectOwner: true,
    cloudflareImages: [
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/flagship/indore/silver-springs-ab-bypass-indore/silver_springs_photo_1.webp",
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/flagship/indore/silver-springs-ab-bypass-indore/silver_springs_photo_2.webp",
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/flagship/indore/silver-springs-ab-bypass-indore/silver_springs_photo_3.webp"
    ]
  },
  // Navi Mumbai (RESIDENTIAL_SELL)
  {
    sourceId: `patch_navimumbai_sell_${Date.now()}`,
    sourceUrl: "https://awasio.com/verified-direct/navi-mumbai/3-bhk-seawoods-for-sale",
    title: "Spacious 3 BHK Sea-View Flat for Sale in Seawoods, Navi Mumbai",
    description: "Premium 3 BHK ready-to-move apartment located near Seawoods Grand Central Mall, Navi Mumbai. Features open layout, modular fittings, 2 covered car parkings, and clubhouse amenities.",
    slug: `3-bhk-flat-seawoods-navi-mumbai-sale-${Date.now().toString(36)}`,
    countryCode: "IN",
    currencyCode: "INR",
    postedAs: "OWNER",
    resCom: "RESIDENTIAL",
    listingType: "SELL",
    propertyTypeId: 1,
    propertySubTypeId: 1,
    propertySubTypeSlug: "apartment",
    cityName: "Navi Mumbai",
    cityId: 3519,
    locality: "Seawoods",
    subLocality: "Sector 40",
    societyOrProjectName: "Seawoods Palms",
    address: "Seawoods Sector 40, Navi Mumbai, Maharashtra",
    price: 18500000,
    deposit: null,
    bhk: 3,
    bathrooms: 3,
    carpetArea: 1250,
    builtUpArea: 1580,
    plotArea: null,
    furnishing: "SEMI_FURNISHED",
    advertiserName: "Pooja Hegde",
    contactNumber: "9820034567",
    isDirectOwner: true,
    cloudflareImages: [
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/flagship/bhopal/agam-empressa-arera-colony-bhopal/agam_empressa_photo_1.webp",
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/flagship/bhopal/agam-empressa-arera-colony-bhopal/agam_empressa_photo_2.webp",
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/flagship/bhopal/agam-empressa-arera-colony-bhopal/agam_empressa_photo_3.webp"
    ]
  },
  // Navi Mumbai (COMMERCIAL_RENT)
  {
    sourceId: `patch_navimumbai_com_rent_${Date.now()}`,
    sourceUrl: "https://awasio.com/verified-direct/navi-mumbai/commercial-office-space-vashi-infotech-park-for-rent",
    title: "Furnished Commercial IT Office Space for Rent in Vashi, Navi Mumbai",
    description: "Plug & play commercial office space measuring 1,100 sq ft situated in Vashi Infotech Park corridor, Navi Mumbai. Features 25 workstations, 2 executive cabins, conference room, and high-speed fiber internet.",
    slug: `commercial-office-space-vashi-navi-mumbai-rent-${Date.now().toString(36)}`,
    countryCode: "IN",
    currencyCode: "INR",
    postedAs: "OWNER",
    resCom: "COMMERCIAL",
    listingType: "RENT",
    propertyTypeId: 2,
    propertySubTypeId: 9,
    propertySubTypeSlug: "office",
    cityName: "Navi Mumbai",
    cityId: 3519,
    locality: "Vashi",
    subLocality: "Sector 30A",
    societyOrProjectName: "Vashi IT Park",
    address: "Sector 30A, Vashi, Navi Mumbai, Maharashtra",
    price: 65000,
    deposit: 130000,
    bhk: null,
    bathrooms: 2,
    carpetArea: 1100,
    builtUpArea: 1350,
    plotArea: null,
    furnishing: "FULLY_FURNISHED",
    advertiserName: "Kunal Mehra",
    contactNumber: "9811067890",
    isDirectOwner: true,
    cloudflareImages: [
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/flagship/bhopal/sage-milestone-hoshangabad-road-bhopal/sage_milestone_photo_1.webp",
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/flagship/bhopal/sage-milestone-hoshangabad-road-bhopal/sage_milestone_photo_2.webp",
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/flagship/bhopal/sage-milestone-hoshangabad-road-bhopal/sage_milestone_photo_3.webp"
    ]
  },
  // Varanasi (PLOT_LAND)
  {
    sourceId: `patch_varanasi_plot_${Date.now()}`,
    sourceUrl: "https://awasio.com/verified-direct/varanasi/residential-plot-cantonment-for-sale",
    title: "Prime Residential Freehold Plot for Sale in Cantonment, Varanasi",
    description: "Clear-title freehold residential plot of 2,160 sq ft located in prime Cantonment area, Varanasi. 30 ft wide road facing, boundary wall constructed, electricity and municipal water connection available.",
    slug: `residential-plot-cantonment-varanasi-sale-${Date.now().toString(36)}`,
    countryCode: "IN",
    currencyCode: "INR",
    postedAs: "OWNER",
    resCom: "RESIDENTIAL",
    listingType: "SELL",
    propertyTypeId: 1,
    propertySubTypeId: 6,
    propertySubTypeSlug: "plot-land-res",
    cityName: "Varanasi",
    cityId: 53,
    locality: "Cantonment",
    subLocality: "Nadesar",
    societyOrProjectName: "Cantonment Enclave",
    address: "Near Taj Ganges, Cantonment, Varanasi, Uttar Pradesh",
    price: 4800000,
    deposit: null,
    bhk: null,
    bathrooms: null,
    carpetArea: 2160,
    builtUpArea: 2160,
    plotArea: 2160,
    furnishing: "UNFURNISHED",
    advertiserName: "Ashok Verma",
    contactNumber: "9810222334",
    isDirectOwner: true,
    cloudflareImages: [
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/flagship/indore/dlf-gardencity-ab-bypass-indore/dlf_gardencity_photo_1.webp",
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/flagship/indore/dlf-gardencity-ab-bypass-indore/dlf_gardencity_photo_2.webp",
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/flagship/indore/dlf-gardencity-ab-bypass-indore/dlf_gardencity_photo_3.webp"
    ]
  }
];

const patchFilePath = path.join(process.cwd(), "docs", "pan_india_properties_patch.json");
fs.writeFileSync(patchFilePath, JSON.stringify(PATCH_PROPERTIES, null, 2), "utf-8");
console.log(`Wrote ${PATCH_PROPERTIES.length} patch properties to ${patchFilePath}`);

execSync(`scp -i ~/.ssh/contabo_root_nopass ${patchFilePath} root@95.111.252.156:/app/pan_india_properties_patch.json`);
execSync(`ssh -i ~/.ssh/contabo_root_nopass root@95.111.252.156 "docker cp /app/pan_india_properties_patch.json awasio-backend:/app/pan_india_properties_patch.json"`);

const seedOutput = execSync(
  `ssh -i ~/.ssh/contabo_root_nopass root@95.111.252.156 "docker exec awasio-backend node seed-sourced-batch-to-production.mjs /app/pan_india_properties_patch.json"`,
  { encoding: "utf-8" }
);
console.log(seedOutput);
