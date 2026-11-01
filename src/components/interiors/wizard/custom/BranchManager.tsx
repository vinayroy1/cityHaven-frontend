"use client";

import { useState } from "react";
import { Building, Loader2, MapPin, Pencil, Phone, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { InteriorBranch, InteriorBranchDraft, InteriorWizardValues } from "@/types/interior.types";
import { BRANCH_TYPES } from "@/features/interiors/wizard/options";
import { INDIAN_PHONE_REGEX } from "@/features/interiors/wizard/options";
import { branchDraftToPayload } from "@/features/interiors/wizard/mapper";
import {
  useAddCompanyBranchMutation,
  useDeleteCompanyBranchMutation,
  useUpdateCompanyBranchMutation,
} from "@/features/interiors/api";
import { PropertyListingCitySelector } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector } from "@/components/propertyListing/PropertyListingLocalitySelector";
import {
  AddButton,
  Chip,
  EditorPanel,
  EmptyState,
  Field,
  StatusBadge,
  Toggle,
  apiErrorMessage,
  getAt,
  ghostIconBtn,
  inputCls,
  newId,
  primaryBtn,
  propPath,
  secondaryBtn,
  setPath,
} from "./ui";

const emptyBranch = (): InteriorBranchDraft => ({
  id: newId("branch"),
  serverId: null,
  branchName: "",
  branchType: "",
  city: "",
  state: "",
  locality: "",
  address: "",
  pincode: "",
  lat: null,
  lng: null,
  phone: "",
  managerName: "",
  workingHours: "",
  overridesCompanyPricing: false,
  isActive: true,
});

const typeLabel = (t: string) => BRANCH_TYPES.find((b) => b.value === t)?.label ?? "Branch";

const toPayload = branchDraftToPayload;

export default function BranchManager({ values, form, props }: CustomStepProps<InteriorWizardValues>) {
  const path = propPath(props, "field", "location.branches");
  const branches = getAt<InteriorBranchDraft[]>(values, path) ?? [];
  const [editing, setEditing] = useState<InteriorBranchDraft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addBranch, addState] = useAddCompanyBranchMutation();
  const [updateBranch, updState] = useUpdateCompanyBranchMutation();
  const [deleteBranch] = useDeleteCompanyBranchMutation();
  const saving = addState.isLoading || updState.isLoading;

  const write = (next: InteriorBranchDraft[]) => setPath(form, path, next);
  const patch = (p: Partial<InteriorBranchDraft>) => setEditing((e) => (e ? { ...e, ...p } : e));

  const otherHeadOffice = (id: string) => branches.some((b) => b.branchType === "HEAD_OFFICE" && b.id !== id);

  const openNew = () => {
    const b = emptyBranch();
    if (!branches.some((x) => x.branchType === "HEAD_OFFICE")) {
      // First branch is the head office, prefilled from the primary location the user already entered.
      b.branchType = "HEAD_OFFICE";
      b.branchName = "Head office";
      b.city = values.location?.primaryCity ?? "";
      b.state = values.location?.primaryState ?? "";
      b.locality = values.location?.primaryLocality ?? "";
      b.address = values.location?.primaryAddress ?? "";
      b.pincode = values.location?.primaryPincode ?? "";
      b.lat = values.location?.primaryLat ?? null;
      b.lng = values.location?.primaryLng ?? null;
    }
    setErrors({});
    setEditing(b);
  };

  const validate = (b: InteriorBranchDraft) => {
    const e: Record<string, string> = {};
    if (!b.branchName.trim()) e.branchName = "Give this location a name";
    if (!b.branchType) e.branchType = "Choose a type";
    if (b.branchType === "HEAD_OFFICE" && otherHeadOffice(b.id)) e.branchType = "You already have a head office";
    if (!b.city) e.city = "Choose a city";
    if (b.phone && !INDIAN_PHONE_REGEX.test(b.phone)) e.phone = "Enter a valid 10-digit mobile number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!editing || !validate(editing)) return;
    let saved = { ...editing };
    try {
      if (editing.serverId) {
        await updateBranch({ id: editing.serverId, data: toPayload(editing) }).unwrap();
      } else {
        const res = await addBranch(toPayload(editing)).unwrap();
        saved = { ...saved, serverId: (res as InteriorBranch)?.id ?? null };
      }
      toast.success("Location saved");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Saved on this device — we couldn't sync it yet."));
    }
    const exists = branches.some((b) => b.id === saved.id);
    write(exists ? branches.map((b) => (b.id === saved.id ? saved : b)) : [...branches, saved]);
    setEditing(null);
  };

  const remove = async (b: InteriorBranchDraft) => {
    if (!confirm(`Remove “${b.branchName || typeLabel(b.branchType)}”?`)) return;
    if (b.serverId) {
      try {
        await deleteBranch(b.serverId).unwrap();
      } catch (err) {
        toast.error(apiErrorMessage(err, "Couldn't delete this location"));
        return;
      }
    }
    write(branches.filter((x) => x.id !== b.id));
  };

  const toggleActive = async (b: InteriorBranchDraft) => {
    const next = { ...b, isActive: !b.isActive };
    write(branches.map((x) => (x.id === b.id ? next : x)));
    if (b.serverId) {
      try {
        await updateBranch({ id: b.serverId, data: toPayload(next) }).unwrap();
      } catch (err) {
        toast.error(apiErrorMessage(err));
      }
    }
  };

  const sorted = [...branches].sort((a, b) => (a.branchType === "HEAD_OFFICE" ? -1 : b.branchType === "HEAD_OFFICE" ? 1 : 0));

  return (
    <div className="space-y-4">
      {branches.length === 0 ? (
        <EmptyState
          icon={<Building className="size-5" />}
          title="Add your head office"
          description="Optional for now — you can add your head office, studios and experience centres later from your dashboard. You'll need a head office before submitting."
          action={<AddButton onClick={openNew}>Add head office</AddButton>}
        />
      ) : (
        <>
          <ul className="grid gap-3 sm:grid-cols-2">
            {sorted.map((b) => (
              <li
                key={b.id}
                className={`rounded-2xl border p-4 transition ${b.isActive ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" : "border-dashed border-slate-300 bg-slate-50 opacity-70 dark:bg-slate-900/50"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <StatusBadge tone={b.branchType === "HEAD_OFFICE" ? "blue" : "slate"}>{typeLabel(b.branchType)}</StatusBadge>
                    <p className="mt-1.5 truncate font-semibold text-slate-900 dark:text-white">{b.branchName || "Untitled location"}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin className="size-3.5 shrink-0" /> <span className="truncate">{[b.locality, b.city].filter(Boolean).join(", ") || "No city yet"}</span>
                    </p>
                    {(b.managerName || b.phone) && (
                      <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
                        {b.managerName && (
                          <span className="inline-flex items-center gap-1">
                            <User className="size-3" /> {b.managerName}
                          </span>
                        )}
                        {b.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="size-3" /> {b.phone}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0">
                    <button type="button" className={ghostIconBtn} aria-label="Edit location" onClick={() => (setErrors({}), setEditing({ ...b }))}>
                      <Pencil className="size-4" />
                    </button>
                    <button type="button" className={ghostIconBtn} aria-label="Delete location" onClick={() => remove(b)}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                  <span className="text-slate-500">{b.overridesCompanyPricing ? "Own pricing (set in Pricing)" : "Uses company pricing"}</span>
                  <button type="button" onClick={() => toggleActive(b)} className="font-medium text-slate-700 underline underline-offset-2 dark:text-slate-300">
                    {b.isActive ? "Active · Pause" : "Paused · Activate"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" onClick={openNew} className={secondaryBtn}>
            + Add another location
          </button>
        </>
      )}

      <EditorPanel
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing?.serverId ? "Edit location" : "New location"}
        description="Each location appears on your profile so clients can visit the nearest one."
        footer={
          <>
            <button type="button" className={`${secondaryBtn} flex-1 sm:flex-none`} onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="button" className={`${primaryBtn} flex-1 sm:flex-none`} onClick={save} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />} Save location
            </button>
          </>
        }
      >
        {editing && (
          <>
            <Field label="What kind of location is this?" required error={errors.branchType}>
              {() => (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {BRANCH_TYPES.map((t) => {
                    const blocked = t.value === "HEAD_OFFICE" && otherHeadOffice(editing.id);
                    return (
                      <Chip key={t.value} active={editing.branchType === t.value} disabled={blocked} onClick={() => patch({ branchType: t.value })} className="rounded-xl">
                        {t.label}
                      </Chip>
                    );
                  })}
                </div>
              )}
            </Field>
            <Field label="Location name" required error={errors.branchName} hint="e.g. Whitefield Experience Centre">
              {(id) => <input id={id} className={inputCls} value={editing.branchName} onChange={(e) => patch({ branchName: e.target.value })} />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" required error={errors.city}>
                {() => (
                  <PropertyListingCitySelector
                    value={editing.city}
                    selectedState={editing.state}
                    hasError={!!errors.city}
                    onChange={(c) => patch({ city: c.name, state: c.state ?? "", locality: "", lat: c.lat ?? null, lng: c.lng ?? null })}
                  />
                )}
              </Field>
              <Field label="Locality">
                {() => (
                  <PropertyListingLocalitySelector
                    value={editing.locality}
                    cityName={editing.city}
                    selectedState={editing.state}
                    placeholder={editing.city ? "Search locality" : "Select city first"}
                    onChange={(l) => patch({ locality: l.name, pincode: l.pincode || editing.pincode, lat: l.lat ?? editing.lat, lng: l.lng ?? editing.lng })}
                  />
                )}
              </Field>
            </div>
            <Field label="Address">
              {(id) => <input id={id} className={inputCls} value={editing.address} onChange={(e) => patch({ address: e.target.value })} />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Pincode">
                {(id) => (
                  <input id={id} inputMode="numeric" className={inputCls} value={editing.pincode} onChange={(e) => patch({ pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} />
                )}
              </Field>
              <Field label="Phone" error={errors.phone}>
                {(id) => <input id={id} type="tel" inputMode="tel" className={inputCls} value={editing.phone} onChange={(e) => patch({ phone: e.target.value })} />}
              </Field>
              <Field label="Manager name">
                {(id) => <input id={id} className={inputCls} value={editing.managerName} onChange={(e) => patch({ managerName: e.target.value })} />}
              </Field>
              <Field label="Working hours" hint="e.g. Mon–Sat, 10am–7pm">
                {(id) => <input id={id} className={inputCls} value={editing.workingHours} onChange={(e) => patch({ workingHours: e.target.value })} />}
              </Field>
            </div>
            <Toggle
              checked={editing.overridesCompanyPricing}
              onChange={(v) => patch({ overridesCompanyPricing: v })}
              label="This location has its own pricing"
              hint="You'll set the rates in the Pricing step."
            />
          </>
        )}
      </EditorPanel>
    </div>
  );
}
