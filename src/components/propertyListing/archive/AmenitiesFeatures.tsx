"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, Droplets, Zap, Wind, Dumbbell, Waves, Trees, GraduationCap, ShoppingCart, Train, TrendingUp } from 'lucide-react';
import type { PropertyListingData } from '@/types/propertyListing.types';

interface AmenitiesFeaturesProps {
  data?: PropertyListingData;
  onNext?: (data: Partial<PropertyListingData>) => void;
  onBack?: () => void;
}

const amenitiesData = [
  { id: 'maintenance-staff', name: 'Maintenance Staff', category: 'amenities' },
  { id: 'water-storage', name: 'Water Storage', category: 'amenities' },
  { id: 'waste-disposal', name: 'Waste Disposal', category: 'amenities' },
  { id: 'rain-water-harvest', name: 'Rain Water Harvesting', category: 'amenities' },
  { id: 'water-purifier', name: 'Water Purifier', category: 'amenities' },
  { id: 'piped-gas', name: 'Piped Gas', category: 'amenities' },
];

const propertyFeaturesData = [
  { id: 'high-ceiling', name: 'High Ceiling Height', category: 'property' },
  { id: 'false-ceiling', name: 'False Ceiling', category: 'property' },
  { id: 'tile-marble', name: 'Tile/Marble Flooring', category: 'property' },
  { id: 'wooden-flooring', name: 'Wooden Flooring', category: 'property' },
  { id: 'modular-kitchen', name: 'Modular Kitchen', category: 'property' },
  { id: 'air-conditioning', name: 'Air Conditioning', category: 'property' },
  { id: 'intercom', name: 'Intercom Facility', category: 'property' },
  { id: 'servant-room', name: 'Servant Room', category: 'property' },
];

const societyFeaturesData = [
  { id: 'gym', name: 'Gym', icon: Dumbbell, category: 'society' },
  { id: 'swimming-pool', name: 'Swimming Pool', icon: Waves, category: 'society' },
  { id: 'club-house', name: 'Club House', icon: Shield, category: 'society' },
  { id: 'park', name: 'Park/Garden', icon: Trees, category: 'society' },
  { id: 'security', name: '24x7 Security', icon: Shield, category: 'society' },
  { id: 'power-backup', name: 'Power Backup', icon: Zap, category: 'society' },
  { id: 'lift', name: 'Lift', category: 'society' },
  { id: 'visitor-parking', name: 'Visitor Parking', category: 'society' },
  { id: 'play-area', name: "Children's Play Area", category: 'society' },
  { id: 'cctv', name: 'CCTV Surveillance', category: 'society' },
];

const locationAdvantagesData = [
  { id: 'near-metro', name: 'Near Metro Station', icon: Train, category: 'location' },
  { id: 'near-school', name: 'Near Schools', icon: GraduationCap, category: 'location' },
  { id: 'near-hospital', name: 'Near Hospital', category: 'location' },
  { id: 'near-market', name: 'Near Market', icon: ShoppingCart, category: 'location' },
  { id: 'near-mall', name: 'Near Shopping Mall', category: 'location' },
  { id: 'near-highway', name: 'Near Highway', category: 'location' },
  { id: 'near-airport', name: 'Near Airport', category: 'location' },
  { id: 'near-park', name: 'Near Park', category: 'location' },
];

export function AmenitiesFeatures({ data = {}, onNext, onBack }: AmenitiesFeaturesProps) {
  const [amenities, setAmenities] = useState<string[]>(data.amenities || []);
  const [propertyFeatures, setPropertyFeatures] = useState<string[]>(data.propertyFeatures || []);
  const [societyFeatures, setSocietyFeatures] = useState<string[]>(data.societyFeatures || []);
  const [locationAdvantages, setLocationAdvantages] = useState<string[]>(data.locationAdvantages || []);

  const toggleItem = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const totalSelected = amenities.length + propertyFeatures.length + societyFeatures.length + locationAdvantages.length;
  const totalAvailable = amenitiesData.length + propertyFeaturesData.length + societyFeaturesData.length + locationAdvantagesData.length;
  const completionPercentage = Math.round((totalSelected / totalAvailable) * 100);

  const handleContinue = () => {
    onNext?.({
      amenities,
      propertyFeatures,
      societyFeatures,
      locationAdvantages,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3>Amenities & Features</h3>
          <p className="text-gray-600">
            More details help buyers make better decisions
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-green-600">{completionPercentage}% Complete</span>
          </div>
          <p className="text-sm text-gray-600">
            {totalSelected} of {totalAvailable} selected
          </p>
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-600" />
          Amenities
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {amenitiesData.map((item) => (
            <div
              key={item.id}
              className={`
                flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${amenities.includes(item.id) 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => toggleItem(item.id, amenities, setAmenities)}
            >
              <Checkbox
                id={item.id}
                checked={amenities.includes(item.id)}
                onCheckedChange={() => {}}
              />
              <Label htmlFor={item.id} className="cursor-pointer flex-1">
                {item.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Property Features */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-blue-600" />
          Property Features
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {propertyFeaturesData.map((item) => (
            <div
              key={item.id}
              className={`
                flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${propertyFeatures.includes(item.id) 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => toggleItem(item.id, propertyFeatures, setPropertyFeatures)}
            >
              <Checkbox
                id={item.id}
                checked={propertyFeatures.includes(item.id)}
                onCheckedChange={() => {}}
              />
              <Label htmlFor={item.id} className="cursor-pointer flex-1">
                {item.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Society Features */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Society Features
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {societyFeaturesData.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`
                  flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${societyFeatures.includes(item.id) 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => toggleItem(item.id, societyFeatures, setSocietyFeatures)}
              >
                <Checkbox
                  id={item.id}
                  checked={societyFeatures.includes(item.id)}
                  onCheckedChange={() => {}}
                />
                <Label htmlFor={item.id} className="cursor-pointer flex-1 flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.name}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location Advantages */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2">
          <Train className="w-5 h-5 text-blue-600" />
          Location Advantages
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {locationAdvantagesData.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`
                  flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${locationAdvantages.includes(item.id) 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => toggleItem(item.id, locationAdvantages, setLocationAdvantages)}
              >
                <Checkbox
                  id={item.id}
                  checked={locationAdvantages.includes(item.id)}
                  onCheckedChange={() => {}}
                />
                <Label htmlFor={item.id} className="cursor-pointer flex-1 flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.name}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Suggestions */}
      {completionPercentage < 80 && (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-900">
            💡 Complete 80% of features for better visibility and more enquiries
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button onClick={onBack} variant="outline" size="lg">
          Back
        </Button>
        <Button onClick={handleContinue} size="lg" className="bg-blue-600 hover:bg-blue-700">
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
