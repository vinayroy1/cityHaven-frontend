import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "/Users/vinaykumar/Desktop/myProjects/awasio-backend/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";

const BASE_DIR = "/Users/vinaykumar/Desktop/awasio-sourced-properties";
const PROJECT_IMAGES_DIR = path.join(BASE_DIR, "tier2_batch3_images");
const PROJECTS_FILE = path.join(BASE_DIR, "tier2_metros_batch3.json");
const DOCS_FILE = path.join(process.cwd(), "docs", "tier2_metros_batch3.json");

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
  const url = `https://www.olx.in/api/relevance/v4/search?facet_limit=30&category=1723&query=${encodeURIComponent(query)}`;
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

async function patch() {
  const raw = JSON.parse(fs.readFileSync(DOCS_FILE, "utf-8"));
  const usedImages = new Set();
  for (const p of raw) {
    if (p.images) {
      for (const img of p.images) usedImages.add(img);
    }
  }

  for (const p of raw) {
    if (!p.images || p.images.length < 3) {
      console.log(`Patching missing images for: ${p.name} in ${p.cityName}...`);
      let query = `${p.cityName} flat`;
      if (p.cityName === "Dehradun") query = "Dehradun flat apartment";
      if (p.cityName === "Faridabad") query = "Faridabad flat apartment";

      const photos = await fetchPhotosForQuery(query);
      const projectDir = path.join(PROJECT_IMAGES_DIR, p.slug);
      if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });

      const uploaded = p.images || [];
      for (let j = 0; j < photos.length; j++) {
        if (uploaded.length >= 5) break;
        const photoUrl = photos[j];
        if (usedImages.has(photoUrl)) continue;
        usedImages.add(photoUrl);

        const idx = uploaded.length + 1;
        const localFile = path.join(projectDir, `photo_${idx}.webp`);
        const r2Key = `projects/photos/${p.slug}/photo_${idx}.webp`;

        const ok = await downloadImage(photoUrl, localFile);
        if (ok) {
          const url = await uploadToCloudflareR2(localFile, r2Key);
          uploaded.push(url);
          console.log(`  ✓ Uploaded: ${url}`);
        }
      }
      p.images = uploaded;
    }
  }

  fs.writeFileSync(DOCS_FILE, JSON.stringify(raw, null, 2));
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(raw, null, 2));
  console.log("Successfully patched missing images for Batch 3!");
}

patch().catch(console.error);
