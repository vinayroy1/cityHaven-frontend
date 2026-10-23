"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Compass,
  FileCheck2,
  HelpCircle,
  Image as ImageIcon,
  IndianRupee,
  Layers,
  MapPin,
  PhoneCall,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import indiaCitiesData from "@/data/india-cities-by-state.json";
import { SearchableSelect } from "@/components/propertyListing/SearchableSelect";
import { fetchAwasioSuggestions } from "@/lib/awasioSuggestions";
import type { CreateProjectInput, ProjectConfiguration, ProjectStatus } from "@/types/project.types";
import { useCreateProjectMutation } from "@/features/projects/api";
import { LocalitySearchDropdown } from "./components/LocalitySearchDropdown";
import { ProjectMediaUpload, type UploadedBrochure } from "./components/ProjectMediaUpload";
import { CDN_ASSETS } from "@/config/cdn";
import { BackButton } from "@/components/common/BackButton";
import { registerBackHandler } from "@/lib/navigation/backNavigation";



const POPULAR_CITY_LOCALITIES: Record<string, string[]> = {
  noida: [
    "Sector 43",
    "Sector 62",
    "Sector 150",
    "Sector 137",
    "Sector 18",
    "Sector 75",
    "Noida Extension (Greater Noida West)",
    "Sector 128 (Wish Town)",
    "Sector 93A (Expressway)",
    "Sector 78",
    "Sector 104",
  ],
  gurugram: [
    "Golf Course Extension Road",
    "Sector 63",
    "Sector 63A",
    "DLF Phase 5",
    "Golf Course Road",
    "Sector 57",
    "Sohna Road",
    "Dwarka Expressway (Sector 102-109)",
    "Sector 79 (New Gurugram)",
    "Cyber City",
  ],
  delhi: [
    "Dwarka",
    "Vasant Kunj",
    "Chhatarpur",
    "Greater Kailash",
    "Saket",
    "Rohini",
    "Janakpuri",
    "Nehru Place",
    "Jasola",
  ],
  "new delhi": [
    "Connaught Place",
    "Chhatarpur",
    "Dwarka",
    "Vasant Kunj",
    "Saket",
    "Greater Kailash",
    "Jasola",
  ],
  bengaluru: [
    "Whitefield",
    "HSR Layout",
    "Koramangala",
    "Indiranagar",
    "Bellandur",
    "Sarjapur Road",
    "Electronic City",
    "Panathur (Outer Ring Road)",
    "Kadugodi",
    "Hebbal",
    "Yelahanka",
  ],
  "mumbai mmr": [
    "Titwala East (Kalyan Region)",
    "Ghodbunder Road, Thane West",
    "Kolshet Road, Thane",
    "Bandra West",
    "Andheri West",
    "Powai",
    "Worli",
    "Kalyan West",
    "Dombivli East",
  ],
  thane: [
    "Ghodbunder Road",
    "Kolshet Road",
    "Majiwada",
    "Vartak Nagar",
    "Naupada",
    "Hiranandani Estate",
    "Kasarvadavali",
  ],
  pune: [
    "Hinjewadi",
    "Baner",
    "Wakad",
    "Kharadi",
    "Kothrud",
    "Viman Nagar",
    "Hadapsar",
    "Bavdhan",
  ],
  hyderabad: [
    "Gachibowli",
    "Hitec City",
    "Kondapur",
    "Madhapur",
    "Kokapet",
    "Financial District",
    "Jubilee Hills",
    "Tellapur",
  ],
};

const POSSESSION_PRESETS = [
  "Ready to Move",
  "December 2025",
  "December 2026",
  "Mid 2027",
  "December 2028",
];

const AVAILABLE_AMENITIES = [
  "Grand Clubhouse",
  "Swimming Pool & Kids Pool",
  "Fully Equipped Gymnasium",
  "EV Charging Stations",
  "24/7 Gated Security & CCTV",
  "Jogging & Cycling Track",
  "Children’s Adventure Play Area",
  "Badminton & Tennis Courts",
  "100% Power Backup",
  "Rainwater Harvesting System",
  "Landscaped Podium Gardens",
  "Yoga & Meditation Deck",
  "Indoor Games Room",
  "Co-Working Lounge",
  "High-Speed Elevators",
  "Senior Citizen Sit-out Pavilion",
];

const BHK_OPTIONS = ["1 RK", "1 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3.5 BHK", "4 BHK", "Penthouse", "Duplex", "Villa"];

export default function PostProjectPage() {
  const router = useRouter();
  const [createProject, { isLoading: isPublishing }] = useCreateProjectMutation();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Intercept back presses in Expo WebView or browser to decrement wizard step
  useEffect(() => {
    if (currentStep <= 1) return;
    const unregister = registerBackHandler(() => {
      setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4) : 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true; // handled
    });
    return unregister;
  }, [currentStep]);

  // Step 1: Project Identity & Location
  const [name, setName] = useState("");
  const [developerName, setDeveloperName] = useState("");
  const [reraId, setReraId] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("UNDER_CONSTRUCTION");
  const [possessionDate, setPossessionDate] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [isCustomLocality, setIsCustomLocality] = useState(false);
  const [dynamicLocalities, setDynamicLocalities] = useState<string[]>([]);
  const [siteAddress, setSiteAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [totalLandArea, setTotalLandArea] = useState("");
  const [totalTowers, setTotalTowers] = useState<number | undefined>(undefined);
  const [totalUnits, setTotalUnits] = useState<number | undefined>(undefined);

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

  // Combined localities list (dynamic suggestions from API + known popular sectors)
  const localityOptions = useMemo(() => {
    const cityKey = city.toLowerCase().trim();
    const staticList = POPULAR_CITY_LOCALITIES[cityKey] || [];
    const combined = Array.from(new Set([...dynamicLocalities, ...staticList]));
    return combined;
  }, [city, dynamicLocalities]);

  // Fetch dynamic localities when city changes
  useEffect(() => {
    if (!city) {
      setDynamicLocalities([]);
      return;
    }

    let isMounted = true;
    const fetchCityLocalities = async () => {
      try {
        const res = await fetchAwasioSuggestions(city, { limit: 15, types: ["LOCALITY"] });
        if (isMounted && res.data) {
          const locs = res.data.map((item) => item.title || item.displayText).filter(Boolean);
          setDynamicLocalities(locs);
        }
      } catch (err) {
        // Silently use static fallbacks
      }
    };

    fetchCityLocalities();
    return () => {
      isMounted = false;
    };
  }, [city]);

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const match = (indiaCitiesData.states || []).find((s) => s.state === newState);
    if (match && match.cities.length > 0) {
      if (!match.cities.includes(city)) {
        setCity(match.cities[0]);
        setLocality("");
      }
    }
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setLocality("");
    // Auto-detect state if not set or mismatched
    const parentState = (indiaCitiesData.states || []).find((s) =>
      s.cities.some((c) => c.toLowerCase() === newCity.toLowerCase())
    );
    if (parentState) {
      setSelectedState(parentState.state);
    }
  };

  const handleLocalityChange = (
    newLocality: string,
    meta?: { pincode?: string; lat?: number; lng?: number }
  ) => {
    setLocality(newLocality);
    setLatitude(meta?.lat);
    setLongitude(meta?.lng);
    if (meta?.pincode && !pincode) {
      setPincode(meta.pincode);
    }
  };

  // Step 2: Pricing & Configurations Matrix
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [pricePerSqFt, setPricePerSqFt] = useState<number | "">("");
  const [configurations, setConfigurations] = useState<ProjectConfiguration[]>([
    {
      id: "cfg-1",
      bhkType: "2 BHK",
      carpetArea: 0,
      bathrooms: 0,
      priceMin: 0,
      isAvailable: true,
    },
  ]);

  // Step 3: Amenities & Media
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [brochureUrl, setBrochureUrl] = useState("");
  const [brochureFile, setBrochureFile] = useState<UploadedBrochure | null>(null);

  // Step 4: Sales Office & Concierge Contact
  const [salesPhone, setSalesPhone] = useState("");
  const [salesEmail, setSalesEmail] = useState("");
  const [siteVisitTimings, setSiteVisitTimings] = useState("");

  function addConfiguration() {
    const newCfg: ProjectConfiguration = {
      id: `cfg-${Date.now()}`,
      bhkType: "3 BHK",
      carpetArea: 1200,
      superBuiltUpArea: 1600,
      bathrooms: 2,
      balconies: 2,
      priceMin: 8500000,
      priceMax: 9500000,
      isAvailable: true,
    };
    setConfigurations([...configurations, newCfg]);
  }

  function removeConfiguration(id: string | number) {
    if (configurations.length <= 1) {
      toast.error("At least one BHK configuration is required");
      return;
    }
    setConfigurations(configurations.filter((c) => c.id !== id));
  }

  function updateConfig(id: string | number, field: keyof ProjectConfiguration, val: unknown) {
    setConfigurations(
      configurations.map((c) => {
        if (c.id === id) {
          return { ...c, [field]: val };
        }
        return c;
      })
    );
  }

  function toggleAmenity(amenity: string) {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  }

  function formatMoney(num?: number | string) {
    if (!num) return "₹0";
    const n = Number(num);
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${n.toLocaleString("en-IN")}`;
  }

  function handleNext() {
    if (currentStep === 1) {
      if (!name.trim()) return toast.error("Please enter project name");
      if (!developerName.trim()) return toast.error("Please enter developer / builder name");
      if (!reraId.trim()) return toast.error("Please enter RERA registration number");
      if (!possessionDate.trim()) return toast.error("Please enter possession timeline (e.g. December 2026 or Ready)");
      if (!city.trim()) return toast.error("Please select a city");
      if (!locality.trim()) return toast.error("Please enter locality or sector");
      if (!pincode.trim()) return toast.error("Please enter the project pincode");
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 2) {
      if (configurations.length === 0) return toast.error("Add at least one configuration");
      if (configurations.some((item) => item.carpetArea <= 0 || item.bathrooms <= 0 || item.priceMin <= 0)) {
        return toast.error("Enter valid carpet area, bathrooms and price for every configuration");
      }
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 3) {
      if (images.length === 0) return toast.error("Please upload at least one project photo or render");
      if (images.some((url) => !url.startsWith("http"))) return toast.error("Please wait for all project photos to finish uploading");
      if (brochureFile && !brochureFile.uploadedToR2) return toast.error("Please retry the brochure upload before continuing");
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSubmit() {
    if (!salesPhone.trim()) return toast.error("Sales desk phone number is required");

    // Auto-calculate headline min & max if not explicitly set
    const calculatedMin =
      Number(priceMin) || Math.min(...configurations.map((c) => Number(c.priceMin) || 0));
    const calculatedMax =
      Number(priceMax) || Math.max(...configurations.map((c) => Number(c.priceMax || c.priceMin) || 0));

    const newProject: CreateProjectInput = {
      name,
      developerName,
      reraId,
      status,
      possessionDate,
      priceMin: calculatedMin,
      priceMax: calculatedMax,
      pricePerSqFt: Number(pricePerSqFt) || undefined,
      city,
      locality,
      siteAddress: siteAddress || `${locality}, ${city}`,
      landmark,
      pincode,
      latitude,
      longitude,
      totalLandArea: totalLandArea || undefined,
      totalTowers: totalTowers ? Number(totalTowers) : undefined,
      totalUnits: totalUnits ? Number(totalUnits) : undefined,
      configurations,
      amenities: selectedAmenities,
      highlights: [],
      images,
      brochureUrl: brochureFile?.url || brochureUrl,
      salesPhone,
      salesEmail,
      siteVisitTimings,
    };

    try {
      const created = await createProject(newProject).unwrap();
      toast.success("Project submitted successfully.");
      router.push(`/new-projects/${created.slug || created.id}`);
    } catch {
      // The shared API layer displays the backend validation/authentication error.
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1 bg-gradient-to-b from-slate-100/70 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Top Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="mb-1.5">
                <BackButton fallbackHref="/new-projects" label="Back to New Projects" variant="ghost" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                Builder & Developer Project Portal
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                List your entire township, high-rise, or gated community with RERA verification & configuration matrix.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Direct Builder Desk • Zero Individual Unit Repetition</span>
            </div>
          </div>

          {/* Stepper Header */}
          <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { num: 1, title: "1. Identity & Location", icon: MapPin },
              { num: 2, title: "2. Configurations & Price", icon: Layers },
              { num: 3, title: "3. Amenities & Media", icon: Sparkles },
              { num: 4, title: "4. Sales Office Desk", icon: PhoneCall },
            ].map((step) => {
              const active = currentStep === step.num;
              const completed = currentStep > step.num;
              const Icon = step.icon;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => completed && setCurrentStep(step.num as 1 | 2 | 3 | 4)}
                  className={`flex items-center gap-2.5 rounded-2xl p-3 text-left transition ${
                    active
                      ? "bg-rose-600 text-white shadow-md shadow-rose-200 dark:shadow-none"
                      : completed
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-white text-slate-400 border border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                      active
                        ? "bg-white/20 text-white"
                        : completed
                        ? "bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                    }`}
                  >
                    {completed ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className="text-xs font-bold truncate">{step.title}</span>
                </button>
              );
            })}
          </div>

          {/* Main Form Content + Live Search Card Preview */}
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {/* STEP 1: IDENTITY & SITE LOCATION */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                        <Building2 className="h-4 w-4" />
                        <span>Step 1 of 4</span>
                      </div>
                      <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                        Project Identity & Site Location
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Enter your development entity and official RERA registration number.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            Project Name *
                          </label>
                          <span className="text-[11px] text-slate-400">
                            Township, community, or development name
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Godrej Woods - Luxury High-Rise Residences, Sector 43"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-y min-h-[58px] leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Developer / Builder Entity *
                        </label>
                        <input
                          type="text"
                          value={developerName}
                          onChange={(e) => setDeveloperName(e.target.value)}
                          placeholder="e.g. Godrej Properties, DLF Homes"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          RERA Registration Number *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={reraId}
                            onChange={(e) => setReraId(e.target.value)}
                            placeholder="e.g. UPRERAPRJ704730 or P51700000001"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                          <FileCheck2 className="absolute right-3 top-3 h-4 w-4 text-emerald-600" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Construction Status *
                        </label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="NEW_LAUNCH">Newly Launched / Pre-Launch</option>
                          <option value="UNDER_CONSTRUCTION">Under Construction</option>
                          <option value="READY_TO_MOVE">Ready to Move (OC Received)</option>
                        </select>
                      </div>
                    </div>

                    {/* Possession Timeline */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Possession Timeline *
                        </label>
                        <span className="text-[11px] text-slate-400">Target completion / OC date</span>
                      </div>
                      <input
                        type="text"
                        value={possessionDate}
                        onChange={(e) => setPossessionDate(e.target.value)}
                        placeholder="e.g. December 2026 or Ready"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      {/* Quick preset chips */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-400 py-0.5">Quick picks:</span>
                        {POSSESSION_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setPossessionDate(preset)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                              possessionDate === preset
                                ? "bg-rose-600 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* State & City Searchable Dropdowns */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            State *
                          </label>
                          <span className="text-[11px] text-slate-400">Searchable dropdown</span>
                        </div>
                        <SearchableSelect
                          value={selectedState}
                          onChange={handleStateChange}
                          options={statesList}
                          placeholder="Select State (e.g. Uttar Pradesh)..."
                          searchPlaceholder="Search State..."
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            City *
                          </label>
                          <span className="text-[11px] text-slate-400">Searchable dropdown</span>
                        </div>
                        <SearchableSelect
                          value={city}
                          onChange={handleCityChange}
                          options={citiesList}
                          placeholder="Select City (e.g. Noida)..."
                          searchPlaceholder="Search City..."
                        />

                      </div>
                    </div>

                    {/* Locality / Sector Dropdown with Suggestions like Property Search Flow */}
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            Locality / Sector *
                          </label>
                          <span className="text-[11px] text-slate-400">Real-time autocomplete suggestion</span>
                        </div>

                        <LocalitySearchDropdown
                          value={locality}
                          onChange={handleLocalityChange}
                          city={city}
                          popularLocalities={localityOptions}
                          placeholder="e.g. Sector 43, Whitefield"
                        />
                        <p className="mt-1 text-[11px] text-slate-400">
                          Search master sectors &amp; localities in {city}, or type any custom sector.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Pincode
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 201301"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Site Office & Project Address
                      </label>
                      <input
                        type="text"
                        value={siteAddress}
                        onChange={(e) => setSiteAddress(e.target.value)}
                        placeholder="e.g. Plot GH-01, Sector 43 (Near Golf Course Road)"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Landmark
                        </label>
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="e.g. Opp Golf Course Metro"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Total Land Area
                        </label>
                        <input
                          type="text"
                          value={totalLandArea}
                          onChange={(e) => setTotalLandArea(e.target.value)}
                          placeholder="e.g. 11.5 Acres"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Total Towers & Units
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={totalTowers ?? ""}
                            onChange={(e) => setTotalTowers(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="Towers"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                          <input
                            type="number"
                            value={totalUnits ?? ""}
                            onChange={(e) => setTotalUnits(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="Units"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: PRICING & CONFIGURATIONS MATRIX */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                        <Layers className="h-4 w-4" />
                        <span>Step 2 of 4</span>
                      </div>
                      <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                        Pricing & Configurations Matrix
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Add the different unit types (1 BHK, 2 BHK, 3 BHK) offered in your project.
                      </p>
                    </div>

                    {/* Headline Price & Rate */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                        Project Headline Pricing
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Starting Price (₹)
                          </label>
                          <input
                            type="number"
                            value={priceMin}
                            onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : "")}
                            placeholder="e.g. 6500000"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"
                          />
                          <span className="text-[10px] text-slate-500">{formatMoney(priceMin)}</span>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Max Price (₹)
                          </label>
                          <input
                            type="number"
                            value={priceMax}
                            onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : "")}
                            placeholder="e.g. 15000000"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"
                          />
                          <span className="text-[10px] text-slate-500">{formatMoney(priceMax)}</span>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Base Rate (₹ / sq.ft)
                          </label>
                          <input
                            type="number"
                            value={pricePerSqFt}
                            onChange={(e) => setPricePerSqFt(e.target.value ? Number(e.target.value) : "")}
                            placeholder="e.g. 8500"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Configurations Matrix Table */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Unit Configurations Offered ({configurations.length})
                        </h3>
                        <button
                          type="button"
                          onClick={addConfiguration}
                          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Unit Type</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {configurations.map((cfg, idx) => (
                          <div
                            key={cfg.id}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
                              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                Configuration #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeConfiguration(cfg.id)}
                                className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                                title="Remove"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-4">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                  Unit Type
                                </label>
                                <select
                                  value={cfg.bhkType}
                                  onChange={(e) => updateConfig(cfg.id, "bhkType", e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
                                >
                                  {BHK_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                  Carpet Area (sq.ft)
                                </label>
                                <input
                                  type="number"
                                  value={cfg.carpetArea}
                                  onChange={(e) => updateConfig(cfg.id, "carpetArea", Number(e.target.value))}
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                  Starting Price (₹)
                                </label>
                                <input
                                  type="number"
                                  value={cfg.priceMin}
                                  onChange={(e) => updateConfig(cfg.id, "priceMin", Number(e.target.value))}
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
                                />
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {formatMoney(cfg.priceMin)}
                                </span>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                  Bathrooms / Balconies
                                </label>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <input
                                    type="number"
                                    value={cfg.bathrooms}
                                    onChange={(e) => updateConfig(cfg.id, "bathrooms", Number(e.target.value))}
                                    placeholder="Baths"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
                                  />
                                  <input
                                    type="number"
                                    value={cfg.balconies ?? ""}
                                    onChange={(e) => updateConfig(cfg.id, "balconies", Number(e.target.value))}
                                    placeholder="Balc"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: AMENITIES & MEDIA */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                        <Sparkles className="h-4 w-4" />
                        <span>Step 3 of 4</span>
                      </div>
                      <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                        Society Amenities & Visual Media
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Highlight your township’s signature features, layout plan, and brochure.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Select Project Amenities ({selectedAmenities.length} selected)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {AVAILABLE_AMENITIES.map((amenity) => {
                          const checked = selectedAmenities.includes(amenity);
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => toggleAmenity(amenity)}
                              className={`flex items-center gap-2 rounded-xl p-2.5 text-left text-xs font-semibold transition border ${
                                checked
                                  ? "border-rose-600 bg-rose-50/70 text-rose-800 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-300"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              <div
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                  checked
                                    ? "border-rose-600 bg-rose-600 text-white"
                                    : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
                                }`}
                              >
                                {checked && <CheckCircle2 className="h-3 w-3" />}
                              </div>
                              <span className="truncate">{amenity}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <ProjectMediaUpload
                      images={images}
                      onImagesChange={setImages}
                      brochureUrl={brochureUrl}
                      onBrochureChange={(b) => {
                        setBrochureFile(b);
                        setBrochureUrl(b?.url || "");
                      }}
                    />
                  </div>
                )}

                {/* STEP 4: SALES OFFICE & CONCIERGE CONTACT */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                        <PhoneCall className="h-4 w-4" />
                        <span>Step 4 of 4</span>
                      </div>
                      <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                        Builder Sales Office & Lead Routing
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Inquiries from verified home seekers will be instantly delivered to your desk.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Official Sales Helpline / WhatsApp *
                        </label>
                        <input
                          type="text"
                          value={salesPhone}
                          onChange={(e) => setSalesPhone(e.target.value)}
                          placeholder="+91-XXXXXXXXXX"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Official Sales Desk Email *
                        </label>
                        <input
                          type="email"
                          value={salesEmail}
                          onChange={(e) => setSalesEmail(e.target.value)}
                          placeholder="sales@developer.com"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Site Visit Office Timings
                      </label>
                      <input
                        type="text"
                        value={siteVisitTimings}
                        onChange={(e) => setSiteVisitTimings(e.target.value)}
                        placeholder="e.g. 9:30 AM – 6:30 PM (Mon – Sun)"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
                      <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                        Direct Builder Partnership Benefits
                      </h4>
                      <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-400">
                        Your project will be featured in Awasio New Projects showcase with verified RERA badge, direct buyer callouts, and interactive configuration floor plans.
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4)}
                      className="rounded-full border border-slate-200 px-5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Back
                    </button>
                  ) : <div />}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="rounded-full bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 dark:shadow-none"
                    >
                      Save & Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isPublishing}
                      className="rounded-full bg-emerald-600 px-7 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
                    >
                      {isPublishing ? "Publishing…" : "Publish Project to Portal"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Live Search Card Preview */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Live Search Preview
                    </span>
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                      Card Preview
                    </span>
                  </div>

                  {/* Simulated Project Card */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="relative h-36 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={images[0] || CDN_ASSETS.placeholderWebp}
                        alt="Project"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-emerald-700 shadow-sm">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>RERA Verified</span>
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="rounded-lg bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                          {status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 truncate">
                        By {developerName || "Developer Name"}
                      </div>
                      <h4 className="text-base font-black text-slate-950 dark:text-white truncate">
                        {name || "Project Name"}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{locality ? `${locality}, ${city}` : city}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-xs font-bold text-slate-950 dark:text-white">
                          {priceMin ? `${formatMoney(priceMin)} Onwards` : "Price on Request"}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {configurations.map((c) => (
                            <span
                              key={c.id}
                              className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {c.bhkType}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] text-slate-400 text-center">
                    This card automatically appears on the <strong>New Projects</strong> search page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}
