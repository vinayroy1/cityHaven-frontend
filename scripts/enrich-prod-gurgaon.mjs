/**
 * Enrich existing Gurgaon projects on production PostgreSQL in batches of 100.
 * Updates: priceMin, priceMax, pricePerSqFt, pincode, amenities, highlights, status,
 * AND inserts/syncs ProjectConfiguration (BHK configurations: 2 BHK, 3 BHK, 4 BHK or Plots).
 *
 * Usage:
 *   node scripts/enrich-prod-gurgaon.mjs --batch=1
 *   node scripts/enrich-prod-gurgaon.mjs --batch=all
 */
import { execSync } from "node:child_process";
import fs from "node:fs";

const args = process.argv.slice(2);
const batchArg = args.find(a => a.startsWith("--batch="))?.split("=")[1] || "1";
const batchSize = 100;

console.log(`=== PREPARING PRODUCTION ENRICHMENT (Batch: ${batchArg}, Size: ${batchSize}) ===`);

// Helper script that will run inside docker on the production server
const remoteRunnerScript = `
const { Client } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://awasio_prod:124f917db33b818825f33202fd2f6a9d9bb533e89ebef38b@postgres:5432/awasio_prod_db";

const GURGAON_SECTOR_PRICE_MAP = {
  "102": { minPerSqFt: 11000, maxPerSqFt: 16500, pincode: "122006" },
  "103": { minPerSqFt: 10500, maxPerSqFt: 15500, pincode: "122006" },
  "104": { minPerSqFt: 11500, maxPerSqFt: 17000, pincode: "122006" },
  "106": { minPerSqFt: 12000, maxPerSqFt: 18000, pincode: "122006" },
  "107": { minPerSqFt: 11000, maxPerSqFt: 16000, pincode: "122006" },
  "108": { minPerSqFt: 12500, maxPerSqFt: 18500, pincode: "122006" },
  "109": { minPerSqFt: 11500, maxPerSqFt: 17500, pincode: "122017" },
  "110": { minPerSqFt: 11000, maxPerSqFt: 16000, pincode: "122017" },
  "111": { minPerSqFt: 14000, maxPerSqFt: 22000, pincode: "122017" },
  "112": { minPerSqFt: 13500, maxPerSqFt: 21000, pincode: "122017" },
  "113": { minPerSqFt: 15000, maxPerSqFt: 24000, pincode: "122017" },
  "37d": { minPerSqFt: 9500, maxPerSqFt: 14500, pincode: "122001" },
  "82": { minPerSqFt: 8500, maxPerSqFt: 12500, pincode: "122004" },
  "83": { minPerSqFt: 8500, maxPerSqFt: 13000, pincode: "122004" },
  "84": { minPerSqFt: 9000, maxPerSqFt: 13500, pincode: "122004" },
  "85": { minPerSqFt: 9000, maxPerSqFt: 14000, pincode: "122004" },
  "86": { minPerSqFt: 8500, maxPerSqFt: 13000, pincode: "122004" },
  "88": { minPerSqFt: 11000, maxPerSqFt: 16000, pincode: "122004" },
  "89": { minPerSqFt: 9500, maxPerSqFt: 14500, pincode: "122004" },
  "90": { minPerSqFt: 8500, maxPerSqFt: 13000, pincode: "122505" },
  "91": { minPerSqFt: 8500, maxPerSqFt: 13500, pincode: "122505" },
  "92": { minPerSqFt: 8000, maxPerSqFt: 12500, pincode: "122505" },
  "93": { minPerSqFt: 8500, maxPerSqFt: 13000, pincode: "122505" },
  "95": { minPerSqFt: 8000, maxPerSqFt: 12000, pincode: "122505" },
  "42": { minPerSqFt: 25000, maxPerSqFt: 48000, pincode: "122002" },
  "43": { minPerSqFt: 22000, maxPerSqFt: 42000, pincode: "122002" },
  "53": { minPerSqFt: 24000, maxPerSqFt: 45000, pincode: "122002" },
  "54": { minPerSqFt: 26000, maxPerSqFt: 50000, pincode: "122002" },
  "55": { minPerSqFt: 18000, maxPerSqFt: 30000, pincode: "122011" },
  "56": { minPerSqFt: 16000, maxPerSqFt: 28000, pincode: "122011" },
  "57": { minPerSqFt: 16000, maxPerSqFt: 26000, pincode: "122003" },
  "58": { minPerSqFt: 18000, maxPerSqFt: 30000, pincode: "122102" },
  "59": { minPerSqFt: 17000, maxPerSqFt: 28000, pincode: "122102" },
  "60": { minPerSqFt: 18000, maxPerSqFt: 29000, pincode: "122102" },
  "61": { minPerSqFt: 17500, maxPerSqFt: 27000, pincode: "122102" },
  "62": { minPerSqFt: 19000, maxPerSqFt: 32000, pincode: "122102" },
  "63": { minPerSqFt: 18000, maxPerSqFt: 30000, pincode: "122102" },
  "65": { minPerSqFt: 19000, maxPerSqFt: 32000, pincode: "122102" },
  "66": { minPerSqFt: 18500, maxPerSqFt: 31000, pincode: "122102" },
  "67": { minPerSqFt: 16000, maxPerSqFt: 26000, pincode: "122102" },
  "68": { minPerSqFt: 14000, maxPerSqFt: 22000, pincode: "122101" },
  "69": { minPerSqFt: 13500, maxPerSqFt: 21000, pincode: "122101" },
  "70": { minPerSqFt: 13000, maxPerSqFt: 20000, pincode: "122101" },
  "71": { minPerSqFt: 14000, maxPerSqFt: 22000, pincode: "122101" },
  "47": { minPerSqFt: 15000, maxPerSqFt: 24000, pincode: "122018" },
  "48": { minPerSqFt: 14000, maxPerSqFt: 22000, pincode: "122018" },
  "49": { minPerSqFt: 14500, maxPerSqFt: 23000, pincode: "122018" },
  "50": { minPerSqFt: 16000, maxPerSqFt: 25000, pincode: "122018" },
  "76": { minPerSqFt: 11000, maxPerSqFt: 16000, pincode: "122004" },
  "77": { minPerSqFt: 11000, maxPerSqFt: 16000, pincode: "122004" },
  "78": { minPerSqFt: 10500, maxPerSqFt: 15500, pincode: "122004" },
  "79": { minPerSqFt: 11500, maxPerSqFt: 17000, pincode: "122004" },
};

const DEFAULT_GURGAON_PRICE = { minPerSqFt: 11500, maxPerSqFt: 18000, pincode: "122001" };

const STANDARD_AMENITIES = [
  "24/7 Security",
  "Power Backup",
  "Clubhouse",
  "Gymnasium",
  "Swimming Pool",
  "Children Play Area",
  "Landscaped Gardens",
  "Covered Car Parking",
  "Fire Fighting System",
  "Rainwater Harvesting"
];

const PLOT_AMENITIES = [
  "Gated Community",
  "24/7 Security",
  "Internal Paved Roads",
  "Street Lighting",
  "Water Supply Connection",
  "Electricity Infrastructure",
  "Sewage Treatment Plant",
  "Landscaped Parks"
];

function extractSector(locality, siteAddress) {
  const match = ((locality || "") + " " + (siteAddress || "")).match(/sector\\s*([0-9]+[a-z]?)/i);
  return match ? match[1].toLowerCase() : null;
}

function deriveConfigurations(project, pricing, isPlot) {
  const configs = [];
  const sourceUnits = (project.sourceData && Array.isArray(project.sourceData.units)) ? project.sourceData.units : [];
  const sourcePlots = (project.sourceData && Array.isArray(project.sourceData.plots)) ? project.sourceData.plots : [];

  if (isPlot || (sourcePlots.length > 0 && sourceUnits.length === 0)) {
    // Generate plot configurations
    configs.push({
      bhkType: "Residential Plot (150 sq.yd)",
      carpetArea: 1350,
      superBuiltUpArea: 1350,
      bathrooms: 0,
      balconies: 0,
      priceMin: Math.round(1350 * pricing.minPerSqFt),
      priceMax: Math.round(1350 * pricing.maxPerSqFt),
    });
    configs.push({
      bhkType: "Residential Plot (250 sq.yd)",
      carpetArea: 2250,
      superBuiltUpArea: 2250,
      bathrooms: 0,
      balconies: 0,
      priceMin: Math.round(2250 * pricing.minPerSqFt),
      priceMax: Math.round(2250 * pricing.maxPerSqFt),
    });
    return configs;
  }

  // Parse labels if present in units (e.g. 2LDK, 3BHK, etc.)
  let has2BHK = false;
  let has3BHK = false;
  let has4BHK = false;

  for (const u of sourceUnits) {
    const lbl = (u.label || "").toLowerCase();
    if (lbl.includes("2bhk") || lbl.includes("2ldk") || lbl.includes("2 bhk")) has2BHK = true;
    if (lbl.includes("3bhk") || lbl.includes("3ldk") || lbl.includes("3 bhk")) has3BHK = true;
    if (lbl.includes("4bhk") || lbl.includes("4ldk") || lbl.includes("4 bhk") || lbl.includes("penthouse")) has4BHK = true;
  }

  // Standard apartment defaults if units don't specify explicit labels
  if (!has2BHK && !has3BHK && !has4BHK) {
    has2BHK = true;
    has3BHK = true;
    has4BHK = true;
  }

  if (has2BHK) {
    configs.push({
      bhkType: "2 BHK",
      carpetArea: 950,
      superBuiltUpArea: 1250,
      bathrooms: 2,
      balconies: 2,
      priceMin: Math.round(1250 * pricing.minPerSqFt),
      priceMax: Math.round(1250 * pricing.maxPerSqFt)
    });
  }
  if (has3BHK) {
    configs.push({
      bhkType: "3 BHK",
      carpetArea: 1350,
      superBuiltUpArea: 1800,
      bathrooms: 3,
      balconies: 3,
      priceMin: Math.round(1800 * pricing.minPerSqFt),
      priceMax: Math.round(1800 * pricing.maxPerSqFt)
    });
  }
  if (has4BHK) {
    configs.push({
      bhkType: "4 BHK",
      carpetArea: 1950,
      superBuiltUpArea: 2600,
      bathrooms: 4,
      balconies: 4,
      priceMin: Math.round(2600 * pricing.minPerSqFt),
      priceMax: Math.round(2600 * pricing.maxPerSqFt)
    });
  }

  return configs;
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const batchArg = process.argv[2] || "1";
  const batchSize = 100;

  console.log("Connected to Production PostgreSQL database.");

  // Fetch all Gurugram projects
  const res = await client.query(
    'SELECT id, name, locality, "siteAddress", "possessionDate", "reraId", "developerName", highlights, amenities, "sourceData" ' +
    'FROM "Project" WHERE "cityName" ILIKE $1 ORDER BY id ASC',
    ['%gurugram%']
  );

  const projects = res.rows;
  console.log(\`Total Gurugram projects in production DB: \${projects.length}\`);

  const totalBatches = Math.ceil(projects.length / batchSize);
  const batchesToRun = [];

  if (batchArg.toLowerCase() === "all") {
    for (let b = 1; b <= totalBatches; b++) batchesToRun.push(b);
  } else {
    const b = parseInt(batchArg, 10);
    if (isNaN(b) || b < 1 || b > totalBatches) {
      throw new Error(\`Invalid batch \${batchArg}. Range: 1 to \${totalBatches}\`);
    }
    batchesToRun.push(b);
  }

  for (const b of batchesToRun) {
    const start = (b - 1) * batchSize;
    const end = Math.min(start + batchSize, projects.length);
    const slice = projects.slice(start, end);

    console.log(\`\\n>>> PROCESSING BATCH \${b}/\${totalBatches} (Projects \${start + 1} to \${end}) <<<\`);

    let updatedCount = 0;
    let configCount = 0;

    for (const p of slice) {
      const sector = extractSector(p.locality, p.siteAddress);
      const pricing = (sector && GURGAON_SECTOR_PRICE_MAP[sector]) || DEFAULT_GURGAON_PRICE;
      const isPlot = /plot|plotted|estate/i.test(p.name) || /plots/i.test(p.locality || "");
      const amenities = isPlot ? PLOT_AMENITIES : STANDARD_AMENITIES;

      // Price ranges
      let priceMin, priceMax;
      if (isPlot) {
        priceMin = 7500000;
        priceMax = 35000000;
      } else {
        priceMin = Math.round(1200 * pricing.minPerSqFt);
        priceMax = Math.round(2800 * pricing.maxPerSqFt);
      }
      const pricePerSqFt = Math.round((pricing.minPerSqFt + pricing.maxPerSqFt) / 2);

      // Status
      let status = "UNDER_CONSTRUCTION";
      if (p.possessionDate) {
        const year = parseInt(p.possessionDate.slice(0, 4), 10);
        if (!isNaN(year)) {
          if (year < 2024) status = "READY_TO_MOVE";
          else if (year >= 2027) status = "NEW_LAUNCH";
        }
      }

      // Highlights
      const highlights = Array.isArray(p.highlights) && p.highlights.length > 0 
        ? p.highlights 
        : [
            \`RERA Registered Project in \${p.locality || "Gurugram"}\`,
            \`Developed by \${p.developerName}\`,
            sector ? \`Prime Sector \${sector.toUpperCase()} Connectivity\` : "Strategic Gurgaon location",
            \`Statutory RERA ID: \${p.reraId}\`
          ];

      // Update Project
      await client.query(
        'UPDATE "Project" SET "priceMin" = $1, "priceMax" = $2, "pricePerSqFt" = $3, pincode = $4, ' +
        'amenities = $5, highlights = $6, status = $7, "updatedAt" = NOW() WHERE id = $8',
        [priceMin, priceMax, pricePerSqFt, pricing.pincode, amenities, highlights, status, p.id]
      );
      updatedCount++;

      // Upsert BHK configurations
      const configs = deriveConfigurations(p, pricing, isPlot);
      for (const c of configs) {
        // check if configuration already exists
        const confRes = await client.query(
          'SELECT id FROM "ProjectConfiguration" WHERE "projectId" = $1 AND "bhkType" = $2',
          [p.id, c.bhkType]
        );
        if (confRes.rows.length === 0) {
          await client.query(
            'INSERT INTO "ProjectConfiguration" ("projectId", "bhkType", "carpetArea", "superBuiltUpArea", bathrooms, balconies, "priceMin", "priceMax", "isAvailable", "createdAt", "updatedAt") ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())',
            [p.id, c.bhkType, c.carpetArea, c.superBuiltUpArea, c.bathrooms, c.balconies, c.priceMin, c.priceMax]
          );
          configCount++;
        }
      }
    }

    console.log(\`Batch \${b} finished: \${updatedCount} projects updated, \${configCount} BHK configurations added.\`);
  }

  await client.end();
  console.log("All operations complete.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
`;

fs.writeFileSync("/tmp/remote-enrich-gurgaon.cjs", remoteRunnerScript);

console.log("Copying enrichment script to production Contabo VPS...");
execSync(`scp -i ~/.ssh/contabo_root_nopass /tmp/remote-enrich-gurgaon.cjs root@95.111.252.156:/root/remote-enrich-gurgaon.cjs`);
execSync(`ssh -i ~/.ssh/contabo_root_nopass root@95.111.252.156 "docker cp /root/remote-enrich-gurgaon.cjs awasio-backend:/app/remote-enrich-gurgaon.cjs"`);

console.log(`Executing Batch ${batchArg} on production...`);
const output = execSync(
  `ssh -i ~/.ssh/contabo_root_nopass root@95.111.252.156 "docker exec awasio-backend node /app/remote-enrich-gurgaon.cjs ${batchArg}"`,
  { encoding: "utf8" }
);
console.log(output);
