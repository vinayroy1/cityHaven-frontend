import fs from "fs";
import crypto from "crypto";
import { prisma } from "./dist/prisma/client.js";
import { syncAllDatabaseProperties } from "./dist/src/lib/search/openSearchService.js";

function generatePropertySlug(params) {
  const parts = [];
  if (params.bedrooms && params.bedrooms > 0) {
    parts.push(`${params.bedrooms}-bhk`);
  }
  const rawType = params.propertySubTypeSlug || params.propertyTypeSlug || "";
  const typePart = rawType.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (typePart) parts.push(typePart);

  if (params.listingType === "RENT") parts.push("for-rent");
  else if (params.listingType === "SELL") parts.push("for-sale");
  else if (params.listingType === "PG") parts.push("pg");

  const rawLocality = params.societyOrProjectName || params.locality || "";
  const locality = rawLocality.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (locality) parts.push("in", locality);

  const rawCity = params.cityName || "";
  const city = rawCity.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (city && city !== locality) parts.push(city);

  if (parts.length === 0 && params.title) {
    const cleanTitle = params.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (cleanTitle) parts.push(cleanTitle);
  }

  const baseSlug = parts.join("-").replace(/-+/g, "-").slice(0, 75).replace(/-$/, "");
  const randomSuffix = crypto.randomUUID().replace(/[^a-z0-9]/g, "").slice(0, 6);
  return `${baseSlug || "property"}-${randomSuffix}`;
}

async function main() {
  console.log("=== SEEDING SOURCED PROPERTIES TO PRODUCTION ===");

  const raw = fs.readFileSync("/app/properties_master_inventory.json", "utf-8");
  const properties = JSON.parse(raw);
  console.log(`Loaded ${properties.length} properties from master inventory.`);

  // Subtype mapping
  const subTypeMap = {
    apartment: 1,
    "independent-house-villa": 2,
    "independent-builder-floor": 3,
    "1rk-studio-apartment": 4,
    "serviced-apartment": 5,
    "plot-land-res": 6,
    farmhouse: 7,
    "residential-other": 8,
    office: 9,
    retail: 10,
    "plot-land-com": 11,
    "pg-private-room": 16,
    "pg-shared-room": 17,
    "pg-bed": 18,
  };

  const typeMap = {
    residential: 1,
    commercial: 2,
    pg: 3,
  };

  let createdCount = 0;

  for (let i = 0; i < properties.length; i++) {
    const p = properties[i];

    // Check if property with similar title already exists
    const existing = await prisma.property.findFirst({
      where: {
        title: p.title,
        cityName: p.cityName,
      },
    });

    if (existing) {
      console.log(`[${i + 1}/${properties.length}] Already exists: "${p.title.slice(0, 40)}" (ID: ${existing.id})`);
      continue;
    }

    const typeId = typeMap[p.propertyTypeSlug] || 1;
    const subTypeId = subTypeMap[p.propertySubTypeSlug] || (typeId === 2 ? 9 : typeId === 3 ? 16 : 1);

    const slug = generatePropertySlug({
      title: p.title,
      bedrooms: p.bhk,
      propertySubTypeSlug: p.propertySubTypeSlug,
      propertyTypeSlug: p.propertyTypeSlug,
      listingType: p.listingType,
      locality: p.locality,
      cityName: p.cityName,
      societyOrProjectName: p.projectName,
    });

    const deposit = p.price > 0 ? (p.listingType === "RENT" ? p.price * 2 : null) : null;

    const mediaData = (p.cloudflareImages || []).map((url, uidx) => ({
      url: url,
      type: "IMAGE",
      order: uidx + 1,
    }));

    try {
      const created = await prisma.property.create({
        data: {
          title: p.title,
          description: p.description,
          slug: slug,
          countryCode: "IN",
          currencyCode: "INR",
          postedAs: p.isDirectOwner ? "OWNER" : "AGENT",
          resCom: p.resCom || "RESIDENTIAL",
          listingType: p.listingType || "RENT",
          propertyTypeId: typeId,
          propertySubTypeId: subTypeId,
          cityName: p.cityName,
          locality: p.locality,
          subLocality: p.subLocality || null,
          societyOrProjectName: p.projectName || p.locality,
          address: `${p.locality}, ${p.cityName}`,
          price: p.price || null,
          deposit: deposit,
          bedrooms: p.bhk || null,
          bathrooms: p.bathrooms || 1,
          carpetArea: p.carpetArea || p.builtUpArea || 800,
          builtUpArea: p.builtUpArea || p.carpetArea || 1000,
          furnishing: p.furnishing || "SEMI_FURNISHED",
          status: "ACTIVE",
          qcStatus: "NOT_REQUIRED",
          createdById: 3,
          ownerType: "USER",
          draftState: {
            ownerName: p.advertiserName || "Direct Owner",
            ownerContact: p.contactNumber || "+91 98444 22668",
            source: "Awasio Sourced Real Estate Network",
            isAssistedListing: true,
            originalSourceUrl: p.sourceUrl,
          },
          media: {
            create: mediaData,
          },
        },
      });

      createdCount++;
      console.log(`[${i + 1}/${properties.length}] Created ID ${created.id}: "${p.title.slice(0, 40)}" in ${p.cityName}`);
    } catch (err) {
      console.error(`Error creating property ${p.title}:`, err.message);
    }
  }

  console.log(`\n======================================================`);
  console.log(`Inserted ${createdCount} new active properties into PostgreSQL.`);
  console.log(`Now triggering OpenSearch Synchronization...`);
  console.log(`======================================================\n`);

  try {
    const syncRes = await syncAllDatabaseProperties();
    console.log("OpenSearch Sync Completed:", syncRes);
  } catch (syncErr) {
    console.error("OpenSearch Sync failed:", syncErr);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
