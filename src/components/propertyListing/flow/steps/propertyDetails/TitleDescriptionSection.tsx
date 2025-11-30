import React from "react";
import { Card } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { StepProps } from "../StepCommon";

export const TitleDescriptionSection: React.FC<StepProps> = ({ form }) => (
  <Card className="border border-slate-100 bg-white p-5 shadow-xl">
    <p className="mb-3 text-sm font-semibold text-slate-800">Property title & description</p>
    <FormField
      control={form.control}
      name="meta.title"
      rules={{ required: "Title required" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Property title</FormLabel>
          <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="2 BHK Apartment in HSR Layout" />
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="meta.description"
      render={({ field }) => (
        <FormItem className="mt-3">
          <FormLabel>Property description</FormLabel>
          <Textarea
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
            placeholder="Highlight layout, light, connectivity, upgrades, and society highlights."
            rows={3}
          />
        </FormItem>
      )}
    />
  </Card>
);
