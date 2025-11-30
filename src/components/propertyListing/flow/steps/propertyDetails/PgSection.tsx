import React from "react";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/components/ui/utils";
import { NumberInput } from "../StepCommon";
import type { StepProps } from "../StepCommon";

type PgSectionProps = StepProps & {
  isPG: boolean;
};

export const PgSection: React.FC<PgSectionProps> = ({ form, isPG }) => {
  if (!isPG) return null;

  return (
    <Card className="border border-slate-100 bg-white p-5 shadow-xl">
      <p className="mb-3 text-sm font-semibold text-slate-800">PG specific</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="details.pgFor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allowed for</FormLabel>
              <RadioGroup className="flex flex-wrap gap-3" value={field.value ?? ""} onValueChange={field.onChange}>
                {["BOYS", "GIRLS", "UNISEX"].map((option) => (
                  <label
                    key={option}
                    className={cn(
                      "flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm",
                      field.value === option ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-700",
                    )}
                  >
                    <RadioGroupItem value={option} />
                    {option}
                  </label>
                ))}
              </RadioGroup>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="details.foodIncluded"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
              <FormLabel className="text-sm text-slate-800">Food included</FormLabel>
              <FormControl>
                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        {form.watch("details.foodIncluded") && (
          <FormField
            control={form.control}
            name="details.mealType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meal type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Breakfast / Dinner / Both" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BREAKFAST">Breakfast</SelectItem>
                    <SelectItem value="DINNER">Dinner</SelectItem>
                    <SelectItem value="BOTH">Both</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="details.sharingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sharing type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="1 / 2 / 3 / 4 sharing" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SINGLE">1 Sharing</SelectItem>
                  <SelectItem value="DOUBLE">2 Sharing</SelectItem>
                  <SelectItem value="TRIPLE">3 Sharing</SelectItem>
                  <SelectItem value="QUAD">4 Sharing</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="details.securityDeposit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Security deposit</FormLabel>
              <NumberInput field={field} placeholder="10000" />
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
};
