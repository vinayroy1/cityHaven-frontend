"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, TrendingUp } from 'lucide-react';
import type { PropertyListingData } from '@/types/propertyListing.types';

interface PricingDetailsProps {
  data?: PropertyListingData;
  onNext?: (data: Partial<PropertyListingData>) => void;
  onBack?: () => void;
}

export function PricingDetails({ data = {}, onNext, onBack }: PricingDetailsProps) {
  const ownershipOptions = ['freehold', 'leasehold', 'co-op', 'power-of-attorney'] as const;
  type OwnershipOption = typeof ownershipOptions[number];
  const [ownershipType, setOwnershipType] = useState<OwnershipOption>((data.ownershipType as OwnershipOption) || 'freehold');
  const [expectedPrice, setExpectedPrice] = useState((data.expectedPrice as any) || '');
  const [areaBasis, setAreaBasis] = useState<'carpet' | 'builtup' | 'superbuiltup'>(data.areaBasis || 'carpet');
  const [pricePerSqft, setPricePerSqft] = useState(data.pricePerSqft || 0);
  const [allInclusive, setAllInclusive] = useState(!!data.allInclusive);
  const [taxExcluded, setTaxExcluded] = useState(!!data.taxExcluded);
  const [negotiable, setNegotiable] = useState(!!data.negotiable);
  const [maintenance, setMaintenance] = useState((data.maintenance as any) || '');
  const [maintenanceFrequency, setMaintenanceFrequency] = useState<'monthly' | 'quarterly' | 'yearly'>(
    (data.maintenanceFrequency as 'monthly' | 'quarterly' | 'yearly') || 'monthly'
  );
  const [bookingAmount, setBookingAmount] = useState((data.bookingAmount as any) || '');
  const [annualDues, setAnnualDues] = useState((data.annualDues as any) || '');
  const [membershipCharges, setMembershipCharges] = useState((data.membershipCharges as any) || '');
  const [description, setDescription] = useState(data.description || '');

  // Auto-calculate price per sq ft
  useEffect(() => {
    if (expectedPrice && data.carpetArea) {
      const area = areaBasis === 'carpet' ? data.carpetArea :
                   areaBasis === 'builtup' ? data.builtUpArea :
                   data.superBuiltUpArea;
      
      if (area) {
        setPricePerSqft(Math.round(Number(expectedPrice) / area));
      }
    }
  }, [expectedPrice, areaBasis, data.carpetArea, data.builtUpArea, data.superBuiltUpArea]);

  const handleContinue = () => {
    if (!expectedPrice || !description) {
      alert('Please fill in required fields (Expected Price and Description)');
      return;
    }
    if (description.length < 30) {
      alert('Description should be at least 30 characters');
      return;
    }
    onNext?.({
      ownershipType,
      expectedPrice: Number(expectedPrice),
      pricePerSqft,
      areaBasis,
      allInclusive,
      taxExcluded,
      negotiable,
      maintenance: Number(maintenance),
      maintenanceFrequency,
      bookingAmount: Number(bookingAmount),
      annualDues: Number(annualDues),
      membershipCharges: Number(membershipCharges),
      description,
    });
  };

  const generateDescription = () => {
    const bedrooms = data.bedrooms || 2;
    const locality = data.locality || 'prime locality';
    const city = data.city || 'city';
    const area = data.carpetArea || 1200;
    
    const sample = `Spacious ${bedrooms} BHK apartment in ${locality}, ${city}. This beautiful property offers ${area} sq.ft of carpet area with modern amenities and excellent connectivity. Perfect for families looking for a comfortable living space in a well-maintained society with 24/7 security, power backup, and ample parking space.`;
    
    setDescription(sample);
  };

  return (
    <div className="space-y-8">
      <h3>Pricing & Property Details</h3>

      {/* Ownership Type */}
      <div className="space-y-4">
        <Label>Ownership Type</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ownershipOptions.map((type) => (
            <div
              key={type}
              className={`
                rounded-lg border-2 p-3 cursor-pointer transition-all text-center
                ${ownershipType === type 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => setOwnershipType(type)}
            >
              <p className="capitalize text-sm">{type.replace('-', ' ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Price Section */}
      <div className="space-y-4">
        <h4>Price Information</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="expectedPrice">Expected Price (₹) *</Label>
            <Input
              id="expectedPrice"
              type="number"
              value={expectedPrice}
              onChange={(e) => setExpectedPrice(e.target.value)}
              placeholder="5000000"
            />
            {expectedPrice && (
              <p className="text-sm text-gray-600">
                ₹ {Number(expectedPrice).toLocaleString('en-IN')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="areaBasis">Calculate based on</Label>
            <Select value={areaBasis} onValueChange={(value: any) => setAreaBasis(value)}>
              <SelectTrigger id="areaBasis">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="carpet">Carpet Area</SelectItem>
                <SelectItem value="builtup">Built-up Area</SelectItem>
                <SelectItem value="superbuiltup">Super Built-up Area</SelectItem>
              </SelectContent>
            </Select>
            {pricePerSqft > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>₹ {pricePerSqft.toLocaleString('en-IN')} per sq.ft</span>
              </div>
            )}
          </div>
        </div>

        {/* Price Options */}
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="allInclusive"
              checked={allInclusive}
              onCheckedChange={(checked) => setAllInclusive(checked as boolean)}
            />
            <Label htmlFor="allInclusive" className="cursor-pointer">
              All inclusive price
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox
              id="taxExcluded"
              checked={taxExcluded}
              onCheckedChange={(checked) => setTaxExcluded(checked as boolean)}
            />
            <Label htmlFor="taxExcluded" className="cursor-pointer">
              Tax & Govt. charges excluded
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox
              id="negotiable"
              checked={negotiable}
              onCheckedChange={(checked) => setNegotiable(checked as boolean)}
            />
            <Label htmlFor="negotiable" className="cursor-pointer">
              Price Negotiable
            </Label>
          </div>
        </div>
      </div>

      {/* Additional Costs */}
      <div className="space-y-4">
        <h4>Additional Costs (Optional)</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="maintenance">Maintenance (₹)</Label>
            <div className="flex gap-2">
              <Input
                id="maintenance"
                type="number"
                value={maintenance}
                onChange={(e) => setMaintenance(e.target.value)}
                placeholder="5000"
                className="flex-1"
              />
              <Select value={maintenanceFrequency} onValueChange={(v) => setMaintenanceFrequency(v as 'monthly' | 'quarterly' | 'yearly')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bookingAmount">Booking Amount (₹)</Label>
            <Input
              id="bookingAmount"
              type="number"
              value={bookingAmount}
              onChange={(e) => setBookingAmount(e.target.value)}
              placeholder="100000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualDues">Annual Dues (₹)</Label>
            <Input
              id="annualDues"
              type="number"
              value={annualDues}
              onChange={(e) => setAnnualDues(e.target.value)}
              placeholder="12000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="membershipCharges">Membership Charges (₹)</Label>
            <Input
              id="membershipCharges"
              type="number"
              value={membershipCharges}
              onChange={(e) => setMembershipCharges(e.target.value)}
              placeholder="50000"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4>Property Description *</h4>
            <p className="text-sm text-gray-600">What makes your property unique?</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateDescription}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Suggest
          </Button>
        </div>
        
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your property, nearby amenities, connectivity, and what makes it special..."
          rows={6}
          maxLength={5000}
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>Minimum 30 characters</span>
          <span>{description.length}/5000</span>
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
