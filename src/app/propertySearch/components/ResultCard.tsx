import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { APP_CONFIG } from "@/constants/app-config";
import { useMeQuery } from "@/features/auth/api";
import { useMyOrganizationsQuery } from "@/features/organizations/api";
import {
  useGetCreditPlatformConfigQuery,
  useLazyCheckUnlockedContactQuery,
  useLazyGetBillingSummaryQuery,
  usePurchaseCreditsByPlanMutation,
  usePurchaseCreditsMutation,
  useUnlockPropertyContactMutation,
  BillingSummary,
} from "@/features/contactVerify/api";
import { ContactUnlockDialog, ScopeOption } from "./ContactUnlockDialog";
import { CreditWalletModal } from "@/components/billing/CreditWalletModal";
import { ScheduleVisitDialog } from "@/components/property/ScheduleVisitDialog";
import { ResultCardMedia } from "./ResultCardMedia";
import { ResultCardSummary, SavePropertyButton } from "./ResultCardSummary";
import { CONTACT_PLANS, FALLBACK_IMAGE, type ContactPlan, type ContactStep, type ResultCardProps } from "./resultCardTypes";

export function ResultCard({
  id,
  slug,
  title,
  subtitle,
  price,
  area,
  owner,
  ownerId,
  bedrooms,
  bathrooms,
  type,
  listingType,
  resCom,
  decisionDetails,
  isNew,
  isVerified,
  isBoosted,
  posterBadge,
  images = [],
  compact = false,
}: ResultCardProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = React.useState(false);
  const detailsHref = `/properties/${slug || id}`;
  const safeImages = React.useMemo(() => images.filter(Boolean), [images]);
  const [activeImage, setActiveImage] = React.useState(0);
  const [imageFailed, setImageFailed] = React.useState(false);
  const [contactOpen, setContactOpen] = React.useState(false);
  const [contactStep, setContactStep] = React.useState<ContactStep>("plans");
  const [checkingContact, setCheckingContact] = React.useState(false);
  const contactCheckInFlight = React.useRef(false);
  const contactUnlockInFlight = React.useRef(false);
  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) ?? "" : "");
  const { data: meData } = useMeQuery(undefined, { skip: !getToken() });
  const isMyProperty = Boolean(ownerId && meData?.id && Number(ownerId) === Number(meData.id));

  const [hasActivePlan, setHasActivePlan] = React.useState(false);
  const [credits, setCredits] = React.useState<number>(meData?.credits ?? 0);
  const [selectedScope, setSelectedScope] = React.useState<"PERSONAL" | number>("PERSONAL");
  const [personalSummary, setPersonalSummary] = React.useState<BillingSummary | null>(null);
  const [orgSummaries, setOrgSummaries] = React.useState<Record<number, BillingSummary>>({});
  const [ownerContact, setOwnerContact] = React.useState<{ name: string | null; phone: string | null } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [contactError, setContactError] = React.useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = React.useState("credit_pack_300");
  const [walletOpen, setWalletOpen] = React.useState(false);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof meData?.credits === "number" && credits === 0) {
      setCredits(meData.credits);
    }
  }, [meData?.credits]);

  const openScheduleFlow = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setScheduleOpen(true);
  };

  const { data: orgsData } = useMyOrganizationsQuery(undefined, { skip: !getToken() });
  const orgs = orgsData ?? [];

  const { data: platformResponse } = useGetCreditPlatformConfigQuery();
  const plansResponse = { data: platformResponse?.data?.plans ?? [] };
  const contactCost = platformResponse?.data?.actions.find((action) => action.key === "CONTACT_UNLOCK")?.creditAmount ?? 5;
  const creditPurchasesEnabled = platformResponse?.data?.flags.find((flag) => flag.key === "CREDIT_PURCHASES_ENABLED")?.isEnabled ?? false;
  const [fetchBillingSummary] = useLazyGetBillingSummaryQuery();
  const [triggerCheckUnlocked] = useLazyCheckUnlockedContactQuery();
  const [unlockPropertyContactMutation] = useUnlockPropertyContactMutation();
  const [purchaseCreditsMutation] = usePurchaseCreditsMutation();
  const [purchaseCreditsByPlanMutation] = usePurchaseCreditsByPlanMutation();

  const plansList = React.useMemo<ContactPlan[]>(() => {
    if (plansResponse?.data?.length) {
      const buyerPlans = plansResponse.data.filter(
        (p) =>
          p.isActive !== false &&
          (p.category === "BUYER_TENANT" ||
            (!p.category && (p.contactCredits || (p.features as any)?.creditsIncluded))) &&
          p.price > 0
      );
      const targetList = buyerPlans.length > 0 ? buyerPlans : plansResponse.data.filter((p) => p.price > 0);
      return targetList.map((plan) => {
        const features = (plan.features ?? {}) as any;
        const credits = plan.contactCredits || features.creditsIncluded || 1;
        return {
          dbId: plan.id,
          id: plan.code || features.code || String(plan.id),
          name: plan.name,
          contacts: features.contactsLabel || `${credits} verified contact${credits === 1 ? "" : "s"}`,
          credits,
          description: plan.tagline || plan.description || "",
          price: `₹${plan.price.toLocaleString("en-IN")}`,
          popular: Boolean(plan.isPopular || features.popular),
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
    const personalCredits = personalSummary?.credits ?? meData?.credits ?? credits;
    const list: ScopeOption[] = [
      {
        id: "PERSONAL",
        name: "Personal Account",
        credits: personalCredits,
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
  }, [personalSummary, credits, orgs, orgSummaries, meData?.credits]);

  React.useEffect(() => {
    setActiveImage(0);
    setImageFailed(false);
  }, [safeImages]);


  const refreshScopes = React.useCallback(async () => {
    try {
      const pRes = await fetchBillingSummary({ target: "USER" }).unwrap();
      const pData = pRes.data;
      setPersonalSummary(pData);
      setCredits(pData.credits ?? 0);

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
      return { personal: pData, orgMap };
    } catch {
      return null;
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

  const openDetails = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.push(detailsHref);
  };
  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openDetails();
  };

  const unlockContact = async (scopeToUse = selectedScope): Promise<boolean> => {
    if (contactUnlockInFlight.current) return false;
    contactUnlockInFlight.current = true;
    setLoading(true);
    setContactError(null);
    try {
      const isOrg = scopeToUse !== "PERSONAL";
      const res = await unlockPropertyContactMutation({
        propertyId: id,
        organizationId: isOrg && typeof scopeToUse === "number" ? scopeToUse : undefined,
      }).unwrap();
      setOwnerContact({ name: res.data?.ownerName ?? null, phone: res.data?.ownerPhone ?? null });
      if (typeof res.credits === "number") {
        const newCredits: number = res.credits;
        setCredits(newCredits);
        setPersonalSummary((prev) => (prev ? { ...prev, credits: newCredits } : null));
      }
      setContactStep("contact");
      return true;
    } catch (err: any) {
      if (err?.status === 401 || err?.originalStatus === 401) {
        setContactOpen(false);
        const targetUrl = `/properties/${slug || id}`;
        const returnUrl = encodeURIComponent(`${targetUrl}?autoUnlock=true`);
        router.push(`/login?redirect=${returnUrl}`);
        return false;
      } else if (err?.status === 402 || err?.data?.message?.includes("credits") || err?.data?.message?.includes("allowance")) {
        setContactStep("plans");
        setContactOpen(true);
        return false;
      } else {
        const errorMsg = err?.data?.message || err?.message || "Owner contact not available";
        toast.error(errorMsg);
        setContactOpen(false);
        return false;
      }
    } finally {
      contactUnlockInFlight.current = false;
      setLoading(false);
    }
  };

  const openContactFlow = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (contactCheckInFlight.current) return;
    contactCheckInFlight.current = true;
    setContactError(null);
    setOwnerContact(null);

    const activeToken = getToken();
    if (!activeToken) {
      // Unauthenticated user -> trigger high-converting 1,000 Credit Welcome Gift popup with return URL!
      const targetUrl = `/properties/${slug || id}`;
      const returnUrl = `${targetUrl}?autoUnlock=true`;
      window.dispatchEvent(
        new CustomEvent("awasio:open-welcome-credits", {
          detail: { returnUrl },
        })
      );
      contactCheckInFlight.current = false;
      return;
    }

    setCheckingContact(true);
    setLoading(true);

    if (isMyProperty) {
      setContactStep("contact");
      setContactOpen(true);
      await unlockContact();
      setCheckingContact(false);
      setLoading(false);
      contactCheckInFlight.current = false;
      return;
    }

    try {
      // 1. Check if already unlocked for this property
      const unlocked = await triggerCheckUnlocked(id).unwrap();
      const isAlreadyUnlocked = Boolean(unlocked?.unlocked || unlocked?.data?.unlocked);
      if (isAlreadyUnlocked) {
        const cData = unlocked?.data ?? (unlocked as any);
        setOwnerContact({ name: cData?.ownerName ?? null, phone: cData?.ownerPhone ?? null });
        const remaining = unlocked?.credits ?? meData?.credits ?? personalSummary?.credits;
        if (typeof remaining === "number") {
          setCredits(remaining);
        }
        setContactStep("contact");
        setContactOpen(true);
        setCheckingContact(false);
        setLoading(false);
        return;
      }

      // 2. Fetch fresh billing summaries directly from API
      const scopesData = await refreshScopes();
      const personalCredits = scopesData?.personal?.credits ?? 0;

      // Determine active scope and credits
      let scopeToUse: "PERSONAL" | number = selectedScope;
      let effectiveCredits = 0;

      if (typeof selectedScope === "number" && scopesData?.orgMap?.[selectedScope]) {
        effectiveCredits = scopesData.orgMap[selectedScope]?.credits ?? 0;
      } else {
        effectiveCredits = personalCredits;
      }

      // Smart scope fallback if current selected scope has 0 credits
      if (effectiveCredits < contactCost) {
        if (personalCredits >= contactCost) {
          scopeToUse = "PERSONAL";
          setSelectedScope("PERSONAL");
          effectiveCredits = personalCredits;
        } else if (scopesData?.orgMap) {
          const orgWithCredits = Object.entries(scopesData.orgMap).find(
            ([_, s]) => (s?.credits ?? 0) >= contactCost
          );
          if (orgWithCredits) {
            scopeToUse = Number(orgWithCredits[0]);
            setSelectedScope(scopeToUse);
            effectiveCredits = orgWithCredits[1]?.credits ?? 0;
          }
        }
      }

      setHasActivePlan(effectiveCredits >= contactCost);

      if (effectiveCredits >= contactCost) {
        // User has active credits -> unlock immediately! DO NOT SHOW PLAN/BUY POPUP!
        const success = await unlockContact(scopeToUse);
        if (success) {
          setContactStep("contact");
          setContactOpen(true);
        }
      } else {
        // Zero credits in all scopes -> open plan selection dialog to purchase
        setContactStep("plans");
        setContactOpen(true);
      }
    } catch (err: any) {
      const errorMsg = err?.data?.message || err?.message || "Owner contact not available";
      toast.error(errorMsg);
      setContactOpen(false);
    } finally {
      contactCheckInFlight.current = false;
      setCheckingContact(false);
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

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={handleCardKeyDown}
      aria-busy={isNavigating}
      className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 ${isNavigating ? "pointer-events-none scale-[0.995] opacity-80" : ""}`}
    >
      {isNavigating && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-slate-950/80"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" aria-hidden="true" />
            Opening property details…
          </div>
        </div>
      )}
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
        compact={compact}
      />
      <SavePropertyButton propertyId={id} />
      <ResultCardSummary
        title={title}
        subtitle={subtitle}
        price={price}
        area={area}
        owner={owner}
        bedrooms={bedrooms}
        bathrooms={bathrooms}
        type={type}
        listingType={listingType}
        decisionDetails={decisionDetails}
        contextBadge={contextBadge}
        posterBadge={isBoosted ? "⭐ FEATURED" : posterBadge}
        onContactClick={openContactFlow}
        onScheduleClick={openScheduleFlow}
        compact={compact}
        isContactChecking={checkingContact}
      />
      <ScheduleVisitDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        property={{
          id,
          title,
          locality: subtitle,
          price,
          ownerName: owner,
        }}
      />
      <ContactUnlockDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        contactStep={contactStep}
        hasActivePlan={hasActivePlan}
        loading={loading}
        plansList={plansList}
        selectedPlan={selectedPlan}
        currentPlan={currentPlan}
        contactError={contactError}
        ownerContact={ownerContact}
        owner={owner}
        credits={
          selectedScope === "PERSONAL"
            ? (personalSummary?.credits ?? meData?.credits ?? credits)
            : (orgSummaries[selectedScope]?.credits ?? 0)
        }
        scopes={scopes}
        selectedScope={selectedScope}
        onScopeChange={(s) => {
          setSelectedScope(s);
          if (s === "PERSONAL") {
            setCredits(personalSummary?.credits ?? meData?.credits ?? credits);
          } else {
            setCredits(orgSummaries[s]?.credits ?? 0);
          }
        }}
        onUnlockContact={() => void unlockContact(selectedScope)}
        onSelectedPlanChange={setSelectedPlan}
        onPurchasePlan={purchasePlan}
        purchaseEnabled={creditPurchasesEnabled}
        onOpenWallet={() => {
          setContactOpen(false);
          setWalletOpen(true);
        }}
        contactCost={contactCost}
      />
      <CreditWalletModal
        isOpen={walletOpen}
        onClose={() => {
          setWalletOpen(false);
          void refreshScopes();
        }}
        userProfile={meData}
      />
    </article>
  );
}
