"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Minus, Plus } from 'lucide-react';
import type { PropertyListingData } from '@/types/propertyListing.types';

interface PropertyProfileProps {
  data?: PropertyListingData;
  onNext?: (data: Partial<PropertyListingData>) => void;
  onBack?: () => void;
}

const furnishingItems = [
  { id: 'bed', name: 'Bed' },
  { id: 'wardrobe', name: 'Wardrobe' },
  { id: 'tv', name: 'TV' },
  { id: 'ac', name: 'AC' },
  { id: 'sofa', name: 'Sofa' },
  { id: 'dining', name: 'Dining Table' },
  { id: 'fridge', name: 'Fridge' },
  { id: 'washing', name: 'Washing Machine' },
  { id: 'microwave', name: 'Microwave' },
  { id: 'stove', name: 'Stove' },
];

const otherRoomOptions = [
  { id: 'pooja', name: 'Pooja Room' },
  { id: 'study', name: 'Study Room' },
  { id: 'servant', name: 'Servant Room' },
  { id: 'store', name: 'Store Room' },
];

export function PropertyProfile({ data = {}, onNext, onBack }: PropertyProfileProps) {
  const [bedrooms, setBedrooms] = useState(data.bedrooms || 2);
  const [bathrooms, setBathrooms] = useState(data.bathrooms || 2);
  const [balconies, setBalconies] = useState(data.balconies || 1);
  const [carpetArea, setCarpetArea] = useState((data.carpetArea as any) || '');
  const [builtUpArea, setBuiltUpArea] = useState((data.builtUpArea as any) || '');
  const [superBuiltUpArea, setSuperBuiltUpArea] = useState((data.superBuiltUpArea as any) || '');
  const [furnishingLevel, setFurnishingLevel] = useState<'furnished' | 'semi-furnished' | 'unfurnished'>(
    data.furnishingLevel || 'unfurnished'
  );
  const [furnishingDetails, setFurnishingDetails] = useState<Record<string, number>>(
    data.furnishingDetails || {}
  );
  const [coveredParking, setCoveredParking] = useState(data.coveredParking || 0);
  const [openParking, setOpenParking] = useState(data.openParking || 0);
  const [totalFloors, setTotalFloors] = useState((data.totalFloors as any) || '');
  const [propertyFloor, setPropertyFloor] = useState((data.propertyFloor as any) || '');
  const [propertyAge, setPropertyAge] = useState(data.propertyAge || '');
  const [otherRooms, setOtherRooms] = useState<string[]>(data.otherRooms || []);

  const handleContinue = () => {
    if (!carpetArea) {
      alert('Please enter carpet area');
      return;
    }
    onNext?.({
      bedrooms,
      bathrooms,
      balconies,
      carpetArea: Number(carpetArea),
      builtUpArea: Number(builtUpArea),
      superBuiltUpArea: Number(superBuiltUpArea),
      furnishingLevel,
      furnishingDetails,
      coveredParking,
      openParking,
      totalFloors: Number(totalFloors),
      propertyFloor: Number(propertyFloor),
      propertyAge,
      otherRooms,
    });
  };

  const NumberSelector = ({ value, onChange, min = 0, max = 10 }: any) => (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => value > min && onChange(value - 1)}
        disabled={value <= min}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="w-12 text-center">{value}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => value < max && onChange(value + 1)}
        disabled={value >= max}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      <h3>Tell us about your property</h3>

      {/* Room Configuration */}
      <div className="space-y-4">
        <h4>Room Configuration</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <NumberSelector value={bedrooms} onChange={setBedrooms} min={1} />
          </div>
          
          <div className="space-y-2">
            <Label>Bathrooms</Label>
            <NumberSelector value={bathrooms} onChange={setBathrooms} min={1} />
          </div>
          
          <div className="space-y-2">
            <Label>Balconies</Label>
            <NumberSelector value={balconies} onChange={setBalconies} />
          </div>
        </div>
      </div>

      {/* Area Details */}
      <div className="space-y-4">
        <h4>Area Details</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="carpetArea">Carpet Area (sq.ft) *</Label>
            <Input
              id="carpetArea"
              type="number"
              value={carpetArea}
              onChange={(e) => setCarpetArea(e.target.value)}
              placeholder="1200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="builtUpArea">Built-up Area (sq.ft)</Label>
            <Input
              id="builtUpArea"
              type="number"
              value={builtUpArea}
              onChange={(e) => setBuiltUpArea(e.target.value)}
              placeholder="1500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="superBuiltUpArea">Super Built-up Area (sq.ft)</Label>
            <Input
              id="superBuiltUpArea"
              type="number"
              value={superBuiltUpArea}
              onChange={(e) => setSuperBuiltUpArea(e.target.value)}
              placeholder="1800"
            />
          </div>
        </div>
      </div>

      {/* Other Rooms */}
      <div className="space-y-4">
        <h4>Additional Rooms</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {otherRoomOptions.map((room) => (
            <div key={room.id} className="flex items-center gap-2">
              <Checkbox
                id={room.id}
                checked={otherRooms.includes(room.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setOtherRooms([...otherRooms, room.id]);
                  } else {
                    setOtherRooms(otherRooms.filter(r => r !== room.id));
                  }
                }}
              />
              <Label htmlFor={room.id} className="cursor-pointer">
                {room.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Furnishing Level */}
      <div className="space-y-4">
        <h4>Furnishing Status</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['unfurnished', 'semi-furnished', 'furnished'] as const).map((level) => (
            <div
              key={level}
              className={`
                rounded-lg border-2 p-4 cursor-pointer transition-all
                ${furnishingLevel === level 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => setFurnishingLevel(level)}
            >
              <p className="capitalize">{level.replace('-', ' ')}</p>
            </div>
          ))}
        </div>

        {/* Furnishing Details */}
        {furnishingLevel !== 'unfurnished' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
            {furnishingItems.map((item) => (
              <div key={item.id} className="space-y-2">
                <Label className="text-sm">{item.name}</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setFurnishingDetails({
                      ...furnishingDetails,
                      [item.id]: Math.max(0, (furnishingDetails[item.id] || 0) - 1)
                    })}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">{furnishingDetails[item.id] || 0}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setFurnishingDetails({
                      ...furnishingDetails,
                      [item.id]: (furnishingDetails[item.id] || 0) + 1
                    })}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parking */}
      <div className="space-y-4">
        <h4>Parking</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Covered Parking</Label>
            <NumberSelector value={coveredParking} onChange={setCoveredParking} />
          </div>
          
          <div className="space-y-2">
            <Label>Open Parking</Label>
            <NumberSelector value={openParking} onChange={setOpenParking} />
          </div>
        </div>
      </div>

      {/* Floor Details */}
      <div className="space-y-4">
        <h4>Floor Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="propertyFloor">Property on Floor</Label>
            <Input
              id="propertyFloor"
              type="number"
              value={propertyFloor}
              onChange={(e) => setPropertyFloor(e.target.value)}
              placeholder="3"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="totalFloors">Total Floors</Label>
            <Input
              id="totalFloors"
              type="number"
              value={totalFloors}
              onChange={(e) => setTotalFloors(e.target.value)}
              placeholder="10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="propertyAge">Age of Property</Label>
            <Select value={propertyAge} onValueChange={setPropertyAge}>
              <SelectTrigger id="propertyAge">
                <SelectValue placeholder="Select age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-1">0-1 years</SelectItem>
                <SelectItem value="1-5">1-5 years</SelectItem>
                <SelectItem value="5-10">5-10 years</SelectItem>
                <SelectItem value="10-15">10-15 years</SelectItem>
                <SelectItem value="15+">15+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
