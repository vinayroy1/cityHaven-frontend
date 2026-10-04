"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapPin, Building2, ChevronDown, Sparkles, Navigation } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  fetchAwasioSuggestions,
  type AwasioSuggestion,
} from "@/lib/awasioSuggestions";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";
import { errorText, fieldLabel } from "./theme";
import indiaCitiesData from "@/data/india-cities-by-state.json";

// Known static metadata for popular Indian localities (Pincode + Lat/Lng)
const KNOWN_LOCALITY_METADATA: Record<string, { pincode: string; lat: number; lng: number }> = {
  "chhatarpur": { pincode: "110074", lat: 28.5034, lng: 77.1855 },
  "vasant kunj": { pincode: "110070", lat: 28.5293, lng: 77.1539 },
  "dwarka": { pincode: "110075", lat: 28.5921, lng: 77.0460 },
  "south delhi": { pincode: "110016", lat: 28.5494, lng: 77.2001 },
  "rohini": { pincode: "110085", lat: 28.7041, lng: 77.1025 },
  "saket": { pincode: "110017", lat: 28.5246, lng: 77.2100 },
  "greater kailash": { pincode: "110048", lat: 28.5482, lng: 77.2344 },
  "janakpuri": { pincode: "110058", lat: 28.6219, lng: 77.0878 },
  "connaught place": { pincode: "110001", lat: 28.6315, lng: 77.2167 },
  "hsr layout": { pincode: "560102", lat: 12.9121, lng: 77.6446 },
  "whitefield": { pincode: "560066", lat: 12.9698, lng: 77.7499 },
  "indiranagar": { pincode: "560038", lat: 12.9784, lng: 77.6408 },
  "koramangala": { pincode: "560095", lat: 12.9352, lng: 77.6245 },
  "bellandur": { pincode: "560103", lat: 12.9279, lng: 77.6713 },
  "electronic city": { pincode: "560100", lat: 12.8399, lng: 77.6770 },
  "jayanagar": { pincode: "560041", lat: 12.9250, lng: 77.5938 },
  "marathahalli": { pincode: "560037", lat: 12.9592, lng: 77.6974 },
  "sarjapur road": { pincode: "560035", lat: 12.9116, lng: 77.6741 },
  "dlf phase 5": { pincode: "122002", lat: 28.4442, lng: 77.0945 },
  "dlf phase 1": { pincode: "122002", lat: 28.4716, lng: 77.0924 },
  "golf course road": { pincode: "122002", lat: 28.4485, lng: 77.0970 },
  "sohna road": { pincode: "122018", lat: 28.4069, lng: 77.0428 },
  "sector 62": { pincode: "201309", lat: 28.6280, lng: 77.3649 },
  "sector 18": { pincode: "201301", lat: 28.5708, lng: 77.3261 },
  "noida extension": { pincode: "201306", lat: 28.5912, lng: 77.4538 },
  "bandra west": { pincode: "400050", lat: 19.0600, lng: 72.8335 },
  "andheri west": { pincode: "400058", lat: 19.1363, lng: 72.8376 },
  "powai": { pincode: "400076", lat: 19.1176, lng: 72.9060 },
  "worli": { pincode: "400018", lat: 19.0176, lng: 72.8172 },
  "hitech city": { pincode: "500081", lat: 17.4435, lng: 78.3772 },
  "gachibowli": { pincode: "500032", lat: 17.4401, lng: 78.3489 },
  "kondapur": { pincode: "500084", lat: 17.4600, lng: 78.3676 },
  "baner": { pincode: "411045", lat: 18.5590, lng: 73.7868 },
  "hinjewadi": { pincode: "411057", lat: 18.5912, lng: 73.7389 },
  "wakad": { pincode: "411057", lat: 18.5987, lng: 73.7661 },
};

// City default coordinates fallback (if locality lat/lng is absent or geocoding fails)
const CITY_DEFAULT_COORDINATES: Record<string, { pincode: string; lat: number; lng: number }> = {
  "delhi": { pincode: "110001", lat: 28.6139, lng: 77.2090 },
  "new delhi": { pincode: "110001", lat: 28.6139, lng: 77.2090 },
  "bengaluru": { pincode: "560001", lat: 12.9716, lng: 77.5946 },
  "bangalore": { pincode: "560001", lat: 12.9716, lng: 77.5946 },
  "mumbai": { pincode: "400001", lat: 19.0760, lng: 72.8777 },
  "gurgaon": { pincode: "122001", lat: 28.4595, lng: 77.0266 },
  "gurugram": { pincode: "122001", lat: 28.4595, lng: 77.0266 },
  "noida": { pincode: "201301", lat: 28.5355, lng: 77.3910 },
  "hyderabad": { pincode: "500001", lat: 17.3850, lng: 78.4867 },
  "pune": { pincode: "411001", lat: 18.5204, lng: 73.8567 },
  "chennai": { pincode: "600001", lat: 13.0827, lng: 80.2707 },
  "kolkata": { pincode: "700001", lat: 22.5726, lng: 88.3639 },
  "ahmedabad": { pincode: "380001", lat: 23.0225, lng: 72.5714 },
  "chandigarh": { pincode: "160017", lat: 30.7333, lng: 76.7794 },
  "jaipur": { pincode: "302001", lat: 26.9124, lng: 75.7873 },
  "kochi": { pincode: "682001", lat: 9.9312, lng: 76.2673 },
};

// Curated popular localities for major Indian cities
const POPULAR_LOCALITIES_BY_CITY: Record<string, string[]> = {
  "Delhi": ["South Delhi", "Chhatarpur", "Vasant Kunj", "Dwarka", "Rohini", "Saket", "Greater Kailash", "Janakpuri", "Connaught Place", "Pitampura", "Lajpat Nagar", "New Delhi"],
  "New Delhi": ["South Delhi", "Chhatarpur", "Vasant Kunj", "Dwarka", "Rohini", "Saket", "Greater Kailash", "Janakpuri", "Connaught Place", "Pitampura", "Lajpat Nagar"],
  "Gurgaon": ["DLF Phase 1", "DLF Phase 5", "Golf Course Road", "Sohna Road", "Sector 56", "Sector 57", "Cyber City", "MG Road", "Sector 48", "Sector 82"],
  "Gurugram": ["DLF Phase 1", "DLF Phase 5", "Golf Course Road", "Sohna Road", "Sector 56", "Sector 57", "Cyber City", "MG Road", "Sector 48", "Sector 82"],
  "Noida": ["Sector 62", "Sector 18", "Sector 137", "Sector 150", "Noida Extension", "Sector 78", "Sector 50", "Sector 128"],
  "Bengaluru": ["HSR Layout", "Whitefield", "Indiranagar", "Koramangala", "Bellandur", "Electronic City", "Jayanagar", "Marathahalli", "Sarjapur Road", "Yelahanka", "JP Nagar"],
  "Bangalore": ["HSR Layout", "Whitefield", "Indiranagar", "Koramangala", "Bellandur", "Electronic City", "Jayanagar", "Marathahalli", "Sarjapur Road", "Yelahanka", "JP Nagar"],
  "Mumbai": ["Bandra West", "Andheri West", "Powai", "Juhu", "Worli", "Malad West", "Thane West", "Navi Mumbai", "Borivali", "Goregaon", "Dadra"],
  "Hyderabad": ["Hitech City", "Gachibowli", "Kondapur", "Jubilee Hills", "Banjara Hills", "Madhapur", "Kukatpally", "Miyapur", "Tellapur"],
  "Pune": ["Baner", "Hinjewadi", "Wakad", "Viman Nagar", "Kharadi", "Kothrud", "Hadapsar", "Aundh", "Bavdhan"],
  "Chennai": ["OMR", "Velachery", "Anna Nagar", "Adyar", "T. Nagar", "Porur", "Sholinganallur", "ECR"],
  "Kolkata": ["Rajarhat", "New Town", "Salt Lake", "Ballygunge", "Alipore", "E M Bypass", "Behala"],
  "Ahmedabad": ["SG Highway", "Boped", "Satellite", "Prahlad Nagar", "Vastrapur", "Thaltej", "Gota"],
};

const Field = ({
  label,
  required,
  children,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) => (
  <div className="space-y-1.5">
    <label className={fieldLabel}>
      {label}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
    {children}
    {error && <p className={errorText}>{error}</p>}
  </div>
);

export function LocationStep() {
  const form = useFormContext<PropertyListingFormValues>();
  const errors = form.formState.errors.location ?? {};

  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>(form.getValues("location.cityName") ?? "");
  const [selectedLocality, setSelectedLocality] = useState<string>(form.getValues("location.locality") ?? "");
  const [isCustomLocalityMode, setIsCustomLocalityMode] = useState<boolean>(false);
  const [customLocalityInput, setCustomLocalityInput] = useState<string>("");

  const [addressQuery, setAddressQuery] = useState(form.getValues("location.address") ?? "");
  const [suggestions, setSuggestions] = useState<AwasioSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState("");
  const [dynamicLocalities, setDynamicLocalities] = useState<string[]>([]);
  const [geoStatus, setGeoStatus] = useState<{ pincode?: string; lat?: number; lng?: number; source?: string } | null>(null);

  // States list from JSON
  const statesList = useMemo(() => {
    return (indiaCitiesData.states || []).map((s) => s.state).sort();
  }, []);

  // Filtered Cities list based on selected state
  const citiesList = useMemo(() => {
    if (!selectedState) {
      return Array.from(
        new Set(
          (indiaCitiesData.states || [])
            .flatMap((s) => s.cities)
            .filter(Boolean)
        )
      ).sort();
    }
    const match = (indiaCitiesData.states || []).find((s) => s.state === selectedState);
    return match ? [...match.cities].sort() : [];
  }, [selectedState]);

  // Fetch dynamic localities when selectedCity changes
  useEffect(() => {
    if (!selectedCity) {
      setDynamicLocalities([]);
      return;
    }

    let isMounted = true;
    const fetchCityLocalities = async () => {
      try {
        const res = await fetchAwasioSuggestions(selectedCity, { limit: 15, types: ["LOCALITY"] });
        if (isMounted && res.data) {
          const names = res.data.map((s) => s.location.locality || s.title).filter(Boolean);
          setDynamicLocalities(names);
        }
      } catch {
        if (isMounted) setDynamicLocalities([]);
      }
    };

    fetchCityLocalities();
    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  // Combined locality list for selected city
  const localitySuggestions = useMemo(() => {
    if (!selectedCity) return [];
    const normalized = selectedCity.trim().toLowerCase();
    
    const staticKey = Object.keys(POPULAR_LOCALITIES_BY_CITY).find(
      (k) => k.toLowerCase() === normalized || normalized.includes(k.toLowerCase()) || k.toLowerCase().includes(normalized)
    );
    const staticList = staticKey ? POPULAR_LOCALITIES_BY_CITY[staticKey] : [];

    const combined = Array.from(new Set([...staticList, ...dynamicLocalities])).filter(Boolean);
    return combined;
  }, [selectedCity, dynamicLocalities]);

  // Sync state if city is pre-filled
  useEffect(() => {
    if (selectedCity && !selectedState) {
      const foundState = (indiaCitiesData.states || []).find((s) =>
        s.cities.some((c) => c.toLowerCase() === selectedCity.toLowerCase())
      );
      if (foundState) setSelectedState(foundState.state);
    }
  }, [selectedCity, selectedState]);

  // MULTI-TIER AUTO-PINCODE & GEOLOCATION (LAT/LNG) FALLBACK ENGINE
  const fallbackToCityDefaults = (cityName: string) => {
    const cityKey = (cityName || "").trim().toLowerCase();
    const cityMeta = CITY_DEFAULT_COORDINATES[cityKey] || { pincode: "110001", lat: 28.6139, lng: 77.2090 };
    
    if (!form.getValues("location.pincode") && cityMeta.pincode) {
      form.setValue("location.pincode", cityMeta.pincode);
    }
    if (!form.getValues("location.latitude")) form.setValue("location.latitude", cityMeta.lat);
    if (!form.getValues("location.longitude")) form.setValue("location.longitude", cityMeta.lng);

    setGeoStatus({
      pincode: form.getValues("location.pincode") || cityMeta.pincode,
      lat: form.getValues("location.latitude") || cityMeta.lat,
      lng: form.getValues("location.longitude") || cityMeta.lng,
      source: "City Level",
    });
  };

  const autoPopulatePincodeAndCoordinates = (localityName: string, cityName: string) => {
    const localityKey = (localityName || "").trim().toLowerCase();

    // Tier 1: Direct static Locality metadata match
    const localityMeta = KNOWN_LOCALITY_METADATA[localityKey];
    if (localityMeta) {
      form.setValue("location.pincode", localityMeta.pincode);
      form.setValue("location.latitude", localityMeta.lat);
      form.setValue("location.longitude", localityMeta.lng);
      setGeoStatus({
        pincode: localityMeta.pincode,
        lat: localityMeta.lat,
        lng: localityMeta.lng,
        source: "Locality Level",
      });
      return;
    }

    // Tier 2: Dynamic Geocode Lookup via Awasio suggestions engine
    const searchTarget = [localityName, cityName].filter(Boolean).join(", ").trim();
    if (searchTarget) {
      fetchAwasioSuggestions(searchTarget, { limit: 1 })
        .then((res) => {
          const first = res.data?.[0];
          if (first?.location?.lat != null && first?.location?.lng != null) {
            const { pincode, lat, lng } = first.location;
            if (pincode) {
              form.setValue("location.pincode", String(pincode));
            }
            form.setValue("location.latitude", lat);
            form.setValue("location.longitude", lng);
            setGeoStatus({
              pincode: pincode ? String(pincode) : form.getValues("location.pincode"),
              lat,
              lng,
              source: "Geocoded Locality",
            });
            return;
          }
          // Tier 3: Fall back to City-level coordinates if locality lookup returned no lat/lng
          fallbackToCityDefaults(cityName);
        })
        .catch(() => {
          fallbackToCityDefaults(cityName);
        });
      return;
    }

    // Tier 3 Fallback
    fallbackToCityDefaults(cityName);
  };

  const watchedFlatNo = form.watch("location.flatNumber");
  const watchedHouseNo = form.watch("location.houseNumber");
  const watchedTowerNo = form.watch("location.towerNumber");
  const watchedPlotNo = form.watch("location.plotNumber");
  const watchedSociety = form.watch("location.societyOrProjectName");
  const watchedBuilding = form.watch("location.buildingName");
  const watchedSector = form.watch("location.sectorNumber");
  const watchedSubLoc = form.watch("location.subLocality");
  const watchedLocality = form.watch("location.locality");
  const watchedCity = form.watch("location.cityName");
  const watchedPincode = form.watch("location.pincode");

  // Helper to format sector number intelligently (e.g. "5" -> "Sector 5")
  const formatSectorPart = (raw?: string) => {
    if (!raw) return "";
    const trimmed = raw.trim();
    if (!trimmed) return "";
    if (/^\d+$/.test(trimmed)) return `Sector ${trimmed}`;
    if (!trimmed.toLowerCase().startsWith("sector")) return `Sector ${trimmed}`;
    return trimmed;
  };

  // Helper to format tower number intelligently (e.g. "2" or "B" -> "Tower 2" / "Tower B")
  const formatTowerPart = (raw?: string) => {
    if (!raw) return "";
    const trimmed = raw.trim();
    if (!trimmed) return "";
    if (!trimmed.toLowerCase().startsWith("tower") && !trimmed.toLowerCase().startsWith("block")) {
      return `Tower ${trimmed}`;
    }
    return trimmed;
  };

  // Dynamically auto-generate full formatted real address combining all available location fields
  useEffect(() => {
    const formattedSector = formatSectorPart(watchedSector);
    const formattedTower = formatTowerPart(watchedTowerNo);

    const unitInfo = [watchedFlatNo?.trim(), watchedHouseNo?.trim(), formattedTower, watchedPlotNo?.trim()]
      .filter(Boolean)
      .join(", ");
    const complexInfo = [watchedSociety?.trim(), watchedBuilding?.trim()].filter(Boolean).join(", ");
    const areaInfo = [
      formattedSector,
      watchedSubLoc?.trim(),
      watchedLocality?.trim(),
      watchedCity?.trim(),
      selectedState?.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    let combined = [unitInfo, complexInfo, areaInfo].filter(Boolean).join(", ");
    if (watchedPincode?.trim() && combined) {
      combined += ` - ${watchedPincode.trim()}`;
    }

    if (combined && combined !== form.getValues("location.address")) {
      form.setValue("location.address", combined);
      setAddressQuery(combined);
      setLastQuery(combined);
    }
  }, [
    watchedFlatNo,
    watchedHouseNo,
    watchedTowerNo,
    watchedPlotNo,
    watchedSociety,
    watchedBuilding,
    watchedSector,
    watchedSubLoc,
    watchedLocality,
    watchedCity,
    selectedState,
    watchedPincode,
    form,
  ]);

  const updateFormattedAddress = (city: string, locality: string, state: string) => {
    const formattedSector = formatSectorPart(watchedSector);
    const formattedTower = formatTowerPart(watchedTowerNo);

    const unitInfo = [watchedFlatNo?.trim(), watchedHouseNo?.trim(), formattedTower, watchedPlotNo?.trim()]
      .filter(Boolean)
      .join(", ");
    const complexInfo = [watchedSociety?.trim(), watchedBuilding?.trim()].filter(Boolean).join(", ");
    const areaInfo = [formattedSector, watchedSubLoc?.trim(), locality?.trim(), city?.trim(), state?.trim()]
      .filter(Boolean)
      .join(", ");

    let newAddress = [unitInfo, complexInfo, areaInfo].filter(Boolean).join(", ");
    if (watchedPincode?.trim() && newAddress) {
      newAddress += ` - ${watchedPincode.trim()}`;
    }

    if (newAddress && newAddress !== form.getValues("location.address")) {
      form.setValue("location.address", newAddress);
      setAddressQuery(newAddress);
      setLastQuery(newAddress); // Prevents address search popup from triggering on dropdown select
      setSuggestions([]); // Closes floating search popup
    }
  };

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    setSelectedCity("");
    setSelectedLocality("");
    setIsCustomLocalityMode(false);
    setCustomLocalityInput("");
    form.setValue("location.cityName", "");
    form.setValue("location.locality", "");
  };

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    setSelectedLocality("");
    setIsCustomLocalityMode(false);
    setCustomLocalityInput("");
    form.setValue("location.cityName", cityName);
    form.setValue("location.locality", "");
    form.trigger(["location.cityName"]);

    // Fill City-level default lat/lng immediately when city is picked
    fallbackToCityDefaults(cityName);
    updateFormattedAddress(cityName, "", selectedState);
  };

  const handleLocalitySelect = (localityName: string) => {
    if (localityName === "__CUSTOM__") {
      setIsCustomLocalityMode(true);
      setSelectedLocality("");
      setCustomLocalityInput("");
      form.setValue("location.locality", "");
      return;
    }

    setIsCustomLocalityMode(false);
    setSelectedLocality(localityName);
    setCustomLocalityInput(localityName);
    form.setValue("location.locality", localityName);
    form.trigger(["location.locality"]);

    // Tier 1 -> Tier 2 -> Tier 3 Geocode Resolution
    autoPopulatePincodeAndCoordinates(localityName, selectedCity);
    updateFormattedAddress(selectedCity, localityName, selectedState);
  };

  const applySuggestion = (suggestion: AwasioSuggestion) => {
    const displayAddress = [
      suggestion.location.locality,
      suggestion.location.city,
      suggestion.location.state,
    ].filter(Boolean).join(", ");
    form.setValue("location.address", displayAddress);
    form.setValue("location.latitude", suggestion.location.lat ?? null);
    form.setValue("location.longitude", suggestion.location.lng ?? null);

    const city = suggestion.location.city || "";
    const loc = suggestion.location.locality || city || "";

    form.setValue("location.cityName", city);
    form.setValue("location.locality", loc);
    form.setValue("location.pincode", suggestion.location.pincode ? String(suggestion.location.pincode) : "");
    form.trigger(["location.cityName", "location.locality"]);

    setSelectedCity(city);
    setSelectedLocality(loc);
    setCustomLocalityInput(loc);
    setIsCustomLocalityMode(false);

    if (suggestion.location.state) setSelectedState(suggestion.location.state);

    if (suggestion.location.lat && suggestion.location.lng) {
      setGeoStatus({
        pincode: suggestion.location.pincode ? String(suggestion.location.pincode) : undefined,
        lat: suggestion.location.lat,
        lng: suggestion.location.lng,
        source: "Direct Suggestion",
      });
    }

    setAddressQuery(displayAddress);
    setLastQuery(displayAddress);
    setSuggestions([]);
  };

  const pickSuggestion = (s: AwasioSuggestion) => {
    setError(null);
    applySuggestion(s);
  };

  const useCurrentLocation = () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { reverseGeocodeAwasio } = await import("@/lib/awasioSuggestions");
          const result = await reverseGeocodeAwasio(pos.coords.latitude, pos.coords.longitude);
          if (result?.city) {
            form.setValue("location.cityName", result.city);
            form.setValue("location.locality", result.locality || result.city);
            if (result.pincode) form.setValue("location.pincode", result.pincode);
            const address = [result.locality, result.city, result.state].filter(Boolean).join(", ");
            form.setValue("location.address", address);
            form.setValue("location.latitude", pos.coords.latitude);
            form.setValue("location.longitude", pos.coords.longitude);
            form.trigger(["location.cityName", "location.locality"]);

            setSelectedCity(result.city);
            setSelectedLocality(result.locality || result.city);
            if (result.state) setSelectedState(result.state);

            setGeoStatus({
              pincode: result.pincode,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              source: "GPS Live",
            });

            setAddressQuery(address);
            setLastQuery(address);
            setSuggestions([]);
          } else {
            setError("Could not resolve your location. Please type manually.");
          }
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setError("Location permission denied or unavailable.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  useEffect(() => {
    const handle = setTimeout(async () => {
      const q = addressQuery.trim();
      if (q.length < 3 || q === lastQuery) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const resp = await fetchAwasioSuggestions(q, { limit: 6, types: ["CITY", "LOCALITY", "PROJECT"] });
        setSuggestions(resp.data);
        setLastQuery(q);
      } catch (err) {
        setSuggestions([]);
        setError(err instanceof Error ? err.message : "Could not load location suggestions.");
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => clearTimeout(handle);
  }, [addressQuery, lastQuery]);

  const currentLat = form.watch("location.latitude");
  const currentLng = form.watch("location.longitude");

  return (
    <div className="space-y-6">
      {/* Top Map / Smart Search Banner */}
      <Field label="Quick Location Search or Map Pin">
        <div className="relative">
          <Input
            className="pr-32"
            placeholder="Search street, landmark or society"
            value={addressQuery}
            onChange={(e) => {
              setAddressQuery(e.target.value);
              form.setValue("location.address", e.target.value);
            }}
          />
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="absolute right-1.5 top-1.5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 disabled:opacity-60 transition"
          >
            <MapPin className="h-3.5 w-3.5" />
            {locating ? "Locating…" : "Use GPS"}
          </button>
          {loading && <p className="absolute right-32 top-2.5 text-xs text-slate-400">Searching…</p>}
          {suggestions.length > 0 && (
            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="flex w-full items-center justify-between border-b border-slate-100 px-3 py-2.5 text-left last:border-0 hover:bg-slate-50 transition"
                  onClick={() => pickSuggestion(s)}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-800">{s.title}</span>
                    <span className="block truncate text-xs text-slate-400">{s.subtitle}</span>
                  </span>
                  <span
                    className="ml-2 shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-2xs"
                    style={{ backgroundColor: s.badgeColor }}
                  >
                    {s.badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      </Field>

      {/* Structured Dropdown Selector Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Structured Location Selectors
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Standardized Data
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* 1. State Dropdown */}
          <Field label="State / Union Territory">
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
              >
                <option value="">Select State</option>
                {statesList.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </Field>

          {/* 2. City Dropdown */}
          <Field label="City" required error={errors.cityName?.message as string | undefined}>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
              >
                <option value="">{selectedState ? `Select City in ${selectedState}` : "Select City"}</option>
                {citiesList.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </Field>

          {/* 3. Locality Dropdown / Input */}
          <Field label="Locality / Area" required error={errors.locality?.message as string | undefined}>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={isCustomLocalityMode ? "__CUSTOM__" : selectedLocality}
                onChange={(e) => handleLocalitySelect(e.target.value)}
              >
                <option value="">
                  {selectedCity ? `Select Popular Locality in ${selectedCity}` : "Select Locality"}
                </option>
                {localitySuggestions.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
                <option value="__CUSTOM__">+ Enter Custom Locality</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </Field>
        </div>

        {/* Custom Locality Fallback if custom mode selected or typed */}
        {isCustomLocalityMode && (
          <div className="pt-2">
            <Field label="Custom Locality / Area Name">
              <Input
                value={customLocalityInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomLocalityInput(val);
                  form.setValue("location.locality", val);
                  autoPopulatePincodeAndCoordinates(val, selectedCity);
                  updateFormattedAddress(selectedCity, val, selectedState);
                }}
                placeholder={selectedCity ? `Type locality name in ${selectedCity}` : "Type custom locality name"}
              />
            </Field>
          </div>
        )}

        {/* Internal Geocoding coordinates badge */}
        {(currentLat || currentLng || geoStatus) && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50/70 border border-emerald-200/60 px-3 py-2 text-xs text-emerald-800">
            <Navigation className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>
              Internal Geolocation Synced ({geoStatus?.source || "Target Synced"}):{" "}
              <strong>
                {currentLat ? Number(currentLat).toFixed(4) : "—"}, {currentLng ? Number(currentLng).toFixed(4) : "—"}
              </strong>
              {form.getValues("location.pincode") && (
                <> · Pincode: <strong>{form.getValues("location.pincode")}</strong></>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Detail Location Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Flat / Unit No.">
          <Input {...form.register("location.flatNumber")} placeholder="e.g. Flat 205, Apt 4B" />
        </Field>
        <Field label="House / Villa No.">
          <Input {...form.register("location.houseNumber")} placeholder="e.g. House No. 12 or Villa 4" />
        </Field>
        <Field label="Tower / Block No.">
          <Input {...form.register("location.towerNumber")} placeholder="e.g. Tower B or Block 2" />
        </Field>
        <Field label="Plot No.">
          <Input {...form.register("location.plotNumber")} placeholder="e.g. Plot 15 or Site 4" />
        </Field>
        <Field label="Society / Project Name">
          <Input {...form.register("location.societyOrProjectName")} placeholder="e.g. DLF Phase 5, Ram Colony" />
        </Field>
        <Field label="Building / Landmark Name">
          <Input {...form.register("location.buildingName")} placeholder="e.g. Apex Heights, Near Metro Gate 2" />
        </Field>
        <Field label="Sector No.">
          <Input {...form.register("location.sectorNumber")} placeholder="e.g. 5 (auto-formats to Sector 5)" />
        </Field>
        <Field label="Sub-locality / Pocket">
          <Input {...form.register("location.subLocality")} placeholder="e.g. Pocket B, Phase 2" />
        </Field>
        <Field label="Pincode">
          <Input
            {...form.register("location.pincode")}
            placeholder="110001"
            inputMode="numeric"
          />
        </Field>
        <Field label="Full Formatted Address (Auto-Generated)">
          <Input
            {...form.register("location.address")}
            placeholder="Auto-generated full address"
            readOnly
            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-not-allowed border-slate-200/80 font-medium"
          />
        </Field>
      </div>
    </div>
  );
}
