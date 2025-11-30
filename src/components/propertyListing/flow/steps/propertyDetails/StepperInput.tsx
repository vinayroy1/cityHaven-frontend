import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type StepperInputProps = {
  field: { value: number | null | undefined; onChange: (value: number) => void };
  min?: number;
  max?: number;
  disabled?: boolean;
};

export const StepperInput: React.FC<StepperInputProps> = ({ field, min = 0, max = 20, disabled }) => {
  const value = typeof field.value === "number" ? field.value : 0;
  const clamp = (val: number) => Math.min(Math.max(min, val), max);

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="icon" onClick={() => field.onChange(clamp(value - 1))} disabled={disabled || value <= min}>
        -
      </Button>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const next = e.target.value === "" ? min : Number(e.target.value);
          field.onChange(Number.isNaN(next) ? min : clamp(next));
        }}
        className="w-20 text-center"
        disabled={disabled}
      />
      <Button type="button" variant="outline" size="icon" onClick={() => field.onChange(clamp(value + 1))} disabled={disabled || value >= max}>
        +
      </Button>
    </div>
  );
};
