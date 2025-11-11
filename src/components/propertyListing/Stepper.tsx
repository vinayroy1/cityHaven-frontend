"use client";
import React from 'react';
import * as Progress from '@radix-ui/react-progress';

interface StepperProps {
  currentStep: number; // 1..7
}

const steps = [
  { id: 1, label: 'Basic Details' },
  { id: 2, label: 'Location' },
  { id: 3, label: 'Property Profile' },
  { id: 4, label: 'Photos & Videos' },
  { id: 5, label: 'Pricing' },
  { id: 6, label: 'Amenities' },
  { id: 7, label: 'Review' },
];

export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  const percent = Math.round(((currentStep - 1) / steps.length) * 100);

  return (
    <div className="w-full">
      {/* Mobile: sticky, compact segmented indicator */}
      <div className="sm:hidden sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs text-muted-foreground">Step {currentStep} of {steps.length}</span>
          <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-[11px] px-2 py-1">
            {percent}%
          </span>
        </div>
        <div className="px-3 pb-2">
          <div className="grid grid-cols-7 gap-1" aria-label="Progress through steps">
            {steps.map((s) => {
              const filled = s.id <= currentStep;
              const isCurrent = s.id === currentStep;
              return (
                <div
                  key={s.id}
                  className={`h-1.5 rounded-full ${filled ? 'bg-blue-600' : 'bg-gray-300'} ${isCurrent ? 'shadow-[0_0_0_2px_rgba(37,99,235,0.3)]' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                />
              );
            })}
          </div>
          <div className="mt-2 text-center text-[11px] text-muted-foreground">
            {steps.find(s => s.id === currentStep)?.label}
          </div>
        </div>
      </div>

      {/* Desktop: full step chips with progress bar */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600 font-medium">List Your Property</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Step {currentStep} of {steps.length}</span>
            <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-xs px-2 py-1">{percent}% Complete</span>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            return (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={
                    `flex items-center justify-center h-8 w-8 rounded-full border ${
                      isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'
                    }`
                  }
                >
                  {step.id}
                </div>
                <span className={`text-xs ${isActive ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
        <Progress.Root className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 mt-4" value={percent}>
          <Progress.Indicator
            className="h-full w-full flex-1 bg-blue-600"
            style={{ transform: `translateX(-${100 - percent}%)` }}
          />
        </Progress.Root>
      </div>
    </div>
  );
};

Stepper.displayName = 'Stepper';
