"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import type { CustomStepProps } from "@/lib/listingEngine/types";
import type { InteriorBranchDraft, InteriorTeamMemberDraft, InteriorWizardValues } from "@/types/interior.types";
import { useDeleteInteriorTeamMemberMutation, useSaveInteriorTeamMemberMutation } from "@/features/interiors/api";
import { memberDraftToPayload } from "@/features/interiors/wizard/mapper";
import { cn } from "@/lib/utils";
import {
  EditorPanel,
  EmptyState,
  Field,
  ImageUpload,
  Stepper,
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

const emptyMember = (): InteriorTeamMemberDraft => ({
  id: newId("member"),
  serverId: null,
  name: "",
  designation: "",
  qualification: "",
  experienceYears: null,
  photo: "",
  branchId: null,
  orgMemberId: null,
  isPublic: true,
});

const ROLES = ["Principal designer", "Interior designer", "Project manager", "3D visualiser", "Site supervisor", "Sales"];

export default function TeamManager({ values, form, props }: CustomStepProps<InteriorWizardValues>) {
  const path = propPath(props, "field", "team.members");
  const members = getAt<InteriorTeamMemberDraft[]>(values, path) ?? [];
  const branches = (getAt<InteriorBranchDraft[]>(values, propPath(props, "branchesField", "location.branches")) ?? []).filter((b) => b.serverId);
  const [saveMember, { isLoading: saving }] = useSaveInteriorTeamMemberMutation();
  const [deleteMember] = useDeleteInteriorTeamMemberMutation();
  const [editing, setEditing] = useState<InteriorTeamMemberDraft | null>(null);

  const write = (next: InteriorTeamMemberDraft[]) => setPath(form, path, next);

  const persist = async (m: InteriorTeamMemberDraft, list = members) => {
    const exists = list.some((x) => x.id === m.id);
    const local = exists ? list.map((x) => (x.id === m.id ? m : x)) : [...list, m];
    write(local);
    try {
      const saved = await saveMember({ id: m.serverId ?? undefined, data: memberDraftToPayload(m) }).unwrap();
      const next = local.map((x) => (x.id === m.id ? { ...x, serverId: saved.id } : x));
      write(next);
      return next;
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not save team member"));
      return null;
    }
  };

  const remove = async (m: InteriorTeamMemberDraft) => {
    if (m.serverId) {
      try {
        await deleteMember(m.serverId).unwrap();
      } catch (e) {
        return toast.error(apiErrorMessage(e, "Could not remove team member"));
      }
    }
    write(members.filter((x) => x.id !== m.id));
  };

  return (
    <div className="space-y-4">
      {members.length === 0 ? (
        <EmptyState
          icon={<Users className="size-5" />}
          title="Introduce your team"
          description="Clients like to know who will design their home. Add photo, role and experience."
          action={<button type="button" className={primaryBtn} onClick={() => setEditing(emptyMember())}><Plus className="size-4" /> Add a member</button>}
        />
      ) : (
        <>
          <ul className="grid gap-3 sm:grid-cols-2">
            {members.map((m) => (
              <li key={m.id} className={cn("flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900", !m.isPublic && "opacity-60")}>
                {m.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo} alt="" className="size-12 rounded-full object-cover" />
                ) : (
                  <span className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-sm font-bold dark:bg-slate-800">{m.name.slice(0, 2).toUpperCase() || "?"}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{m.name || "Unnamed"}</p>
                  <p className="truncate text-xs text-slate-500">{[m.designation, m.experienceYears != null ? `${m.experienceYears} yrs` : ""].filter(Boolean).join(" · ")}</p>
                </div>
                <button type="button" aria-label={`Edit ${m.name}`} className={ghostIconBtn} onClick={() => setEditing(m)}><Pencil className="size-4" /></button>
                <button type="button" aria-label={`Remove ${m.name}`} className={ghostIconBtn} onClick={() => remove(m)}><Trash2 className="size-4" /></button>
              </li>
            ))}
          </ul>
          <button type="button" className={secondaryBtn} onClick={() => setEditing(emptyMember())}><Plus className="size-4" /> Add member</button>
        </>
      )}

      {editing && (
        <MemberEditor
          key={editing.id}
          member={editing}
          branches={branches}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={async (m) => {
            if (!m.name.trim() || !m.designation.trim()) return toast.error("Add a name and role");
            if (await persist(m)) setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function MemberEditor({
  member,
  branches,
  saving,
  onClose,
  onSave,
}: {
  member: InteriorTeamMemberDraft;
  branches: InteriorBranchDraft[];
  saving: boolean;
  onClose: () => void;
  onSave: (m: InteriorTeamMemberDraft) => void;
}) {
  const [m, setM] = useState(member);
  const set = <K extends keyof InteriorTeamMemberDraft>(k: K, v: InteriorTeamMemberDraft[K]) => setM((x) => ({ ...x, [k]: v }));
  return (
    <EditorPanel
      open
      onOpenChange={(o) => !o && onClose()}
      title={member.name ? `Edit ${member.name}` : "Add team member"}
      footer={
        <>
          <button type="button" className={secondaryBtn} onClick={onClose}>Cancel</button>
          <button type="button" className={primaryBtn} disabled={saving} onClick={() => onSave(m)}>{saving && <Loader2 className="size-4 animate-spin" />} Save</button>
        </>
      }
    >
      <ImageUpload label="Photo" aspect="square" subFolder="profile" value={m.photo} onChange={(v) => set("photo", v)} />
      <Field label="Name" required>{(id) => <input id={id} className={inputCls} value={m.name} onChange={(e) => set("name", e.target.value)} />}</Field>
      <Field label="Role" required>
        {(id) => (
          <>
            <input id={id} list={`${id}-roles`} className={inputCls} value={m.designation} placeholder="e.g. Interior designer" onChange={(e) => set("designation", e.target.value)} />
            <datalist id={`${id}-roles`}>{ROLES.map((r) => <option key={r} value={r} />)}</datalist>
          </>
        )}
      </Field>
      <Field label="Years of experience">{() => <Stepper label="Years of experience" value={m.experienceYears} onChange={(v) => set("experienceYears", v)} max={60} suffix="yrs" />}</Field>
      <Field label="Qualification">{(id) => <input id={id} className={inputCls} value={m.qualification} placeholder="e.g. B.Des, NID" onChange={(e) => set("qualification", e.target.value)} />}</Field>
      {branches.length > 0 && (
        <Field label="Works from">
          {(id) => (
            <select id={id} className={inputCls} value={m.branchId ?? ""} onChange={(e) => set("branchId", e.target.value ? Number(e.target.value) : null)}>
              <option value="">All locations</option>
              {branches.map((b) => <option key={b.id} value={b.serverId!}>{b.branchName || b.city}</option>)}
            </select>
          )}
        </Field>
      )}
      <Toggle checked={m.isPublic} onChange={(v) => set("isPublic", v)} label="Show on public profile" />
    </EditorPanel>
  );
}
