import React from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import type { StepProps } from "../StepCommon";

const OTHER_ROOM_OPTIONS = [
  { key: "POOJA_ROOM", label: "Pooja Room" },
  { key: "STUDY_ROOM", label: "Study Room" },
  { key: "SERVANT_ROOM", label: "Servant Room" },
  { key: "STORE_ROOM", label: "Store Room" },
];

type OtherRoomsSectionProps = StepProps & {
  show: boolean;
};

export const OtherRoomsSection: React.FC<OtherRoomsSectionProps> = ({ form, show }) => {
  if (!show) return null;

  const toggle = (key: string) => {
    const current = form.getValues("details.otherRooms") ?? {};
    const next = { ...current, [key]: !current[key] };
    form.setValue("details.otherRooms", next);
  };

  return (
    <Card className="border border-slate-100 bg-white p-5 shadow-xl">
      <p className="mb-3 text-sm font-semibold text-slate-800">Other rooms (optional)</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {OTHER_ROOM_OPTIONS.map((option) => (
          <FormField
            key={option.key}
            control={form.control}
            name={`details.otherRooms.${option.key}` as const}
            render={() => {
              const selected = form.watch("details.otherRooms") ?? {};
              const checked = !!selected[option.key];
              return (
                <FormItem className="flex flex-row items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <FormControl>
                    <Checkbox checked={checked} onCheckedChange={() => toggle(option.key)} />
                  </FormControl>
                  <FormLabel className="text-sm text-slate-800">{option.label}</FormLabel>
                </FormItem>
              );
            }}
          />
        ))}
      </div>
    </Card>
  );
};
