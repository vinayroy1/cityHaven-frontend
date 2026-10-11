// Small derivations from the form state: the "2 BHK" style configuration label
// and a suggested listing title.

import { PROPERTY_SUBTYPES } from "@/constants/backend-schema";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";

const subTypeName = (slug?: string) =>
  PROPERTY_SUBTYPES.find((s) => s.slug === slug)?.name ?? "Property";

/** e.g. "3 BHK", "Studio", "Plot", "Office", "2 Sharing in Student Lodge". */
export function deriveConfiguration(v: PropertyListingFormValues): string {
  const slug = v.context.propertySubTypeSlug ?? "";
  if (slug.includes("plot-land")) return "Plot";
  if (slug === "1rk-studio-apartment") return "Studio";
  if (v.context.listingType === "PG") {
    const accTypeMap: Record<string, string> = {
      LODGE: "Student Lodge",
      PG: "PG",
      HOSTEL: "Hostel",
      STUDENT_ROOM: "Student Room",
    };
    const accType = (v.details?.accommodationType && accTypeMap[v.details.accommodationType]) || "PG / Lodge";
    if (v.details?.pricingBasis === "PER_ROOM") {
      const cap = v.details?.maxPersonsInRoom ? ` (${v.details.maxPersonsInRoom} Person Room)` : " (Full Room)";
      return `${accType}${cap}`;
    }
    const share = v.details?.sharingType ? `${v.details.sharingType} Bed` : "Bed";
    return `${share} in ${accType}`;
  }
  if (v.context.resCom === "COMMERCIAL") return subTypeName(slug);
  const beds = v.details.bedrooms;
  return beds ? `${beds}${beds >= 6 ? "+" : ""} BHK` : subTypeName(slug);
}

const listingVerb: Record<string, string> = { SELL: "for Sale", RENT: "for Rent", PG: "for Stay" };

/** e.g. "3 BHK Apartment for Rent in Whitefield, Bengaluru". */
export function suggestTitle(v: PropertyListingFormValues): string {
  const config = deriveConfiguration(v);
  const name = subTypeName(v.context.propertySubTypeSlug);
  const verb = listingVerb[v.context.listingType] ?? "";
  const sectorStr = v.location?.sectorNumber
    ? v.location.sectorNumber.toLowerCase().startsWith("sector")
      ? v.location.sectorNumber
      : `Sector ${v.location.sectorNumber}`
    : undefined;
  const where = [
    v.location?.societyOrProjectName,
    sectorStr,
    v.location?.subLocality,
    v.location?.locality,
    v.location?.cityName,
  ]
    .filter(Boolean)
    .join(", ");

  // Don't repeat: if config is equal to or already contained in the type name (Plot, Studio, Commercial), use name alone.
  const head =
    !config || name.toLowerCase().includes(config.toLowerCase()) || config.toLowerCase() === name.toLowerCase()
      ? name
      : `${config} ${name}`;
  return [head, verb, where && `in ${where}`].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

/** Generates a comprehensive, professional AI property description based on selected details. */
export function suggestDescription(v: PropertyListingFormValues): string {
  const slug = v.context.propertySubTypeSlug ?? "";
  const typeName = subTypeName(slug);
  const verb = listingVerb[v.context.listingType] ?? "for Sale";
  const isPlotOrLand = slug.includes("plot-land") || v.context.propertyTypeSlug === "plot-land";
  const isCommercial = v.context.resCom === "COMMERCIAL";

  const config = deriveConfiguration(v);
  const propertyLabel =
    !config || typeName.toLowerCase().includes(config.toLowerCase()) || config.toLowerCase() === typeName.toLowerCase()
      ? typeName
      : `${config} ${typeName}`;

  const sectorStr = v.location?.sectorNumber
    ? v.location.sectorNumber.toLowerCase().startsWith("sector")
      ? v.location.sectorNumber
      : `Sector ${v.location.sectorNumber}`
    : undefined;

  const fullAddressStr = [
    v.location?.buildingName,
    v.location?.societyOrProjectName,
    sectorStr,
    v.location?.subLocality,
    v.location?.locality,
    v.location?.cityName,
  ]
    .filter(Boolean)
    .join(", ");

  const parts: string[] = [];

  // PG / Lodge / Student accommodation intro & details
  if (v.context.listingType === "PG") {
    const acc =
      v.details?.accommodationType === "LODGE"
        ? "student lodge"
        : v.details?.accommodationType === "HOSTEL"
        ? "hostel"
        : "PG / student accommodation";
    const forWhom =
      v.details?.pgFor === "BOYS"
        ? "boys / male students"
        : v.details?.pgFor === "GIRLS"
        ? "girls / female students"
        : "students and working professionals";
    parts.push(`Well-maintained ${acc} suitable for ${forWhom}${fullAddressStr ? ` situated at ${fullAddressStr}` : ""}.`);

    if (v.details?.pricingBasis === "PER_ROOM") {
      const cap = v.details?.maxPersonsInRoom ? `accommodates up to ${v.details.maxPersonsInRoom} students` : "entire room";
      parts.push(`Available on a room-wise rental basis (${cap}).`);
    } else if (v.details?.sharingType) {
      parts.push(`Offered on a ${v.details.sharingType} sharing bed basis.`);
    }

    if (v.details?.foodOption === "INCLUDED") {
      const meal = v.details?.mealType ? ` (${v.details.mealType.replace(/_/g, " ").toLowerCase()})` : "";
      parts.push(`Fresh hygienic meals included in monthly rent${meal}.`);
    } else if (v.details?.foodOption === "OPTIONAL_MESS") {
      const fee = v.details?.messCharges ? ` at ₹${v.details.messCharges.toLocaleString("en-IN")}/month` : "";
      parts.push(`Optional mess / tiffin service available${fee}.`);
    } else if (v.details?.foodOption === "SELF_COOKING") {
      parts.push("Self-cooking kitchen space and gas provision available.");
    }

    if (v.details?.electricityType === "INCLUDED") {
      parts.push("Electricity charges are included in the rent.");
    } else if (v.details?.electricityType === "SUB_METER") {
      const rate = v.details?.electricityRatePerUnit ? ` (₹${v.details.electricityRatePerUnit}/unit)` : "";
      parts.push(`Electricity billed as per sub-meter reading${rate}.`);
    } else if (v.details?.electricityType === "FIXED_MONTHLY") {
      const fee = v.details?.electricityMonthlyCharge ? ` (₹${v.details.electricityMonthlyCharge}/mo)` : "";
      parts.push(`Fixed monthly electricity surcharge applies${fee}.`);
    }

    const amenitiesList: string[] = [];
    if (v.details?.attachedBathroom) amenitiesList.push("attached washroom");
    if (v.details?.hasStudyTable) amenitiesList.push("study desk & chair");
    if (v.details?.hasRoWater) amenitiesList.push("RO clean drinking water");
    if (v.details?.hasPowerBackup) amenitiesList.push("power backup / inverter");
    if (v.details?.acAvailable) amenitiesList.push("AC / air cooler");
    if (amenitiesList.length > 0) {
      parts.push(`Features include ${amenitiesList.join(", ")}.`);
    }

    if (v.details?.gateClosingTime && v.details.gateClosingTime !== "NO_RESTRICTION") {
      parts.push(`Main gate closing time: ${v.details.gateClosingTime.replace(/_/g, " ")}.`);
    }

    if (v.pricing?.price) {
      const basis = v.details?.pricingBasis === "PER_ROOM" ? "room / month" : "bed / month";
      parts.push(`Rent: ₹${v.pricing.price.toLocaleString("en-IN")} per ${basis}.`);
    }

    parts.push("Peaceful environment with close proximity to coaching institutes, colleges, and daily markets.");
    return parts.join(" ");
  }

  // 1. Intro sentence for residential/commercial/plot
  if (fullAddressStr) {
    parts.push(`Presenting a well-located ${propertyLabel} ${verb} in the prime area of ${fullAddressStr}.`);
  } else {
    parts.push(`Presenting an attractive ${propertyLabel} ${verb}, ideal for modern development.`);
  }

  // 2. Plot / Land Specific Specs
  if (isPlotOrLand) {
    const area = v.details?.plotArea || v.details?.carpetArea || v.details?.builtUpArea;
    const rawUnit = v.details?.plotAreaUnit || v.details?.carpetAreaUnit || "sq.ft";
    const unit = rawUnit.replace(/_/g, ".").toLowerCase();

    if (area) {
      parts.push(`The property spans an impressive plot area of ${area.toLocaleString("en-IN")} ${unit}.`);
    }
    if (v.details?.plotLength && v.details?.plotBreadth) {
      parts.push(`Plot dimensions: ${v.details.plotLength} ft x ${v.details.plotBreadth} ft.`);
    }
    if (v.details?.floorsAllowed) {
      parts.push(`Approved for construction up to ${v.details.floorsAllowed} floors.`);
    }
  } else {
    // 3. Residential / Commercial Layout & Specs
    const layoutDetails: string[] = [];
    if (!isCommercial) {
      if (v.details?.bedrooms) layoutDetails.push(`${v.details.bedrooms} bedroom${v.details.bedrooms > 1 ? "s" : ""}`);
      if (v.details?.bathrooms) layoutDetails.push(`${v.details.bathrooms} bathroom${v.details.bathrooms > 1 ? "s" : ""}`);
      if (v.details?.balconies) layoutDetails.push(`${v.details.balconies} balcony${v.details.balconies > 1 ? "s" : ""}`);
    }

    const area = v.details?.carpetArea || v.details?.builtUpArea || v.details?.plotArea;
    const rawUnit = v.details?.carpetAreaUnit || v.details?.builtUpAreaUnit || "sq.ft";
    const unit = rawUnit.replace(/_/g, ".").toLowerCase();

    let specSentence = "";
    if (layoutDetails.length > 0 && area) {
      specSentence = `The property features ${layoutDetails.join(", ")}, spanning a total area of ${area.toLocaleString("en-IN")} ${unit}.`;
    } else if (area) {
      specSentence = `The property spans a total area of ${area.toLocaleString("en-IN")} ${unit}.`;
    } else if (layoutDetails.length > 0) {
      specSentence = `The unit is efficiently designed with ${layoutDetails.join(", ")}.`;
    }

    if (v.details?.totalFloors) {
      const floorNo = v.details.floorNumber ? `floor ${v.details.floorNumber}` : "a designated floor";
      specSentence += ` Situated on ${floorNo} of a ${v.details.totalFloors}-storey building.`;
    }

    if (v.details?.propertyFacing) {
      specSentence += ` The property faces ${v.details.propertyFacing.replace(/_/g, " ")} ensuring excellent natural light and ventilation.`;
    }

    if (specSentence) parts.push(specSentence);

    if (v.amenities?.furnishing) {
      const furn = v.amenities.furnishing.replace(/_/g, " ").toLowerCase();
      parts.push(`The property comes ${furn} with quality fixtures and essential fittings.`);
    }
  }

  // 4. Financials & Pricing
  if (v.pricing?.price) {
    const formattedP =
      v.pricing.price >= 10000000
        ? `₹ ${(v.pricing.price / 10000000).toFixed(2)} Cr`
        : v.pricing.price >= 100000
        ? `₹ ${(v.pricing.price / 100000).toFixed(2)} Lakh`
        : `₹ ${v.pricing.price.toLocaleString("en-IN")}`;
    const nego = v.pricing.priceNegotiable ? " (price negotiable)" : "";
    parts.push(`Offered at an attractive price of ${formattedP}${nego}.`);
  }

  // 5. Closing Location Advantages
  parts.push("Conveniently situated with seamless connectivity to main roads, commercial hubs, and essential facilities.");

  return parts.join(" ");
}
