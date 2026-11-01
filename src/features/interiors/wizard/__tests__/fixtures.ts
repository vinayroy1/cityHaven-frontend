// Test-only fixtures (never used as form defaults).
import type { InteriorWizardValues } from "@/types/interior.types";
import { createInteriorInitialValues } from "../initialValues";

export function completeValues(kind: "INDIVIDUAL" | "COMPANY"): InteriorWizardValues {
  const v = createInteriorInitialValues();
  v.wizardStep = 9;
  v.identity = {
    ...v.identity,
    providerType: kind,
    fullName: "Test Person",
    displayName: "Test Studio",
    businessName: kind === "COMPANY" ? "Test Interiors Pvt Ltd" : "",
    about: "x".repeat(120),
    experienceYears: 6,
    logo: "https://cdn.test/logo.png",
    website: "https://example.com",
    slug: "test-studio",
  };
  v.location = {
    ...v.location,
    primaryCity: "Bengaluru",
    primaryState: "Karnataka",
    primaryLocality: "Indiranagar",
    primaryPincode: "560038",
    primaryLat: 12.97,
    primaryLng: 77.64,
    serviceCities: ["Bengaluru"],
    branches:
      kind === "COMPANY"
        ? [
            {
              id: "branch-11",
              serverId: 11,
              branchName: "HQ",
              branchType: "HEAD_OFFICE",
              city: "Bengaluru",
              state: "Karnataka",
              locality: "Indiranagar",
              address: "1 Road",
              pincode: "560038",
              lat: 12.9,
              lng: 77.6,
              phone: "9876543210",
              managerName: "Manager",
              workingHours: "10-7",
              overridesCompanyPricing: false,
              isActive: true,
            },
          ]
        : [],
  };
  v.services = {
    ...v.services,
    servicesOffered: ["Full Home Interiors"],
    propertyTypesHandled: ["Apartment"],
    budgetSegments: ["MID_RANGE"],
    designStyles: ["Modern"],
    areaCapacity: { minSqft: 500, maxSqft: 3000, maxConcurrentProjects: 4 },
  };
  v.materials.materialSpecs = [
    { id: "m1", category: "BOARD", material: "BWP Plywood", brand: "Century" },
    { id: "m2", category: "HARDWARE", material: "Soft-close hinges", brand: "Hettich" },
  ];
  v.pricing = {
    ...v.pricing,
    priceMode: "STARTING_PRICE",
    startingRateMin: 1500,
    startingRateMax: 2500,
    pricingUnit: "PER_SQFT",
    startingRateMaterialIncluded: true,
    packages: [
      {
        id: "package-21",
        serverId: 21,
        packageName: "Essential",
        packageCategory: "Full Home",
        description: "",
        pricingMode: "RANGE",
        priceMin: 300000,
        priceMax: 500000,
        pricingUnit: "PER_PROJECT",
        applicablePropertyTypes: ["Apartment"],
        applicableBhk: ["2 BHK"],
        inclusions: ["Kitchen"],
        exclusions: [],
        materialSpecs: [{ category: "BOARD", spec: "BWP Plywood", brand: "Century" }],
        warranty: { woodworkYears: 10, hardwareYears: 5, civilYears: null },
        conditions: [],
        coverImage: "",
        branchIds: [],
        isActive: true,
        orderIndex: 0,
      },
    ],
    consultationOptions: [{ id: "c1", type: "ONLINE", isFree: true, fee: null, durationMins: 30 }],
  };
  v.portfolio.projects = [
    {
      id: "project-31",
      serverId: 31,
      title: "Whitefield 3BHK",
      propertyType: "Apartment",
      bhk: "3 BHK",
      areaSqft: 1600,
      city: "Bengaluru",
      locality: "Whitefield",
      branchId: null,
      budgetRange: "10-15L",
      durationDays: 60,
      completionDate: "2025-04",
      designStyle: "Modern",
      coverImage: "https://cdn.test/a.jpg",
      roomGalleries: [{ room: "KITCHEN", images: ["https://cdn.test/a.jpg", "https://cdn.test/b.jpg"] }],
      beforeImages: [],
      afterImages: ["https://cdn.test/c.jpg"],
      materialsUsed: [],
      servicesPerformed: ["Modular Kitchen"],
      description: "Nice",
      isFeatured: true,
    },
  ];
  v.team = {
    ...v.team,
    gstin: kind === "COMPANY" ? "29ABCDE1234F1Z5" : "",
    credentials: [
      { id: "d1", type: kind === "COMPANY" ? "GST_CERT" : "ID_PROOF", fileUrl: "https://cdn.test/doc.pdf", status: "VERIFIED" },
    ],
  };
  v.warranty.warranties = v.warranty.warranties.map((w) => (w.category === "WOODWORK" ? { ...w, years: 10 } : w));
  v.warranty.support = { freeMaintenanceMonths: 12, responseTimeHours: 24, channels: ["PHONE"], afterSalesNote: "" };
  v.contact = {
    ...v.contact,
    contactName: "Test Person",
    phone: "9876543210",
    whatsappSameAsPhone: true,
    email: "a@b.co",
    showPhonePublicly: true,
    leadPreference: "CALL",
    workingDays: ["MON", "TUE"],
    workingHours: { open: "10:00", close: "19:00" },
    acceptingNewProjects: true,
  };
  return v;
}

// Jest collects every file under __tests__; keep this one a (trivial) suite too.
if (typeof describe === "function") {
  describe("fixtures", () => {
    it("builds both provider kinds", () => {
      expect(completeValues("INDIVIDUAL").identity.providerType).toBe("INDIVIDUAL");
      expect(completeValues("COMPANY").location.branches).toHaveLength(1);
    });
  });
}
