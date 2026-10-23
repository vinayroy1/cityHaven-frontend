import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "/Users/vinaykumar/Desktop/myProjects/awasio-backend/node_modules/@aws-sdk/client-s3/dist-cjs/index.js";

const BASE_DIR = "/Users/vinaykumar/Desktop/awasio-sourced-properties";
const PROJECT_IMAGES_DIR = path.join(BASE_DIR, "deep_inventory_images");
const PROJECTS_FILE = path.join(BASE_DIR, "deep_inventory_projects.json");
const DOCS_FILE = path.join(process.cwd(), "docs", "deep_inventory_projects.json");

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

async function searchPhotos(queries) {
  for (const q of queries) {
    const url = `https://www.olx.in/api/relevance/v4/search?facet_limit=20&category=1723&query=${encodeURIComponent(q)}`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
      });
      if (!res.ok) continue;
      const json = await res.json();
      const items = json.data || [];
      const photos = [];
      for (const item of items) {
        if (item.images && item.images.length >= 2) {
          for (const img of item.images) {
            if (img.url && !photos.includes(img.url)) photos.push(img.url);
            if (photos.length >= 6) return photos;
          }
        }
      }
      if (photos.length >= 4) return photos;
    } catch (err) {}
  }
  return [];
}

async function patch() {
  const projects = JSON.parse(fs.readFileSync(PROJECTS_FILE, "utf-8"));
  for (const p of projects) {
    if (p.slug === "siyaram-bisaka-enclave-bailey-road-patna" && (!p.images || p.images.length === 0)) {
      console.log(`Patching photos for ${p.name}...`);
      const dir = path.join(PROJECT_IMAGES_DIR, p.slug);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const rawUrls = await searchPhotos(["Patna Bailey Road flat", "Patna Gola Road flat", "Patna flat apartment"]);
      const uploaded = [];
      for (let i = 0; i < Math.min(rawUrls.length, 5); i++) {
        const localPath = path.join(dir, `photo_${i + 1}.webp`);
        const r2Key = `projects/photos/${p.slug}/photo_${i + 1}.webp`;
        const downloaded = await downloadImage(rawUrls[i], localPath);
        if (downloaded) {
          const publicUrl = await uploadToCloudflareR2(localPath, r2Key);
          uploaded.push(publicUrl);
          console.log(`  ✓ Uploaded: ${publicUrl}`);
        }
      }
      p.images = uploaded;
    }
  }
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  fs.writeFileSync(DOCS_FILE, JSON.stringify(projects, null, 2));
  console.log("Patch completed!");
}

patch().catch(console.error);
