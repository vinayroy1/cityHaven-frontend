import {
  AreaUnit,
  AvailabilityStatus,
  AgeOfProperty,
  PropertyOnFloor,
  FurnishingType,
} from "@/types/enums";

export enum Rating {
  NO_RATING = "NO_RATING",
  ONE_STAR = "ONE_STAR",
  TWO_STAR = "TWO_STAR",
  THREE_STAR = "THREE_STAR",
  FOUR_STAR = "FOUR_STAR",
  FIVE_STAR = "FIVE_STAR",
  SIX_STAR = "SIX_STAR",
  SEVEN_STAR = "SEVEN_STAR",
}

import { StepConfig } from "./types";

export const propertyProfileStep: StepConfig = {
  id: "property_profile",
  title: "Tell us about your property",
  sections: [
    // ================================================================
    // 1. ROOM DETAILS
    // ================================================================

    // ---- Residential room details ---------------------------------
    {
      id: "room_details_residential",
      title: "Add Room Details",
      visibleWhen: {
        field: "property_subtype",
        in: [
          "apartment",
          "independent-house-villa",
          "independent-builder-floor",
          "1rk-studio-apartment",
          "serviced-apartment",
          "farmhouse",
          "residential-other",
        ],
      },
      fields: [
        {
          id: "bedrooms",
          label: "No. of Bedrooms",
          type: "counter",
          min: 0,
          max: 10,
          step: 1,
          meta: { showZeroAsLabel: "Studio" },
          requiredWhen: {
            field: "property_subtype",
            in: [
              "apartment",
              "independent-house-villa",
              "independent-builder-floor",
              "farmhouse",
            ],
          },
        },
        {
          id: "bathrooms",
          label: "No. of Bathrooms",
          type: "counter",
          min: 0,
          max: 10,
          step: 1,
        },
        {
          id: "balconies",
          label: "No. of Balconies",
          type: "counter",
          min: 0,
          max: 10,
          step: 1,
        },
      ],
    },

    // ---- PG / Hostel room details ---------------------------------
    {
      id: "room_details_pg",
      title: "Add Room Details",
      visibleWhen: {
        field: "property_subtype",
        in: ["pg-private-room", "pg-shared-room", "pg-bed"],
      },
      fields: [
        {
          id: "bedrooms",
          label: "No. of Bedrooms",
          type: "counter",
          min: 0,
          max: 10,
          step: 1,
        },
        {
          id: "bathrooms",
          label: "No. of Bathrooms",
          type: "counter",
          min: 0,
          max: 10,
          step: 1,
        },
        {
          id: "balconies",
          label: "Balconies",
          type: "counter",
          min: 0,
          max: 10,
          step: 1,
        },
        {
          id: "roomType",
          label: "Room Type",
          type: "chip-radio",
          options: [
            { value: "SHARING", label: "Sharing" },
            { value: "PRIVATE", label: "Private" },
          ],
          required: true,
        },
        {
          id: "sharingCapacity",
          label: "How many people can share this room?",
          type: "counter",
          min: 2,
          max: 10,
          step: 1,
          visibleWhen: { field: "roomType", equals: "SHARING" },
        },
        {
          id: "totalBeds",
          label: "Total no. of beds in PG",
          type: "counter",
          min: 0,
          max: 200,
          step: 1,
        },
        {
          id: "availableBeds",
          label: "No. of beds available in PG",
          type: "counter",
          min: 0,
          max: 200,
          step: 1,
        },
        {
          id: "attachedBathroom",
          label: "Attached Bathroom",
          type: "checkbox",
        },
        {
          id: "attachedBalcony",
          label: "Attached Balcony",
          type: "checkbox",
        },
      ],
    },

    // ---- Warehouse / storage room details --------------------------
    {
      id: "room_details_warehouse",
      title: "Add Room Details",
      visibleWhen: {
        field: "property_subtype",
        in: ["warehouse", "cold-storage", "godown"],
      },
      fields: [
        {
          id: "washrooms",
          label: "No. of Washrooms",
          type: "counter",
          min: 0,
          max: 20,
          step: 1,
        },
      ],
    },

    // ---- Hospitality room details ----------------------------------
    {
      id: "room_details_hospitality",
      title: "Add Room Details",
      visibleWhen: {
        field: "property_subtype",
        in: ["hotel-resorts", "guest-house-banquet-halls"],
      },
      fields: [
        {
          id: "totalRooms",
          label: "Enter the total no. of rooms",
          type: "counter",
          min: 0,
          max: 999,
          step: 1,
        },
        {
          id: "washrooms",
          label: "No. of Washrooms",
          type: "counter",
          min: 0,
          max: 50,
          step: 1,
        },
        {
          id: "balconies",
          label: "No. of Balconies",
          type: "counter",
          min: 0,
          max: 50,
          step: 1,
        },
      ],
    },

    // ================================================================
    // 2. AREA DETAILS (varies by subtype)
    // ================================================================

    // ---- Office ----------------------------------------------------
    {
      id: "area_details_office",
      title: "Add Area Details",
      description: "Carpet area is mandatory",
      visibleWhen: { field: "property_subtype", equals: "office" },
      fields: [
        {
          id: "carpetArea",
          label: "Carpet Area",
          type: "number",
          required: true,
          min: 0,
        },
        {
          id: "carpetAreaUnit",
          label: "Unit",
          type: "select",
          required: true,
          options: Object.values(AreaUnit).map((u) => ({
            value: u,
            label: u.replace("_", " "),
          })),
        },
        {
          id: "superBuiltUpArea",
          label: "Super built-up Area",
          type: "number",
          min: 0,
        },
        {
          id: "superBuiltUpAreaUnit",
          label: "Unit",
          type: "select",
          options: Object.values(AreaUnit).map((u) => ({
            value: u,
            label: u.replace("_", " "),
          })),
        },
      ],
    },

    // ---- Retail ----------------------------------------------------
    {
      id: "area_details_retail",
      title: "Add Area Details",
      visibleWhen: { field: "property_subtype", equals: "retail" },
      fields: [
        {
          id: "carpetArea",
          label: "Carpet Area",
          type: "number",
          required: true,
        },
        {
          id: "carpetAreaUnit",
          label: "Unit",
          type: "select",
          required: true,
          options: Object.values(AreaUnit).map((u) => ({
            value: u,
            label: u.replace("_", " "),
          })),
        },
        {
          id: "builtUpArea",
          label: "Built-up Area",
          type: "number",
        },
        {
          id: "builtUpAreaUnit",
          label: "Unit",
          type: "select",
          options: Object.values(AreaUnit).map((u) => ({
            value: u,
            label: u.replace("_", " "),
          })),
        },
        {
          id: "entranceWidth",
          label: "Entrance width",
          type: "number",
          meta: { suffix: "ft." },
        },
        {
          id: "ceilingWidth",
          label: "Ceiling Height",
          type: "number",
          meta: { suffix: "ft." },
        },
      ],
    },

    // ---- Warehouse / storage area ---------------------------------
    {
      id: "area_details_warehouse",
      title: "Add Area Details",
      description: "At least one area type is mandatory",
      visibleWhen: {
        field: "property_subtype",
        in: ["warehouse", "cold-storage", "godown"],
      },
      fields: [
        {
          id: "plotArea",
          label: "Plot Area",
          type: "number",
        },
        {
          id: "plotAreaUnit",
          label: "Unit",
          type: "select",
          options: Object.values(AreaUnit).map((u) => ({
            value: u,
            label: u.replace("_", " "),
          })),
        },
        {
          id: "carpetArea",
          label: "Carpet Area",
          type: "number",
        },
        {
          id: "carpetAreaUnit",
          label: "Unit",
          type: "select",
          options: Object.values(AreaUnit).map((u) => ({
            value: u,
            label: u.replace("_", " "),
          })),
        },
        {
          id: "builtUpArea",
          label: "Built-up Area",
          type: "number",
        },
        {
          id: "builtUpAreaUnit",
          label: "Unit",
          type: "select",
          options: Object.values(AreaUnit).map((u) => ({
            value: u,
            label: u.replace("_", " "),
          })),
        },
      ],
    },

    // ---- Plots (res + com) ----------------------------------------
    {
      id: "area_details_plot",
      title: "Add Area Details",
      visibleWhen: {
        field: "property_subtype",
        in: ["plot-land-res", "plot-land-com"],
      },
      fields: [
        {
          id: "plotArea",
          label: "Plot Area",
          type: "number",
          required: true,
        },
        {
          id: "plotAreaUnit",
          label: "Unit",
          type: "select",
          required: true,
          options: Object.values(AreaUnit).map((u) => ({
            value: u,
            label: u.replace("_", " "),
          })),
        },
        {
          id: "plotLength",
          label: "Length (of plot in ft.)",
          type: "number",
        },
        {
          id: "plotBreadth",
          label: "Breadth (of plot in ft.)",
          type: "number",
        },
        {
          id: "floorsAllowed",
          label: "Floors Allowed For Construction",
          type: "counter",
          min: 0,
          max: 50,
          step: 1,
        },
        {
          id: "boundaryWall",
          label: "Is there a boundary wall around the property?",
          type: "chip-radio",
          options: [
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ],
        },
        {
          id: "openSides",
          label: "No. of open sides",
          type: "chip-radio",
          options: [
            { value: 1, label: "1" },
            { value: 2, label: "2" },
            { value: 3, label: "3+" },
          ],
        },
        {
          id: "constructionDone",
          label: "Any construction done on this property?",
          type: "chip-radio",
          options: [
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ],
        },
        {
          id: "constructionType",
          label: "What type of construction has been done?",
          type: "chip-multi",
          visibleWhen: { field: "constructionDone", equals: true },
          options: [
            { value: "SHED", label: "Shed" },
            { value: "ROOMS", label: "Room(s)" },
            { value: "WASHROOM", label: "Washroom" },
            { value: "OTHER", label: "Other" },
          ],
        },
      ],
    },

    // ---- Generic res / PG / hospitality area block ----------------
    {
      id: "area_details_residential_common",
      title: "Add Area Details",
      description: "At least one area type is mandatory",
      visibleWhen: {
        field: "property_subtype",
        in: [
          "apartment",
          "independent-house-villa",
          "independent-builder-floor",
          "1rk-studio-apartment",
          "serviced-apartment",
          "farmhouse",
          "residential-other",
          "hotel-resorts",
          "guest-house-banquet-halls",
          "pg-private-room",
          "pg-shared-room",
          "pg-bed",
        ],
      },
      fields: [
        {
          id: "plotArea",
          label: "Plot Area",
          type: "number",
        },
        {
          id: "plotAreaUnit",
          label: "Unit",
          type: "select",
          options: Object.values(AreaUnit).map((u) => ({
            value: u,
            label: u.replace("_", " "),
          })),
        },
        {
          id: "carpetArea",
          label: "Carpet Area",
          type: "number",
        },
        {
          id: "carpetAreaUnit",
          label: "Unit",
          type: "select",
          options: Object.values(AreaUnit).map((u) => ({
            value: u,
            label: u.replace("_", " "),
          })),
        },
        {
          id: "builtUpArea",
          label: "Built-up Area",
          type: "number",
        },
        {
          id: "builtUpAreaUnit",
          label: "Unit",
          type: "select",
          options: Object.values(AreaUnit).map((u) => ({
            value: u,
            label: u.replace("_", " "),
          })),
        },
      ],
    },

    // ================================================================
    // 3. OFFICE SETUP
    // ================================================================
    {
      id: "office_setup",
      title: "Describe your office setup",
      visibleWhen: { field: "property_subtype", equals: "office" },
      fields: [
        {
          id: "minNoOfSeats",
          label: "Min. no. of Seats",
          type: "counter",
          min: 0,
          max: 999,
          step: 1,
        },
        {
          id: "maxNoOfSeats",
          label: "Max. no. of Seats (optional)",
          type: "counter",
          min: 0,
          max: 999,
          step: 1,
        },
        {
          id: "cabins",
          label: "No. of Cabins",
          type: "counter",
          min: 0,
          max: 99,
          step: 1,
        },
        {
          id: "meetingRooms",
          label: "No. of Meeting Rooms",
          type: "counter",
          min: 0,
          max: 99,
          step: 1,
        },
        {
          id: "washRoomAvailable",
          label: "Washrooms",
          type: "chip-radio",
          options: [
            { value: true, label: "Available" },
            { value: false, label: "Not Available" },
          ],
        },
        {
          id: "conferenceRoom",
          label: "Conference Room",
          type: "chip-radio",
          options: [
            { value: true, label: "Available" },
            { value: false, label: "Not Available" },
          ],
        },
        {
          id: "receptionArea",
          label: "Reception Area",
          type: "chip-radio",
          options: [
            { value: true, label: "Available" },
            { value: false, label: "Not Available" },
          ],
        },
        {
          id: "pantryType",
          label: "Pantry Type",
          type: "chip-radio",
          options: [
            { value: "PRIVATE", label: "Private" },
            { value: "SHARED", label: "Shared" },
            { value: "NONE", label: "Not Available" },
          ],
        },
        {
          id: "furnishing",
          label: "Furnishing",
          type: "chip-radio",
          options: [
            { value: FurnishingType.FULLY_FURNISHED, label: "Available" },
            { value: FurnishingType.UNFURNISHED, label: "Not Available" },
          ],
        },
        {
          id: "centralAirConditioning",
          label: "Central Air Conditioning",
          type: "chip-radio",
          options: [
            { value: true, label: "Available" },
            { value: false, label: "Not Available" },
          ],
        },
        {
          id: "oxygenDuct",
          label: "Oxygen Duct",
          type: "chip-radio",
          options: [
            { value: true, label: "Available" },
            { value: false, label: "Not Available" },
          ],
        },
        {
          id: "ups",
          label: "UPS",
          type: "chip-radio",
          options: [
            { value: true, label: "Available" },
            { value: false, label: "Not Available" },
          ],
        },
        {
          id: "fireSafety",
          label: "Fire safety measures include",
          type: "chip-multi",
          options: [
            { value: "FIRE_EXTINGUISHER", label: "Fire Extinguisher" },
            { value: "FIRE_SENSORS", label: "Fire Sensors" },
            { value: "SPRINKLERS", label: "Sprinklers" },
            { value: "FIRE_HOSE", label: "Fire Hose" },
          ],
        },
      ],
    },

    // ================================================================
    // 4. FLOOR, LIFTS, PARKING
    // ================================================================
    {
      id: "floor_details_common",
      title: "Floor Details",
      description: "Total no of floors and your floor details",
      visibleWhen: {
        field: "property_subtype",
        in: [
          "office",
          "retail",
          "apartment",
          "independent-builder-floor",
          "hotel-resorts",
          "guest-house-banquet-halls",
          "pg-private-room",
          "pg-shared-room",
          "pg-bed",
          "warehouse",
          "cold-storage",
          "godown",
        ],
      },
      fields: [
        {
          id: "totalFloors",
          label: "Total Floors",
          type: "counter",
          min: 0,
          max: 200,
          step: 1,
        },
        {
          id: "floorNumber",
          label: "Property on Floor",
          type: "select",
          options: Object.values(PropertyOnFloor).map((f) => ({
            value: f,
            label: f
              .replace("_", " ")
              .replace("FLOOR ", "Floor ")
              .replace("LOWER", "Lower"),
          })),
        },
        {
          id: "staircases",
          label: "No. of Staircases (optional)",
          type: "counter",
          min: 0,
          max: 20,
          step: 1,
          visibleWhen: { field: "property_subtype", equals: "office" },
        },
      ],
    },

    {
      id: "lifts_and_parking",
      title: "Lifts & Parking",
      visibleWhen: {
        field: "property_subtype",
        in: [
          "office",
          "retail",
          "apartment",
          "independent-house-villa",
          "independent-builder-floor",
          "hotel-resorts",
          "guest-house-banquet-halls",
          "pg-private-room",
          "pg-shared-room",
          "pg-bed",
          "warehouse",
        ],
      },
      fields: [
        {
          id: "lift",
          label: "Lifts",
          type: "chip-radio",
          options: [
            { value: true, label: "Available" },
            { value: false, label: "Not Available" },
          ],
        },
        {
          id: "parkingAvailable",
          label: "Parking",
          type: "chip-radio",
          options: [
            { value: true, label: "Available" },
            { value: false, label: "Not Available" },
          ],
        },
        {
          id: "privateParkingBasement",
          label: "Private Parking in Basement",
          type: "checkbox",
          visibleWhen: { field: "parkingAvailable", equals: true },
        },
        {
          id: "privateParkingOutside",
          label: "Private Parking Outside",
          type: "checkbox",
          visibleWhen: { field: "parkingAvailable", equals: true },
        },
        {
          id: "publicParking",
          label: "Public Parking",
          type: "checkbox",
          visibleWhen: { field: "parkingAvailable", equals: true },
        },
        {
          id: "noOfParkings",
          label: "No. of Parking (optional)",
          type: "counter",
          min: 0,
          max: 200,
          step: 1,
          visibleWhen: { field: "parkingAvailable", equals: true },
        },
      ],
    },

    // ================================================================
    // 5. FURNISHING & OTHER ROOMS
    // ================================================================
    {
      id: "furnishing_residential",
      title: "Furnishing",
      visibleWhen: {
        field: "property_subtype",
        in: [
          "apartment",
          "independent-house-villa",
          "independent-builder-floor",
          "1rk-studio-apartment",
          "serviced-apartment",
          "farmhouse",
          "residential-other",
          "hotel-resorts",
          "guest-house-banquet-halls",
          "pg-private-room",
          "pg-shared-room",
          "pg-bed",
        ],
      },
      fields: [
        {
          id: "furnishing",
          label: "Furnishing",
          type: "chip-radio",
          options: [
            { value: FurnishingType.FULLY_FURNISHED, label: "Furnished" },
            { value: FurnishingType.SEMI_FURNISHED, label: "Semi-furnished" },
            { value: FurnishingType.UNFURNISHED, label: "Un-furnished" },
          ],
        },
        {
          id: "furnishingDetails",
          label: "Select Furnishings",
          type: "chip-multi",
          visibleWhen: {
            field: "furnishing",
            in: [FurnishingType.FULLY_FURNISHED, FurnishingType.SEMI_FURNISHED],
          },
          options: [
            { value: "LIGHT", label: "Light" },
            { value: "FANS", label: "Fans" },
            { value: "AC", label: "AC" },
            { value: "TV", label: "TV" },
            { value: "BEDS", label: "Beds" },
            { value: "WARDROBE", label: "Wardrobe" },
            { value: "GEYSER", label: "Geyser" },
            { value: "WASHING_MACHINE", label: "Washing Machine" },
            { value: "FRIDGE", label: "Fridge" },
            { value: "MICROWAVE", label: "Microwave" },
            { value: "SOFA", label: "Sofa" },
            { value: "DINING_TABLE", label: "Dining Table" },
            { value: "CURTAINS", label: "Curtains" },
            { value: "MODULAR_KITCHEN", label: "Modular Kitchen" },
            { value: "STUDY_TABLE", label: "Study Table" },
          ],
        },
        {
          id: "commonAreaFurnishing",
          label: "Select common area furnishings",
          type: "chip-multi",
          visibleWhen: {
            field: "property_subtype",
            in: ["pg-private-room", "pg-shared-room", "pg-bed"],
          },
          options: [
            { value: "TV", label: "TV" },
            { value: "LIGHT", label: "Light" },
            { value: "FANS", label: "Fans" },
            { value: "AC", label: "AC" },
            { value: "SOFA", label: "Sofa" },
            { value: "WARDROBE", label: "Wardrobe" },
            { value: "WASHING_MACHINE", label: "Washing Machine" },
            { value: "FRIDGE", label: "Fridge" },
            { value: "WATER_PURIFIER", label: "Water Purifier" },
            { value: "MICROWAVE", label: "Microwave" },
            { value: "DINING_TABLE", label: "Dining Table" },
            { value: "CURTAINS", label: "Curtains" },
          ],
        },
      ],
    },

    {
      id: "other_rooms_block",
      title: "Other rooms (Optional)",
      visibleWhen: {
        field: "property_subtype",
        in: [
          "apartment",
          "independent-house-villa",
          "independent-builder-floor",
          "hotel-resorts",
          "guest-house-banquet-halls",
          "pg-private-room",
          "pg-shared-room",
          "pg-bed",
        ],
      },
      fields: [
        {
          id: "otherRooms",
          label: "Other rooms",
          type: "chip-multi",
          options: [
            { value: "POOJA_ROOM", label: "Pooja Room" },
            { value: "STUDY_ROOM", label: "Study Room" },
            { value: "SERVANT_ROOM", label: "Servant Room" },
            { value: "STORE_ROOM", label: "Store Room" },
          ],
        },
      ],
    },

    // ================================================================
    // 6. RETAIL EXTRAS
    // ================================================================
    {
      id: "located_near_and_business_type",
      title: "Located Near & Business Type",
      visibleWhen: { field: "property_subtype", equals: "retail" },
      fields: [
        {
          id: "locatedNear",
          label: "Located Near (optional)",
          type: "chip-multi",
          options: [
            { value: "ENTRANCE", label: "Entrance" },
            { value: "ELEVATOR", label: "Elevator" },
            { value: "STAIRS", label: "Stairs" },
          ],
        },
        {
          id: "suitableForBussinessType",
          label: "Business Type",
          type: "chip-multi",
          options: [
            { value: "ATM", label: "ATM" },
            { value: "BAKERY", label: "Bakery" },
            { value: "BOUTIQUE", label: "Boutique" },
            { value: "CLINIC", label: "Clinic" },
            { value: "RESTAURANT", label: "Restaurant" },
            { value: "SALON", label: "Salon" },
            { value: "GROCERY", label: "Grocery" },
            { value: "OTHER", label: "Others" },
          ],
        },
      ],
    },

    // ================================================================
    // 7. AVAILABILITY, AGE, RATING, PG TARGET
    // ================================================================
    {
      id: "availability_and_age",
      title: "Availability & Age of Property",
      visibleWhen: {
        field: "property_subtype",
        in: [
          "office",
          "retail",
          "apartment",
          "independent-house-villa",
          "independent-builder-floor",
          "1rk-studio-apartment",
          "serviced-apartment",
          "farmhouse",
          "residential-other",
          "warehouse",
          "cold-storage",
          "godown",
          "hotel-resorts",
          "guest-house-banquet-halls",
          "pg-private-room",
          "pg-shared-room",
          "pg-bed",
          "plot-land-res",
          "plot-land-com",
        ],
      },
      fields: [
        {
          id: "availabilityStatus",
          label: "Availability Status",
          type: "chip-radio",
          options: [
            { value: AvailabilityStatus.READY_TO_MOVE, label: "Ready to move" },
            {
              value: AvailabilityStatus.UNDER_CONSTRUCTION,
              label: "Under construction",
            },
            { value: AvailabilityStatus.NEW_LAUNCH, label: "New launch" },
          ],
        },
        {
          id: "availableFrom",
          label: "Available from",
          type: "text", // render as date input in UI
          visibleWhen: {
            field: "property_subtype",
            in: ["pg-private-room", "pg-shared-room", "pg-bed"],
          },
        },
        {
          id: "ageOfProperty",
          label: "Age of property",
          type: "chip-radio",
          options: [
            { value: AgeOfProperty.ZERO_TO_ONE, label: "0–1 years" },
            { value: AgeOfProperty.ONE_TO_FIVE, label: "1–5 years" },
            { value: AgeOfProperty.FIVE_TO_TEN, label: "5–10 years" },
            { value: AgeOfProperty.TEN_PLUS, label: "10+ years" },
          ],
        },
      ],
    },

    {
      id: "pg_target_audience",
      title: "PG Target Audience",
      visibleWhen: {
        field: "property_subtype",
        in: ["pg-private-room", "pg-shared-room", "pg-bed"],
      },
      fields: [
        {
          id: "availableFor",
          label: "Available for",
          type: "chip-radio",
          options: [
            { value: "GIRLS", label: "Girls" },
            { value: "BOYS", label: "Boys" },
            { value: "ANY", label: "Any" },
          ],
        },
        {
          id: "suitableFor",
          label: "Suitable for",
          type: "chip-multi",
          options: [
            { value: "STUDENTS", label: "Students" },
            { value: "WORKING_PROFESSIONALS", label: "Working Professionals" },
          ],
        },
      ],
    },

    {
      id: "hospitality_quality_rating",
      title: "Quality Rating",
      visibleWhen: {
        field: "property_subtype",
        in: ["hotel-resorts", "guest-house-banquet-halls"],
      },
      fields: [
        {
          id: "qualityRating",
          label: "Quality Rating",
          type: "chip-radio",
          options: [
            { value: Rating.NO_RATING, label: "No Rating" },
            { value: Rating.ONE_STAR, label: "1 Star" },
            { value: Rating.TWO_STAR, label: "2 Star" },
            { value: Rating.THREE_STAR, label: "3 Star" },
            { value: Rating.FOUR_STAR, label: "4 Star" },
            { value: Rating.FIVE_STAR, label: "5 Star" },
            { value: Rating.SIX_STAR, label: "6 Star" },
            { value: Rating.SEVEN_STAR, label: "7 Star" },
          ],
        },
      ],
    },
  ],
};
