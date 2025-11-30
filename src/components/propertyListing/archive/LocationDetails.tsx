"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Info } from 'lucide-react';
import type { PropertyListingData } from '@/types/propertyListing.types';

interface LocationDetailsProps {
  data?: PropertyListingData;
  onNext?: (data: Partial<PropertyListingData>) => void;
  onBack?: () => void;
}

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Gurgaon', 'Noida'
];

const localitiesByCity: Record<string, string[]> = {
  'Mumbai': ['Andheri', 'Bandra', 'Powai', 'Worli', 'Lower Parel', 'Malad'],
  'Bangalore': ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Electronic City', 'Marathahalli'],
  'Delhi': ['Connaught Place', 'Saket', 'Dwarka', 'Rohini', 'Vasant Kunj', 'Janakpuri'],
  'Pune': ['Kothrud', 'Hinjewadi', 'Wakad', 'Viman Nagar', 'Koregaon Park', 'Aundh'],
};

export function LocationDetails({ data = {}, onNext, onBack }: LocationDetailsProps) {
  const [city, setCity] = useState(data.city || '');
  const [locality, setLocality] = useState(data.locality || '');
  const [subLocality, setSubLocality] = useState(data.subLocality || '');
  const [societyName, setSocietyName] = useState(data.societyName || '');
  const [houseNumber, setHouseNumber] = useState(data.houseNumber || '');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);

  const filteredCities = cities.filter(c => 
    c.toLowerCase().includes(city.toLowerCase())
  );

  const localities = localitiesByCity[city] || [];
  const filteredLocalities = localities.filter(l => 
    l.toLowerCase().includes(locality.toLowerCase())
  );

  const handleContinue = () => {
    if (!city || !locality) {
      alert('Please fill in required fields (City and Locality)');
      return;
    }
    onNext?.({ city, locality, subLocality, societyName, houseNumber });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2">Where is your property located?</h3>
        <p className="text-gray-600">
          Accurate location increases genuine enquiries by 40%
        </p>
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label htmlFor="city">City *</Label>
        <div className="relative">
          <Input
            id="city"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setShowCityDropdown(true);
            }}
            onFocus={() => setShowCityDropdown(true)}
            placeholder="Search for your city"
          />
          {showCityDropdown && filteredCities.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredCities.map((c) => (
                <div
                  key={c}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setCity(c);
                    setShowCityDropdown(false);
                    setLocality('');
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Locality */}
      <div className="space-y-2">
        <Label htmlFor="locality">Locality *</Label>
        <div className="relative">
          <Input
            id="locality"
            value={locality}
            onChange={(e) => {
              setLocality(e.target.value);
              setShowLocalityDropdown(true);
            }}
            onFocus={() => setShowLocalityDropdown(true)}
            placeholder="Search for locality"
            disabled={!city}
          />
          {showLocalityDropdown && filteredLocalities.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredLocalities.map((l) => (
                <div
                  key={l}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setLocality(l);
                    setShowLocalityDropdown(false);
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sub-locality */}
      <div className="space-y-2">
        <Label htmlFor="subLocality">Sub-locality (Optional)</Label>
        <Input
          id="subLocality"
          value={subLocality}
          onChange={(e) => setSubLocality(e.target.value)}
          placeholder="Enter sub-locality"
        />
      </div>

      {/* Society/Project Name */}
      <div className="space-y-2">
        <Label htmlFor="societyName">Society/Project Name</Label>
        <Input
          id="societyName"
          value={societyName}
          onChange={(e) => setSocietyName(e.target.value)}
          placeholder="Enter society or project name"
        />
      </div>

      {/* House Number */}
      <div className="space-y-2">
        <Label htmlFor="houseNumber">House/Flat Number</Label>
        <Input
          id="houseNumber"
          value={houseNumber}
          onChange={(e) => setHouseNumber(e.target.value)}
          placeholder="Enter house/flat number"
        />
      </div>

      {/* Map Preview */}
      {city && locality && (
        <div className="border-2 border-dashed rounded-lg p-8 bg-gray-50">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <MapPin className="w-12 h-12 text-blue-600" />
            <div>
              <p className="text-gray-900">{locality}, {city}</p>
              <p className="text-sm text-gray-600">Location preview</p>
            </div>
            <Button variant="outline" size="sm">
              Verify on Map
            </Button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-900">
            Accurate location increases genuine enquiries by 40%
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Your exact address will only be shared with interested buyers after you approve
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button onClick={onBack} variant="outline" size="lg">
          Back
        </Button>
        <Button onClick={handleContinue} size="lg" className="bg-blue-600 hover:bg-blue-700">
          Continue
        </Button>
      </div>
    </div>
  );
}
