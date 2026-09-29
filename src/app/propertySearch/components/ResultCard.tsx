import { useRouter } from "next/navigation";
import React from "react";
import { BadgeCheck, Bath, BedDouble, Camera, CheckCircle2, ChevronLeft, ChevronRight, Heart, MapPin, PhoneCall, Ruler, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
  id: number;
  title?: string;
  subtitle?: string;
  price?: string;
  area?: string;
  postedAt?: string;
  owner?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  type?: string | null;
  listingType?: string | null;
  resCom?: string | null;
  isNew?: boolean;
  isVerified?: boolean;
  posterBadge?: string;
  images?: string[];
};

const FALLBACK_IMAGE = "/property-placeholder.svg";
const CONTACT_PLANS = [
  {
    id: "trial",
    name: "Trial",
    contacts: "1 owner contact",
    description: "Unlock this listing only.",
    price: "₹49",
  },
  {
    id: "starter",
    name: "Starter",
    contacts: "5 owner contacts",
    description: "Good for a few shortlisted homes.",
    price: "₹199",
  },
  {
    id: "basic",
    name: "Basic",
    contacts: "10 owner contacts",
    description: "For one locality search.",
    price: "₹349",
  },
  {
    id: "power",
    name: "Power",
    contacts: "20 owner contacts",
    description: "Best value for active searchers.",
    price: "₹499",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    contacts: "40 owner contacts",
    description: "For comparing multiple localities.",
    price: "₹899",
  },
  {
    id: "assisted",
    name: "Assisted",
    contacts: "60 contacts + callback",
    description: "Priority details and assisted callbacks.",
    price: "₹1,499",
  },
  {
    id: "concierge",
    name: "Concierge",
    contacts: "100 contacts + RM",
    description: "Dedicated help for serious buyers.",
    price: "₹2,499",
  },
] as const;

type ContactPlanId = (typeof CONTACT_PLANS)[number]["id"];

export function ResultCard({
  id,
  title,
  subtitle,
  price,
  area,
  postedAt,
  owner,
  bedrooms,
  bathrooms,
  type,
  listingType,
  resCom,
  isNew,
  isVerified,
  posterBadge,
  images = [],
}: Props) {
  const router = useRouter();
  const safeImages = React.useMemo(() => images.filter(Boolean), [images]);
  const [activeImage, setActiveImage] = React.useState(0);
  const [imageFailed, setImageFailed] = React.useState(false);
  const [contactOpen, setContactOpen] = React.useState(false);
  const [contactStep, setContactStep] = React.useState<"details" | "plans" | "contact">("details");
  const [leadName, setLeadName] = React.useState("");
  const [leadPhone, setLeadPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [resendSeconds, setResendSeconds] = React.useState(0);
  const [selectedPlan, setSelectedPlan] = React.useState<ContactPlanId>("power");
  const hasActivePlan = false;
  const currentPlan = CONTACT_PLANS.find((plan) => plan.id === selectedPlan) ?? CONTACT_PLANS[0];
  const photoCount = safeImages.length;
  const image = !imageFailed ? safeImages[activeImage] ?? FALLBACK_IMAGE : FALLBACK_IMAGE;
  const hasCarousel = photoCount > 1;
  const contextBadge =
    listingType === "PG"
      ? "PG"
      : resCom === "COMMERCIAL"
        ? "Commercial"
        : listingType === "RENT"
          ? "For rent"
          : listingType === "SELL"
            ? "For sale"
            : null;

  React.useEffect(() => {
    setActiveImage(0);
    setImageFailed(false);
  }, [safeImages]);

  React.useEffect(() => {
    if (!otpSent || resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [otpSent, resendSeconds]);

  const moveImage = (event: React.MouseEvent<HTMLButtonElement>, direction: 1 | -1) => {
    event.preventDefault();
    event.stopPropagation();
    if (!hasCarousel) return;
    setImageFailed(false);
    setActiveImage((current) => (current + direction + photoCount) % photoCount);
  };

  const chooseImage = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    setImageFailed(false);
    setActiveImage(index);
  };

  const openDetails = () => router.push(`/properties/${id}`);
  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openDetails();
  };

  const openContactFlow = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setContactStep("details");
    setOtp("");
    setOtpSent(false);
    setResendSeconds(0);
    setSelectedPlan("power");
    setContactOpen(true);
  };

  const requestOtp = () => {
    if (!leadName.trim() || leadPhone.trim().length < 10) return;
    setOtp("");
    setOtpSent(true);
    setResendSeconds(30);
  };

  const verifyLeadDetails = () => {
    if (!otpSent || !leadName.trim() || leadPhone.trim().length < 10 || otp.trim().length < 4) return;
    setContactStep(hasActivePlan ? "contact" : "plans");
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={handleCardKeyDown}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-200"
    >

      <div className="relative block aspect-[16/10] overflow-hidden bg-zinc-100 sm:aspect-[4/3]">
        <img
          src={image}
          alt={title || "Property"}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={() => setImageFailed(true)}
        />
        {hasCarousel && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(event) => moveImage(event, -1)}
              className="absolute left-2 top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-white/95 text-zinc-800 shadow-sm transition hover:bg-white focus:opacity-100 sm:left-3 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={(event) => moveImage(event, 1)}
              className="absolute right-2 top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-white/95 text-zinc-800 shadow-sm transition hover:bg-white focus:opacity-100 sm:right-3 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
        {type && (
          <span className="absolute left-3 top-3 max-w-[75%] truncate rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-zinc-800 shadow-sm">
            {type}
          </span>
        )}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {isVerified && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white shadow-sm">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
          {isNew && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-400 px-2 py-1 text-[11px] font-semibold text-zinc-950 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              New
            </span>
          )}
        </div>
        {photoCount > 0 && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-zinc-950/80 px-2 py-1 text-[11px] font-semibold text-white">
            <Camera className="h-3.5 w-3.5" />
            {activeImage + 1}/{photoCount}
          </span>
        )}
        {hasCarousel && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 rounded-md bg-zinc-950/55 px-1.5 py-1">
            {safeImages.slice(0, 5).map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show photo ${index + 1}`}
                onClick={(event) => chooseImage(event, index)}
                className={`relative z-20 h-1.5 w-1.5 rounded-full transition ${index === activeImage ? "bg-white" : "bg-white/45"}`}
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        aria-label="Save property"
        className="absolute right-3 top-3 z-20 hidden h-9 w-9 items-center justify-center rounded-md bg-white/95 text-zinc-700 shadow-sm transition hover:text-rose-600 group-hover:inline-flex"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <Heart className="h-4 w-4" />
      </button>

      <div className="relative z-0 flex flex-1 flex-col gap-2.5 p-3 sm:gap-3 sm:p-4">
        <div className="flex flex-wrap gap-1.5">
          {contextBadge && <span className="rounded-md bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">{contextBadge}</span>}
          {posterBadge && <span className="rounded-md bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700">{posterBadge}</span>}
          {type && <span className="hidden rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-700 sm:inline-flex">{type}</span>}
        </div>

        <div>
          <h3 className="line-clamp-1 text-sm font-semibold text-zinc-950 group-hover:text-rose-700 sm:line-clamp-2 sm:text-base">
            {title || "Property listing"}
          </h3>
          {subtitle && (
            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-zinc-600 sm:text-sm">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <span className="truncate">{subtitle}</span>
            </p>
          )}
        </div>

        <p className="text-base font-bold text-zinc-950 sm:text-lg">{price}</p>

        <div className="grid grid-cols-2 gap-1.5 text-xs text-zinc-700 sm:gap-2">
          {bedrooms != null && bedrooms > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 px-2 py-1.5 sm:px-2.5">
              <BedDouble className="h-3.5 w-3.5 text-zinc-400" />
              {bedrooms} BHK
            </span>
          )}
          {bathrooms != null && bathrooms > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 px-2 py-1.5 sm:px-2.5">
              <Bath className="h-3.5 w-3.5 text-zinc-400" />
              {bathrooms} Bath
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 px-2 py-1.5 sm:px-2.5">
            <Ruler className="h-3.5 w-3.5 text-zinc-400" />
            <span className="truncate">{area}</span>
          </span>
          <span className="truncate rounded-md bg-zinc-50 px-2 py-1.5 sm:px-2.5">{owner}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-zinc-100 pt-2.5 sm:gap-3 sm:pt-3">
          <p className="truncate text-xs text-zinc-500">{postedAt}</p>
          <button
            type="button"
            className="relative z-20 inline-flex shrink-0 items-center gap-1.5 rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-700 sm:text-sm"
            onClick={openContactFlow}
          >
            <PhoneCall className="h-3.5 w-3.5" />
            View contact
          </button>
        </div>
      </div>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent
          className={`max-h-[92vh] overflow-y-auto border-0 bg-white p-0 shadow-2xl sm:max-w-md ${contactStep === "plans" ? "lg:max-w-5xl" : "lg:max-w-md"}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="bg-rose-600 px-5 py-5 text-white">
            <DialogHeader className="text-left">
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-white/15">
                <PhoneCall className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-bold">
                {contactStep === "contact" ? "Owner contact details" : "Contact owner directly"}
              </DialogTitle>
              <DialogDescription className="text-rose-50">
                {contactStep === "contact"
                  ? "Your active contact plan allows you to view this advertiser."
                  : "Verify your details to continue. If you do not have a plan, choose one to unlock numbers."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-3 p-5">
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
              {[
                ["1", "Verify", contactStep === "details"],
                ["2", hasActivePlan ? "Contact" : "Plan", contactStep === "plans" || contactStep === "contact"],
              ].map(([num, label, active]) => (
                <div key={label as string} className={`whitespace-nowrap rounded-md px-2 py-2 text-center ${active ? "bg-rose-50 text-rose-700" : "bg-zinc-50 text-zinc-500"}`}>
                  <span className="mr-1">{num}</span>
                  {label}
                </div>
              ))}
            </div>

            {contactStep === "details" && (
              <>
                <div className="rounded-lg border border-zinc-200 p-4">
                  <p className="text-sm font-semibold text-zinc-950">Share your details</p>
                  <p className="mt-1 text-xs text-zinc-500">We will verify your mobile before revealing owner contact details.</p>
                  <div className="mt-4 space-y-3">
                    <input
                      value={leadName}
                      onChange={(event) => setLeadName(event.target.value)}
                      placeholder="Your name"
                      className="h-11 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    />
	                    <div className="flex h-11 overflow-hidden rounded-md border border-zinc-200 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100">
	                      <span className="flex items-center border-r border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-zinc-600">+91</span>
	                      <input
                        value={leadPhone}
                        onChange={(event) => setLeadPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="Mobile number"
                        inputMode="numeric"
	                        className="min-w-0 flex-1 px-3 text-sm outline-none"
	                      />
	                    </div>
                    {otpSent && (
                      <div className="space-y-2">
                        <input
                          value={otp}
                          onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="OTP"
                          inputMode="numeric"
                          className="h-11 w-full rounded-md border border-zinc-200 px-3 text-center text-base font-semibold tracking-[0.25em] outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                        />
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="truncate text-zinc-500">OTP sent to +91 {leadPhone}</span>
                          <button
                            type="button"
                            className="shrink-0 font-semibold text-rose-600 disabled:text-zinc-400"
                            disabled={resendSeconds > 0}
                            onClick={requestOtp}
                          >
                            {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend OTP"}
                          </button>
                        </div>
                      </div>
                    )}
	                  </div>
	                </div>
                {!otpSent ? (
                  <button
                    type="button"
                    className="w-full rounded-md bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
                    disabled={!leadName.trim() || leadPhone.length < 10}
                    onClick={requestOtp}
                  >
                    Get OTP
                  </button>
                ) : (
                  <button
                    type="button"
                    className="w-full rounded-md bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
                    disabled={otp.length < 4}
                    onClick={verifyLeadDetails}
                  >
                    Verify and continue
                  </button>
                )}
	              </>
	            )}

            {contactStep === "plans" && (
              <>
                <div className="grid gap-4 lg:grid-cols-[0.42fr_1fr] lg:items-start">
                  <div className="space-y-3">
                    <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                      <p className="text-sm font-bold text-zinc-950">Choose your contact pack</p>
                      <p className="mt-1 text-xs text-zinc-600">
                        Unlock this owner now and use remaining contacts on other shortlisted homes.
                      </p>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase text-zinc-500">Selected plan</p>
                      <div className="mt-2 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-bold text-zinc-950">{currentPlan.name}</p>
                          <p className="mt-1 text-xs text-zinc-600">{currentPlan.contacts}</p>
                        </div>
                        <p className="text-xl font-black text-zinc-950">{currentPlan.price}</p>
                      </div>
                    </div>

                    <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700">
                      {["Verified mobile before reveal", "Unused contacts stay in your account", "Works for owner, agent and builder listings"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-rose-600" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2.5 lg:grid-cols-2">
                    {CONTACT_PLANS.map((plan) => {
                      const active = selectedPlan === plan.id;
                      const isPriority = plan.id === "power" || plan.id === "premium" || plan.id === "assisted";
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition ${
                            active
                              ? "border-rose-500 bg-white shadow-lg shadow-rose-100 ring-2 ring-rose-100"
                              : "border-zinc-200 bg-white hover:border-rose-200 hover:bg-rose-50/40"
                          }`}
                        >
                          {"popular" in plan && plan.popular && (
                            <span className="absolute right-3 top-3 rounded-md bg-zinc-950 px-2 py-1 text-[10px] font-bold uppercase text-white">
                              Popular
                            </span>
                          )}
                          <div className="flex gap-3 pr-12">
                            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isPriority ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                              {isPriority ? <ShieldCheck className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-zinc-950">{plan.name}</p>
                                {active && <CheckCircle2 className="h-4 w-4 text-rose-600" />}
                              </div>
                              <p className="mt-1 text-xs font-semibold text-zinc-700">{plan.contacts}</p>
                              <p className="mt-1 text-xs text-zinc-500">{plan.description}</p>
                            </div>
                          </div>
                          <p className="mt-3 text-xl font-black text-zinc-950">{plan.price}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full rounded-md bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-700"
                >
                  Continue with {CONTACT_PLANS.find((plan) => plan.id === selectedPlan)?.name}
                </button>
              </>
            )}

            {contactStep === "contact" && (
              <>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-950">{owner || "Owner"}</p>
                      <p className="mt-1 text-xl font-bold text-zinc-950">+91 98••• ••432</p>
                      <p className="mt-1 text-xs text-zinc-600">Full number will come from the backend entitlement API.</p>
                    </div>
                  </div>
                </div>
                <button type="button" className="w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">
                  Call owner
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
