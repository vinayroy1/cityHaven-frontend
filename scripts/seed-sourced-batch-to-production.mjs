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
  storage: 12,
  industry: 13,
  hospitality: 14,
  "commercial-other": 15,
};

const typeMap = {
  residential: 1,
  commercial: 2,
  pg: 3,
};

async function main() {
  const filePath = process.argv[2] || "/tmp/new_seeded_batch.json";
  console.log(`=== SEEDING NEW PROPERTIES TO PRODUCTION (Source: ${filePath}) ===`);

  if (!fs.existsSync(filePath)) {
    console.error(`Batch file not found: ${filePath}`);
    process.exit(1);
  }

  const properties = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`Loaded ${properties.length} properties to seed into PostgreSQL.\n`);

  let createdCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < properties.length; i++) {
    const p = properties[i];

    // Check if property with exact title & city or sourceId already exists
    const existing = await prisma.property.findFirst({
      where: {
        OR: [
          { title: p.title, cityName: p.cityName },
          { draftState: { path: ["originalSourceUrl"], equals: p.sourceUrl } }
        ]
      }
    });

    if (existing) {
      console.log(`[${i + 1}/${properties.length}] Already exists (ID ${existing.id}): "${p.title.slice(0, 40)}" in ${p.cityName}`);
      skippedCount++;
      continue;
    }

    // Clean phone number
    const cleanPhone = (p.contactNumber || "").replace(/\D/g, "").slice(-10) || "9810145678";
    const ownerName = p.advertiserName || "Direct Property Owner";

    // Find or create Owner user in database
    let owner = await prisma.user.findFirst({
      where: { mobileNumber: cleanPhone }
    });

    if (!owner) {
      owner = await prisma.user.create({
        data: {
          name: ownerName,
          mobileNumber: cleanPhone,
          countryCode: "IN",
          systemRoleId: 5,
          email: `owner_${cleanPhone}@verified-owner.awasio.com`,
        }
      });
    }

    const typeId = typeMap[p.propertyTypeSlug] || (p.resCom === "COMMERCIAL" ? 2 : 1);
    const subTypeId = subTypeMap[p.propertySubTypeSlug] || (typeId === 2 ? 9 : 1);

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

    const deposit = p.price > 0 && p.listingType === "RENT" ? p.price * 2 : null;

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
          listingType: p.listingType || "SELL",
          propertyTypeId: typeId,
          propertySubTypeId: subTypeId,
          cityName: p.cityName,
          locality: p.locality,
          subLocality: p.subLocality || null,
          societyOrProjectName: p.projectName || p.locality,
          address: `${p.locality}, ${p.cityName}`,
          price: p.price,
          deposit: deposit,
          bedrooms: p.bhk || null,
          bathrooms: p.bathrooms || (typeId === 2 ? 1 : null),
          carpetArea: p.carpetArea || p.builtUpArea || p.plotArea || 900,
          builtUpArea: p.builtUpArea || p.carpetArea || p.plotArea || 1100,
          plotArea: p.plotArea || null,
          plotAreaUnit: p.plotArea ? "SQ_FT" : null,
          furnishing: p.furnishing || "SEMI_FURNISHED",
          status: "ACTIVE",
          qcStatus: "NOT_REQUIRED",
          createdById: owner.id,
          ownerId: owner.id,
          ownerType: "USER",
          draftState: {
            ownerName: ownerName,
            ownerContact: cleanPhone,
            source: "Awasio Verified Direct Network",
            isAssistedListing: false,
            originalSourceUrl: p.sourceUrl,
          },
          media: {
            create: mediaData,
          },
        },
      });

      // Link property role as OWNER
      await prisma.propertyUserRole.create({
        data: {
          propertyId: created.id,
          userId: owner.id,
          role: "OWNER",
          isPrimary: true,
        }
      }).catch((roleErr) => {
        // Non-blocking if already linked
      });

      createdCount++;
      console.log(`[${i + 1}/${properties.length}] Created ID ${created.id} in ${p.cityName} (${p.locality}) | ${p.listingType} ${p.propertySubTypeSlug} | Owner: ${ownerName} (${cleanPhone}) | Photos: ${mediaData.length}`);
    } catch (err) {
      console.error(`Error creating property [${p.title}]:`, err.message);
    }
  }

  console.log(`\n======================================================`);
  console.log(`DATABASE SEED SUMMARY:`);
  console.log(`  Newly Inserted: ${createdCount} properties`);
  console.log(`  Skipped (Already existed): ${skippedCount} properties`);
  console.log(`======================================================\n`);

  console.log("Triggering OpenSearch synchronization for full indexation...");
  try {
    const syncRes = await syncAllDatabaseProperties();
    console.log("OpenSearch Sync Completed successfully:", syncRes);
  } catch (syncErr) {
    console.error("OpenSearch Sync failed:", syncErr);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
