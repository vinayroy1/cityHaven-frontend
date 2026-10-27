"use client";

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { canonicalizeCity, dedupeCities, type CityItem } from "@/components/search/CitySelectorDropdown";

const DEFAULT_POPULAR_CITIES: CityItem[] = [
  { id: 12, name: "New Delhi", slug: "new-delhi", state: "Delhi", isPopular: true },
  { id: 16, name: "Gurugram", slug: "gurugram", state: "Haryana", isPopular: true },
  { id: 13, name: "Noida", slug: "noida", state: "Uttar Pradesh", isPopular: true },
  { id: 1, name: "Mumbai", slug: "mumbai", state: "Maharashtra", isPopular: true },
  { id: 19, name: "Bengaluru", slug: "bengaluru", state: "Karnataka", isPopular: true },
  { id: 2, name: "Pune", slug: "pune", state: "Maharashtra", isPopular: true },
  { id: 25, name: "Hyderabad", slug: "hyderabad", state: "Telangana", isPopular: true },
  { id: 29, name: "Chennai", slug: "chennai", state: "Tamil Nadu", isPopular: true },
  { id: 46, name: "Kolkata", slug: "kolkata", state: "West Bengal", isPopular: true },
  { id: 35, name: "Ahmedabad", slug: "ahmedabad", state: "Gujarat", isPopular: true },
  { id: 14, name: "Chandigarh", slug: "chandigarh", state: "Punjab", isPopular: true },
  { id: 38, name: "Jaipur", slug: "jaipur", state: "Rajasthan", isPopular: true },
];

const KNOWN_INDIAN_METROS = new Set([
  "delhi", "new delhi", "gurugram", "gurgaon", "noida", "greater noida", "ghaziabad", "faridabad",
  "mumbai", "navi mumbai", "thane", "bengaluru", "bangalore", "pune", "hyderabad",
  "chennai", "kolkata", "ahmedabad", "jaipur", "chandigarh", "lucknow", "surat", "indore", "kochi",
  "ranchi", "patna", "bhopal", "dehradun"
]);

export interface LocationsState {
  popularCities: CityItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: LocationsState = {
  popularCities: DEFAULT_POPULAR_CITIES,
  status: "idle",
  error: null,
};

// Non-paginated API call managed via Redux Toolkit createAsyncThunk
export const fetchPopularCities = createAsyncThunk<CityItem[], void>(
  "locations/fetchPopularCities",
  async () => {
    const res = await fetch(`${API_ENDPOINTS.locations.cities}?popular=true`);
    const json = await res.json();
    if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
      const eligible: CityItem[] = [];
      for (const rawCity of json.data) {
        const c = canonicalizeCity(rawCity);
        const key = c.name?.toLowerCase().trim();
        if (key && KNOWN_INDIAN_METROS.has(key)) {
          eligible.push(c);
        }
      }
      const unique = dedupeCities(eligible);
      if (unique.length >= 4) {
        return unique.slice(0, 14);
      }
    }
    return DEFAULT_POPULAR_CITIES;
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { locations?: LocationsState };
      // Prevent redundant fetches if already in-flight or successfully loaded
      if (state.locations?.status === "loading" || state.locations?.status === "succeeded") {
        return false;
      }
      return true;
    },
  }
);

export const locationsSlice = createSlice({
  name: "locations",
  initialState,
  reducers: {
    setPopularCities: (state, action: PayloadAction<CityItem[]>) => {
      state.popularCities = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPopularCities.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPopularCities.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.popularCities = action.payload;
      })
      .addCase(fetchPopularCities.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch popular cities";
      });
  },
});

export const { setPopularCities } = locationsSlice.actions;
export default locationsSlice.reducer;
