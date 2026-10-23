import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "/Users/vinaykumar/Desktop/myProjects/awasio-backend/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";

const BASE_DIR = "/Users/vinaykumar/Desktop/awasio-sourced-properties";
const INVENTORY_FILE = path.join(BASE_DIR, "properties_master_inventory.json");
const MD_FILE = path.join(BASE_DIR, "properties_master_inventory.md");

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

async function uploadToCloudflare(localFilePath, r2Key) {
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

async function main() {
  console.log("=== UPLOADING SOURCED PROPERTY IMAGES TO CLOUDFLARE R2 ===");

  if (!fs.existsSync(INVENTORY_FILE)) {
    console.error("Inventory file not found:", INVENTORY_FILE);
    process.exit(1);
  }

  const properties = JSON.parse(fs.readFileSync(INVENTORY_FILE, "utf-8"));
  console.log(`Found ${properties.length} properties to process.\n`);

  let totalUploaded = 0;

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    console.log(`[${i + 1}/${properties.length}] Uploading photos for: "${prop.title.slice(0, 45)}..."`);

    const cloudflareUrls = [];

    for (const relPath of prop.localImages || []) {
      const fullLocalPath = path.join(BASE_DIR, relPath);
      if (!fs.existsSync(fullLocalPath)) {
        console.warn(`  File not found: ${fullLocalPath}`);
        continue;
      }

      const r2Key = `properties/photos/sourced/${relPath.replace(/^images\//, "")}`;
      try {
        const publicUrl = await uploadToCloudflare(fullLocalPath, r2Key);
        cloudflareUrls.push(publicUrl);
        totalUploaded++;
      } catch (err) {
        console.error(`  Upload failed for ${r2Key}:`, err.message);
      }
    }

    prop.cloudflareImages = cloudflareUrls;
    console.log(`  -> Uploaded ${cloudflareUrls.length} images to Cloudflare R2.`);
  }

  // Save updated JSON
  fs.writeFileSync(INVENTORY_FILE, JSON.stringify(properties, null, 2));

  // Also update workspace copy in docs/
  const docsDir = path.join(process.cwd(), "docs");
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(path.join(docsDir, "properties_master_inventory.json"), JSON.stringify(properties, null, 2));

  // Update Markdown table with Cloudflare Links
  let mdContent = `# Awasio Sourced Properties Inventory (Cloudflare R2 Stored)\n\n`;
  mdContent += `**Total Sourced Properties:** ${properties.length}\n`;
  mdContent += `**Total Uploaded to Cloudflare R2:** ${totalUploaded} images\n`;
  mdContent += `**Generated At:** ${new Date().toISOString()}\n\n`;
  mdContent += `| # | City | Locality | Type | BHK / Config | Price | Contact | Cloudflare Photos |\n`;
  mdContent += `|:--|:-----|:---------|:-----|:-------------|:------|:--------|:------------------|\n`;

  properties.forEach((p, idx) => {
    const config = p.bhk ? `${p.bhk} BHK (${p.carpetArea || p.builtUpArea || 0} sqft)` : p.propertySubTypeSlug;
    const coverUrl = p.cloudflareImages?.[0] ? `[View Photos (${p.cloudflareImages.length})](${p.cloudflareImages[0]})` : "None";
    mdContent += `| ${idx + 1} | **${p.cityName}** | ${p.locality} | \`${p.listingType}\` | ${config} | **${p.priceDisplay}** | \`${p.contactNumber}\` | ${coverUrl} |\n`;
  });

  mdContent += `\n\n---\n## Detailed Property Profiles & Cloudflare Assets\n\n`;
  properties.forEach((p, idx) => {
    mdContent += `### ${idx + 1}. ${p.title}\n`;
    mdContent += `- **City**: ${p.cityName} | **Locality**: ${p.locality}\n`;
    mdContent += `- **Listing Type**: ${p.listingType} | **Category**: ${p.propertyTypeSlug} (${p.propertySubTypeSlug})\n`;
    mdContent += `- **Price**: ${p.priceDisplay} | **Furnishing**: ${p.furnishing}\n`;
    mdContent += `- **Advertiser**: ${p.advertiserName} | **Contact**: \`${p.contactNumber}\`\n`;
    mdContent += `- **Description**: ${p.description}\n`;
    mdContent += `- **Cloudflare R2 Image URLs**:\n`;
    (p.cloudflareImages || []).forEach((url, uidx) => {
      mdContent += `  ${uidx + 1}. ${url}\n`;
    });
    mdContent += `\n`;
  });

  fs.writeFileSync(MD_FILE, mdContent);
  fs.writeFileSync(path.join(docsDir, "properties_master_inventory.md"), mdContent);

  console.log(`\n======================================================`);
  console.log(`COMPLETED! Successfully uploaded ${totalUploaded} images to Cloudflare R2.`);
  console.log(`Master JSON updated: ${INVENTORY_FILE}`);
  console.log(`Master Markdown updated: ${MD_FILE}`);
  console.log(`======================================================\n`);
}

main().catch(console.error);
