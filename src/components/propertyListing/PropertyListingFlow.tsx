"use client";
import React, { useState } from 'react';
import { Stepper } from '@/components/propertyListing/Stepper';
import { BasicDetails } from '@/components/propertyListing/BasicDetails';
import { LocationDetails } from '@/components/propertyListing/LocationDetails';
import { PropertyProfile } from '@/components/propertyListing/PropertyProfile';
import { PhotosVideos } from '@/components/propertyListing/PhotosVideos';
import { PricingDetails } from '@/components/propertyListing/PricingDetails';
import { AmenitiesFeatures } from '@/components/propertyListing/AmenitiesFeatures';
import { ReviewSubmit } from '@/components/propertyListing/ReviewSubmit';
import type { PropertyListingData } from '@/types/propertyListing.types';

export const PropertyListingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<PropertyListingData>({});

  const handleNext = (partial?: Partial<PropertyListingData>) => {
    if (partial) setData(prev => ({ ...prev, ...partial }));
    setCurrentStep(s => Math.min(7, s + 1));
  };

  const handleBack = () => {
    setCurrentStep(s => Math.max(1, s - 1));
  };

  const handleSubmit = (partial?: Partial<PropertyListingData>) => {
    if (partial) setData(prev => ({ ...prev, ...partial }));
    // TODO: integrate API submission when backend is ready
    // For now, we can log and show a simple confirmation
    console.log('Submitting property listing:', { ...data, ...partial });
    alert('Property listing prepared. Submission flow can now integrate API.');
  };

  return (
    <div>
      <Stepper currentStep={currentStep} />
      <div className="mt-6">
        {currentStep === 1 && (
          <BasicDetails data={data} onNext={handleNext} />
        )}
        {currentStep === 2 && (
          <LocationDetails data={data} onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 3 && (
          <PropertyProfile data={data} onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 4 && (
          <PhotosVideos data={data} onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 5 && (
          <PricingDetails data={data} onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 6 && (
          <AmenitiesFeatures data={data} onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 7 && (
          <ReviewSubmit data={data} onBack={handleBack} onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  );
};

PropertyListingFlow.displayName = 'PropertyListingFlow';

