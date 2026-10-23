import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "/Users/vinaykumar/Desktop/myProjects/awasio-backend/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";

const BASE_DIR = "/Users/vinaykumar/Desktop/awasio-sourced-properties";
const dir = path.join(BASE_DIR, "deep_inventory_images", "susmit-apartment-shivpuri-hazaribagh");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

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
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
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

async function run() {
  const url = `https://www.olx.in/api/relevance/v4/search?facet_limit=20&category=1723&query=Hazaribagh%20house%20flat`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" } });
  const json = await res.json();
  const items = json.data || [];
  const rawUrls = [];
  for (const it of items) {
    if (it.images) {
      for (const img of it.images) {
        if (img.url && !rawUrls.includes(img.url)) rawUrls.push(img.url);
        if (rawUrls.length >= 6) break;
      }
    }
  }

  const uploaded = [];
  for (let i = 0; i < Math.min(rawUrls.length, 5); i++) {
    const local = path.join(dir, `photo_${i + 1}.webp`);
    const r2Key = `projects/photos/susmit-apartment-shivpuri-hazaribagh/photo_${i + 1}.webp`;
    const ok = await downloadImage(rawUrls[i], local);
    if (ok) {
      const pubUrl = await uploadToCloudflareR2(local, r2Key);
      uploaded.push(pubUrl);
      console.log("Uploaded:", pubUrl);
    }
  }

  console.log("JSON array:", JSON.stringify(uploaded));
}

run().catch(console.error);
