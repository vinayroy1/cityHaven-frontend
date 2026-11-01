"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  User,
  Sparkles,
  Layers,
  MapPin,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Save,
  Send,
  Plus,
  Unlock,
  Package,
  Wrench,
  Check,
  ExternalLink,
  ChevronRight,
  Eye,
  Trash2,
  IndianRupee,
} from "lucide-react";
import {
  useGetMyInteriorProfileQuery,
  useSaveMyInteriorProfileMutation,
  usePublishMyInteriorProfileMutation,
  useSaveInteriorPackageMutation,
  useSavePortfolioProjectMutation,
  useUnlockInteriorInquiryMutation,
} from "@/features/interiors/api";
import {
  INTERIOR_CITIES,
  CITY_LOCALITIES,
  BOARD_MATERIALS,
  BOARD_BRANDS,
  SURFACE_FINISHES,
  FINISH_BRANDS,
  HARDWARE_FITTINGS,
  HARDWARE_BRANDS,
  DESIGN_STYLES,
  SERVICES_OFFERED,
  PROPERTY_TYPES,
  PRICING_UNITS,
} from "@/constants/interior-data";
import {
  PropertyListingCitySelector,
  type CitySelection,
} from "@/components/propertyListing/PropertyListingCitySelector";
import {
  PropertyListingLocalitySelector,
  type LocalitySelection,
} from "@/components/propertyListing/PropertyListingLocalitySelector";

const WIZARD_STEPS = [
  { id: 1, title: "Identity", desc: "Studio & Type" },
  { id: 2, title: "Location", desc: "City & Localities" },
  { id: 3, title: "Services", desc: "Scope & Types" },
  { id: 4, title: "Materials", desc: "Boards & Hardware" },
  { id: 5, title: "Pricing", desc: "Rates & Packages" },
  { id: 6, title: "Warranties", desc: "Guarantees & Support" },
  { id: 7, title: "Publish", desc: "Review & Live" },
];

export default function InteriorProfileWizardPage() {
  const { data: profile, isLoading } = useGetMyInteriorProfileQuery();
  const [saveProfile, { isLoading: isSaving }] = useSaveMyInteriorProfileMutation();
  const [publishProfile, { isLoading: isPublishing }] = usePublishMyInteriorProfileMutation();
  const [savePackage, { isLoading: isPackageSaving }] = useSaveInteriorPackageMutation();
  const [saveProject, { isLoading: isProjectSaving }] = useSavePortfolioProjectMutation();
  const [unlockInquiry, { isLoading: isUnlocking }] = useUnlockInteriorInquiryMutation();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<"WIZARD" | "PACKAGES" | "PROJECTS" | "LEADS">("WIZARD");

  // Step 1: Business Identity
  const [providerType, setProviderType] = useState<"INDIVIDUAL" | "COMPANY">("INDIVIDUAL");
  const [businessName, setBusinessName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [about, setAbout] = useState("");
  const [experienceYears, setExperienceYears] = useState(5);
  const [teamSize, setTeamSize] = useState(2);
  const [logo, setLogo] = useState("");
  const [coverBanner, setCoverBanner] = useState("");

  // Step 2: Location
  const [primaryCity, setPrimaryCity] = useState("Mumbai");
  const [primaryState, setPrimaryState] = useState("Maharashtra");
  const [primaryLocality, setPrimaryLocality] = useState("Bandra West");
  const [primaryAddress, setPrimaryAddress] = useState("");
  const [serviceCities, setServiceCities] = useState<string[]>(["Mumbai"]);
  const [workingHours, setWorkingHours] = useState("Mon - Sat (10:00 AM - 7:00 PM)");

  // Step 3: Scope & Services
  const [servicesOffered, setServicesOffered] = useState<string[]>([
    "Full Home Interior (Turnkey)",
    "Modular Kitchen Design & Install",
    "Custom Wardrobes & Storage",
  ]);
  const [propertyTypesHandled, setPropertyTypesHandled] = useState<string[]>([
    "2 BHK Apartment",
    "3 BHK Apartment",
    "4 BHK Apartment",
  ]);
  const [designStyles, setDesignStyles] = useState<string[]>(["Modern", "Contemporary", "Minimalist"]);

  // Step 4: Materials & Brands
  const [boardMaterials, setBoardMaterials] = useState<string[]>([
    "BWP Marine Plywood (IS 710)",
    "HDHMR (High Density High Moisture Resistant)",
  ]);
  const [boardBrands, setBoardBrands] = useState<string[]>(["CenturyPly", "Greenply"]);
  const [surfaceFinishes, setSurfaceFinishes] = useState<string[]>([
    "Matte Laminate (1mm)",
    "Acrylic Finish (Scratch Resistant)",
  ]);
  const [finishBrands, setFinishBrands] = useState<string[]>(["Merino Laminates", "Decowood Natural Veneers"]);
  const [hardwareBrands, setHardwareBrands] = useState<string[]>(["Hafele (Germany)", "Blum (Austria)", "Hettich (Germany)"]);

  // Step 5: Pricing
  const [startingRateMin, setStartingRateMin] = useState(1600);
  const [startingRateMax, setStartingRateMax] = useState(2800);
  const [pricingUnit, setPricingUnit] = useState<string>("PER_SQFT");
  const [isCustomQuotationOnly, setIsCustomQuotationOnly] = useState(false);
  const [consultationFee, setConsultationFee] = useState(0);

  // Step 6: Warranties & Credentials
  const [woodworkWarrantyYears, setWoodworkWarrantyYears] = useState(10);
  const [hardwareWarrantyYears, setHardwareWarrantyYears] = useState(10);
  const [civilWarrantyYears, setCivilWarrantyYears] = useState(1);
  const [freeMaintenanceMonths, setFreeMaintenanceMonths] = useState(6);
  const [gstin, setGstin] = useState("");

  // Package Form State
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [packageName, setPackageName] = useState("");
  const [packageCategory, setPackageCategory] = useState("Full Home Turnkey");
  const [packagePriceMin, setPackagePriceMin] = useState(1450000);
  const [packagePriceMax, setPackagePriceMax] = useState(1850000);
  const [packageUnit, setPackageUnit] = useState<any>("FIXED_PRICE");
  const [packageConfigs, setPackageConfigs] = useState<string[]>(["2 BHK Apartment", "3 BHK Apartment"]);
  const [packageInclusions, setPackageInclusions] = useState<string>("");
  const [packageExclusions, setPackageExclusions] = useState<string>("");
  const [packageBoardSpec, setPackageBoardSpec] = useState("CenturyPly BWP Marine Ply (IS 710)");
  const [packageFinishSpec, setPackageFinishSpec] = useState("1mm Anti-Fingerprint Matte Laminate");
  const [packageHardwareSpec, setPackageHardwareSpec] = useState("Hafele & Blum Soft-Close Hinges & Tandem Drawers");
  const [packageWarrantyYears, setPackageWarrantyYears] = useState(10);

  // Step 7/Portfolio Form State
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectConfig, setProjectConfig] = useState("3 BHK Apartment");
  const [projectStyle, setProjectStyle] = useState("Modern");
  const [projectBudget, setProjectBudget] = useState(1800000);
  const [projectCity, setProjectCity] = useState("Mumbai");
  const [projectState, setProjectState] = useState("Maharashtra");
  const [projectLocality, setProjectLocality] = useState("Bandra West");
  const [projectArea, setProjectArea] = useState(1350);
  const [projectDurationDays, setProjectDurationDays] = useState(50);
  const [projectCover, setProjectCover] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectBoardSpec, setProjectBoardSpec] = useState("CenturyPly BWP 710 Club Prime");
  const [projectHardwareSpec, setProjectHardwareSpec] = useState("Hafele & Blum Soft-Close");

  // Dynamic localities for primary city
  const availableLocalities = useMemo(() => {
    return CITY_LOCALITIES[primaryCity] || [];
  }, [primaryCity]);

  // Dynamic localities for project city
  const availableProjectLocalities = useMemo(() => {
    return CITY_LOCALITIES[projectCity] || [];
  }, [projectCity]);

  // Prepopulate form when profile is fetched
  useEffect(() => {
    if (profile) {
      setProviderType(profile.providerType);
      setBusinessName(profile.businessName || "");
      setDisplayName(profile.displayName || "");
      setTagline(profile.tagline || "");
      setAbout(profile.about || "");
      setExperienceYears(profile.experienceYears || 5);
      setTeamSize(profile.teamSize || 2);
      setLogo(profile.logo || "");
      setCoverBanner(profile.coverBanner || "");
      setPrimaryCity(profile.primaryCity || "Mumbai");
      setPrimaryLocality(profile.primaryLocality || "Bandra West");
      setPrimaryAddress(profile.primaryAddress || "");
      setStartingRateMin(profile.startingRateMin || 1600);
      setStartingRateMax(profile.startingRateMax || 2800);
      setPricingUnit(profile.pricingUnit || "PER_SQFT");
      setIsCustomQuotationOnly(profile.isCustomQuotationOnly || false);
      if (profile.servicesOffered?.length) setServicesOffered(profile.servicesOffered);
      if (profile.boardMaterials?.length) setBoardMaterials(profile.boardMaterials);
      if (profile.boardBrands?.length) setBoardBrands(profile.boardBrands);
      if (profile.surfaceFinishes?.length) setSurfaceFinishes(profile.surfaceFinishes);
      if (profile.finishBrands?.length) setFinishBrands(profile.finishBrands);
      if (profile.hardwareBrands?.length) setHardwareBrands(profile.hardwareBrands);
      if (profile.designStyles?.length) setDesignStyles(profile.designStyles);
      if (profile.propertyTypesHandled?.length) setPropertyTypesHandled(profile.propertyTypesHandled);
      if (profile.woodworkWarrantyYears) setWoodworkWarrantyYears(profile.woodworkWarrantyYears);
      if (profile.hardwareWarrantyYears) setHardwareWarrantyYears(profile.hardwareWarrantyYears);
      if (profile.gstin) setGstin(profile.gstin);
    }
  }, [profile]);

  // Toggle selection in an array state
  const toggleArrayItem = (list: string[], setList: (items: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSaveProgress = async () => {
    try {
      await saveProfile({
        providerType,
        businessName: businessName.trim() || "My Interior Studio",
        displayName: displayName.trim() || businessName.trim() || "Principal Designer",
        tagline: tagline.trim() || undefined,
        about: about.trim() || "Dedicated to creating exceptional residential and commercial spaces.",
        experienceYears: Number(experienceYears) || 1,
        teamSize: Number(teamSize) || 1,
        logo: logo.trim() || undefined,
        coverBanner: coverBanner.trim() || undefined,
        primaryCity,
        primaryLocality,
        primaryAddress: primaryAddress.trim() || undefined,
        workingHours,
        servicesOffered,
        propertyTypesHandled,
        designStyles,
        boardMaterials,
        boardBrands,
        surfaceFinishes,
        finishBrands,
        hardwareBrands,
        startingRateMin: isCustomQuotationOnly ? null : Number(startingRateMin) || null,
        startingRateMax: isCustomQuotationOnly ? null : Number(startingRateMax) || null,
        pricingUnit: pricingUnit as any,
        isCustomQuotationOnly,
        consultationFee: Number(consultationFee) || 0,
        woodworkWarrantyYears: Number(woodworkWarrantyYears) || 10,
        hardwareWarrantyYears: Number(hardwareWarrantyYears) || 10,
        civilWarrantyYears: Number(civilWarrantyYears) || 1,
        freeMaintenanceMonths: Number(freeMaintenanceMonths) || 6,
        gstin: gstin.trim() || undefined,
      }).unwrap();

      alert("Changes saved successfully!");
    } catch (err: any) {
      alert(err?.data?.message || "Failed to save profile progress.");
    }
  };

  const handlePublish = async () => {
    try {
      await publishProfile().unwrap();
      alert("Congratulations! Your Interior Designer profile has been submitted and published.");
    } catch (err: any) {
      alert(err?.data?.message || "Failed to publish. Ensure you have added at least 1 completed project.");
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName.trim()) {
      alert("Please provide a package name.");
      return;
    }

    try {
      await savePackage({
        data: {
          packageName: packageName.trim(),
          packageCategory,
          priceMin: Number(packagePriceMin) || 1200,
          priceMax: Number(packagePriceMax) || null,
          pricingUnit: packageUnit,
          applicablePropertyTypes: packageConfigs,
          inclusions: packageInclusions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          exclusions: packageExclusions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          boardMaterialAndBrand: packageBoardSpec,
          finishAndBrand: packageFinishSpec,
          hardwareAndBrand: packageHardwareSpec,
          woodworkWarrantyYears: Number(packageWarrantyYears) || 10,
          isActive: true,
        },
      }).unwrap();

      alert("Package created successfully!");
      setIsAddingPackage(false);
      setPackageName("");
      setPackageInclusions("");
      setPackageExclusions("");
    } catch (err: any) {
      alert(err?.data?.message || "Failed to save package.");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !projectCover.trim()) {
      alert("Please provide project title and cover image URL.");
      return;
    }

    try {
      await saveProject({
        data: {
          title: projectTitle,
          projectCategory: "Residential",
          propertyConfig: projectConfig,
          carpetAreaSqft: Number(projectArea) || 1200,
          cityName: projectCity,
          locality: projectLocality,
          designStyle: projectStyle,
          projectBudget: Number(projectBudget) || 1500000,
          executionDurationDays: Number(projectDurationDays) || 45,
          completionDate: new Date().toISOString(),
          description: projectDesc || "Complete turnkey interior execution.",
          coverImage: projectCover,
          images: [projectCover],
          actualBoardSpec: projectBoardSpec,
          actualHardwareSpec: projectHardwareSpec,
        },
      }).unwrap();

      alert("Project added to portfolio!");
      setIsAddingProject(false);
      setProjectTitle("");
      setProjectCover("");
      setProjectDesc("");
    } catch (err: any) {
      alert(err?.data?.message || "Failed to save project.");
    }
  };

  const handleUnlockLead = async (inquiryId: number) => {
    if (!confirm("Unlocking this verified client lead will deduct 20 credits from your wallet. Proceed?")) return;
    try {
      await unlockInquiry(inquiryId).unwrap();
      alert("Lead unlocked! Client phone & email are now visible.");
    } catch (err: any) {
      alert(err?.data?.message || "Failed to unlock lead. Please check your credit balance.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-3.5 py-6 sm:px-6 sm:py-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Professional Partner Control Hub</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Interior Studio & Designer Profile
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Configure your business branding, verified material standards, multi-city presence, and portfolio.
          </p>
        </div>

        {/* Live Profile Link */}
        {profile?.isPublished && (
          <Link
            href={`/interior-designers/${encodeURIComponent(profile.primaryCity.toLowerCase())}/${profile.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white shrink-0"
          >
            <Eye className="h-4 w-4 text-rose-600" />
            <span>View Public Listing</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        )}
      </div>

      {/* Main Tab Switcher */}
      <div className="mt-6 flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("WIZARD")}
          className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "WIZARD"
              ? "bg-slate-900 text-white shadow-xs dark:bg-rose-600"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Setup Wizard ({currentStep}/7)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PACKAGES")}
          className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "PACKAGES"
              ? "bg-slate-900 text-white shadow-xs dark:bg-rose-600"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Packages ({profile?.packages?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PROJECTS")}
          className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "PROJECTS"
              ? "bg-slate-900 text-white shadow-xs dark:bg-rose-600"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Portfolio Projects ({profile?.projects?.length || 0})
        </button>

        {/* Client Inquiries Tab - ONLY visible if listing is published */}
        {profile?.isPublished && (
          <button
            type="button"
            onClick={() => setActiveTab("LEADS")}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "LEADS"
                ? "bg-slate-900 text-white shadow-xs dark:bg-rose-600"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Client Inquiries & Leads ({profile?.inquiries?.length || 0})
          </button>
        )}
      </div>

      {/* TAB 1: 7-STEP WIZARD */}
      {activeTab === "WIZARD" && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Progress Step Indicators */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Onboarding Steps</h3>
              <div className="mt-3 space-y-1">
                {WIZARD_STEPS.map((step) => {
                  const isActive = currentStep === step.id;
                  const isDone = currentStep > step.id;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left text-xs font-bold transition ${
                        isActive
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                          : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black ${
                          isDone
                            ? "bg-emerald-500 text-white"
                            : isActive
                            ? "bg-rose-600 text-white"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {isDone ? <Check className="h-3.5 w-3.5" /> : step.id}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{step.title}</p>
                        <p className="truncate text-[10px] font-normal text-slate-400">{step.desc}</p>
                      </div>
                      {isActive && <ChevronRight className="h-4 w-4 text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Requirement Alert */}
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                <span className="font-bold">Publication Rule:</span> At least 1 completed project must be added to the portfolio before listing can be verified and published.
              </div>
            </div>
          </div>

          {/* Right Column: Active Step Form */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              {/* STEP 1: IDENTITY */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 1: Business Identity</h3>
                    <p className="text-xs text-slate-500">Choose your entity structure and brand profile.</p>
                  </div>

                  {/* Provider Type Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Entity Classification *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setProviderType("INDIVIDUAL")}
                        className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
                          providerType === "INDIVIDUAL"
                            ? "border-rose-600 bg-rose-50/60 text-rose-700 shadow-2xs dark:bg-rose-950/30 dark:text-rose-300"
                            : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        <User className="h-6 w-6 text-rose-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold">Independent Designer / Architect</p>
                          <p className="text-[11px] text-slate-500">Solo professional, freelancer, or consultant</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProviderType("COMPANY")}
                        className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
                          providerType === "COMPANY"
                            ? "border-indigo-600 bg-indigo-50/60 text-indigo-700 shadow-2xs dark:bg-indigo-950/30 dark:text-indigo-300"
                            : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        <Building2 className="h-6 w-6 text-indigo-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold">Design Company / Studio</p>
                          <p className="text-[11px] text-slate-500">Firm with teams, experience centers, or branches</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Name fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Business / Studio Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Aura Spaces Studio Pvt Ltd"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Display / Brand Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Aura Spaces Studio"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tagline (One-line specialty)
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. Turnkey Luxury Residential Interiors & Hafele Modular Kitchens"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      About Studio & Design Philosophy *
                    </label>
                    <textarea
                      rows={4}
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="Highlight your experience, manufacturing units, delivery timeline guarantee, and design ethos..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Years of Industry Experience *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Cover Image / Studio Showcase URL
                      </label>
                      <input
                        type="url"
                        value={coverBanner}
                        onChange={(e) => setCoverBanner(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: LOCATION */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 2: Location & Coverage</h3>
                    <p className="text-xs text-slate-500">
                      Search and select your primary operating city and hub across India using verified database suggestions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Primary City Search Dropdown from Property Listing Flow */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Primary Operating City *
                      </label>
                      <PropertyListingCitySelector
                        value={primaryCity}
                        selectedState={primaryState}
                        onChange={(cityData: CitySelection) => {
                          setPrimaryCity(cityData.name);
                          if (cityData.state) setPrimaryState(cityData.state);
                          setPrimaryLocality("");
                        }}
                        placeholder="Search city across India..."
                      />
                    </div>

                    {/* Primary Locality Search Dropdown from Property Listing Flow */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Primary Locality / Hub *
                      </label>
                      <PropertyListingLocalitySelector
                        value={primaryLocality}
                        cityName={primaryCity}
                        selectedState={primaryState}
                        onChange={(locData: LocalitySelection) => {
                          setPrimaryLocality(locData.name);
                        }}
                        placeholder={`Search localities in ${primaryCity || "city"}...`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Complete Experience Center / Studio Address
                    </label>
                    <input
                      type="text"
                      value={primaryAddress}
                      onChange={(e) => setPrimaryAddress(e.target.value)}
                      placeholder="e.g. Plot 14, Linking Road, Bandra West, Mumbai 400050"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Experience Center Visiting Hours
                    </label>
                    <input
                      type="text"
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      placeholder="e.g. Tue - Sun (10:00 AM - 8:00 PM)"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: SERVICES & SCOPE */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 3: Services & Scope</h3>
                    <p className="text-xs text-slate-500">Select what your studio manufactures and executes.</p>
                  </div>

                  {/* Services Checklist */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Services Provided (Multi-select)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SERVICES_OFFERED.map((svc) => {
                        const isSelected = servicesOffered.includes(svc);
                        return (
                          <button
                            key={svc}
                            type="button"
                            onClick={() => toggleArrayItem(servicesOffered, setServicesOffered, svc)}
                            className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-semibold transition ${
                              isSelected
                                ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                                : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <div
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                                isSelected ? "border-rose-600 bg-rose-600 text-white" : "border-slate-300"
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                            <span className="truncate">{svc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Design Styles */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Aesthetic Styles Mastered
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DESIGN_STYLES.map((style) => {
                        const isSelected = designStyles.includes(style);
                        return (
                          <button
                            key={style}
                            type="button"
                            onClick={() => toggleArrayItem(designStyles, setDesignStyles, style)}
                            className={`rounded-full px-3 py-1 text-xs font-bold transition border ${
                              isSelected
                                ? "bg-rose-600 border-rose-600 text-white"
                                : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {style}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Property Types */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Property Configurations Catered To
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PROPERTY_TYPES.map((pt) => {
                        const isSelected = propertyTypesHandled.includes(pt);
                        return (
                          <button
                            key={pt}
                            type="button"
                            onClick={() => toggleArrayItem(propertyTypesHandled, setPropertyTypesHandled, pt)}
                            className={`rounded-full px-3 py-1 text-xs font-bold transition border ${
                              isSelected
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {pt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: MATERIALS & BRANDS */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 4: Materials & Brand Standards</h3>
                    <p className="text-xs text-slate-500">Disclose genuine materials to earn Verified Material Badges.</p>
                  </div>

                  {/* Substrates / Boards */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Substrate & Core Plywood Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {BOARD_MATERIALS.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => toggleArrayItem(boardMaterials, setBoardMaterials, b)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition ${
                            boardMaterials.includes(b)
                              ? "bg-rose-50 border-rose-600 text-rose-700 dark:bg-rose-950/40"
                              : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Board Brands */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Plywood Brands Sourced
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {BOARD_BRANDS.map((brand) => (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => toggleArrayItem(boardBrands, setBoardBrands, brand)}
                          className={`rounded-full px-3 py-1 text-xs font-bold border transition ${
                            boardBrands.includes(brand)
                              ? "bg-rose-600 border-rose-600 text-white"
                              : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hardware Brands */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Hardware & Fittings Partner Brands (Hafele, Blum, Hettich)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {HARDWARE_BRANDS.map((hb) => (
                        <button
                          key={hb}
                          type="button"
                          onClick={() => toggleArrayItem(hardwareBrands, setHardwareBrands, hb)}
                          className={`rounded-full px-3.5 py-1 text-xs font-bold border transition ${
                            hardwareBrands.includes(hb)
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-2xs"
                              : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {hb}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Surface Finishes */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Surface Finishes
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SURFACE_FINISHES.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => toggleArrayItem(surfaceFinishes, setSurfaceFinishes, f)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition ${
                            surfaceFinishes.includes(f)
                              ? "bg-purple-50 border-purple-600 text-purple-700 dark:bg-purple-950/40"
                              : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: PRICING & RATES */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 5: Pricing Models</h3>
                    <p className="text-xs text-slate-500">Configure transparent turnkey or square-foot rates.</p>
                  </div>

                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <input
                      type="checkbox"
                      id="customQuoteOnly"
                      checked={isCustomQuotationOnly}
                      onChange={(e) => setIsCustomQuotationOnly(e.target.checked)}
                      className="h-4 w-4 rounded-md text-rose-600 focus:ring-rose-500"
                    />
                    <label
                      htmlFor="customQuoteOnly"
                      className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      Custom Quotation Only (Do not show starting numbers on search cards)
                    </label>
                  </div>

                  {!isCustomQuotationOnly && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Min Starting Rate (₹) *
                        </label>
                        <input
                          type="number"
                          value={startingRateMin}
                          onChange={(e) => setStartingRateMin(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Max Rate (₹)
                        </label>
                        <input
                          type="number"
                          value={startingRateMax}
                          onChange={(e) => setStartingRateMax(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Pricing Unit Dropdown
                        </label>
                        <select
                          value={pricingUnit}
                          onChange={(e) => setPricingUnit(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          {PRICING_UNITS.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Initial Site Visit / Online Consultation Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(Number(e.target.value))}
                      placeholder="0 for Complimentary Walkthrough"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Set to 0 if your studio offers Free Initial Consultation.</p>
                  </div>

                  {/* Material Packages Callout in Step 5 */}
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 text-xs dark:border-rose-900/50 dark:bg-rose-950/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Package className="h-4 w-4 text-rose-600" />
                          <span>Material-Based Turnkey Packages ({profile?.packages?.length || 0})</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Package configurations (e.g. Essential ₹1,400/sq.ft, Premium ₹1,900/sq.ft, Luxe ₹2,600/sq.ft) with custom deliverables.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("PACKAGES")}
                        className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-rose-700 shrink-0"
                      >
                        Manage Packages &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: WARRANTIES & COMPLIANCE */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 6: Warranties & Trust</h3>
                    <p className="text-xs text-slate-500">Provide official warranty commitments to gain higher search rank.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Modular Woodwork Warranty (Years)
                      </label>
                      <input
                        type="number"
                        value={woodworkWarrantyYears}
                        onChange={(e) => setWoodworkWarrantyYears(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Branded Hardware Warranty (Years)
                      </label>
                      <input
                        type="number"
                        value={hardwareWarrantyYears}
                        onChange={(e) => setHardwareWarrantyYears(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      GSTIN Identification (Optional for Verified Badge)
                    </label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 27AAAAA0000A1Z5"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* STEP 7: REVIEW & PUBLISH */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 7: Review & Publish</h3>
                    <p className="text-xs text-slate-500">Check your details before pushing to the public directory.</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2 dark:border-slate-800 dark:bg-slate-800/60">
                    <p><strong>Business:</strong> {businessName || "Not configured"}</p>
                    <p><strong>Primary Hub:</strong> {primaryLocality ? `${primaryLocality}, ` : ""}{primaryCity}</p>
                    <p><strong>Key Services:</strong> {servicesOffered.slice(0, 3).join(", ") || "None"}</p>
                    <p><strong>Material Brands:</strong> {[...boardBrands, ...hardwareBrands].slice(0, 4).join(", ") || "Standard"}</p>
                    <p><strong>Portfolio Projects Added:</strong> {profile?.projects?.length || 0}</p>
                  </div>

                  {(!profile?.projects || profile.projects.length === 0) ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                      ⚠️ <strong>Mandatory Step:</strong> You must upload at least 1 completed project under the <strong>Portfolio Projects</strong> tab before publishing.
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={isPublishing}
                      className="w-full rounded-2xl bg-emerald-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-98"
                    >
                      {isPublishing ? "Publishing..." : "Publish Profile to Awasio Directory"}
                    </button>
                  )}
                </div>
              )}

              {/* Bottom Buttons Row */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleSaveProgress}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? "Saving..." : "Save Draft"}</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                    >
                      &larr; Back
                    </button>
                  )}
                  {currentStep < 7 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => prev + 1)}
                      className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500"
                    >
                      Next Step &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PACKAGES */}
      {activeTab === "PACKAGES" && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Material & Pricing Packages</h2>
              <p className="text-xs text-slate-500">
                Create structured turnkey packages (Essential, Premium, Luxe) with defined materials & deliverables.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingPackage(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Package</span>
            </button>
          </div>

          {/* New Package Form */}
          {isAddingPackage && (
            <form
              onSubmit={handleCreatePackage}
              className="rounded-3xl border border-rose-200 bg-rose-50/40 p-5 sm:p-7 space-y-4 dark:border-rose-950 dark:bg-rose-950/20"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Create Material Turnkey Package
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingPackage(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Premium 3BHK Turnkey Interior Package"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Package Category *
                  </label>
                  <select
                    value={packageCategory}
                    onChange={(e) => setPackageCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="Full Home Turnkey">Full Home Turnkey</option>
                    <option value="Modular Kitchen Only">Modular Kitchen Only</option>
                    <option value="Wardrobes & Storage">Wardrobes & Storage</option>
                    <option value="Living & Dining Makeover">Living & Dining Makeover</option>
                    <option value="Commercial Office Fitout">Commercial Office Fitout</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Starting Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={packagePriceMin}
                    onChange={(e) => setPackagePriceMin(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Price (₹) (Optional)
                  </label>
                  <input
                    type="number"
                    value={packagePriceMax}
                    onChange={(e) => setPackagePriceMax(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pricing Unit *
                  </label>
                  <select
                    value={packageUnit}
                    onChange={(e) => setPackageUnit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="FIXED_PRICE">Fixed Lump-Sum Package (₹)</option>
                    <option value="PER_SQFT">₹ per Sq. Ft.</option>
                    <option value="PER_ROOM">₹ per Room</option>
                  </select>
                </div>
              </div>

              {/* Material Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Board / Plywood Spec
                  </label>
                  <input
                    type="text"
                    value={packageBoardSpec}
                    onChange={(e) => setPackageBoardSpec(e.target.value)}
                    placeholder="e.g. CenturyPly BWP 710"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Finish & Brand Spec
                  </label>
                  <input
                    type="text"
                    value={packageFinishSpec}
                    onChange={(e) => setPackageFinishSpec(e.target.value)}
                    placeholder="e.g. Merino 1mm Matte / Acrylic"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hardware & Fittings Spec
                  </label>
                  <input
                    type="text"
                    value={packageHardwareSpec}
                    onChange={(e) => setPackageHardwareSpec(e.target.value)}
                    placeholder="e.g. Hafele Soft-Close Hinges"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Inclusions (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={packageInclusions}
                    onChange={(e) => setPackageInclusions(e.target.value)}
                    placeholder="e.g. 3D Renders, Modular Kitchen, Beds, False Ceiling, Painting"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exclusions (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={packageExclusions}
                    onChange={(e) => setPackageExclusions(e.target.value)}
                    placeholder="e.g. Civil structural changes, White goods, Appliances"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPackageSaving}
                className="w-full rounded-xl bg-rose-600 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-rose-700"
              >
                {isPackageSaving ? "Saving Package..." : "Publish Package"}
              </button>
            </form>
          )}

          {/* Package Cards List */}
          {(profile?.packages || []).length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <Package className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">No packages configured yet</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Offering turnkey packages with upfront material specs boosts lead conversion and builds client trust.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {profile!.packages!.map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                        {pkg.packageCategory}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">Active</span>
                    </div>
                    <h4 className="mt-2 text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                      {pkg.packageName}
                    </h4>
                    <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                      ₹{pkg.priceMin?.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-slate-400 ml-1">
                        {pkg.pricingUnit === "PER_SQFT" ? "/sq.ft." : "Lump sum"}
                      </span>
                    </p>

                    <div className="mt-3 text-xs text-slate-500 space-y-1 border-t border-slate-100 pt-3 dark:border-slate-800">
                      {pkg.boardMaterialAndBrand && (
                        <p className="truncate"><strong>Board:</strong> {pkg.boardMaterialAndBrand}</p>
                      )}
                      {pkg.hardwareAndBrand && (
                        <p className="truncate"><strong>Hardware:</strong> {pkg.hardwareAndBrand}</p>
                      )}
                      <p><strong>Warranty:</strong> {pkg.woodworkWarrantyYears || 10} Years</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PORTFOLIO PROJECTS */}
      {activeTab === "PROJECTS" && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Portfolio Showcase</h2>
              <p className="text-xs text-slate-500">Add completed residential and commercial spaces.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingProject(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Project</span>
            </button>
          </div>

          {/* New Project Form */}
          {isAddingProject && (
            <form onSubmit={handleCreateProject} className="rounded-3xl border border-rose-200 bg-rose-50/40 p-5 sm:p-7 space-y-4 dark:border-rose-950 dark:bg-rose-950/20">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Add Completed Portfolio Project
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingProject(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Minimalist Scandinavian 3BHK"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Configuration *
                  </label>
                  <select
                    value={projectConfig}
                    onChange={(e) => setProjectConfig(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                  >
                    {PROPERTY_TYPES.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Project City *
                  </label>
                  <PropertyListingCitySelector
                    value={projectCity}
                    selectedState={projectState}
                    onChange={(cityData: CitySelection) => {
                      setProjectCity(cityData.name);
                      if (cityData.state) setProjectState(cityData.state);
                      setProjectLocality("");
                    }}
                    placeholder="Search city across India..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Locality Dropdown *
                  </label>
                  <PropertyListingLocalitySelector
                    value={projectLocality}
                    cityName={projectCity}
                    selectedState={projectState}
                    onChange={(locData: LocalitySelection) => {
                      setProjectLocality(locData.name);
                    }}
                    placeholder={`Locality in ${projectCity || "city"}...`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Design Style *
                  </label>
                  <select
                    value={projectStyle}
                    onChange={(e) => setProjectStyle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                  >
                    {DESIGN_STYLES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Carpet Area (sq.ft.)
                  </label>
                  <input
                    type="number"
                    value={projectArea}
                    onChange={(e) => setProjectArea(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Actual Project Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={projectBudget}
                    onChange={(e) => setProjectBudget(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Execution Days
                  </label>
                  <input
                    type="number"
                    value={projectDurationDays}
                    onChange={(e) => setProjectDurationDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  High-Resolution Cover Photo URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={projectCover}
                  onChange={(e) => setProjectCover(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Board Spec Used
                  </label>
                  <input
                    type="text"
                    value={projectBoardSpec}
                    onChange={(e) => setProjectBoardSpec(e.target.value)}
                    placeholder="e.g. CenturyPly BWP 710 Club Prime"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hardware Spec Used
                  </label>
                  <input
                    type="text"
                    value={projectHardwareSpec}
                    onChange={(e) => setProjectHardwareSpec(e.target.value)}
                    placeholder="e.g. Hafele Soft-Close Hinges & Blum Drawers"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProjectSaving}
                className="w-full rounded-xl bg-rose-600 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-rose-700"
              >
                {isProjectSaving ? "Saving Project..." : "Upload Project to Portfolio"}
              </button>
            </form>
          )}

          {/* Project List Display */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(profile?.projects || []).map((proj) => (
              <div
                key={proj.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800">
                  <img src={proj.coverImage} alt={proj.title} className="h-full w-full object-cover" />
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                    {proj.propertyConfig}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{proj.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{proj.locality ? `${proj.locality}, ` : ""}{proj.cityName}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-600 dark:border-slate-800">
                    <span>₹{((proj.projectBudget || 0) / 100000).toFixed(1)} Lakhs</span>
                    <span className="text-emerald-600 font-bold">Approved</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LEADS & INQUIRIES */}
      {activeTab === "LEADS" && (
        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Customer Inquiries</h2>
            <p className="text-xs text-slate-500">Homeowners requesting estimates & consultations for your studio.</p>
          </div>

          {(profile?.inquiries || []).length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <User className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">No inquiries yet</h3>
              <p className="mt-1 text-xs text-slate-500">
                Once homeowners view your public listing and request estimates, inquiries will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile!.inquiries!.map((inq) => (
                <div
                  key={inq.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{inq.clientName}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {inq.bhkType} ({inq.carpetAreaSqft} sq.ft.)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {inq.locality ? `${inq.locality}, ` : ""}{inq.cityName} · Scope: {inq.projectScope}
                    </p>
                    {inq.isUnlocked ? (
                      <p className="text-xs font-bold text-emerald-600">
                        📞 {inq.clientPhone} {inq.clientEmail ? `· ✉️ ${inq.clientEmail}` : ""}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        📞 +91 ••••• •••• (Unlock to reveal contact phone & email)
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {inq.isUnlocked ? (
                      <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40">
                        Unlocked Lead
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUnlockLead(inq.id)}
                        disabled={isUnlocking}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
                      >
                        <Unlock className="h-3.5 w-3.5" />
                        <span>Unlock Lead (20 Credits)</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
