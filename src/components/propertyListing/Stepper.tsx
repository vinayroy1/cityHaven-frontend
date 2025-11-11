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
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600 font-medium">
          List Your Property
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-gray-500">Step {currentStep} of {steps.length}</span>
          <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-xs px-2 py-1">
            {percent}% Complete
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2 flex-nowrap sm:flex-wrap">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          return (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={
                  `flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full border ${
                    isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'
                  }`
                }
              >
                {step.id}
              </div>
              <span className={`whitespace-nowrap text-[11px] sm:text-xs ${isActive ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>{step.label}</span>
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
  );
};

Stepper.displayName = 'Stepper';