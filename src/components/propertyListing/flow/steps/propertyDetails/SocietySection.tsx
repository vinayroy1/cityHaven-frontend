import React from "react";
import { Card } from "@/components/ui/card";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumberInput } from "../StepCommon";
import type { StepProps } from "../StepCommon";

type SocietySectionProps = StepProps & {
  showSocietyDetails: boolean;
  showPossessionDate: boolean;
};

export const SocietySection: React.FC<SocietySectionProps> = ({ form, showSocietyDetails, showPossessionDate }) => {
  if (!showSocietyDetails) return null;

  return (
    <Card className="border border-slate-100 bg-white p-5 shadow-xl">
      <p className="mb-3 text-sm font-semibold text-slate-800">Society / project details</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="location.societyOrProjectName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project / Society name</FormLabel>
              <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Green View Residency" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location.totalTowers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total towers</FormLabel>
              <NumberInput field={field} placeholder="8" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location.totalUnits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total units</FormLabel>
              <NumberInput field={field} placeholder="120" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location.constructionStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Construction status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Ready / Under construction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="READY_TO_MOVE">Ready to move</SelectItem>
                  <SelectItem value="UNDER_CONSTRUCTION">Under construction</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        {showPossessionDate && (
          <FormField
            control={form.control}
            name="location.possessionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Possession date</FormLabel>
                <Input type="date" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} />
              </FormItem>
            )}
          />
        )}
      </div>
    </Card>
  );
};
