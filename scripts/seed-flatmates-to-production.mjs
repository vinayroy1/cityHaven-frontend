import fs from "fs";
import { prisma } from "./dist/prisma/client.js";

async function main() {
  const filePath = process.argv[2] || "/app/pan_india_flatmates_inventory.json";
  console.log(`=== SEEDING PAN-INDIA FLATMATE LISTINGS TO PRODUCTION (Source: ${filePath}) ===`);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const listings = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`Loaded ${listings.length} verified flatmate listings to seed.\n`);

  let inserted = 0;
  let updated = 0;

  for (let i = 0; i < listings.length; i++) {
    const item = listings[i];
    const p = item.profile;

    // 1. Find or create User record
    let user = await prisma.user.findFirst({
      where: { mobileNumber: p.mobileNumber }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          mobileNumber: p.mobileNumber,
          name: p.displayName,
          email: p.email,
          countryCode: "IN",
          profileImage: p.profilePhoto,
          isVerified: true,
          kycVerified: true,
          credits: 10,
        }
      });
    }

    // 2. Find or create FlatmateProfile linked to userId
    let profile = await prisma.flatmateProfile.findUnique({
      where: { userId: user.id }
    });

    if (!profile) {
      profile = await prisma.flatmateProfile.create({
        data: {
          userId: user.id,
          displayName: p.displayName,
          profilePhoto: p.profilePhoto,
          birthYear: p.birthYear,
          gender: p.gender,
          occupation: p.occupation,
          companyOrCollege: p.companyOrCollege,
          bio: p.bio,
          languages: p.languages,
          diet: p.diet,
          smoking: p.smoking,
          drinking: p.drinking,
          sleepSchedule: p.sleepSchedule,
          workMode: p.workMode,
          cleanlinessLevel: p.cleanlinessLevel,
          socialPreference: p.socialPreference,
          hasPets: p.hasPets,
          isIdentityVerified: true,
        }
      });
    } else {
      profile = await prisma.flatmateProfile.update({
        where: { id: profile.id },
        data: {
          displayName: p.displayName,
          profilePhoto: p.profilePhoto,
          occupation: p.occupation,
          companyOrCollege: p.companyOrCollege,
          bio: p.bio,
          languages: p.languages,
          diet: p.diet,
          smoking: p.smoking,
          drinking: p.drinking,
          workMode: p.workMode,
        }
      });
    }

    // 3. Upsert FlatmateListing
    const existing = await prisma.flatmateListing.findUnique({
      where: { slug: item.slug }
    });

    if (existing) {
      await prisma.flatmateListing.update({
        where: { slug: item.slug },
        data: {
          profileId: profile.id,
          mode: item.mode,
          status: "ACTIVE",
          title: item.title,
          description: item.description,
          cityName: item.cityName,
          locality: item.locality,
          preferredLocalities: item.preferredLocalities,
          bhk: item.bhk,
          roomType: item.roomType,
          furnishing: item.furnishing,
          rent: item.rent,
          deposit: item.deposit,
          maintenance: item.maintenance,
          spotsAvailable: item.spotsAvailable,
          minimumStayMonths: item.minimumStayMonths,
          availableFrom: new Date(item.availableFrom),
          expiresAt: new Date(item.expiresAt),
          amenities: item.amenities,
          photos: item.photos,
          preferredGenders: item.preferredGenders,
          preferredOccupations: item.preferredOccupations,
          preferredDiet: item.preferredDiet,
          smokingAllowed: item.smokingAllowed,
          drinkingAllowed: item.drinkingAllowed,
          petsAllowed: item.petsAllowed,
          updatedAt: new Date(),
        }
      });
      updated++;
    } else {
      await prisma.flatmateListing.create({
        data: {
          profileId: profile.id,
          slug: item.slug,
          mode: item.mode,
          status: "ACTIVE",
          title: item.title,
          description: item.description,
          countryCode: "IN",
          stateName: item.stateName,
          cityName: item.cityName,
          locality: item.locality,
          preferredLocalities: item.preferredLocalities,
          bhk: item.bhk,
          roomType: item.roomType,
          furnishing: item.furnishing,
          rent: item.rent,
          deposit: item.deposit,
          maintenance: item.maintenance,
          spotsAvailable: item.spotsAvailable,
          minimumStayMonths: item.minimumStayMonths,
          availableFrom: new Date(item.availableFrom),
          expiresAt: new Date(item.expiresAt),
          amenities: item.amenities,
          photos: item.photos,
          preferredGenders: item.preferredGenders,
          preferredOccupations: item.preferredOccupations,
          preferredDiet: item.preferredDiet,
          smokingAllowed: item.smokingAllowed,
          drinkingAllowed: item.drinkingAllowed,
          petsAllowed: item.petsAllowed,
        }
      });
      inserted++;
    }

    if ((i + 1) % 20 === 0 || i === listings.length - 1) {
      console.log(`[${i + 1}/${listings.length}] Seeded: ${item.cityName} - ${item.locality} | ${p.displayName} (${p.mobileNumber})`);
    }
  }

  console.log("\n======================================================");
  console.log(`DATABASE SEED SUMMARY:`);
  console.log(`  Newly Inserted: ${inserted} flatmate listings`);
  console.log(`  Updated: ${updated} flatmate listings`);
  console.log("======================================================\n");

  const total = await prisma.flatmateListing.count();
  console.log(`Total FlatmateListings now in Database: ${total}`);
}

main().catch(console.error).finally(() => process.exit(0));
