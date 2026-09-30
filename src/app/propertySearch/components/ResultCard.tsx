import { useRouter } from "next/navigation";
import React from "react";
import { APP_CONFIG } from "@/constants/app-config";
import { useMeQuery, useUpdateProfileMutation } from "@/features/auth/api";
import { useMyOrganizationsQuery } from "@/features/organizations/api";
import {
  useGetPlansQuery,
  useLazyCheckUnlockedContactQuery,
  useLazyGetBillingSummaryQuery,
  usePurchaseCreditsByPlanMutation,
  usePurchaseCreditsMutation,
  useRequestContactOtpMutation,
  useUnlockPropertyContactMutation,
  useVerifyContactOtpMutation,
  BillingSummary,
} from "@/features/contactVerify/api";
import { ContactUnlockDialog, ScopeOption } from "./ContactUnlockDialog";
import { ResultCardMedia } from "./ResultCardMedia";
import { ResultCardSummary, SavePropertyButton } from "./ResultCardSummary";
import { CONTACT_PLANS, FALLBACK_IMAGE, type ContactPlan, type ContactStep, type ResultCardProps } from "./resultCardTypes";

export function ResultCard({
  id,
  title,
  subtitle,
  price,
  area,
  postedAt,
  owner,
  ownerId,
  bedrooms,
  bathrooms,
  type,
  listingType,
  resCom,
  isNew,
  isVerified,
  posterBadge,
  images = [],
}: ResultCardProps) {
  const router = useRouter();
  const safeImages = React.useMemo(() => images.filter(Boolean), [images]);
  const [activeImage, setActiveImage] = React.useState(0);
  const [imageFailed, setImageFailed] = React.useState(false);
  const [contactOpen, setContactOpen] = React.useState(false);
  const [contactStep, setContactStep] = React.useState<ContactStep>("details");
  const [leadName, setLeadName] = React.useState("");
  const [leadEmail, setLeadEmail] = React.useState("");
  const [leadPhone, setLeadPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [resendSeconds, setResendSeconds] = React.useState(0);
  const [hasActivePlan, setHasActivePlan] = React.useState(false);
  const [credits, setCredits] = React.useState(0);
  const [selectedScope, setSelectedScope] = React.useState<"PERSONAL" | number>("PERSONAL");
  const [personalSummary, setPersonalSummary] = React.useState<BillingSummary | null>(null);
  const [orgSummaries, setOrgSummaries] = React.useState<Record<number, BillingSummary>>({});
  const [ownerContact, setOwnerContact] = React.useState<{ name: string | null; phone: string | null } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [contactError, setContactError] = React.useState<string | null>(null);
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [sessionToken, setSessionToken] = React.useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = React.useState("power");

  const getToken = () => sessionToken ?? (typeof window !== "undefined" ? localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) ?? "" : "");
  const { data: meData } = useMeQuery(undefined, { skip: !getToken() });
  const isMyProperty = Boolean(ownerId && meData?.id && Number(ownerId) === Number(meData.id));

  const { data: orgsData } = useMyOrganizationsQuery(undefined, { skip: !getToken() });
  const orgs = orgsData ?? [];

  const { data: plansResponse } = useGetPlansQuery();
  const [requestContactOtp] = useRequestContactOtpMutation();
  const [verifyContactOtp] = useVerifyContactOtpMutation();
  const [updateProfileMutation] = useUpdateProfileMutation();
  const [fetchBillingSummary] = useLazyGetBillingSummaryQuery();
  const [triggerCheckUnlocked] = useLazyCheckUnlockedContactQuery();
  const [unlockPropertyContactMutation] = useUnlockPropertyContactMutation();
  const [purchaseCreditsMutation] = usePurchaseCreditsMutation();
  const [purchaseCreditsByPlanMutation] = usePurchaseCreditsByPlanMutation();

  const plansList = React.useMemo<ContactPlan[]>(() => {
    if (plansResponse?.data?.length) {
      return plansResponse.data.map((plan) => {
        const features = (plan.features ?? {}) as any;
        return {
          dbId: plan.id,
          id: features.code || String(plan.id),
          name: plan.name,
          contacts: features.contactsLabel || `${features.creditsIncluded || 1} owner contacts`,
          credits: features.creditsIncluded || 1,
          description: plan.description || "",
          price: `₹${plan.price.toLocaleString("en-IN")}`,
          popular: !!features.popular,
        };
      });
    }
    return CONTACT_PLANS.map((plan) => ({ ...plan, dbId: undefined, credits: 1 }));
  }, [plansResponse]);

  const currentPlan = plansList.find((plan) => plan.id === selectedPlan || String(plan.dbId) === String(selectedPlan)) ?? plansList[0];
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

  const scopes = React.useMemo<ScopeOption[]>(() => {
    const list: ScopeOption[] = [
      {
        id: "PERSONAL",
        name: "Personal Account",
        credits: personalSummary?.credits ?? credits,
      },
    ];
    for (const org of orgs) {
      list.push({
        id: org.id,
        name: org.name,
        credits: orgSummaries[org.id]?.credits ?? 0,
      });
    }
    return list;
  }, [personalSummary, credits, orgs, orgSummaries]);

  React.useEffect(() => {
    setActiveImage(0);
    setImageFailed(false);
  }, [safeImages]);

  React.useEffect(() => {
    if (!otpSent || resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [otpSent, resendSeconds]);

  const refreshScopes = React.useCallback(async () => {
    try {
      const pRes = await fetchBillingSummary({ target: "USER" }).unwrap();
      setPersonalSummary(pRes.data);
      setCredits(pRes.data.credits ?? 0);

      const orgMap: Record<number, BillingSummary> = {};
      for (const org of orgs) {
        try {
          const oRes = await fetchBillingSummary({ target: "ORG", organizationId: org.id }).unwrap();
          orgMap[org.id] = oRes.data;
        } catch {
          // ignore
        }
      }
      setOrgSummaries(orgMap);
    } catch {
      // ignore
    }
  }, [fetchBillingSummary, orgs]);

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

  const checkAlreadyUnlocked = async () => {
    try {
      const res = await triggerCheckUnlocked(id).unwrap();
      if (res?.data?.unlocked) {
        setOwnerContact({ name: res.data.ownerName ?? null, phone: res.data.ownerPhone ?? null });
        return true;
      }
    } catch {
      // The unlock flow can continue if this convenience check fails.
    }
    return false;
  };

  const unlockContact = async (scopeToUse = selectedScope) => {
    setLoading(true);
    setContactError(null);
    try {
      if (await checkAlreadyUnlocked()) {
        setContactStep("contact");
        return;
      }
      const isOrg = scopeToUse !== "PERSONAL";
      const res = await unlockPropertyContactMutation({
        propertyId: id,
        organizationId: isOrg && typeof scopeToUse === "number" ? scopeToUse : undefined,
      }).unwrap();
      setOwnerContact({ name: res.data?.ownerName ?? null, phone: res.data?.ownerPhone ?? null });
      setCredits(res.credits ?? 0);
      setContactStep("contact");
      void refreshScopes();
    } catch (err: any) {
      if (err?.status === 402 || err?.data?.message?.includes("credits") || err?.data?.message?.includes("allowance")) {
        setContactStep("plans");
      } else {
        setContactError(err?.data?.message || err.message || "Failed to unlock contact");
      }
    } finally {
      setLoading(false);
    }
  };

  const openContactFlow = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setContactError(null);
    setOtpError(null);
    setOwnerContact(null);
    setContactOpen(true);
    setLoading(true);

    if (isMyProperty) {
      setContactStep("contact");
      await unlockContact();
      setLoading(false);
      return;
    }

    const activeToken = getToken();
    if (activeToken) {
      try {
        const unlocked = await triggerCheckUnlocked(id).unwrap();
        if (unlocked?.data?.unlocked) {
          setOwnerContact({ name: unlocked.data.ownerName ?? null, phone: unlocked.data.ownerPhone ?? null });
          setContactStep("contact");
          setLoading(false);
          return;
        }

        await refreshScopes();
        const pCredits = personalSummary?.credits ?? 0;
        setHasActivePlan(pCredits > 0);
        if (pCredits > 0) {
          await unlockContact("PERSONAL");
        } else {
          setContactStep("plans");
          setLoading(false);
        }
        return;
      } catch {
        // Fall through to OTP collection when authenticated checks fail.
      }
    }

    setSessionToken(null);
    setContactStep("details");
    setOtp("");
    setOtpSent(false);
    setResendSeconds(0);
    setSelectedPlan("power");
    setLoading(false);
  };

  const requestOtp = async () => {
    if (leadPhone.trim().length < 10) return;
    setOtpError(null);
    setLoading(true);
    try {
      const data = await requestContactOtp({ mobileNumber: leadPhone.trim() }).unwrap();
      setOtp("");
      setOtpSent(true);
      setResendSeconds(30);
      if (data.otp) console.info(`[DEV] OTP for ${leadPhone}: ${data.otp}`);
    } catch (err: any) {
      setOtpError(err?.data?.message || err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const purchasePlan = async () => {
    setLoading(true);
    setContactError(null);
    const isOrg = selectedScope !== "PERSONAL";
    const orgId = isOrg && typeof selectedScope === "number" ? selectedScope : undefined;
    try {
      if (currentPlan?.dbId) {
        const res = await purchaseCreditsByPlanMutation({
          planId: currentPlan.dbId,
          target: isOrg ? "ORG" : "USER",
          organizationId: orgId,
        }).unwrap();
        setCredits(res.data?.credits ?? 0);
      } else {
        const res = await purchaseCreditsMutation({ credits: currentPlan?.credits ?? 20, reason: "PURCHASE" }).unwrap();
        setCredits(res.data?.credits ?? 0);
      }
      setHasActivePlan(true);
      await unlockContact(selectedScope);
    } catch (err: any) {
      setContactError(err?.data?.message || err.message || "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyLeadDetails = async () => {
    if (!otpSent || leadPhone.trim().length < 10 || otp.trim().length < 6) return;
    setOtpError(null);
    setLoading(true);
    try {
      const res = await verifyContactOtp({
        mobileNumber: leadPhone.trim(),
        otp: otp.trim(),
        propertyId: id,
        source: "property_search_result_card",
        city: subtitle || undefined,
      }).unwrap();

      const token = res.data?.accessToken;
      if (token) {
        setSessionToken(token);
        if (typeof window !== "undefined") {
          localStorage.setItem(APP_CONFIG.AUTH.TOKEN_KEY, token);
          if (res.data?.refreshToken) localStorage.setItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY, res.data.refreshToken);
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("auth-change"));
        }
      }

      const userName = res.data?.user?.name;
      const isNewUser = res.data?.isNewUser || !userName || userName === "New User" || userName === "User";

      if (isNewUser) {
        setContactStep("profile");
        return;
      }

      await refreshScopes();
      const userCredits = res.data?.user?.credits ?? 0;
      setCredits(userCredits);
      setHasActivePlan(userCredits > 0);
      if (userCredits > 0) {
        await unlockContact("PERSONAL");
      } else {
        setContactStep("plans");
      }
    } catch (err: any) {
      setOtpError(err?.data?.message || err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!leadName.trim()) return;
    setLoading(true);
    setContactError(null);
    try {
      await updateProfileMutation({
        name: leadName.trim(),
        email: leadEmail.trim() || undefined,
      }).unwrap();

      await refreshScopes();
      const userCredits = personalSummary?.credits ?? 0;
      setCredits(userCredits);
      setHasActivePlan(userCredits > 0);
      if (userCredits > 0) {
        await unlockContact("PERSONAL");
      } else {
        setContactStep("plans");
      }
    } catch (err: any) {
      setContactError(err?.data?.message || err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={handleCardKeyDown}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <ResultCardMedia
        image={image}
        title={title}
        type={type}
        isMyProperty={isMyProperty}
        isVerified={isVerified}
        isNew={isNew}
        activeImage={activeImage}
        photoCount={photoCount}
        safeImages={safeImages}
        hasCarousel={hasCarousel}
        onImageError={() => setImageFailed(true)}
        onMoveImage={moveImage}
        onChooseImage={chooseImage}
      />
      <SavePropertyButton propertyId={id} />
      <ResultCardSummary
        title={title}
        subtitle={subtitle}
        price={price}
        area={area}
        owner={owner}
        postedAt={postedAt}
        bedrooms={bedrooms}
        bathrooms={bathrooms}
        type={type}
        contextBadge={contextBadge}
        posterBadge={posterBadge}
        onContactClick={openContactFlow}
      />
      <ContactUnlockDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        contactStep={contactStep}
        hasActivePlan={hasActivePlan}
        leadName={leadName}
        leadEmail={leadEmail}
        leadPhone={leadPhone}
        otp={otp}
        otpSent={otpSent}
        otpError={otpError}
        resendSeconds={resendSeconds}
        loading={loading}
        plansList={plansList}
        selectedPlan={selectedPlan}
        currentPlan={currentPlan}
        contactError={contactError}
        ownerContact={ownerContact}
        owner={owner}
        credits={credits}
        scopes={scopes}
        selectedScope={selectedScope}
        onScopeChange={(s) => setSelectedScope(s)}
        onLeadNameChange={setLeadName}
        onLeadEmailChange={setLeadEmail}
        onLeadPhoneChange={setLeadPhone}
        onOtpChange={(value) => {
          setOtp(value);
          setOtpError(null);
        }}
        onRequestOtp={requestOtp}
        onVerifyLeadDetails={verifyLeadDetails}
        onSaveProfile={saveProfile}
        onSelectedPlanChange={setSelectedPlan}
        onPurchasePlan={purchasePlan}
      />
    </article>
  );
}
