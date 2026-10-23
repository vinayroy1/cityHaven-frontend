import fs from "fs";
import { prisma } from "./dist/prisma/client.js";

async function main() {
  const filePath = process.argv[2] || "/tmp/projects_master_inventory.json";
  console.log(`=== SEEDING FLAGSHIP PROJECTS TO PRODUCTION (Source: ${filePath}) ===`);

  if (!fs.existsSync(filePath)) {
    console.error(`Projects file not found: ${filePath}`);
    process.exit(1);
  }

  const projects = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`Loaded ${projects.length} benchmark projects to insert.\n`);

  let createdCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];

    // Check if project slug already exists
    const existing = await prisma.project.findFirst({
      where: {
        OR: [
          { slug: p.slug },
          { name: p.name, cityName: p.cityName }
        ]
      }
    });

    if (existing) {
      console.log(`[${i + 1}/${projects.length}] Already exists (ID ${existing.id}): ${p.name} in ${p.cityName}`);
      skippedCount++;
      continue;
    }

    const cleanPhone = (p.salesPhone || "").replace(/\D/g, "").slice(-10) || "9845012345";
    const agentName = `${p.developerName} Official Sales Desk`;

    // Find or create sales agent user
    let owner = await prisma.user.findFirst({
      where: { mobileNumber: cleanPhone }
    });

    if (!owner) {
      owner = await prisma.user.create({
        data: {
          name: agentName,
          mobileNumber: cleanPhone,
          countryCode: "IN",
          systemRoleId: 5,
          email: p.salesEmail || `sales.${p.slug}@verified-projects.awasio.com`,
        }
      });
    }

    // Match city if available
    const city = await prisma.city.findFirst({
      where: { name: { equals: p.cityName, mode: "insensitive" } }
    });

    try {
      const created = await prisma.project.create({
        data: {
          code: p.code || `PRJ-${p.cityName.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
          name: p.name,
          slug: p.slug,
          developerName: p.developerName,
          reraId: p.reraId,
          reraStatus: p.reraStatus || "VERIFIED",
          status: p.status || "READY_TO_MOVE",
          possessionDate: p.possessionDate,
          priceMin: p.priceMin,
          priceMax: p.priceMax,
          pricePerSqFt: p.pricePerSqFt,
          countryCode: "IN",
          stateName: p.stateName,
          cityName: p.cityName,
          cityId: city?.id || null,
          locality: p.locality,
          siteAddress: p.siteAddress,
          landmark: p.landmark,
          pincode: p.pincode,
          totalLandArea: p.totalLandArea,
          totalTowers: p.totalTowers,
          totalUnits: p.totalUnits,
          amenities: p.amenities || [],
          highlights: p.highlights || [],
          images: p.images || [],
          salesPhone: cleanPhone,
          salesEmail: p.salesEmail,
          siteVisitTimings: p.siteVisitTimings,
          isVerified: true,
          isFeatured: true,
          ownerId: owner.id,
          configurations: {
            create: (p.configurations || []).map((c) => ({
              bhkType: c.bhkType,
              carpetArea: c.carpetArea,
              superBuiltUpArea: c.superBuiltUpArea,
              bathrooms: c.bathrooms,
              balconies: c.balconies,
              priceMin: c.priceMin,
              priceMax: c.priceMax,
              floorPlanImage: c.floorPlanImage,
              isAvailable: true,
            })),
          },
        },
      });

      createdCount++;
      console.log(`[${i + 1}/${projects.length}] Created Project ID ${created.id}: "${created.name}" in ${p.cityName} | Developer: ${p.developerName} | Sales Phone: ${cleanPhone} | ${p.configurations?.length || 0} BHK configs | Photos: ${p.images?.length || 0}`);
    } catch (err) {
      console.error(`Error creating project ${p.name}:`, err.message);
    }
  }

  console.log(`\n======================================================`);
  console.log(`PROJECTS SEED SUMMARY:`);
  console.log(`  Newly Inserted: ${createdCount} projects`);
  console.log(`  Skipped (Already existed): ${skippedCount} projects`);
  console.log(`======================================================\n`);

  await prisma.$disconnect();
}

main().catch(console.error);
