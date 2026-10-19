"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Search,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  IndianRupee,
  BedDouble,
  Building,
  Upload,
  X,
  Plus,
  HeartHandshake,
  Loader2,
  Calendar,
  Utensils,
  PawPrint,
  Cigarette,
  Wine,
  Moon,
  Laptop,
  Check,
  ShieldCheck,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { APP_CONFIG } from "@/constants/app-config";
import { PropertyListingCitySelector, type CitySelection } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector, type LocalitySelection } from "@/components/propertyListing/PropertyListingLocalitySelector";
import { useCreateFlatmateListingMutation } from "@/features/flatmates/api";
import { useGetPresignedUploadUrlMutation } from "@/features/propertyListing/api";
import type { FlatmateListingMode, FlatmateListingInput } from "@/types/flatmate.types";
import { registerBackHandler } from "@/lib/navigation/backNavigation";

const ROOM_TYPES = ["Private Room", "Shared Room (Twin)", "Shared Room (3+)", "Whole Flat"];
const BHK_OPTIONS = [1, 2, 3, 4, 5];
const FURNISHING_OPTIONS = ["Fully Furnished", "Semi-Furnished", "Unfurnished"];
const AMENITY_OPTIONS = [
  "High Speed WiFi",
  "Air Conditioner",
  "Attached Bathroom",
  "Power Backup",
  "Washing Machine",
  "Refrigerator",
  "Daily Cook / Maid",
  "Covered Parking",
  "Gym Access",
  "Balcony View",
  "Swimming Pool",
  "Gated Security",
];
const GENDER_OPTIONS = ["Any Gender", "Female Only", "Male Only"];
const OCCUPATION_OPTIONS = ["Working Professional", "Student", "Freelancer / Remote"];
const DIET_OPTIONS = ["Any Diet", "Pure Vegetarian", "Vegetarian & Eggetarian", "Non-Vegetarian", "Vegan"];
const WORK_MODE_OPTIONS = ["Remote / WFH", "Hybrid", "In-Office"];
const SLEEP_SCHEDULE_OPTIONS = ["Flexible", "Early Bird", "Night Owl"];

export function FlatmateListingWizard() {
  const router = useRouter();
  const [createListing, { isLoading: isSubmitting }] = useCreateFlatmateListingMutation();
  const [getPresignedUploadUrl] = useGetPresignedUploadUrlMutation();

  const [step, setStep] = useState(1);

  // Intercept back presses in Expo WebView or browser to decrement wizard step
  React.useEffect(() => {
    if (step <= 1) return;
    const unregister = registerBackHandler(() => {
      setStep((s) => Math.max(1, s - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true; // handled
    });
    return unregister;
  }, [step]);

  // Form state
  const [mode, setMode] = useState<FlatmateListingMode>("HAVE_ROOM");
  const [cityName, setCityName] = useState("Bengaluru");
  const [stateName, setStateName] = useState("Karnataka");
  const [locality, setLocality] = useState("");
  const [preferredLocalities, setPreferredLocalities] = useState<string[]>([]);
  const [localityInput, setLocalityInput] = useState("");

  // Room details
  const [bhk, setBhk] = useState<number>(2);
  const [roomType, setRoomType] = useState<string>("Private Room");
  const [furnishing, setFurnishing] = useState<string>("Fully Furnished");
  const [rent, setRent] = useState<string>("15000");
  const [deposit, setDeposit] = useState<string>("30000");
  const [budgetMin, setBudgetMin] = useState<string>("10000");
  const [budgetMax, setBudgetMax] = useState<string>("20000");
  const [maintenance, setMaintenance] = useState<string>("1500");
  const [availableFrom, setAvailableFrom] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
  );
  const [minimumStayMonths, setMinimumStayMonths] = useState<string>("6");
  const [amenities, setAmenities] = useState<string[]>([
    "High Speed WiFi",
    "Air Conditioner",
    "Attached Bathroom",
    "Washing Machine",
  ]);

  // Lifestyle & compatibility preferences
  const [preferredGenders, setPreferredGenders] = useState<string[]>(["Any Gender"]);
  const [preferredOccupations, setPreferredOccupations] = useState<string[]>([]);
  const [preferredDiet, setPreferredDiet] = useState<string>("Any Diet");
  const [smokingAllowed, setSmokingAllowed] = useState<boolean>(false);
  const [drinkingAllowed, setDrinkingAllowed] = useState<boolean>(true);
  const [petsAllowed, setPetsAllowed] = useState<boolean>(true);
  const [cleanlinessLevel, setCleanlinessLevel] = useState<number>(4);
  const [sleepSchedule, setSleepSchedule] = useState<string>("Flexible");
  const [workMode, setWorkMode] = useState<string>("Hybrid");

  // Profile and photos
  const [displayName, setDisplayName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [companyOrCollege, setCompanyOrCollege] = useState("");
  const [bio, setBio] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  React.useEffect(() => {
    if (!window.localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY)) {
      router.replace(`/login?redirect=${encodeURIComponent("/flatmates/post")}`);
    }
  }, [router]);

  // Toggle helpers
  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const addPreferredLocality = () => {
    if (localityInput.trim() && !preferredLocalities.includes(localityInput.trim())) {
      setPreferredLocalities((prev) => [...prev, localityInput.trim()]);
      setLocalityInput("");
    }
  };

  const removePreferredLocality = (item: string) => {
    setPreferredLocalities((prev) => prev.filter((l) => l !== item));
  };

  const addPhoto = () => {
    if (newPhotoUrl.trim() && !photos.includes(newPhotoUrl.trim())) {
      setPhotos((prev) => [...prev, newPhotoUrl.trim()]);
      setNewPhotoUrl("");
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files).slice(0, Math.max(0, 8 - photos.length));
    if (!selected.length) return;
    if (selected.some((file) => !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024)) {
      toast.error("Choose image files smaller than 10 MB each");
      return;
    }
    setIsUploadingPhotos(true);
    try {
      const uploaded = await Promise.all(selected.map(async (file) => {
        const presigned = await getPresignedUploadUrl({ fileName: file.name, contentType: file.type, category: "flatmates", subFolder: "photos" }).unwrap();
        const response = await fetch(presigned.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
        if (!response.ok) throw new Error(`Could not upload ${file.name}`);
        return presigned.publicUrl;
      }));
      setPhotos((current) => [...current, ...uploaded].slice(0, 8));
      toast.success(`${uploaded.length} photo${uploaded.length === 1 ? "" : "s"} uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Photo upload failed");
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  // Smart title generation
  const computedTitle = () => {
    if (title.trim()) return title.trim();
    const loc = locality || cityName;
    if (mode === "HAVE_ROOM") {
      return `${roomType} in ${bhk} BHK at ${loc} for rent`;
    }
    if (mode === "NEED_ROOM") {
      return `Looking for ${roomType || "Room"} near ${loc} (Budget: ₹${budgetMax || "20k"})`;
    }
    return `Buddy Up: Looking to team up for a flat in ${loc}`;
  };

  const handleNextStep = () => {
    if (step === 2) {
      if (!cityName) {
        toast.error("Please select a city");
        return;
      }
      if (mode === "HAVE_ROOM" && !rent) {
        toast.error("Please specify the monthly rent");
        return;
      }
      if (mode !== "HAVE_ROOM" && !budgetMax) {
        toast.error("Please specify your maximum budget");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 5));
  };

  const handleSubmit = async () => {
    try {
      const finalTitle = computedTitle();
      const payload: FlatmateListingInput = {
        mode,
        title: finalTitle,
        description: description.trim() || undefined,
        cityName,
        stateName: stateName || undefined,
        locality: locality.trim() || undefined,
        preferredLocalities: preferredLocalities.length ? preferredLocalities : undefined,
        bhk: mode === "HAVE_ROOM" ? bhk : undefined,
        roomType,
        furnishing,
        rent: mode === "HAVE_ROOM" ? Number(rent) : undefined,
        deposit: mode === "HAVE_ROOM" && deposit ? Number(deposit) : undefined,
        budgetMin: mode !== "HAVE_ROOM" && budgetMin ? Number(budgetMin) : undefined,
        budgetMax: mode !== "HAVE_ROOM" && budgetMax ? Number(budgetMax) : undefined,
        maintenance: maintenance ? Number(maintenance) : undefined,
        availableFrom: availableFrom ? new Date(availableFrom).toISOString() : undefined,
        minimumStayMonths: minimumStayMonths ? Number(minimumStayMonths) : undefined,
        spotsAvailable: 1,
        amenities,
        photos,
        preferredGenders,
        preferredOccupations,
        preferredDiet: preferredDiet !== "Any Diet" ? preferredDiet : undefined,
        smokingAllowed,
        drinkingAllowed,
        petsAllowed,
        profile: {
              displayName: displayName || undefined,
              birthYear: birthYear ? Number(birthYear) : undefined,
              gender: gender || undefined,
              occupation: occupation || undefined,
              companyOrCollege: companyOrCollege || undefined,
              bio: bio || undefined,
              diet: preferredDiet,
              cleanlinessLevel,
              sleepSchedule,
              workMode,
              hasPets: petsAllowed,
            },
      };

      const res = await createListing(payload).unwrap();
      toast.success("Flatmate listing posted successfully!", {
        description: "Your listing is now live and room seekers can connect with you directly.",
      });
      router.push(`/flatmates/${res.slug}`);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to publish listing. Please check required fields.";
      toast.error(msg);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-6">
      {/* Step Indicator Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "Intent" },
            { num: 2, label: "Location & Budget" },
            { num: 3, label: "Room Details" },
            { num: 4, label: "Lifestyle" },
            { num: 5, label: "Preview & Publish" },
          ].map((item) => {
            const isActive = step === item.num;
            const isCompleted = step > item.num;
            return (
              <div key={item.num} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-rose-600 text-white shadow-lg shadow-rose-500/30 scale-105"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : item.num}
                  </div>
                  <span
                    className={`mt-1.5 hidden sm:block text-[11px] font-semibold ${
                      isActive ? "text-rose-600 dark:text-rose-400" : "text-slate-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {item.num < 5 && (
                  <div
                    className={`mx-2 h-1 flex-1 rounded-full ${
                      step > item.num ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Listing Intent & Mode */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              What are you looking to do?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              Select your goal to customize your listing flow and connect with the best matched roommates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {/* Mode 1: HAVE_ROOM */}
            <button
              type="button"
              onClick={() => setMode("HAVE_ROOM")}
              className={`group relative flex flex-col items-start p-6 rounded-3xl border-2 text-left transition-all ${
                mode === "HAVE_ROOM"
                  ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-lg shadow-emerald-500/10 scale-[1.02]"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                I have a room to share
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You already rent or own a flat and have an unoccupied bedroom for a new flatmate.
              </p>
              {mode === "HAVE_ROOM" && (
                <div className="absolute top-4 right-4 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white" />
                </div>
              )}
            </button>

            {/* Mode 2: NEED_ROOM */}
            <button
              type="button"
              onClick={() => setMode("NEED_ROOM")}
              className={`group relative flex flex-col items-start p-6 rounded-3xl border-2 text-left transition-all ${
                mode === "NEED_ROOM"
                  ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/10 scale-[1.02]"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                I need a room / flat
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Looking for an available private or shared room to move into with like-minded flatmates.
              </p>
              {mode === "NEED_ROOM" && (
                <div className="absolute top-4 right-4 text-indigo-600">
                  <CheckCircle2 className="w-5 h-5 fill-indigo-600 text-white" />
                </div>
              )}
            </button>

            {/* Mode 3: BUDDY_UP */}
            <button
              type="button"
              onClick={() => setMode("BUDDY_UP")}
              className={`group relative flex flex-col items-start p-6 rounded-3xl border-2 text-left transition-all ${
                mode === "BUDDY_UP"
                  ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-lg shadow-amber-500/10 scale-[1.02]"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Buddy Up (Team Up)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Team up with 1 or 2 people to find and lease an entire 2BHK or 3BHK flat together.
              </p>
              {mode === "BUDDY_UP" && (
                <div className="absolute top-4 right-4 text-amber-600">
                  <CheckCircle2 className="w-5 h-5 fill-amber-600 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Location & Budget */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {mode === "HAVE_ROOM" ? "Where is your property located?" : "Where do you want to live?"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Target location helps roomies searching in the same neighborhood find you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                City <span className="text-rose-500">*</span>
              </label>
              <PropertyListingCitySelector
                value={cityName}
                selectedState={stateName}
                onChange={(city: CitySelection) => {
                  setCityName(city.name);
                  if (city.state) setStateName(city.state);
                  setLocality("");
                }}
                placeholder="Select city (e.g. Bengaluru, Mumbai, Delhi)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Primary Locality / Sector
              </label>
              <PropertyListingLocalitySelector
                value={locality}
                cityName={cityName}
                selectedState={stateName}
                onChange={(loc: LocalitySelection) => setLocality(loc.name)}
                placeholder="Search locality (e.g. Koramangala, Indiranagar)"
              />
            </div>
          </div>

          {/* Preferred additional localities for seekers */}
          {mode !== "HAVE_ROOM" && (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Other Preferred Areas (Optional, up to 5)
              </label>
              <div className="flex gap-2">
                <Input
                  value={localityInput}
                  onChange={(e) => setLocalityInput(e.target.value)}
                  placeholder="e.g. HSR Layout, Bellandur..."
                  className="rounded-2xl"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPreferredLocality();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPreferredLocality}
                  className="rounded-2xl"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              {preferredLocalities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {preferredLocalities.map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <span>{loc}</span>
                      <button
                        type="button"
                        onClick={() => removePreferredLocality(loc)}
                        className="hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pricing fields */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {mode === "HAVE_ROOM" ? "Rent & Security Deposit" : "Your Monthly Budget Range"}
            </h3>

            {mode === "HAVE_ROOM" ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Monthly Rent (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                      type="number"
                      value={rent}
                      onChange={(e) => setRent(e.target.value)}
                      placeholder="15000"
                      className="pl-9 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Security Deposit (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                      type="number"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      placeholder="30000"
                      className="pl-9 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Maintenance / Bills (₹/mo)
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                      type="number"
                      value={maintenance}
                      onChange={(e) => setMaintenance(e.target.value)}
                      placeholder="1500"
                      className="pl-9 rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Min Budget (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      placeholder="8000"
                      className="pl-9 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Max Budget (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      placeholder="20000"
                      className="pl-9 rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Room & Property Details */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Room & Property Details
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Specify the room type, flat size, and amenities available.
            </p>
          </div>

          {/* Room type selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Room Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ROOM_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRoomType(type)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                    roomType === type
                      ? "border-rose-500 bg-rose-50/50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* BHK Configuration */}
          {mode === "HAVE_ROOM" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Flat Configuration (BHK)
              </label>
              <div className="flex gap-2">
                {BHK_OPTIONS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setBhk(val)}
                    className={`h-11 w-14 rounded-2xl border text-sm font-bold transition-all ${
                      bhk === val
                        ? "border-rose-500 bg-rose-600 text-white shadow-md shadow-rose-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {val} BHK
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Furnishing */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Furnishing Level
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {FURNISHING_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFurnishing(opt)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                    furnishing === opt
                      ? "border-rose-500 bg-rose-50/50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Available From & Minimum Stay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Available From Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  type="date"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  className="pl-9 rounded-2xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Minimum Stay (Months)
              </label>
              <Input
                type="number"
                value={minimumStayMonths}
                onChange={(e) => setMinimumStayMonths(e.target.value)}
                placeholder="6"
                className="rounded-2xl"
              />
            </div>
          </div>

          {/* Amenities checklist */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Key Amenities Included
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITY_OPTIONS.map((amenity) => {
                const isSelected = amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-medium text-left transition-all ${
                      isSelected
                        ? "border-rose-400 bg-rose-50/50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white ${
                        isSelected ? "bg-rose-600" : "border border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span className="line-clamp-1">{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Lifestyle & Roomie Compatibility */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lifestyle Matching Engine</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Roommate Preferences & Lifestyle
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Top roomie platforms match people based on lifestyle habits. Set your preferences for zero-friction living.
            </p>
          </div>

          {/* Gender Preference */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Preferred Gender of Flatmate
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPreferredGenders([opt])}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                    preferredGenders.includes(opt)
                      ? "border-rose-500 bg-rose-50/50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Preference */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Preferred Occupation <span className="font-normal text-slate-400">(optional)</span></label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {OCCUPATION_OPTIONS.map((option) => {
                const selected = preferredOccupations.includes(option);
                return (
                  <button key={option} type="button" onClick={() => setPreferredOccupations((current) => selected ? current.filter((item) => item !== option) : [...current, option])} className={`rounded-2xl border p-2.5 text-xs font-semibold transition ${selected ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" : "border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400"}`}>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary Preference */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Dietary Preference
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {DIET_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPreferredDiet(opt)}
                  className={`p-2.5 rounded-2xl border text-xs font-bold transition-all text-center ${
                    preferredDiet === opt
                      ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Work Mode & Sleep Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-slate-500" /> Work Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {WORK_MODE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setWorkMode(opt)}
                    className={`p-2 rounded-2xl border text-xs font-medium transition-all ${
                      workMode === opt
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-slate-500" /> Sleep Schedule
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SLEEP_SCHEDULE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSleepSchedule(opt)}
                    className={`p-2 rounded-2xl border text-xs font-medium transition-all ${
                      sleepSchedule === opt
                        ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-bold"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Habits & House Rules Toggles */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              House Rules & Habits
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Smoking */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Cigarette className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Smoking Allowed
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSmokingAllowed(!smokingAllowed)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                    smokingAllowed ? "bg-rose-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Drinking */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Wine className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Drinking Allowed
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrinkingAllowed(!drinkingAllowed)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                    drinkingAllowed ? "bg-rose-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Pets */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Pet Friendly
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPetsAllowed(!petsAllowed)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                    petsAllowed ? "bg-emerald-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Cleanliness Level */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Cleanliness Level (1 = Relaxed, 5 = Spotless)
              </span>
              <span className="font-bold text-rose-600">{cleanlinessLevel} / 5</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setCleanlinessLevel(level)}
                  className={`flex-1 h-9 rounded-2xl border text-xs font-bold transition-all ${
                    cleanlinessLevel === level
                      ? "border-rose-500 bg-rose-600 text-white shadow-sm"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Photos & Preview & Publish */}
      {step === 5 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                About You & Photos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A clear profile and recent room photos help people decide whether to start a conversation.
              </p>
            </div>

            {/* Profile fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Your Name / Display Name
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Rahul S."
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Your Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900">
                  <option value="">Prefer not to say</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Self-described / Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Birth Year</label>
                <Input type="number" inputMode="numeric" min="1940" max={new Date().getFullYear() - 18} value={birthYear} onChange={(e) => setBirthYear(e.target.value)} placeholder="e.g. 1998" className="rounded-2xl" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Occupation
                </label>
                <Input
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="e.g. Product Designer"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Company / College
                </label>
                <Input
                  value={companyOrCollege}
                  onChange={(e) => setCompanyOrCollege(e.target.value)}
                  placeholder="e.g. TechCorp / IIT"
                  className="rounded-2xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                A bit about you (Bio / Roommate pitch)
              </label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="I work in tech, respect private spaces, love an occasional movie night on weekends..."
                rows={2}
                className="rounded-2xl resize-none text-sm"
              />
            </div>

            {/* Photos */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Room & Flat Photos
              </label>
              <label className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-rose-400 hover:bg-rose-50/40 dark:border-slate-700 dark:bg-slate-800/50 ${isUploadingPhotos ? "pointer-events-none opacity-70" : ""}`}>
                {isUploadingPhotos ? <Loader2 className="mb-2 h-6 w-6 animate-spin text-rose-500" /> : <Upload className="mb-2 h-6 w-6 text-rose-500" />}
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{isUploadingPhotos ? "Uploading photos…" : "Choose room or profile photos"}</span>
                <span className="mt-1 text-[11px] text-slate-500">Up to 8 JPG, PNG or WebP images · 10 MB each</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => void uploadPhotos(e.target.files)} />
              </label>
              <details className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-800">
                <summary className="cursor-pointer text-[11px] font-semibold text-slate-500">Or add an image URL</summary>
                <div className="mt-2 flex gap-2">
                <Input
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="Paste photo URL (https://...)"
                  className="rounded-2xl text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPhoto();
                    }
                  }}
                />
                <Button type="button" onClick={addPhoto} className="rounded-2xl shrink-0">
                  <Plus className="w-4 h-4 mr-1" /> Add Photo
                </Button>
                </div>
              </details>

              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {photos.map((url, idx) => (
                    <div key={idx} className="relative group rounded-2xl overflow-hidden h-28 border border-slate-200 dark:border-slate-800">
                      <img src={url} alt={`Room photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-950/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom title & description */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Listing Title
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTitle(computedTitle());
                      toast.success("Reset to auto-generated title!");
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    <Sparkles className="h-3 w-3" />
                    Auto-generate
                  </button>
                </div>
                <Textarea
                  value={title || computedTitle()}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={2}
                  className="rounded-2xl font-medium text-sm resize-y min-h-[58px] leading-relaxed border-slate-200 dark:border-slate-700 focus-visible:ring-rose-500"
                  placeholder="e.g. Spacious Private Room with Balcony in 3 BHK Gated Society"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description / Additional Notes
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Include any details about cook, maid, society rules, parking availability..."
                  rows={3}
                  className="rounded-2xl resize-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Quick Review Box */}
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Ready to find verified flatmates?
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Your listing will be published immediately on Awasio&apos;s Roomie network. Seekers can send you introduction notes and direct contact requests with no brokerage fees.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-200/80 dark:border-slate-800 pt-5">
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={isSubmitting}
            className="rounded-full px-5 border-slate-200 dark:border-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <Button
            type="button"
            onClick={handleNextStep}
            className="rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold px-8 shadow-md shadow-rose-500/20"
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-10 shadow-lg shadow-emerald-600/30 text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing Listing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Publish Flatmate Listing
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
