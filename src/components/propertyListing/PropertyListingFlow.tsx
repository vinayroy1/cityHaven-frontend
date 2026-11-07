"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectPropertyListing } from "@/store/store";
import {
  hydrateDraft,
  initialPropertyListingFormValues,
  saveDraft,
} from "@/features/propertyListing/slice";
import {
  useSubmitPropertyMutation,
  useUpdatePropertyMutation,
  useGetPropertyQuery,
} from "@/features/propertyListing/api";
import {
  clearPersistedDraft,
  loadPersistedDraft,
  persistDraft,
} from "@/features/propertyListing/storage";
import { mapApiToForm } from "@/features/propertyListing/apiToForm";
import { listingSteps } from "@/features/propertyListing/formConfig/steps";
import { computeListingScore } from "@/features/propertyListing/formConfig/scoring";
import {
  requiredPathsForStep,
  getRequiredFieldsForStep,
  isFieldFilled,
  type RequiredFieldMeta,
} from "@/features/propertyListing/formConfig/validation";
import { suggestTitle, suggestDescription } from "@/features/propertyListing/formConfig/derive";
import { APP_CONFIG } from "@/constants/app-config";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";
import type { FieldPath } from "react-hook-form";
import { Stepper } from "./Stepper";
import { MobileStepBar } from "./MobileStepBar";
import { PropertyScore } from "./PropertyScore";
import { SectionRenderer } from "./SectionRenderer";
import { LocationStep } from "./LocationStep";
import { ReviewSummary } from "./ReviewSummary";
import { WorkspacePicker } from "./WorkspacePicker";
import { MandatoryFieldsTracker } from "./MandatoryFieldsTracker";
import { PublishSuccess, type PublishedListing } from "./PublishSuccess";
import { useMyOrganizationsQuery } from "@/features/organizations/api";
import { panel } from "./theme";
import { registerBackHandler } from "@/lib/navigation/backNavigation";

import { AdminOwnerSourcingCard } from "./AdminOwnerSourcingCard";
import { AdminDeduplicationAlert } from "./AdminDeduplicationAlert";
import { getSelectedCountry } from "@/lib/country/countryStore";

const PG_SUBTYPES = ["pg-private-room", "pg-shared-room", "pg-bed"];
/** Where the admin store keeps the signed-in staff profile. */
const STAFF_KEY = "awasio_admin_current_staff";

export function PropertyListingFlow({
  propertyId: propIdOverride,
  adminMode = false,
  onSuccessRedirect,
  assistedOwner,
  onAssistedSaved,
}: {
  propertyId?: string;
  adminMode?: boolean;
  onSuccessRedirect?: string;
  /** Staff-assisted mode: the owner is fixed (API calls carry the owner's assisted token). */
  assistedOwner?: { id: number; name: string | null; mobileNumber: string };
  onAssistedSaved?: (created: { id?: number; slug?: string | null; title?: string | null }) => void;
}) {
  const isAssisted = Boolean(assistedOwner);
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = propIdOverride ?? searchParams.get("id") ?? undefined;
  // "Duplicate listing": prefill a NEW draft from an existing listing (never publishes on its own).
  const duplicateOf = propertyId ? undefined : (searchParams.get("duplicateOf") ?? undefined);
  const organizationIdFromQuery = searchParams.get("orgId") ?? undefined;
  const dispatch = useAppDispatch();
  const { draft } = useAppSelector(selectPropertyListing);

  const storageKey = adminMode ? "adminPropertySourcingDraft" : undefined;

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (adminMode && !isAssisted) {
        const adminStaff = localStorage.getItem(STAFF_KEY);
        const adminToken = localStorage.getItem("awasio_admin_token") || localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
        if (!adminStaff && !adminToken) {
          router.replace(`/admin/login?redirect=/admin/properties/create`);
        }
      } else {
        // New listings can be filled in logged out (draft is saved locally); login is asked
        // before photos/publish. Editing an existing listing still needs a session.
        const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
        if (!token && (propertyId || duplicateOf)) {
          const redirectUrl = propertyId ? `/propertyListing?id=${propertyId}` : `/propertyListing?duplicateOf=${duplicateOf}`;
          router.replace(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        }
      }
    }
  }, [router, propertyId, duplicateOf, adminMode, isAssisted]);

  const [submitProperty, submitState] = useSubmitPropertyMutation();
  const [updateProperty, updateState] = useUpdatePropertyMutation();
  const { data: existing } = useGetPropertyQuery(propertyId as string, { skip: !propertyId });
  const { data: duplicateSource } = useGetPropertyQuery(duplicateOf as string, { skip: !duplicateOf });
  const [duplicateFrom, setDuplicateFrom] = useState<{ id: string; title: string; flatNumber?: string; houseNumber?: string; price?: number } | null>(null);
  const [hasToken, setHasToken] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasToken(Boolean(localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY)));
    }
  }, []);
  const { data: myOrganizations = [] } = useMyOrganizationsQuery(undefined, { skip: !hasToken });

  const [stepIndex, setStepIndex] = useState(0);
  const [maxVisited, setMaxVisited] = useState(adminMode ? listingSteps.length - 1 : 0);
  const [published, setPublished] = useState<PublishedListing | null>(null);
  const [resume, setResume] = useState<{ form: PropertyListingFormValues; step?: number } | null>(null);
  const hydratedRef = useRef(false);

  const form = useForm<PropertyListingFormValues>({
    mode: "onChange",
    defaultValues: draft ?? {
      ...initialPropertyListingFormValues,
      context: {
        ...initialPropertyListingFormValues.context,
        postedAs: "OWNER",
        isAssistedListing: adminMode,
        source: "GOOGLE_SOURCED",
        sendOwnerNotification: true,
      },
      publishOptions: {
        status: adminMode ? "ACTIVE" : "DRAFT",
        qcRequired: !adminMode,
      },
    },
  });

  // New listing: start in the portal country the visitor picked (still changeable on the Location step).
  useEffect(() => {
    if (propertyId || duplicateOf || draft) return;
    if (form.getValues("location.cityName")) return;
    const portal = getSelectedCountry();
    if (portal !== (form.getValues("location.countryCode") || "IN")) form.setValue("location.countryCode", portal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const values = useWatch({ control: form.control }) as PropertyListingFormValues;
  const score = useMemo(() => computeListingScore(listingSteps, values ?? {}), [values]);

  const activeSelectedOrg = useMemo(() => {
    if (!values?.context?.organizationId) return null;
    return myOrganizations.find((o) => String(o.id) === String(values.context.organizationId)) || null;
  }, [myOrganizations, values?.context?.organizationId]);

  const isViewerInSelectedOrg = activeSelectedOrg?.role?.name === "VIEWER";

  // Hydrate an existing listing for editing.
  useEffect(() => {
    if (existing && !hydratedRef.current) {
      hydratedRef.current = true;
      const mapped = mapApiToForm(existing as Record<string, unknown>);
      prevClassificationRef.current = {
        listingType: mapped.context?.listingType,
        resCom: mapped.context?.resCom,
        subType: mapped.context?.propertySubTypeSlug,
      };
      pendingHydrationRef.current = prevClassificationRef.current;
      form.reset(mapped);
      dispatch(hydrateDraft(mapped));
    }
  }, [existing, form, dispatch]);

  // Duplicate: copy everything shared (location, society, amenities, rules, photos), clear what
  // differs per unit (flat/house/plot no., floor, price, available-from) and start a fresh draft.
  useEffect(() => {
    if (!duplicateOf || !duplicateSource || hydratedRef.current) return;
    hydratedRef.current = true;
    const src = mapApiToForm(duplicateSource as Record<string, unknown>);
    const uploads = (src.meta?.draftState as { mediaUploads?: Array<Record<string, unknown>> } | undefined)?.mediaUploads;
    const copy: PropertyListingFormValues = {
      ...src,
      location: { ...src.location, flatNumber: undefined, houseNumber: undefined, plotNumber: undefined, address: undefined },
      details: { ...src.details, floorNumber: undefined },
      pricing: { ...src.pricing, price: undefined, pricePerSqFt: undefined, priceInWords: undefined },
      availability: { ...src.availability, availableFrom: undefined },
      meta: {
        ...src.meta,
        title: undefined,
        draftState: uploads
          ? {
              ...(src.meta?.draftState as object),
              // Same photo files, new media rows: drop the original's media ids.
              mediaUploads: uploads.map((m) => ({ ...m, id: undefined, localId: `dup-${String(m.localId)}` })),
            }
          : src.meta?.draftState,
      },
      media: { mediaIds: undefined },
      publishOptions: { status: "DRAFT", qcRequired: !adminMode },
    } as PropertyListingFormValues;
    prevClassificationRef.current = {
      listingType: copy.context?.listingType,
      resCom: copy.context?.resCom,
      subType: copy.context?.propertySubTypeSlug,
    };
    pendingHydrationRef.current = prevClassificationRef.current;
    isTitleCustomRef.current = false;
    isDescCustomRef.current = true; // keep the owner's description
    form.reset(copy);
    dispatch(hydrateDraft(copy));
    setMaxVisited(listingSteps.length - 1);
    setDuplicateFrom({
      id: duplicateOf,
      title: String((duplicateSource as { title?: string }).title || "your listing"),
      flatNumber: src.location?.flatNumber || undefined,
      houseNumber: src.location?.houseNumber || undefined,
      price: src.pricing?.price ?? undefined,
    });
  }, [duplicateOf, duplicateSource, form, dispatch, adminMode]);

  // Immediately hydrate saved draft on mount (for a fresh "create" session).
  useEffect(() => {
    if (propertyId || duplicateOf) return;
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const persisted = loadPersistedDraft(storageKey);
    if (persisted?.form) {
      prevClassificationRef.current = {
        listingType: persisted.form.context?.listingType,
        resCom: persisted.form.context?.resCom,
        subType: persisted.form.context?.propertySubTypeSlug,
      };
      pendingHydrationRef.current = prevClassificationRef.current;
      // A restored title/description that differs from the generated one was
      // typed by the user; don't let the auto-generator overwrite it.
      const restoredTitle = persisted.form.meta?.title;
      if (restoredTitle && restoredTitle !== suggestTitle(persisted.form)) isTitleCustomRef.current = true;
      const restoredDesc = persisted.form.meta?.description;
      if (restoredDesc && restoredDesc !== suggestDescription(persisted.form)) isDescCustomRef.current = true;
      form.reset(persisted.form);
      dispatch(hydrateDraft(persisted.form));
      const s = persisted.step && persisted.step > 0 ? persisted.step : 0;
      setStepIndex(s);
      setMaxVisited(adminMode ? listingSteps.length - 1 : s);
      setResume(persisted);
    }
  }, [propertyId, duplicateOf, form, dispatch, storageKey, adminMode]);

  useEffect(() => {
    if (propertyId) return;
    if (organizationIdFromQuery) {
      form.setValue("context.organizationId", organizationIdFromQuery, { shouldDirty: true });
    }
  }, [form, organizationIdFromQuery, propertyId]);

  // Autosave to localStorage + Redux (debounced) only after form has been hydrated.
  useEffect(() => {
    if (!hydratedRef.current) return;
    const sub = form.watch((v) => {
      persistDraft({ form: v as PropertyListingFormValues, step: stepIndex }, storageKey);
    });
    return () => sub.unsubscribe();
  }, [form, stepIndex, storageKey]);

  // Cross-field resets keyed on user changes to the classification fields.
  const listingType = values?.context?.listingType;
  const resCom = values?.context?.resCom;
  const subType = values?.context?.propertySubTypeSlug;
  const prevClassificationRef = useRef<{ listingType?: string; resCom?: string; subType?: string } | null>(null);
  // Set when form.reset() hydrates a draft/listing. Until the watched values
  // reflect the hydrated classification, the reset effect below must not
  // treat the stale defaults -> hydrated values transition as a user change
  // (it would wipe propertySubTypeSlug for e.g. commercial listings).
  const pendingHydrationRef = useRef<{ listingType?: string; resCom?: string; subType?: string } | null>(null);

  useEffect(() => {
    // Skip before form is hydrated
    if (!hydratedRef.current) return;

    const pending = pendingHydrationRef.current;
    if (pending) {
      if (
        (pending.listingType ?? "") === (listingType ?? "") &&
        (pending.resCom ?? "") === (resCom ?? "") &&
        (pending.subType ?? "") === (subType ?? "")
      ) {
        pendingHydrationRef.current = null;
        prevClassificationRef.current = { listingType, resCom, subType };
      }
      return;
    }

    // Skip on initial classification recording
    if (!prevClassificationRef.current) {
      prevClassificationRef.current = { listingType, resCom, subType };
      return;
    }

    const prev = prevClassificationRef.current;
    const listingTypeChanged = prev.listingType !== listingType;
    const resComChanged = prev.resCom !== resCom;
    const subTypeChanged = prev.subType !== subType;
    prevClassificationRef.current = { listingType, resCom, subType };

    if (!listingTypeChanged && !resComChanged && !subTypeChanged) {
      return;
    }

    if (listingType === "PG") {
      if (resCom !== "RESIDENTIAL") form.setValue("context.resCom", "RESIDENTIAL", { shouldDirty: true });
      if (subType && !PG_SUBTYPES.includes(subType)) {
        form.setValue("context.propertySubTypeSlug", "", { shouldDirty: true });
        form.clearErrors(["context.propertySubTypeSlug"]);
      }
      form.setValue("details.bedrooms", undefined, { shouldDirty: true });
      form.setValue("details.balconies", undefined, { shouldDirty: true });
    } else if (listingTypeChanged && subType && PG_SUBTYPES.includes(subType)) {
      form.setValue("context.propertySubTypeSlug", "", { shouldDirty: true });
      form.clearErrors(["context.propertySubTypeSlug"]);
    }

    // When property category changes (e.g. from RESIDENTIAL to COMMERCIAL or vice versa), always clear subtype and dependents
    if (resComChanged) {
      form.setValue("context.propertySubTypeSlug", "", { shouldDirty: true });
      form.setValue("context.propertySubCategorySlug", "", { shouldDirty: true });
      form.setValue("context.locatedInsideSlug", "", { shouldDirty: true });
      form.clearErrors(["context.propertySubTypeSlug", "context.propertySubCategorySlug", "context.locatedInsideSlug"]);
    }

    if (subTypeChanged && subType && !["office", "retail"].includes(subType)) {
      if (values?.context?.propertySubCategorySlug) {
        form.setValue("context.propertySubCategorySlug", "", { shouldDirty: true });
        form.clearErrors(["context.propertySubCategorySlug"]);
      }
      if (values?.context?.locatedInsideSlug) {
        form.setValue("context.locatedInsideSlug", "", { shouldDirty: true });
        form.clearErrors(["context.locatedInsideSlug"]);
      }
    }
    if (subType?.includes("plot-land")) {
      form.setValue("details.bedrooms", undefined, { shouldDirty: true });
      form.setValue("details.bathrooms", undefined, { shouldDirty: true });
      form.setValue("details.balconies", undefined, { shouldDirty: true });
      form.setValue("amenities.furnishing", undefined, { shouldDirty: true });
    }
    // Allow title and description to regenerate when classification or subType changes
    isTitleCustomRef.current = false;
    isDescCustomRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingType, resCom, subType]);

  // Real-time Title & Description Auto-Generator based on user selections
  const lastAutoTitleRef = useRef<string>("");
  const lastAutoDescRef = useRef<string>("");
  const isTitleCustomRef = useRef<boolean>(false);
  const isDescCustomRef = useRef<boolean>(false);

  // Builders sell new inventory: preselect "New booking" (still editable) when nothing is chosen.
  const postedAsValue = values?.context?.postedAs;
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (listingType === "SELL" && postedAsValue === "BUILDER" && !form.getValues("context.saleType")) {
      form.setValue("context.saleType", "NEW_BOOKING", { shouldDirty: true });
    }
  }, [listingType, postedAsValue, form]);

  // Watch for manual user edits on title & description to freeze auto-generation
  useEffect(() => {
    const currentTitle = form.getValues("meta.title");
    // An empty value counts as a manual edit too (select-all + delete), otherwise
    // the generator refills the field and the user's typing is appended to it.
    if (lastAutoTitleRef.current && currentTitle !== lastAutoTitleRef.current) {
      isTitleCustomRef.current = true;
    }
    const currentDesc = form.getValues("meta.description");
    if (lastAutoDescRef.current && currentDesc !== lastAutoDescRef.current) {
      isDescCustomRef.current = true;
    }
  }, [values?.meta?.title, values?.meta?.description, form]);

  // Dynamically update Title & Description in real time as user changes property config
  useEffect(() => {
    if (propertyId) return;

    if (!isTitleCustomRef.current && values?.location?.cityName) {
      const newTitle = suggestTitle(values);
      if (newTitle && newTitle !== form.getValues("meta.title")) {
        form.setValue("meta.title", newTitle, { shouldDirty: true });
        lastAutoTitleRef.current = newTitle;
      }
    }

    if (!isDescCustomRef.current && values?.location?.cityName) {
      const newDesc = suggestDescription(values);
      if (newDesc && newDesc !== form.getValues("meta.description")) {
        form.setValue("meta.description", newDesc, { shouldDirty: true });
        lastAutoDescRef.current = newDesc;
      }
    }
  }, [
    values?.context,
    values?.details,
    values?.location,
    values?.pricing,
    values?.amenities,
    propertyId,
    form,
  ]);

  const step = listingSteps[stepIndex];
  const isLast = stepIndex === listingSteps.length - 1;
  const busy = submitState.isLoading || updateState.isLoading;

  const requiredFieldsMeta = useMemo(() => {
    return getRequiredFieldsForStep(step, values ?? {});
  }, [step, values]);

  const missingRequiredFields = useMemo(() => {
    return requiredFieldsMeta.filter((f) => !isFieldFilled(values ?? {}, f.id));
  }, [requiredFieldsMeta, values]);

  const scrollToField = (fieldId: string) => {
    const el = document.getElementById(`field-container-${fieldId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-rose-500", "ring-offset-2", "bg-rose-50/50");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-rose-500", "ring-offset-2", "bg-rose-50/50");
      }, 2500);
    }
  };

  /** Photos upload and publishing need an account: save the draft, then send the user to log in. */
  const redirectToLoginIfNeeded = (resumeStep: number) => {
    if (adminMode || typeof window === "undefined" || localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY)) return false;
    persistDraft({ form: form.getValues(), step: resumeStep }, storageKey);
    toast.info("Log in or sign up to add photos and publish. Your details are saved.");
    router.push(`/login?redirect=${encodeURIComponent("/propertyListing")}`);
    return true;
  };

  const goToStep = (i: number) => {
    if (i === listingSteps.length - 1 && redirectToLoginIfNeeded(i)) return;
    dispatch(saveDraft(form.getValues()));
    setStepIndex(i);
    setMaxVisited((m) => Math.max(m, i));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Intercept back presses in Expo WebView or browser when in steps > 0
  useEffect(() => {
    if (stepIndex <= 0) return;
    const unregister = registerBackHandler(() => {
      goToStep(stepIndex - 1);
      return true; // handled
    });
    return unregister;
  }, [stepIndex]);

  const handleNext = async () => {
    if (isViewerInSelectedOrg) {
      toast.error("Viewer role cannot publish listings under this organization. Please switch to My Account or update your role.");
      return;
    }
    const paths = requiredPathsForStep(step, form.getValues()) as FieldPath<PropertyListingFormValues>[];
    const triggered = paths.length === 0 || (await form.trigger(paths, { shouldFocus: true }));
    // trigger() only validates fields with registered rules; custom steps
    // (location) and some config fields have none, so check values directly.
    const unfilled = paths.filter((p) => !isFieldFilled(form.getValues(), p));
    const ok = triggered && unfilled.length === 0;
    if (!ok) {
      const currentValues = form.getValues();
      if (step.kind === "custom" && unfilled.length > 0) {
        const labels: Record<string, string> = { "location.cityName": "City", "location.locality": "Locality" };
        toast.error(`Please complete mandatory fields: ${unfilled.map((p) => labels[p] ?? p).join(", ")}`);
        return;
      }
      const stillMissing = requiredFieldsMeta.filter((f) => !isFieldFilled(currentValues, f.id));
      if (stillMissing.length > 0) {
        scrollToField(stillMissing[0].id);
        const labels = stillMissing.map((f) => f.label).slice(0, 3).join(", ");
        const extraCount = stillMissing.length > 3 ? ` (+${stillMissing.length - 3} more)` : "";
        toast.error(`Please complete mandatory fields: ${labels}${extraCount}`);
      } else {
        toast.error("Please complete the highlighted fields.");
      }
      return;
    }
    dispatch(saveDraft(form.getValues()));
    goToStep(Math.min(listingSteps.length - 1, stepIndex + 1));
  };

  const handlePublish = async () => {
    if (redirectToLoginIfNeeded(stepIndex)) return;
    if (isViewerInSelectedOrg) {
      toast.error("Viewer role cannot publish listings under this organization. Please switch to My Account or update your role.");
      return;
    }

    if (adminMode && !isAssisted) {
      const ownerContact = form.getValues("context.ownerContact");
      const cleanNum = (ownerContact || "").replace(/\D/g, "").slice(-10);
      if (!cleanNum || cleanNum.length !== 10 || !/^[6-9]\d{9}$/.test(cleanNum)) {
        toast.error("Please enter a valid 10-digit Indian mobile number for the owner in Step 1.");
        goToStep(0);
        return;
      }
    }

    const paths = listingSteps
      .flatMap((s) => requiredPathsForStep(s, form.getValues()))
      .filter((p, i, a) => a.indexOf(p) === i) as FieldPath<PropertyListingFormValues>[];
    const triggered = await form.trigger(paths, { shouldFocus: true });
    const unfilledStepIndex = listingSteps.findIndex((s) =>
      requiredPathsForStep(s, form.getValues()).some((p) => !isFieldFilled(form.getValues(), p)),
    );
    if (!triggered || unfilledStepIndex !== -1) {
      toast.error("Some required details are missing.");
      if (unfilledStepIndex !== -1 && unfilledStepIndex !== stepIndex) goToStep(unfilledStepIndex);
      return;
    }
    const payload = form.getValues();

    // Duplicate guard: same unit number and price as the original looks like a repost.
    if (duplicateFrom) {
      const sameUnit =
        (payload.location?.flatNumber || "") === (duplicateFrom.flatNumber || "") &&
        (payload.location?.houseNumber || "") === (duplicateFrom.houseNumber || "");
      const samePrice = Number(payload.pricing?.price) === Number(duplicateFrom.price);
      if (
        sameUnit &&
        samePrice &&
        !window.confirm(`This looks identical to "${duplicateFrom.title}" (same unit no. and price). Post it anyway?`)
      ) {
        goToStep(listingSteps.findIndex((s) => s.id === "location") >= 0 ? listingSteps.findIndex((s) => s.id === "location") : 0);
        return;
      }
    }

    if (adminMode) {
      try {
        const rawStaff = localStorage.getItem(STAFF_KEY);
        if (rawStaff) {
          const staffObj = JSON.parse(rawStaff);
          if (staffObj?.id) {
            payload.context.createdById = staffObj.id;
          }
        }
      } catch {
        /* no stored staff */
      }
      payload.context.isAssistedListing = true;
      if (assistedOwner) {
        payload.context.ownerId = assistedOwner.id;
        payload.context.ownerName = assistedOwner.name || payload.context.ownerName;
        payload.context.ownerContact = assistedOwner.mobileNumber;
        // The backend applies the normal publish/QC policy for the owner's account.
        payload.publishOptions = { status: "ACTIVE", qcRequired: true };
      }
      if (!payload.publishOptions?.status) {
        payload.publishOptions = {
          status: "ACTIVE",
          qcRequired: false,
        };
      }
    } else {
      // Stamp the current user so the listing shows under "My listings".
      try {
        const raw = localStorage.getItem("awasio_user");
        const uid = raw ? (JSON.parse(raw) as { id?: number }).id : undefined;
        if (uid && !payload.context.ownerId) {
          payload.context = { ...payload.context, ownerId: uid, createdById: uid };
        }
      } catch {
        /* no stored user */
      }
      // Live vs. review is decided by the backend from the admin review policy.
      payload.publishOptions = { status: "ACTIVE", qcRequired: true };
    }

    dispatch(saveDraft(payload));
    try {
      if (propertyId) {
        await updateProperty({ id: propertyId, formValues: payload }).unwrap();
        // Bust the ISR-cached public detail page (reachable by id or slug).
        const slug = (existing as { slug?: string } | undefined)?.slug;
        await fetch("/api/properties/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keys: [String(propertyId), slug].filter(Boolean) }),
        }).catch(() => undefined);
        toast.success("Listing updated.");
      } else {
        const res = (await submitProperty(payload).unwrap()) as unknown as Record<string, unknown>;
        const created = ((res?.data as Record<string, unknown>) ?? res) as Record<string, unknown>;
        if (isAssisted) {
          clearPersistedDraft(storageKey);
          onAssistedSaved?.({
            id: Number(created?.id) || undefined,
            slug: (created?.slug as string) ?? null,
            title: (created?.title as string) ?? payload.meta?.title ?? null,
          });
          return;
        }
        if (adminMode) {
          toast.success(
            `Property successfully listed on behalf of owner ${payload.context?.ownerContact ? `(+91 ${payload.context.ownerContact})` : ""}!`
          );
        } else {
          clearPersistedDraft(storageKey);
          if (!Number.isFinite(Number(created?.id))) {
            toast.success("Listing submitted.");
            router.push("/dashboard/properties");
            return;
          }
          setPublished({
            id: Number(created?.id),
            slug: (created?.slug as string) ?? null,
            status: (created?.status as string) ?? null,
            title: (created?.title as string) ?? payload.meta?.title ?? null,
          });
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        clearPersistedDraft(storageKey);
      }
      router.push(adminMode ? (onSuccessRedirect || "/admin/properties") : "/dashboard/properties");
    } catch (err) {
      const msg = (err as { data?: { message?: string } })?.data?.message;
      toast.error(msg || "Could not save the listing. Please try again.");
    }
  };

  const applyResume = () => {
    if (resume?.form) {
      dispatch(hydrateDraft(resume.form));
      prevClassificationRef.current = {
        listingType: resume.form.context?.listingType,
        resCom: resume.form.context?.resCom,
        subType: resume.form.context?.propertySubTypeSlug,
      };
      form.reset(resume.form);
      const s = resume.step && resume.step > 0 ? resume.step : 0;
      setStepIndex(s);
      setMaxVisited(adminMode ? listingSteps.length - 1 : s);
    }
    setResume(null);
  };

  const startFresh = () => {
    form.reset({
      ...initialPropertyListingFormValues,
      context: {
        ...initialPropertyListingFormValues.context,
        postedAs: "OWNER",
        isAssistedListing: adminMode,
        source: "GOOGLE_SOURCED",
        sendOwnerNotification: true,
      },
      publishOptions: {
        status: adminMode ? "ACTIVE" : "DRAFT",
        qcRequired: !adminMode,
      },
    });
    dispatch(hydrateDraft(initialPropertyListingFormValues));
    clearPersistedDraft(storageKey);
    prevClassificationRef.current = {
      listingType: initialPropertyListingFormValues.context?.listingType,
      resCom: initialPropertyListingFormValues.context?.resCom,
      subType: initialPropertyListingFormValues.context?.propertySubTypeSlug,
    };
    setStepIndex(0);
    setMaxVisited(adminMode ? listingSteps.length - 1 : 0);
    setResume(null);
  };

  if (published && Number.isFinite(published.id)) {
    return (
      <PublishSuccess
        listing={published}
        onPostAnother={() => {
          startFresh();
          setPublished(null);
        }}
      />
    );
  }

  return (
    <FormProvider {...form}>
      <MobileStepBar
        steps={listingSteps}
        current={stepIndex}
        maxVisited={maxVisited}
        score={score.pct}
        onNavigate={goToStep}
      />

      <div className="grid gap-6 pb-24 pt-4 lg:grid-cols-[264px_minmax(0,1fr)] lg:pb-6 lg:pt-0">
        <aside className="hidden space-y-4 lg:block lg:sticky lg:top-6 lg:self-start">
          <div className={cn(panel, "p-3")}>
            <Stepper
              steps={listingSteps}
              current={stepIndex}
              maxVisited={maxVisited}
              onNavigate={goToStep}
            />
          </div>
          <PropertyScore pct={score.pct} />
        </aside>

        <div className="min-w-0 space-y-5">
          {duplicateFrom && (
            <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-3.5 text-sm text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
              <p className="font-semibold">Copied from &ldquo;{duplicateFrom.title}&rdquo;</p>
              <p className="mt-0.5 text-xs">
                Location, amenities, details and photos are filled in. Add what&apos;s different for this unit:{" "}
                <b>flat / house no., floor, price</b> and <b>available from</b>. Replace photos if this unit looks different.
              </p>
            </div>
          )}

          {resume && (
            <div className="flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              <span>Restored your saved draft from your previous session.</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={startFresh}>
                  Start fresh
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setResume(null)}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          <div className={cn(panel, "space-y-4 p-4 sm:space-y-5 sm:p-6")}>
            {/* Heading is shown in the compact bar on mobile; full here on lg+ */}
            <div className="hidden lg:block">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-rose-500">
                <span>Step {stepIndex + 1} of {listingSteps.length}</span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-slate-500 dark:text-slate-400 normal-case tracking-normal">{step.label}</span>
              </div>
              <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{step.title ?? step.label}</h1>
              {step.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{step.description}</p>}
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {adminMode && !isAssisted && stepIndex === 0 && <AdminOwnerSourcingCard />}

              {adminMode && stepIndex > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-200/90 bg-indigo-50/70 px-3.5 py-2 text-xs text-indigo-900 dark:border-indigo-800/80 dark:bg-indigo-950/40 dark:text-indigo-200">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                    <span>
                      Listing for: <strong>{values?.context?.ownerName || "Owner"}</strong>{" "}
                      {values?.context?.ownerContact ? `(+91 ${values.context.ownerContact})` : "(No phone)"}
                      {values?.context?.ownerPassword ? " · Password configured" : ""} ·
                      Channel: <strong>{values?.context?.source || "GOOGLE_SOURCED"}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(0)}
                    className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 underline underline-offset-2"
                  >
                    Edit Owner Info
                  </button>
                </div>
              )}

              {stepIndex === 0 && !adminMode && (
                <WorkspacePicker
                  selectedOrgId={values?.context?.organizationId}
                  onSelectPersonal={() => {
                    form.setValue("context.organizationId", undefined, { shouldDirty: true });
                    if (!form.getValues("context.postedAs")) {
                      form.setValue("context.postedAs", "OWNER", { shouldDirty: true });
                    }
                  }}
                  onSelectOrg={(org) => {
                    form.setValue("context.organizationId", String(org.id), { shouldDirty: true });
                  }}
                />
              )}

              {step.kind === "custom" && step.component === "location" && (
                <div className="space-y-4">
                  {adminMode && <AdminDeduplicationAlert />}
                  <LocationStep />
                </div>
              )}

              {step.kind !== "custom" && !isLast && (
                <MandatoryFieldsTracker
                  totalRequired={requiredFieldsMeta.length}
                  missingFields={missingRequiredFields}
                  onJumpToField={scrollToField}
                />
              )}

              {step.kind !== "custom" &&
                (step.sections ?? []).map((section, i) => (
                  <SectionRenderer key={section.id} section={section} values={values ?? {}} index={i + 1} />
                ))}

              {isLast && (
                <ReviewSummary
                  values={values ?? form.getValues()}
                  score={score.pct}
                  onEditStep={(id) => {
                    // Photos/description live on this same step: scroll instead of navigating.
                    if (id === step.id) {
                      const target = document.getElementById("field-container-media.mediaIds") ?? document.querySelector("form");
                      target?.scrollIntoView({ behavior: "smooth", block: "start" });
                      return;
                    }
                    const i = listingSteps.findIndex((s) => s.id === id);
                    goToStep(i >= 0 ? i : 0);
                  }}
                />
              )}
            </form>
          </div>
        </div>
      </div>

      {/* sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 lg:sticky lg:bottom-4 lg:mt-4 lg:rounded-2xl lg:border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={stepIndex === 0}
            onClick={() => goToStep(Math.max(0, stepIndex - 1))}
            className="px-2.5 sm:px-4"
          >
            Back
          </Button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {step.kind !== "custom" && missingRequiredFields.length > 0 && !isLast && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 mr-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                {missingRequiredFields.length} mandatory remaining
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="px-2.5 sm:px-4 text-xs sm:text-sm"
              onClick={() => {
                const currentVals = form.getValues();
                dispatch(saveDraft(currentVals));
                persistDraft({ form: currentVals, step: stepIndex });
                toast.success("Draft saved.");
              }}
            >
              Save draft
            </Button>
            {isLast ? (
              <Button
                type="button"
                size="sm"
                className="bg-rose-600 px-3.5 sm:px-6 hover:bg-rose-700 text-xs sm:text-sm font-bold text-white shadow-xs dark:bg-rose-600 dark:hover:bg-rose-700 dark:text-white"
                onClick={handlePublish}
                disabled={busy || isViewerInSelectedOrg}
              >
                {busy ? "Saving…" : propertyId ? "Update listing" : "Post listing"}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="bg-rose-600 px-3.5 sm:px-6 hover:bg-rose-700 text-xs sm:text-sm font-bold text-white shadow-xs dark:bg-rose-600 dark:hover:bg-rose-700 dark:text-white"
                onClick={handleNext}
                disabled={isViewerInSelectedOrg}
              >
                Save &amp; continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}

export default PropertyListingFlow;
