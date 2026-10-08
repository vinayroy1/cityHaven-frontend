"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { MapPin, Building2, ChevronDown, Sparkles, Navigation, Train, Hospital, GraduationCap, ShoppingBag, Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  fetchAwasioSuggestions,
  type AwasioSuggestion,
} from "@/lib/awasioSuggestions";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";
import { errorText, fieldLabel } from "./theme";
import indiaCitiesData from "@/data/india-cities-by-state.json";
import { SearchableSelect } from "./SearchableSelect";

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
  const [nearbyLandmarks, setNearbyLandmarks] = useState<{
    transit?: Array<{ name: string; distanceKm: number; duration?: string; key: string }>;
    healthcare?: Array<{ name: string; distanceKm: number; duration?: string; key: string }>;
    education?: Array<{ name: string; distanceKm: number; duration?: string; key: string }>;
    lifestyle?: Array<{ name: string; distanceKm: number; duration?: string; key: string }>;
  } | null>((form.getValues("location.nearbyLandmarks") as any) ?? null);
  const [loadingLandmarks, setLoadingLandmarks] = useState(false);

  // Auto-fetch nearby landmarks when valid latitude & longitude are assigned OR from manual address
  const watchedLat = form.watch("location.latitude");
  const watchedLng = form.watch("location.longitude");
  const watchedAddress = form.watch("location.address");
  const watchedLocality = form.watch("location.locality");
  const watchedCity = form.watch("location.cityName");
  const watchedSubLoc = form.watch("location.subLocality");
  const watchedSociety = form.watch("location.societyOrProjectName");
  const watchedBuilding = form.watch("location.buildingName");
  const watchedSector = form.watch("location.sectorNumber");
  const watchedPincode = form.watch("location.pincode");
  const lastFetchedCoordsRef = useRef<string>("");
  const lastGeocodedAddressRef = useRef<string>("");
  const localityReqSeqRef = useRef<number>(0);
  const landmarkReqSeqRef = useRef<number>(0);
  const customLocalityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-fetch nearby landmarks ONLY when locality is present / selected
  useEffect(() => {
    const localityClean = watchedLocality?.trim();

    // 1. If locality is empty (e.g. state or city changed), immediately cancel and clear landmarks
    if (!localityClean) {
      landmarkReqSeqRef.current++;
      setLoadingLandmarks(false);
      if (nearbyLandmarks) {
        setNearbyLandmarks(null);
        form.setValue("location.nearbyLandmarks", null, { shouldDirty: false });
      }
      lastFetchedCoordsRef.current = "";
      lastGeocodedAddressRef.current = "";
      return;
    }

    const latNum = Number(watchedLat);
    const lngNum = Number(watchedLng);
    const hasValidCoords =
      Number.isFinite(latNum) && Number.isFinite(lngNum) && latNum !== 0 && lngNum !== 0;

    // 2. If valid coordinates are available (from locality geocoding or city fallback):
    if (hasValidCoords) {
      const coordKey = `${latNum.toFixed(4)},${lngNum.toFixed(4)}:${localityClean.toLowerCase()}`;
      if (lastFetchedCoordsRef.current === coordKey) {
        setLoadingLandmarks(false);
        return;
      }

      // If landmarks already exist in form for these coordinates, reuse without refetching
      const existingLandmarks = form.getValues("location.nearbyLandmarks");
      if (existingLandmarks && Object.keys(existingLandmarks).length > 0 && !lastFetchedCoordsRef.current) {
        lastFetchedCoordsRef.current = coordKey;
        setNearbyLandmarks(existingLandmarks as any);
        setLoadingLandmarks(false);
        return;
      }

      const reqSeq = ++landmarkReqSeqRef.current;
      setLoadingLandmarks(true);

      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/google/nearby-landmarks?lat=${latNum}&lng=${lngNum}`, {
            cache: "no-store",
          });
          if (reqSeq !== landmarkReqSeqRef.current) return;
          if (!res.ok) return;
          const data = await res.json();
          if (reqSeq !== landmarkReqSeqRef.current) return;
          if (data.success) {
            lastFetchedCoordsRef.current = coordKey;
            const formatted = {
              transit: (data.transit || []).slice(0, 5),
              healthcare: (data.healthcare || []).slice(0, 5),
              education: (data.education || []).slice(0, 5),
              lifestyle: (data.lifestyle || []).slice(0, 5),
              all: data.all || [],
            };
            setNearbyLandmarks(formatted);
            form.setValue("location.nearbyLandmarks", formatted, { shouldDirty: false });
          }
        } catch (err) {
          console.warn("Could not fetch nearby landmarks", err);
        } finally {
          if (reqSeq === landmarkReqSeqRef.current) {
            setLoadingLandmarks(false);
          }
        }
      }, 350);

      return () => {
        clearTimeout(timer);
      };
    }

    // 3. If coordinates are not yet available, geocode locality + city to obtain coords and landmarks
    const targetAddress = [
      watchedSociety?.trim(),
      watchedBuilding?.trim(),
      watchedSector ? `Sector ${watchedSector.replace(/^sector\s*/i, "").trim()}` : "",
      watchedSubLoc?.trim(),
      localityClean,
      watchedCity?.trim(),
      selectedState?.trim(),
    ].filter(Boolean).join(", ");

    const normalizedQuery = targetAddress.toLowerCase();
    if (lastGeocodedAddressRef.current === normalizedQuery) {
      setLoadingLandmarks(false);
      return;
    }

    const reqSeq = ++landmarkReqSeqRef.current;
    setLoadingLandmarks(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/google/nearby-landmarks?address=${encodeURIComponent(targetAddress)}`,
          { cache: "no-store" }
        );
        if (reqSeq !== landmarkReqSeqRef.current) return;
        if (!res.ok) return;
        const data = await res.json();
        if (reqSeq !== landmarkReqSeqRef.current) return;
        if (data.success) {
          lastGeocodedAddressRef.current = normalizedQuery;

          // Auto-populate latitude, longitude and pincode if returned
          if (data.coordinates?.lat && data.coordinates?.lng) {
            const resLat = Number(data.coordinates.lat);
            const resLng = Number(data.coordinates.lng);
            lastFetchedCoordsRef.current = `${resLat.toFixed(4)},${resLng.toFixed(4)}:${localityClean.toLowerCase()}`;
            form.setValue("location.latitude", resLat, { shouldDirty: true });
            form.setValue("location.longitude", resLng, { shouldDirty: true });
            if (data.pincode) {
              form.setValue("location.pincode", data.pincode, { shouldDirty: true });
            }
            setGeoStatus({
              lat: resLat,
              lng: resLng,
              source: "Address Geocoded",
              pincode: data.pincode || form.getValues("location.pincode") || "",
            });
          }

          const formatted = {
            transit: (data.transit || []).slice(0, 5),
            healthcare: (data.healthcare || []).slice(0, 5),
            education: (data.education || []).slice(0, 5),
            lifestyle: (data.lifestyle || []).slice(0, 5),
            all: data.all || [],
          };
          setNearbyLandmarks(formatted);
          form.setValue("location.nearbyLandmarks", formatted, { shouldDirty: false });
        }
      } catch (err) {
        console.warn("Could not geocode and fetch landmarks for address", err);
      } finally {
        if (reqSeq === landmarkReqSeqRef.current) {
          setLoadingLandmarks(false);
        }
      }
    }, 450);

    return () => {
      clearTimeout(timer);
    };
  }, [
    watchedLat,
    watchedLng,
    watchedLocality,
    watchedCity,
    selectedState,
    watchedSociety,
    watchedBuilding,
    watchedSector,
    watchedSubLoc,
    form,
  ]);

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

  // MULTI-TIER AUTO-PINCODE & GEOLOCATION (LAT/LNG) ENGINE
  const fallbackToCityDefaults = async (cityName: string) => {
    const currentSeq = ++localityReqSeqRef.current;
    const cityKey = (cityName || "").trim().toLowerCase();
    const cityMeta = CITY_DEFAULT_COORDINATES[cityKey];
    
    if (cityMeta) {
      form.setValue("location.pincode", cityMeta.pincode);
      form.setValue("location.latitude", cityMeta.lat);
      form.setValue("location.longitude", cityMeta.lng);

      setGeoStatus({
        pincode: cityMeta.pincode,
        lat: cityMeta.lat,
        lng: cityMeta.lng,
        source: "City Level",
      });
      return;
    }

    // Dynamic geocode lookup for city via Google API
    const cityTarget = [cityName, selectedState].filter(Boolean).join(", ").trim();
    if (!cityTarget) return;

    try {
      const gRes = await fetch(`/api/google/nearby-landmarks?address=${encodeURIComponent(cityTarget)}`);
      if (currentSeq !== localityReqSeqRef.current) return;
      if (gRes.ok) {
        const gData = await gRes.json();
        if (currentSeq !== localityReqSeqRef.current) return;
        if (gData.success && gData.coordinates?.lat && gData.coordinates?.lng) {
          form.setValue("location.latitude", gData.coordinates.lat);
          form.setValue("location.longitude", gData.coordinates.lng);
          if (gData.pincode) {
            form.setValue("location.pincode", gData.pincode);
          }
          setGeoStatus({
            pincode: gData.pincode || form.getValues("location.pincode") || "",
            lat: gData.coordinates.lat,
            lng: gData.coordinates.lng,
            source: "City Geocoded",
          });
        }
      }
    } catch {
      // Ignore network errors
    }
  };

  const autoPopulatePincodeAndCoordinates = async (localityName: string, cityName: string) => {
    const currentSeq = ++localityReqSeqRef.current;
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

    // Tier 2: Dynamic Geocode Lookup via Google nearby-landmarks geocoder
    const searchTarget = [localityName, cityName, selectedState].filter(Boolean).join(", ").trim();
    if (searchTarget) {
      try {
        const gRes = await fetch(`/api/google/nearby-landmarks?address=${encodeURIComponent(searchTarget)}`);
        if (currentSeq !== localityReqSeqRef.current) return;
        if (gRes.ok) {
          const gData = await gRes.json();
          if (currentSeq !== localityReqSeqRef.current) return;
          if (gData.success && gData.coordinates?.lat && gData.coordinates?.lng) {
            form.setValue("location.latitude", gData.coordinates.lat);
            form.setValue("location.longitude", gData.coordinates.lng);
            if (gData.pincode) {
              form.setValue("location.pincode", gData.pincode);
            }
            setGeoStatus({
              pincode: gData.pincode || form.getValues("location.pincode") || "",
              lat: gData.coordinates.lat,
              lng: gData.coordinates.lng,
              source: "Locality Geocoded",
            });
            return;
          }
        }
      } catch (err) {
        console.warn("Geocoding failed for locality", err);
      }

      // Tier 3: Dynamic Geocode Lookup via Awasio suggestions engine
      try {
        const res = await fetchAwasioSuggestions(searchTarget, { limit: 1 });
        if (currentSeq !== localityReqSeqRef.current) return;
        const first = res.data?.[0];
        if (first?.location?.lat != null && first?.location?.lng != null) {
          const { pincode, lat, lng } = first.location;
          if (pincode) {
            form.setValue("location.pincode", String(pincode));
          }
          form.setValue("location.latitude", lat);
          form.setValue("location.longitude", lng);
          setGeoStatus({
            pincode: pincode ? String(pincode) : form.getValues("location.pincode") || "",
            lat,
            lng,
            source: "Geocoded Locality",
          });
          return;
        }
      } catch {
        // Proceed to Tier 4
      }
    }

    // Tier 4: Fall back to City-level coordinates if locality lookup returned no lat/lng
    if (currentSeq === localityReqSeqRef.current && cityName) {
      fallbackToCityDefaults(cityName);
    }
  };

  const watchedFlatNo = form.watch("location.flatNumber");
  const watchedHouseNo = form.watch("location.houseNumber");
  const watchedTowerNo = form.watch("location.towerNumber");
  const watchedPlotNo = form.watch("location.plotNumber");

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
    localityReqSeqRef.current++;
    landmarkReqSeqRef.current++;
    setSelectedState(stateName);
    setSelectedCity("");
    setSelectedLocality("");
    setIsCustomLocalityMode(false);
    setCustomLocalityInput("");
    form.setValue("location.cityName", "");
    form.setValue("location.locality", "");
    form.setValue("location.pincode", "");
    form.setValue("location.latitude", null);
    form.setValue("location.longitude", null);
    form.setValue("location.nearbyLandmarks", null, { shouldDirty: false });
    setGeoStatus(null);
    setNearbyLandmarks(null);
    setLoadingLandmarks(false);
    lastFetchedCoordsRef.current = "";
    lastGeocodedAddressRef.current = "";
  };

  const handleCityChange = (cityName: string) => {
    localityReqSeqRef.current++;
    landmarkReqSeqRef.current++;
    setSelectedCity(cityName);
    setSelectedLocality("");
    setIsCustomLocalityMode(false);
    setCustomLocalityInput("");
    form.setValue("location.cityName", cityName);
    form.setValue("location.locality", "");
    form.setValue("location.pincode", "");
    form.setValue("location.latitude", null);
    form.setValue("location.longitude", null);
    form.setValue("location.nearbyLandmarks", null, { shouldDirty: false });
    setGeoStatus(null);
    setNearbyLandmarks(null);
    setLoadingLandmarks(false);
    lastFetchedCoordsRef.current = "";
    lastGeocodedAddressRef.current = "";
    form.trigger(["location.cityName"]);

    // Fill City-level default lat/lng immediately when city is picked (landmarks will wait for locality)
    if (cityName) {
      fallbackToCityDefaults(cityName);
      updateFormattedAddress(cityName, "", selectedState);
    }
  };

  const handleLocalitySelect = (localityName: string) => {
    localityReqSeqRef.current++;
    if (localityName === "__CUSTOM__") {
      landmarkReqSeqRef.current++;
      setIsCustomLocalityMode(true);
      setSelectedLocality("");
      setCustomLocalityInput("");
      form.setValue("location.locality", "");
      form.setValue("location.pincode", "");
      form.setValue("location.nearbyLandmarks", null, { shouldDirty: false });
      setNearbyLandmarks(null);
      setLoadingLandmarks(false);
      lastFetchedCoordsRef.current = "";
      lastGeocodedAddressRef.current = "";
      return;
    }

    setIsCustomLocalityMode(false);
    setSelectedLocality(localityName);
    setCustomLocalityInput(localityName);
    form.setValue("location.locality", localityName);
    form.setValue("location.pincode", "");
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
          let resolvedCity = "";
          let resolvedLocality = "";
          let resolvedState = "";
          let resolvedPincode = "";

          try {
            const { reverseGeocodeAwasio } = await import("@/lib/awasioSuggestions");
            const result = await reverseGeocodeAwasio(pos.coords.latitude, pos.coords.longitude);
            if (result?.city) {
              resolvedCity = result.city;
              resolvedLocality = result.locality || result.city;
              resolvedState = result.state || "";
              resolvedPincode = result.pincode || "";
            }
          } catch (geocodeErr) {
            console.warn("Reverse geocode failed, using direct coordinates", geocodeErr);
          }

          const fallbackCity = resolvedCity || "Gurgaon";
          const fallbackLocality = resolvedLocality || fallbackCity;
          const address = [fallbackLocality, fallbackCity, resolvedState].filter(Boolean).join(", ");

          form.setValue("location.cityName", fallbackCity);
          form.setValue("location.locality", fallbackLocality);
          if (resolvedPincode) form.setValue("location.pincode", resolvedPincode);
          form.setValue("location.address", address);
          form.setValue("location.latitude", pos.coords.latitude);
          form.setValue("location.longitude", pos.coords.longitude);
          form.trigger(["location.cityName", "location.locality"]);

          setSelectedCity(fallbackCity);
          setSelectedLocality(fallbackLocality);
          if (resolvedState) setSelectedState(resolvedState);

          setGeoStatus({
            pincode: resolvedPincode,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            source: "GPS Live",
          });

          setAddressQuery(address);
          setLastQuery(address);
          setSuggestions([]);
        } catch (e: any) {
          console.error("GPS selection error", e);
          setError("Could not complete GPS location. Please enter manually.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.warn("Geolocation permission error", err);
        setLocating(false);
        setError("Location permission denied or timed out.");
      },
      { enableHighAccuracy: true, timeout: 6000 }
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
            <SearchableSelect
              value={selectedState}
              onChange={handleStateChange}
              options={statesList}
              placeholder="Select State / UT"
              searchPlaceholder="Search State / Union Territory..."
              emptyMessage="No matching state found"
            />
          </Field>

          {/* 2. City Dropdown */}
          <Field label="City" required error={errors.cityName?.message as string | undefined}>
            <SearchableSelect
              value={selectedCity}
              onChange={handleCityChange}
              options={citiesList}
              placeholder={selectedState ? `Select City in ${selectedState}` : "Select City (or search across India)"}
              searchPlaceholder={selectedState ? `Search city in ${selectedState}...` : "Search city across India..."}
              emptyMessage={selectedState ? `No city found in ${selectedState}` : "No matching city found"}
              hasError={Boolean(errors.cityName)}
            />
          </Field>

          {/* 3. Locality Dropdown / Input */}
          <Field label="Locality / Area" required error={errors.locality?.message as string | undefined}>
            <SearchableSelect
              value={isCustomLocalityMode ? "__CUSTOM__" : selectedLocality}
              onChange={handleLocalitySelect}
              options={localitySuggestions}
              placeholder={selectedCity ? `Select Locality in ${selectedCity}` : "Select Locality"}
              searchPlaceholder={selectedCity ? `Search locality in ${selectedCity}...` : "Search locality..."}
              allowCustom={true}
              customValue="__CUSTOM__"
              customLabel="+ Enter Custom Locality"
              onCustomSelect={(customVal) => {
                setIsCustomLocalityMode(true);
                setCustomLocalityInput(customVal);
                setSelectedLocality(customVal);
                form.setValue("location.locality", customVal);
                form.setValue("location.pincode", "");
                form.trigger(["location.locality"]);
                updateFormattedAddress(selectedCity, customVal, selectedState);
                autoPopulatePincodeAndCoordinates(customVal, selectedCity);
              }}
              emptyMessage={selectedCity ? `No listed locality found in ${selectedCity}` : "No locality found"}
              hasError={Boolean(errors.locality)}
            />
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
                  updateFormattedAddress(selectedCity, val, selectedState);
                  if (customLocalityTimerRef.current) {
                    clearTimeout(customLocalityTimerRef.current);
                  }
                  if (!val.trim()) {
                    landmarkReqSeqRef.current++;
                    form.setValue("location.pincode", "");
                    form.setValue("location.nearbyLandmarks", null, { shouldDirty: false });
                    setNearbyLandmarks(null);
                    setLoadingLandmarks(false);
                    return;
                  }
                  customLocalityTimerRef.current = setTimeout(() => {
                    if (val.trim()) {
                      autoPopulatePincodeAndCoordinates(val.trim(), selectedCity);
                    }
                  }, 400);
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
              {watchedPincode && (
                <> · Pincode: <strong>{watchedPincode}</strong></>
              )}
            </span>
          </div>
        )}

        {/* Live Detected Nearby Amenities from Google Places API (New) */}
        {(loadingLandmarks || nearbyLandmarks) && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Nearby Landmarks & Connectivity (Auto-Detected)
                </h4>
              </div>
              {loadingLandmarks ? (
                <span className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Detecting…
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  Saved with Listing
                </span>
              )}
            </div>

            {nearbyLandmarks && (
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Transit */}
                {nearbyLandmarks.transit && nearbyLandmarks.transit.length > 0 && (
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-1.5">
                      <Train className="h-3.5 w-3.5 text-blue-600" />
                      <span>Transit & Metro</span>
                    </div>
                    <ul className="space-y-1">
                      {nearbyLandmarks.transit.map((t, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex justify-between gap-1">
                          <span className="truncate" title={t.name}>{t.name}</span>
                          <span className="shrink-0 font-semibold text-slate-900">{t.distanceKm} km</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 2. Healthcare */}
                {nearbyLandmarks.healthcare && nearbyLandmarks.healthcare.length > 0 && (
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-1.5">
                      <Hospital className="h-3.5 w-3.5 text-rose-600" />
                      <span>Healthcare</span>
                    </div>
                    <ul className="space-y-1">
                      {nearbyLandmarks.healthcare.map((h, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex justify-between gap-1">
                          <span className="truncate" title={h.name}>{h.name}</span>
                          <span className="shrink-0 font-semibold text-slate-900">{h.distanceKm} km</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 3. Education */}
                {nearbyLandmarks.education && nearbyLandmarks.education.length > 0 && (
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-amber-600" />
                      <span>Schools & Colleges</span>
                    </div>
                    <ul className="space-y-1">
                      {nearbyLandmarks.education.map((e, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex justify-between gap-1">
                          <span className="truncate" title={e.name}>{e.name}</span>
                          <span className="shrink-0 font-semibold text-slate-900">{e.distanceKm} km</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 4. Lifestyle */}
                {nearbyLandmarks.lifestyle && nearbyLandmarks.lifestyle.length > 0 && (
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-1.5">
                      <ShoppingBag className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Shopping & Parks</span>
                    </div>
                    <ul className="space-y-1">
                      {nearbyLandmarks.lifestyle.map((l, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex justify-between gap-1">
                          <span className="truncate" title={l.name}>{l.name}</span>
                          <span className="shrink-0 font-semibold text-slate-900">{l.distanceKm} km</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
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
