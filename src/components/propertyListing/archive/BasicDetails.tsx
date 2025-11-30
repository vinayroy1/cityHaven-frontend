"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Building2, Home, Building, TreePine, Factory, Store, Warehouse } from 'lucide-react';

type ListingType = 'sell' | 'rent' | 'pg';
type PropertyCategory = 'residential' | 'commercial';
interface BasicDetailsData {
  listingType: ListingType;
  propertyCategory: PropertyCategory;
  propertyType: string;
}

interface BasicDetailsProps {
  data?: Partial<BasicDetailsData>;
  onNext?: (data: Partial<BasicDetailsData>) => void;
}

const propertyTypes = {
  residential: [
    { id: 'apartment', name: 'Apartment', icon: Building2 },
    { id: 'independent-house', name: 'Independent House', icon: Home },
    { id: 'villa', name: 'Villa', icon: Home },
    { id: 'plot', name: 'Plot', icon: TreePine },
    { id: 'builder-floor', name: 'Builder Floor', icon: Building },
    { id: 'farmhouse', name: 'Farm House', icon: TreePine },
  ],
  commercial: [
    { id: 'office', name: 'Office Space', icon: Building },
    { id: 'shop', name: 'Shop/Showroom', icon: Store },
    { id: 'commercial-plot', name: 'Commercial Plot', icon: TreePine },
    { id: 'warehouse', name: 'Warehouse', icon: Warehouse },
    { id: 'industrial', name: 'Industrial Building', icon: Factory },
    { id: 'commercial-building', name: 'Commercial Building', icon: Building2 },
  ],
};

export function BasicDetails({ data, onNext }: BasicDetailsProps) {
  const [listingType, setListingType] = useState<ListingType>(data?.listingType ?? 'sell');
  const [propertyCategory, setPropertyCategory] = useState<PropertyCategory>(
    data?.propertyCategory ?? 'residential'
  );
  const [propertyType, setPropertyType] = useState<string>(data?.propertyType ?? '');

  const handleContinue = () => {
    if (!propertyType) {
      alert('Please select a property type');
      return;
    }
    onNext?.({ listingType, propertyCategory, propertyType });
  };

  return (
    <div className="space-y-8">
      {/* Listing Type */}
      <div>
        <h3 className="mb-4">I'm looking to</h3>
        <RadioGroup value={listingType} onValueChange={(value: any) => setListingType(value)}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`
                relative rounded-lg border-2 p-4 cursor-pointer transition-all
                ${listingType === 'sell' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => setListingType('sell')}
            >
              <RadioGroupItem value="sell" id="sell" className="absolute top-4 right-4" />
              <Label htmlFor="sell" className="cursor-pointer">
                <div className="space-y-1">
                  <p>Sell</p>
                  <p className="text-sm text-gray-500">I want to sell my property</p>
                </div>
              </Label>
            </div>

            <div
              className={`
                relative rounded-lg border-2 p-4 cursor-pointer transition-all
                ${listingType === 'rent' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => setListingType('rent')}
            >
              <RadioGroupItem value="rent" id="rent" className="absolute top-4 right-4" />
              <Label htmlFor="rent" className="cursor-pointer">
                <div className="space-y-1">
                  <p>Rent</p>
                  <p className="text-sm text-gray-500">I want to rent out</p>
                </div>
              </Label>
            </div>

            <div
              className={`
                relative rounded-lg border-2 p-4 cursor-pointer transition-all
                ${listingType === 'pg' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => setListingType('pg')}
            >
              <RadioGroupItem value="pg" id="pg" className="absolute top-4 right-4" />
              <Label htmlFor="pg" className="cursor-pointer">
                <div className="space-y-1">
                  <p>PG</p>
                  <p className="text-sm text-gray-500">Paying guest accommodation</p>
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Property Type */}
      <div>
        <h3 className="mb-4">Property Type</h3>
        
        {/* Category Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            type="button"
            variant={propertyCategory === 'residential' ? 'default' : 'outline'}
            onClick={() => setPropertyCategory('residential')}
            className="flex-1"
          >
            Residential
          </Button>
          <Button
            type="button"
            variant={propertyCategory === 'commercial' ? 'default' : 'outline'}
            onClick={() => setPropertyCategory('commercial')}
            className="flex-1"
          >
            Commercial
          </Button>
        </div>

        {/* Property Type Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {propertyTypes[propertyCategory].map((type) => {
            const Icon = type.icon;
            const isSelected = propertyType === type.id;
            
            return (
              <div
                key={type.id}
                className={`
                  rounded-lg border-2 p-4 cursor-pointer transition-all
                  flex flex-col items-center gap-3 hover:shadow-md
                  ${isSelected 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => setPropertyType(type.id)}
              >
                <Icon className={`w-8 h-8 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className={`text-center ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                  {type.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button onClick={handleContinue} size="lg" className="bg-blue-600 hover:bg-blue-700">
          Continue
        </Button>
      </div>
    </div>
  );
}
