const BASE_URL = "http://localhost:4000/api/v1";

async function requestOtp(mobileNumber) {
  const res = await fetch(`${BASE_URL}/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobileNumber }),
  });
  const json = await res.json();
  return json?.data?.otp || "123456";
}

async function verifyOtp(mobileNumber, otp, name) {
  const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobileNumber, otp }),
  });
  const json = await res.json();
  const token = json?.data?.accessToken;
  const user = json?.data?.user;

  if (name && token) {
    await fetch(`${BASE_URL}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
  }

  return { token, user };
}

async function loginUser(mobileNumber, name) {
  const otp = await requestOtp(mobileNumber);
  return await verifyOtp(mobileNumber, otp, name);
}

async function main() {
  console.log("=================================================");
  console.log(" 🚀 STARTING AUTOMATED ORGANIZATION SETUP & ROLES ");
  console.log("=================================================\n");

  // 1. Login OWNER (8848510629)
  console.log("1. Authenticating OWNER (8848510629)...");
  const owner = await loginUser("8848510629", "VINAY ROY (Owner)");
  console.log(`   ✅ Logged in as OWNER (ID: ${owner.user.id})\n`);

  // 2. Fetch Organizations
  const orgsRes = await fetch(`${BASE_URL}/organizations/my`, {
    headers: { Authorization: `Bearer ${owner.token}` },
  });
  const orgsData = await orgsRes.json();
  const org1 = orgsData?.data?.find((o) => o.id === 1) || orgsData?.data?.[0];
  const orgId = org1?.id || 1;
  console.log(`2. Target Organization: "${org1?.name}" (ID: ${orgId})\n`);

  // 3. Upgrade Plan to Concierge to ensure ample allowance
  console.log("3. Provisioning Organization Plan & Credits...");
  await fetch(`${BASE_URL}/billing/credits/purchase-plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${owner.token}`,
    },
    body: JSON.stringify({
      planId: 7,
      target: "ORG",
      organizationId: orgId,
      paymentRef: "auto_test_setup",
    }),
  });
  console.log("   ✅ Organization upgraded with 100 Credits & Concierge tier.\n");

  // 4. Authenticate & Setup Roles
  const rolesToCreate = [
    { mobile: "8848510632", name: "Aman Sharma (Admin)", role: "ADMIN" },
    { mobile: "8848510631", name: "Rahul Kumar (Manager)", role: "MANAGER" },
    { mobile: "8848510633", name: "Priya Singh (Agent)", role: "AGENT" },
    { mobile: "8848510634", name: "Vikram Patel (Viewer)", role: "VIEWER" },
  ];

  const roleTokens = {
    OWNER: { mobile: "8848510629", name: "VINAY ROY", token: owner.token, userId: owner.user.id },
  };

  console.log("4. Registering accounts and assigning Organization Roles...");
  for (const item of rolesToCreate) {
    const auth = await loginUser(item.mobile, item.name);
    roleTokens[item.role] = {
      mobile: item.mobile,
      name: item.name,
      token: auth.token,
      userId: auth.user.id,
    };

    // Add / Update member in Organization
    const addRes = await fetch(`${BASE_URL}/organizations/${orgId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${owner.token}`,
      },
      body: JSON.stringify({ userId: auth.user.id, role: item.role }),
    });
    const addJson = await addRes.json();
    console.log(`   ✅ [${item.role}] -> User ${item.name} (Mobile: ${item.mobile}, ID: ${auth.user.id})`);
  }

  console.log("\n5. Creating Sample Property Listings under Organization ID:", orgId);

  const sampleListings = [
    {
      title: "DLF Farms Luxury 4BHK Villa",
      description: "Exclusive luxury villa with private pool, landscaped gardens, and 24/7 security.",
      listingType: "SELL",
      resCom: "RESIDENTIAL",
      postedAs: "AGENT",
      propertyTypeSlug: "residential",
      propertySubTypeSlug: "villa",
      organizationId: orgId,
      cityName: "New Delhi",
      locality: "Chhatarpur",
      address: "DLF Farms Sector 4, Chhatarpur, New Delhi",
      price: 55000000,
      carpetArea: 4800,
      carpetAreaUnit: "SQ_FT",
      bedrooms: 4,
      bathrooms: 5,
      ownershipType: "FREEHOLD",
      availabilityStatus: "READY_TO_MOVE",
    },
    {
      title: "Grade A Commercial Corporate Office",
      description: "Fully furnished commercial office with 60 workstations, 4 cabins, and boardroom.",
      listingType: "RENT",
      resCom: "COMMERCIAL",
      postedAs: "AGENT",
      propertyTypeSlug: "commercial",
      propertySubTypeSlug: "office",
      organizationId: orgId,
      cityName: "Gurugram",
      locality: "Cyber City",
      address: "DLF Cyber City Phase 2, Gurugram",
      price: 250000,
      carpetArea: 3200,
      carpetAreaUnit: "SQ_FT",
      ownershipType: "LEASEHOLD",
      availabilityStatus: "READY_TO_MOVE",
    },
    {
      title: "Modern 2BHK Premium Apartment",
      description: "Bright and airy apartment close to metro station with modern modular kitchen.",
      listingType: "SELL",
      resCom: "RESIDENTIAL",
      postedAs: "AGENT",
      propertyTypeSlug: "residential",
      propertySubTypeSlug: "apartment",
      organizationId: orgId,
      cityName: "Noida",
      locality: "Sector 62",
      address: "Tower B, Sector 62, Noida",
      price: 9500000,
      carpetArea: 1150,
      carpetAreaUnit: "SQ_FT",
      bedrooms: 2,
      bathrooms: 2,
      ownershipType: "FREEHOLD",
      availabilityStatus: "READY_TO_MOVE",
    },
  ];

  for (const listing of sampleListings) {
    const listRes = await fetch(`${BASE_URL}/propertyListing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${roleTokens.AGENT.token}`,
      },
      body: JSON.stringify(listing),
    });
    const listJson = await listRes.json();
    console.log(`   ✅ Listing Created: "${listing.title}" (ID: ${listJson?.data?.id})`);
  }

  console.log("\n=================================================");
  console.log(" 🎉 SETUP COMPLETE! ALL ROLES & LISTINGS READY ");
  console.log("=================================================");
}

main().catch(console.error);
