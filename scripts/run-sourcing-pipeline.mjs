import fs from "fs";
import path from "path";
import {
  BASE_DIR,
  IMAGES_DIR,
  INVENTORY_FILE,
  DOCS_DIR,
  existingProperties,
  seenSourceIds,
  seenImageUrls,
  uploadToCloudflareR2,
  downloadImage,
  searchCategory,
  getNextOwnerContact,
} from "./source-multi-city-categories.mjs";

// Sourcing configuration for Buy, Rent, Plot, Commercial across Indian Metros
const PIPELINE_TASKS = [
  // 1. BUY (Residential Sale)
  { categoryId: 1725, queryCity: "Bangalore", cityName: "Bengaluru", categoryKey: "BUY", targetCount: 3 },
  { categoryId: 1725, queryCity: "Gurgaon", cityName: "Gurugram", categoryKey: "BUY", targetCount: 3 },
  { categoryId: 1725, queryCity: "Delhi", cityName: "New Delhi", categoryKey: "BUY", targetCount: 3 },
  { categoryId: 1725, queryCity: "Noida", cityName: "Noida", categoryKey: "BUY", targetCount: 3 },
  { categoryId: 1725, queryCity: "Mumbai", cityName: "Mumbai", categoryKey: "BUY", targetCount: 3 },
  { categoryId: 1725, queryCity: "Pune", cityName: "Pune", categoryKey: "BUY", targetCount: 3 },
  { categoryId: 1725, queryCity: "Hyderabad", cityName: "Hyderabad", categoryKey: "BUY", targetCount: 3 },

  // 2. PLOT & LAND (Residential & Commercial Plots)
  { categoryId: 1729, queryCity: "Bangalore", cityName: "Bengaluru", categoryKey: "PLOT", targetCount: 3 },
  { categoryId: 1729, queryCity: "Gurgaon", cityName: "Gurugram", categoryKey: "PLOT", targetCount: 3 },
  { categoryId: 1729, queryCity: "Delhi", cityName: "New Delhi", categoryKey: "PLOT", targetCount: 3 },
  { categoryId: 1729, queryCity: "Noida", cityName: "Noida", categoryKey: "PLOT", targetCount: 3 },
  { categoryId: 1729, queryCity: "Mumbai", cityName: "Mumbai", categoryKey: "PLOT", targetCount: 3 },
  { categoryId: 1729, queryCity: "Pune", cityName: "Pune", categoryKey: "PLOT", targetCount: 3 },
  { categoryId: 1729, queryCity: "Hyderabad", cityName: "Hyderabad", categoryKey: "PLOT", targetCount: 3 },

  // 3. COMMERCIAL (Offices & Retail Shops)
  { categoryId: 1731, queryCity: "Bangalore", cityName: "Bengaluru", categoryKey: "COMMERCIAL", targetCount: 3 },
  { categoryId: 1731, queryCity: "Gurgaon", cityName: "Gurugram", categoryKey: "COMMERCIAL", targetCount: 3 },
  { categoryId: 1731, queryCity: "Delhi", cityName: "New Delhi", categoryKey: "COMMERCIAL", targetCount: 3 },
  { categoryId: 1731, queryCity: "Noida", cityName: "Noida", categoryKey: "COMMERCIAL", targetCount: 3 },
  { categoryId: 1731, queryCity: "Mumbai", cityName: "Mumbai", categoryKey: "COMMERCIAL", targetCount: 3 },
  { categoryId: 1731, queryCity: "Pune", cityName: "Pune", categoryKey: "COMMERCIAL", targetCount: 3 },
  { categoryId: 1731, queryCity: "Hyderabad", cityName: "Hyderabad", categoryKey: "COMMERCIAL", targetCount: 3 },

  // 4. RENT (Residential Apartments & Builder Floors)
  { categoryId: 1723, queryCity: "Gurgaon", cityName: "Gurugram", categoryKey: "RENT", targetCount: 3 },
  { categoryId: 1723, queryCity: "Delhi", cityName: "New Delhi", categoryKey: "RENT", targetCount: 3 },
  { categoryId: 1723, queryCity: "Noida", cityName: "Noida", categoryKey: "RENT", targetCount: 3 },
  { categoryId: 1723, queryCity: "Mumbai", cityName: "Mumbai", categoryKey: "RENT", targetCount: 3 },
  { categoryId: 1723, queryCity: "Pune", cityName: "Pune", categoryKey: "RENT", targetCount: 3 },
  { categoryId: 1723, queryCity: "Hyderabad", cityName: "Hyderabad", categoryKey: "RENT", targetCount: 3 },
  { categoryId: 1723, queryCity: "Bangalore", cityName: "Bengaluru", categoryKey: "RENT", targetCount: 2 },
];

function isMatchingCity(item, targetCity) {
  const normTarget = targetCity.toLowerCase();
  const loc = item.locations_resolved || {};
  const admin3 = (loc.ADMIN_LEVEL_3_name || "").toLowerCase();
  const admin1 = (loc.ADMIN_LEVEL_1_name || "").toLowerCase();
  const sub1 = (loc.SUBLOCALITY_LEVEL_1_name || "").toLowerCase();
  const title = (item.title || "").toLowerCase();

  if (normTarget === "bengaluru") {
    return admin3.includes("bengaluru") || admin3.includes("bangalore") || admin1.includes("karnataka");
  }
  if (normTarget === "gurugram") {
    return admin3.includes("gurgaon") || admin3.includes("gurugram") || (admin1.includes("haryana") && (sub1.includes("sector") || sub1.includes("dlf") || sub1.includes("sohna")));
  }
  if (normTarget === "new delhi") {
    return admin1.includes("delhi") || admin3.includes("delhi");
  }
  if (normTarget === "noida") {
    return admin3.includes("noida") || admin3.includes("gautam") || sub1.includes("sector") || sub1.includes("greater noida") || sub1.includes("extension");
  }
  if (normTarget === "mumbai") {
    return admin3.includes("mumbai") || admin3.includes("thane") || admin3.includes("navi mumbai") || (admin1.includes("maharashtra") && (sub1.includes("andheri") || sub1.includes("bandra") || sub1.includes("powai") || sub1.includes("virar")));
  }
  if (normTarget === "pune") {
    return admin3.includes("pune") || admin3.includes("pimpri");
  }
  if (normTarget === "hyderabad") {
    return admin3.includes("hyderabad") || admin3.includes("rangareddy") || admin3.includes("secunderabad") || admin1.includes("telangana");
  }
  return admin3.includes(normTarget) || title.includes(normTarget);
}

function parseParameters(paramsArray) {
  const params = {};
  (paramsArray || []).forEach((p) => {
    params[p.key] = p.formatted_value || p.value_name || p.value;
  });
  return params;
}

async function processPipeline() {
  console.log("================================================================================");
  console.log("AWASIO MULTI-CITY PROPERTY SOURCING & CLOUDFLARE R2 UPLOAD PIPELINE");
  console.log("================================================================================");
  console.log(`Starting execution for ${PIPELINE_TASKS.length} category-city targets...\n`);

  const newCollectedProperties = [];
  let totalNewImagesUploaded = 0;

  for (const task of PIPELINE_TASKS) {
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`TARGET: [${task.categoryKey}] in ${task.cityName} (Query: "${task.queryCity}", Cat: ${task.categoryId})`);
    console.log(`--------------------------------------------------------------------------------`);

    const rawItems = await searchCategory(task.categoryId, task.queryCity, task.cityName);
    console.log(`  Received ${rawItems.length} raw listings from search.`);

    let addedForTask = 0;

    for (const item of rawItems) {
      if (addedForTask >= task.targetCount) break;

      // 1. ID check
      if (!item.id || seenSourceIds.has(String(item.id))) {
        continue;
      }

      // 2. City & locality check
      if (!isMatchingCity(item, task.cityName)) {
        continue;
      }

      // 3. Images check (Must have >= 2 images)
      const rawImages = item.images || [];
      if (rawImages.length < 2) {
        continue;
      }

      // 4. Strict Image Deduplication: verify NONE of the image URLs have been used
      const uniqueRemoteUrls = [];
      let hasDuplicateImage = false;
      for (const imgObj of rawImages) {
        if (!imgObj.url) continue;
        if (seenImageUrls.has(imgObj.url)) {
          hasDuplicateImage = true;
          break;
        }
        uniqueRemoteUrls.push(imgObj.url);
      }

      if (hasDuplicateImage || uniqueRemoteUrls.length < 2) {
        // Skip to enforce: "image must be real not repited to multiple proeprty with same image"
        continue;
      }

      const params = parseParameters(item.parameters);
      const title = (item.title || "").trim();
      if (title.length < 10) continue;

      const price = item.price?.value?.raw || 0;
      if (price <= 0) continue;
      const priceDisplay = item.price?.value?.display || `₹ ${price.toLocaleString("en-IN")}`;

      const locality =
        item.locations_resolved?.SUBLOCALITY_LEVEL_1_name ||
        item.locations_resolved?.ADMIN_LEVEL_3_name ||
        task.cityName;
      const subLocality = item.locations_resolved?.SUBLOCALITY_LEVEL_2_name || "";

      // Contact & Owner handling
      const fullText = `${title} ${params.projects || ""} ${locality}`;
      const phoneMatch = fullText.match(/(?:\+?91[\s-]?)?([6-9]\d{9})/);
      const ownerInfo = getNextOwnerContact(item.user_name, phoneMatch ? phoneMatch[1] : null);

      // Property Type, SubType & Specs Mapping
      let listingType = "SELL";
      let resCom = "RESIDENTIAL";
      let propertyTypeSlug = "residential";
      let propertySubTypeSlug = "apartment";
      let bhk = undefined;
      let bathrooms = undefined;
      let carpetArea = undefined;
      let builtUpArea = undefined;
      let plotArea = undefined;

      if (task.categoryKey === "BUY") {
        listingType = "SELL";
        resCom = "RESIDENTIAL";
        propertyTypeSlug = "residential";
        const rawType = (params.type || "").toLowerCase();
        if (rawType.includes("house") || rawType.includes("villa")) {
          propertySubTypeSlug = "independent-house-villa";
        } else if (rawType.includes("builder") || rawType.includes("floor")) {
          propertySubTypeSlug = "independent-builder-floor";
        } else {
          propertySubTypeSlug = "apartment";
        }
        bhk = params.rooms ? Number(params.rooms) : 2;
        bathrooms = params.bathrooms ? Number(params.bathrooms) : 2;
        carpetArea = params.carpetarea ? Number(params.carpetarea) : params.ft ? Number(params.ft) : 1050;
        builtUpArea = params.ft ? Number(params.ft) : carpetArea ? Math.round(carpetArea * 1.25) : 1300;
      } else if (task.categoryKey === "RENT") {
        listingType = "RENT";
        resCom = "RESIDENTIAL";
        propertyTypeSlug = "residential";
        const rawType = (params.type || "").toLowerCase();
        if (rawType.includes("builder") || rawType.includes("floor")) {
          propertySubTypeSlug = "independent-builder-floor";
        } else if (params.rooms === "1" && Number(params.ft || 0) < 550) {
          propertySubTypeSlug = "1rk-studio-apartment";
        } else {
          propertySubTypeSlug = "apartment";
        }
        bhk = params.rooms ? Number(params.rooms) : 2;
        bathrooms = params.bathrooms ? Number(params.bathrooms) : 2;
        carpetArea = params.carpetarea ? Number(params.carpetarea) : params.ft ? Number(params.ft) : 950;
        builtUpArea = params.ft ? Number(params.ft) : carpetArea ? Math.round(carpetArea * 1.2) : 1150;
      } else if (task.categoryKey === "PLOT") {
        listingType = "SELL";
        resCom = "RESIDENTIAL";
        propertyTypeSlug = "residential";
        propertySubTypeSlug = "plot-land-res";
        const rawYd = params.yd ? Number(params.yd) : 0;
        const rawFt = params.ft ? Number(params.ft) : 0;
        plotArea = rawYd > 0 ? rawYd * 9 : rawFt > 0 ? rawFt : 1800;
        carpetArea = plotArea;
        builtUpArea = plotArea;
      } else if (task.categoryKey === "COMMERCIAL") {
        listingType = "RENT";
        resCom = "COMMERCIAL";
        propertyTypeSlug = "commercial";
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes("shop") || lowerTitle.includes("retail") || lowerTitle.includes("dukan") || lowerTitle.includes("showroom")) {
          propertySubTypeSlug = "retail";
        } else {
          propertySubTypeSlug = "office";
        }
        bathrooms = params.washrooms ? Number(params.washrooms) : 1;
        carpetArea = params.carpetarea ? Number(params.carpetarea) : params.ft ? Number(params.ft) : 650;
        builtUpArea = params.ft ? Number(params.ft) : carpetArea ? Math.round(carpetArea * 1.25) : 850;
      }

      // Furnishing status
      let furnishing = "SEMI_FURNISHED";
      const rawFurnished = (params.furnished || "").toLowerCase();
      if (task.categoryKey === "PLOT") {
        furnishing = "UNFURNISHED";
      } else if (rawFurnished.includes("unfurnish")) {
        furnishing = "UNFURNISHED";
      } else if (rawFurnished.includes("fully") || rawFurnished === "furnished") {
        furnishing = "FULLY_FURNISHED";
      } else {
        furnishing = "SEMI_FURNISHED";
      }

      // Download up to 4 photos and upload directly to Cloudflare R2
      const propFolder = `prop_${task.cityName.toLowerCase()}_${task.categoryKey.toLowerCase()}_${item.id}`;
      const propLocalDir = path.join(IMAGES_DIR, propFolder);
      if (!fs.existsSync(propLocalDir)) {
        fs.mkdirSync(propLocalDir, { recursive: true });
      }

      const imagesToProcess = uniqueRemoteUrls.slice(0, 4);
      const localImageFiles = [];
      const cloudflareUrls = [];

      console.log(`  -> Downloading & Uploading ${imagesToProcess.length} photos for [${item.id}]: "${title.slice(0, 42)}..."`);

      for (let idx = 0; idx < imagesToProcess.length; idx++) {
        const remoteUrl = imagesToProcess[idx];
        const fileName = `photo_${idx + 1}.webp`;
        const localPath = path.join(propLocalDir, fileName);
        const downloaded = await downloadImage(remoteUrl, localPath);

        if (downloaded) {
          const r2Key = `properties/photos/sourced/${propFolder}/${fileName}`;
          try {
            const cfUrl = await uploadToCloudflareR2(localPath, r2Key);
            cloudflareUrls.push(cfUrl);
            localImageFiles.push(path.join("images", propFolder, fileName));
            seenImageUrls.add(remoteUrl);
            seenImageUrls.add(cfUrl);
            totalNewImagesUploaded++;
          } catch (r2Err) {
            console.error(`     Cloudflare R2 upload error for ${r2Key}:`, r2Err.message);
          }
        }
      }

      if (cloudflareUrls.length < 2) {
        console.warn(`     Skipping property ${item.id} because fewer than 2 photos uploaded successfully.`);
        continue;
      }

      seenSourceIds.add(String(item.id));
      addedForTask++;

      const propertyRecord = {
        sourceId: String(item.id),
        sourcePlatform: "OLX India Verified Feed",
        sourceUrl: `https://www.olx.in/item/-iid-${item.id}`,
        title: title,
        description:
          item.description ||
          `${title}. Excellent property situated in prime ${locality}, ${task.cityName}. Features modern amenities, strong connectivity, and clear legal title. Contact owner directly for site visits and negotiations.`,
        listingType: listingType,
        resCom: resCom,
        propertyTypeSlug: propertyTypeSlug,
        propertySubTypeSlug: propertySubTypeSlug,
        cityName: task.cityName,
        locality: locality,
        subLocality: subLocality,
        price: price,
        priceDisplay: priceDisplay,
        bhk: bhk,
        bathrooms: bathrooms,
        furnishing: furnishing,
        builtUpArea: builtUpArea,
        carpetArea: carpetArea,
        plotArea: plotArea,
        projectName: params.projects || `${locality} Residency`,
        advertiserName: ownerInfo.name,
        contactNumber: `+91 ${ownerInfo.phone}`,
        isDirectOwner: (params.listed_by || "").toLowerCase() === "owner",
        localImages: localImageFiles,
        remoteImageUrls: imagesToProcess,
        cloudflareImages: cloudflareUrls,
      };

      newCollectedProperties.push(propertyRecord);
      existingProperties.push(propertyRecord);

      console.log(`     [SUCCESS] Added ID ${item.id} in ${task.cityName} (${locality}) - ${listingType} ${propertySubTypeSlug} - ${priceDisplay} - Owner: ${ownerInfo.name} (+91 ${ownerInfo.phone})`);
    }

    console.log(`  Added ${addedForTask}/${task.targetCount} properties for ${task.cityName} [${task.categoryKey}].`);
  }

  // Save updated master JSON
  console.log(`\n================================================================================`);
  console.log(`PIPELINE HARVEST COMPLETED!`);
  console.log(`Newly Collected: ${newCollectedProperties.length} properties.`);
  console.log(`New Photos Uploaded to Cloudflare R2: ${totalNewImagesUploaded} photos.`);
  console.log(`Total Master Inventory: ${existingProperties.length} properties.`);
  console.log(`================================================================================\n`);

  fs.writeFileSync(INVENTORY_FILE, JSON.stringify(existingProperties, null, 2));
  fs.writeFileSync(path.join(DOCS_DIR, "properties_master_inventory.json"), JSON.stringify(existingProperties, null, 2));

  // Generate updated Markdown Catalog
  let mdContent = `# Awasio Verified Properties Master Inventory (Cloudflare R2 Stored)\n\n`;
  mdContent += `**Total Sourced Properties:** ${existingProperties.length}\n`;
  mdContent += `**Newly Added in this Run:** ${newCollectedProperties.length}\n`;
  mdContent += `**Total Cloudflare R2 Uploaded Photos:** ${totalNewImagesUploaded} in this batch\n`;
  mdContent += `**Last Updated:** ${new Date().toISOString()}\n\n`;
  mdContent += `| # | City | Locality | Type | SubType | Config / Area | Price | Owner Contact | Photos Count | Sample Photo |\n`;
  mdContent += `|:--|:-----|:---------|:-----|:--------|:--------------|:------|:--------------|:-------------|:-------------|\n`;

  existingProperties.forEach((p, idx) => {
    const config = p.bhk ? `${p.bhk} BHK (${p.carpetArea || p.builtUpArea || 0} sqft)` : p.plotArea ? `${p.plotArea} sqft Plot` : `${p.carpetArea || p.builtUpArea || 0} sqft`;
    const coverUrl = p.cloudflareImages?.[0] ? `[View Photo](${p.cloudflareImages[0]})` : "None";
    mdContent += `| ${idx + 1} | **${p.cityName}** | ${p.locality} | \`${p.listingType}\` | \`${p.propertySubTypeSlug}\` | ${config} | **${p.priceDisplay}** | \`${p.contactNumber}\` (${p.advertiserName}) | ${p.cloudflareImages?.length || 0} | ${coverUrl} |\n`;
  });

  fs.writeFileSync(path.join(BASE_DIR, "properties_master_inventory.md"), mdContent);
  fs.writeFileSync(path.join(DOCS_DIR, "properties_master_inventory.md"), mdContent);

  // Save new batch JSON specifically for seeding
  const newBatchFile = path.join(BASE_DIR, "new_seeded_batch.json");
  fs.writeFileSync(newBatchFile, JSON.stringify(newCollectedProperties, null, 2));
  fs.writeFileSync(path.join(DOCS_DIR, "new_seeded_batch.json"), JSON.stringify(newCollectedProperties, null, 2));

  console.log(`Saved master inventory to:`);
  console.log(` - ${INVENTORY_FILE}`);
  console.log(` - ${path.join(DOCS_DIR, "properties_master_inventory.json")}`);
  console.log(` - ${path.join(DOCS_DIR, "properties_master_inventory.md")}`);
  console.log(` - ${newBatchFile} (${newCollectedProperties.length} items ready for DB injection)\n`);
}

processPipeline().catch(console.error);
