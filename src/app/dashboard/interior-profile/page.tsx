"use client";

import React, { useState, useEffect } from "react";
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
  DollarSign,
  Phone,
  Save,
  Send,
  Plus,
  Unlock,
} from "lucide-react";
import {
  useGetMyInteriorProfileQuery,
  useSaveMyInteriorProfileMutation,
  usePublishMyInteriorProfileMutation,
  useSavePortfolioProjectMutation,
  useUnlockInteriorInquiryMutation,
} from "@/features/interiors/api";

const WIZARD_STEPS = [
  "1. Business Identity",
  "2. Location & Coverage",
  "3. Scope & Services",
  "4. Materials & Brands",
  "5. Pricing & Packages",
  "6. Portfolio Projects",
  "7. Warranty & Support",
  "8. Contact & Availability",
  "9. Review & Publish",
];

export default function InteriorProfileWizardPage() {
  const { data: profile, isLoading } = useGetMyInteriorProfileQuery();
  const [saveProfile, { isLoading: isSaving }] = useSaveMyInteriorProfileMutation();
  const [publishProfile, { isLoading: isPublishing }] = usePublishMyInteriorProfileMutation();
  const [saveProject, { isLoading: isProjectSaving }] = useSavePortfolioProjectMutation();
  const [unlockInquiry, { isLoading: isUnlocking }] = useUnlockInteriorInquiryMutation();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<"WIZARD" | "LEADS" | "PROJECTS">("WIZARD");

  // Step 1 Form state
  const [providerType, setProviderType] = useState<"INDIVIDUAL" | "COMPANY">("INDIVIDUAL");
  const [businessName, setBusinessName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [about, setAbout] = useState("");
  const [experienceYears, setExperienceYears] = useState(3);
  const [teamSize, setTeamSize] = useState(1);
  const [logo, setLogo] = useState("");
  const [coverBanner, setCoverBanner] = useState("");

  // Step 2 Location
  const [primaryCity, setPrimaryCity] = useState("Mumbai");
  const [primaryLocality, setPrimaryLocality] = useState("");
  const [primaryAddress, setPrimaryAddress] = useState("");
  const [workingHours, setWorkingHours] = useState("Mon - Sat (10:00 AM - 7:00 PM)");

  // Step 3 Services
  const [servicesOffered, setServicesOffered] = useState<string[]>([
    "Full Home Turnkey",
    "Modular Kitchen",
    "Wardrobe Design",
  ]);

  // Step 4 Materials
  const [boardMaterials, setBoardMaterials] = useState<string[]>([
    "BWP Marine Plywood (IS 710)",
    "HDHMR",
  ]);
  const [hardwareBrands, setHardwareBrands] = useState<string[]>(["Hettich", "Hafele"]);

  // Step 5 Pricing
  const [startingRateMin, setStartingRateMin] = useState(1400);
  const [pricingUnit, setPricingUnit] = useState<any>("PER_SQFT");
  const [isCustomQuotationOnly, setIsCustomQuotationOnly] = useState(false);

  // New Project Form
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectConfig, setProjectConfig] = useState("3 BHK");
  const [projectStyle, setProjectStyle] = useState("Modern");
  const [projectBudget, setProjectBudget] = useState(1600000);
  const [projectCover, setProjectCover] = useState("");
  const [projectDesc, setProjectDesc] = useState("");

  // Prepopulate form when profile loads
  useEffect(() => {
    if (profile) {
      setProviderType(profile.providerType);
      setBusinessName(profile.businessName || "");
      setDisplayName(profile.displayName || "");
      setTagline(profile.tagline || "");
      setAbout(profile.about || "");
      setExperienceYears(profile.experienceYears || 3);
      setTeamSize(profile.teamSize || 1);
      setLogo(profile.logo || "");
      setCoverBanner(profile.coverBanner || "");
      setPrimaryCity(profile.primaryCity || "Mumbai");
      setPrimaryLocality(profile.primaryLocality || "");
      setPrimaryAddress(profile.primaryAddress || "");
      setStartingRateMin(profile.startingRateMin || 1400);
      setIsCustomQuotationOnly(profile.isCustomQuotationOnly || false);
      if (profile.servicesOffered?.length) setServicesOffered(profile.servicesOffered);
      if (profile.boardMaterials?.length) setBoardMaterials(profile.boardMaterials);
      if (profile.hardwareBrands?.length) setHardwareBrands(profile.hardwareBrands);
    }
  }, [profile]);

  const handleSaveProgress = async () => {
    try {
      await saveProfile({
        providerType,
        businessName: businessName || "My Design Studio",
        displayName: displayName || businessName || "Designer",
        tagline,
        about: about || "Passionate about creating modern living spaces.",
        experienceYears: Number(experienceYears) || 1,
        teamSize: Number(teamSize) || 1,
        logo,
        coverBanner,
        primaryCity,
        primaryLocality,
        primaryAddress,
        workingHours,
        servicesOffered,
        boardMaterials,
        hardwareBrands,
        startingRateMin: Number(startingRateMin) || null,
        pricingUnit,
        isCustomQuotationOnly,
      }).unwrap();

      alert("Progress saved successfully!");
    } catch (err: any) {
      alert(err?.data?.message || "Failed to save profile");
    }
  };

  const handlePublish = async () => {
    try {
      await publishProfile().unwrap();
      alert("Congratulations! Your Interior Designer listing is now live on Awasio.");
    } catch (err: any) {
      alert(err?.data?.message || "Failed to publish. Ensure you have added at least 1 completed project.");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProject({
        data: {
          title: projectTitle,
          projectCategory: "Residential",
          propertyConfig: projectConfig,
          cityName: primaryCity,
          locality: primaryLocality,
          designStyle: projectStyle,
          projectBudget: Number(projectBudget) || null,
          completionDate: new Date().toISOString(),
          description: projectDesc || "Complete turnkey interior execution.",
          coverImage: projectCover || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80",
          images: [],
          servicesPerformed: servicesOffered,
        },
      }).unwrap();

      setIsAddingProject(false);
      setProjectTitle("");
      alert("Project added to portfolio!");
    } catch (err: any) {
      alert(err?.data?.message || "Failed to add project");
    }
  };

  const handleUnlockLead = async (inquiryId: number) => {
    if (!confirm("Unlock this homeowner's phone number and consultation request for 20 Awasio Credits?")) return;
    try {
      await unlockInquiry(inquiryId).unwrap();
      alert("Client contact unlocked successfully!");
    } catch (err: any) {
      alert(err?.data?.message || "Failed to unlock lead");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-rose-600 border-t-transparent" />
        <p className="mt-3 text-sm text-slate-500">Loading Interior Workspace...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Partner Workspace
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Interior Designer & Company Listing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your public listing, completed portfolios, and client consultation leads.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("WIZARD")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeTab === "WIZARD"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Listing Setup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PROJECTS")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeTab === "PROJECTS"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Portfolio ({profile?.projects?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("LEADS")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeTab === "LEADS"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Client Leads ({profile?.inquiries?.length || 0})
          </button>
        </div>
      </div>

      {/* TAB 1: 9-STEP WIZARD */}
      {activeTab === "WIZARD" && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Left Stepper Navigation */}
          <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 h-fit space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
              Onboarding Steps
            </span>
            {WIZARD_STEPS.map((label, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx + 1)}
                className={`w-full rounded-xl px-3 py-2 text-left text-xs font-bold transition ${
                  currentStep === idx + 1
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right Form Body */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {/* Step 1: Business Identity */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 1: Business Identity</h3>
                
                {/* Individual vs Company Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Provider Classification *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setProviderType("INDIVIDUAL")}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${
                        providerType === "INDIVIDUAL"
                          ? "border-rose-600 bg-rose-50/50 text-rose-700 dark:bg-rose-950/30"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <User className="h-5 w-5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold">Independent Designer</p>
                        <p className="text-[11px] text-slate-500">Solo Architect or Freelancer</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProviderType("COMPANY")}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${
                        providerType === "COMPANY"
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/30"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Building2 className="h-5 w-5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold">Interior Design Company</p>
                        <p className="text-[11px] text-slate-500">Studio / Firm with team or branches</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Business / Studio Name *
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Studio Vistara Interiors"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Ar. Rohan Mehta"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tagline (One-line specialty)
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Turnkey Luxury Residential Interiors in Mumbai"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    About Business & Design Philosophy *
                  </label>
                  <textarea
                    rows={4}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Describe your design approach, working style, and execution capabilities..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Experience (Years) *
                    </label>
                    <input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Logo / Portrait Image URL
                    </label>
                    <input
                      type="url"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location & Coverage */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 2: Location & Coverage</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Operating City *
                    </label>
                    <input
                      type="text"
                      value={primaryCity}
                      onChange={(e) => setPrimaryCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Locality
                    </label>
                    <input
                      type="text"
                      value={primaryLocality}
                      onChange={(e) => setPrimaryLocality(e.target.value)}
                      placeholder="e.g. Bandra West"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Studio / Office Address
                  </label>
                  <input
                    type="text"
                    value={primaryAddress}
                    onChange={(e) => setPrimaryAddress(e.target.value)}
                    placeholder="Full studio street address"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Working Hours
                  </label>
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="e.g. Mon - Sat (10:00 AM - 7:00 PM)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Scope & Services */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 3: Services & Scope</h3>
                <p className="text-xs text-slate-500">Select all execution capabilities offered by your studio:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    "Full Home Turnkey",
                    "Modular Kitchen",
                    "Wardrobe Design",
                    "Full Renovation",
                    "3D Visualization",
                    "Civil Modifications",
                    "False Ceiling & Lighting",
                    "Commercial Offices",
                  ].map((service) => {
                    const isChecked = servicesOffered.includes(service);
                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setServicesOffered(servicesOffered.filter((s) => s !== service));
                          } else {
                            setServicesOffered([...servicesOffered, service]);
                          }
                        }}
                        className={`rounded-xl border p-2.5 text-left font-semibold transition ${
                          isChecked
                            ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/40"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {service}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Materials & Brands */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 4: Materials & Brand Standards</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Core Boards Used
                  </label>
                  <p className="text-xs text-slate-500 mb-2">BWP Marine Ply (IS 710), HDHMR, etc.</p>
                  <div className="flex flex-wrap gap-2">
                    {["BWP Marine Plywood (IS 710)", "HDHMR", "BWR Commercial Ply", "Particle Board"].map((board) => (
                      <button
                        key={board}
                        type="button"
                        onClick={() => {
                          if (boardMaterials.includes(board)) {
                            setBoardMaterials(boardMaterials.filter((b) => b !== board));
                          } else {
                            setBoardMaterials([...boardMaterials, board]);
                          }
                        }}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition border ${
                          boardMaterials.includes(board)
                            ? "bg-rose-50 border-rose-600 text-rose-700"
                            : "border-slate-200"
                        }`}
                      >
                        {board}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Branded Hardware Partners
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Hettich", "Hafele", "Blum", "Ebco", "Godrej"].map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => {
                          if (hardwareBrands.includes(brand)) {
                            setHardwareBrands(hardwareBrands.filter((b) => b !== brand));
                          } else {
                            setHardwareBrands([...hardwareBrands, brand]);
                          }
                        }}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition border ${
                          hardwareBrands.includes(brand)
                            ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                            : "border-slate-200"
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Pricing & Rates */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 5: Pricing & Packages</h3>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="customQuoteOnly"
                    checked={isCustomQuotationOnly}
                    onChange={(e) => setIsCustomQuotationOnly(e.target.checked)}
                    className="h-4 w-4 rounded text-rose-600"
                  />
                  <label htmlFor="customQuoteOnly" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Custom Quotation Only (Do not display numeric starting rate)
                  </label>
                </div>

                {!isCustomQuotationOnly && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Starting Rate (₹) *
                      </label>
                      <input
                        type="number"
                        value={startingRateMin}
                        onChange={(e) => setStartingRateMin(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Pricing Unit
                      </label>
                      <select
                        value={pricingUnit}
                        onChange={(e) => setPricingUnit(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="PER_SQFT">Per Sq. Ft.</option>
                        <option value="PER_ROOM">Per Room</option>
                        <option value="FIXED_PRICE">Fixed Package</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Other Steps: Quick overview */}
            {currentStep >= 6 && currentStep <= 8 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {WIZARD_STEPS[currentStep - 1]}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure default warranties (10-year woodwork, 10-year hardware), GSTIN credentials, and contact preferences.
                </p>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-800">
                  Standard warranty benchmarks (10 Years Woodwork, 10 Years Hardware, 6 Months Free Site Maintenance) have been applied automatically.
                </div>
              </div>
            )}

            {/* Step 9: Review & Publish */}
            {currentStep === 9 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 9: Review & Publish</h3>
                <div className="rounded-xl border border-slate-200 p-4 text-xs space-y-2 dark:border-slate-700">
                  <p><strong>Business:</strong> {businessName || "Not set"}</p>
                  <p><strong>City:</strong> {primaryCity}</p>
                  <p><strong>Services:</strong> {servicesOffered.join(", ")}</p>
                  <p><strong>Completed Projects:</strong> {profile?.projects?.length || 0}</p>
                </div>

                {(!profile?.projects || profile.projects.length === 0) ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                    ⚠️ <strong>Requirement:</strong> You must add at least 1 completed project in the <strong>Portfolio</strong> tab before your listing can be published to the public directory.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                  >
                    {isPublishing ? "Publishing..." : "Publish Listing to Awasio Directory"}
                  </button>
                )}
              </div>
            )}

            {/* Wizard Action Controls */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={handleSaveProgress}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Draft"}
              </button>

              <div className="flex items-center gap-2">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                  >
                    Previous
                  </button>
                )}
                {currentStep < 9 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500"
                  >
                    Next Step &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PORTFOLIO PROJECTS */}
      {activeTab === "PROJECTS" && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Portfolio Projects</h2>
              <p className="text-xs text-slate-500">Showcase completed apartments, villas, and renovation projects.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingProject(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Add Project
            </button>
          </div>

          {/* New Project Form Modal */}
          {isAddingProject && (
            <form onSubmit={handleCreateProject} className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 space-y-3 dark:border-rose-950 dark:bg-rose-950/20">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add New Completed Project</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Project Title (e.g. Modern 3BHK Scandinavian)"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
                <select
                  value={projectConfig}
                  onChange={(e) => setProjectConfig(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="Villa">Villa / Bungalow</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Total Budget Spent (₹)"
                  value={projectBudget}
                  onChange={(e) => setProjectBudget(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
                <input
                  type="url"
                  placeholder="Cover Photo URL (https://...)"
                  value={projectCover}
                  onChange={(e) => setProjectCover(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <textarea
                placeholder="Short description of the brief, scope, and materials used..."
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingProject(false)}
                  className="rounded-xl border px-4 py-1.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProjectSaving}
                  className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                >
                  {isProjectSaving ? "Saving..." : "Save Project"}
                </button>
              </div>
            </form>
          )}

          {/* List of existing projects */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile?.projects?.map((proj) => (
              <div key={proj.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <img src={proj.coverImage} alt={proj.title} className="aspect-[16/10] w-full object-cover" />
                <div className="p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">{proj.propertyConfig}</span>
                  <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{proj.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">₹{(proj.projectBudget ? proj.projectBudget / 100000 : 0).toFixed(2)} Lakhs Total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CLIENT INQUIRIES & LEADS */}
      {activeTab === "LEADS" && (
        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Client Consultation Leads</h2>
            <p className="text-xs text-slate-500">
              Homeowners and property buyers requesting interior estimates. Unlock contact details using your Awasio credit balance.
            </p>
          </div>

          <div className="space-y-3">
            {(!profile?.inquiries || profile.inquiries.length === 0) ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
                No client leads yet. Make sure your profile is published to receive inquiries!
              </div>
            ) : (
              profile.inquiries.map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{lead.clientName}</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {lead.bhkType} · {lead.projectScope}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Location: {lead.cityName} {lead.locality ? `(${lead.locality})` : ""} · Area: {lead.carpetAreaSqft || "N/A"} sq.ft.
                    </p>
                    {lead.notes && <p className="text-xs text-slate-600 mt-1 italic">"{lead.notes}"</p>}
                  </div>

                  <div className="shrink-0">
                    {lead.isUnlocked ? (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                        <p className="font-bold flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {lead.clientPhone}
                        </p>
                        {lead.clientEmail && <p className="text-[11px] text-emerald-600">{lead.clientEmail}</p>}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUnlockLead(lead.id)}
                        disabled={isUnlocking}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-98"
                      >
                        <Unlock className="h-3.5 w-3.5" />
                        Unlock Contact (20 Credits)
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

