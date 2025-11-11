"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  MapPin, Home, Ruler, IndianRupee, Image as ImageIcon, 
  CheckCircle2, TrendingUp, Edit, Calendar, Save 
} from 'lucide-react';
import type { PropertyListingData } from '@/types/propertyListing.types';

interface ReviewSubmitProps {
  data?: PropertyListingData;
  onBack?: () => void;
  onSubmit?: (data: Partial<PropertyListingData>) => void;
  onEditStep?: (step: number) => void;
}

export function ReviewSubmit({ data = {}, onBack, onSubmit, onEditStep }: ReviewSubmitProps) {
  const [publishOption, setPublishOption] = useState<'immediate' | 'schedule' | 'draft'>('immediate');
  const [scheduleDate, setScheduleDate] = useState('');

  // Calculate property score
  const calculateScore = () => {
    let score = 40; // Base score
    
    if (data.photos && data.photos.length >= 5) score += 20;
    if (data.description && data.description.length > 100) score += 10;
    if (data.amenities && data.amenities.length > 3) score += 10;
    if (data.societyFeatures && data.societyFeatures.length > 3) score += 10;
    if (data.video) score += 10;
    
    return Math.min(score, 100);
  };

  const score = calculateScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent!';
    if (score >= 70) return 'Great';
    if (score >= 55) return 'Good';
    return 'Needs improvement';
  };

  const getImprovements = () => {
    const improvements = [];
    
    if (!data.photos || data.photos.length < 5) {
      improvements.push({ text: 'Add at least 5 photos', impact: '+20%' });
    }
    if (!data.video) {
      improvements.push({ text: 'Add a property video', impact: '+10%' });
    }
    if (!data.description || data.description.length < 100) {
      improvements.push({ text: 'Write a detailed description', impact: '+10%' });
    }
    if (!data.amenities || data.amenities.length < 3) {
      improvements.push({ text: 'Add more amenities', impact: '+10%' });
    }
    
    return improvements;
  };

  const improvements = getImprovements();

  const handleSubmit = () => {
    onSubmit?.({ publishOption });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-2">Review Your Listing</h3>
        <p className="text-gray-600">Make sure all details are correct before publishing</p>
      </div>

      {/* Property Score with quick improvements */}
      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4>Property Score</h4>
                <p className="text-sm text-gray-600">{getScoreLabel(score)}</p>
              </div>
              <div className={`text-right ${getScoreColor(score)}`}>
                <div className="text-3xl font-semibold">{score}</div>
              </div>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full">
              <div
                className={`h-full rounded-full transition-all ${score >= 80 ? 'bg-green-600' : score >= 60 ? 'bg-yellow-600' : 'bg-orange-600'}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-700 mb-2">Quick Improvements</div>
            <div className="space-y-2">
              {improvements.length === 0 && (
                <div className="text-sm text-gray-600">All set. Great job!</div>
              )}
              {improvements.map((imp, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <span className="text-gray-700">{imp.text}</span>
                  <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded-sm text-xs inline-flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {imp.impact} visibility
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Property Preview Card */}
      <Card className="overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
          {data.photos && data.photos.length > 0 ? (
            <ImageIcon className="w-16 h-16 text-blue-300" />
          ) : (
            <div className="text-center">
              <ImageIcon className="w-16 h-16 text-blue-300 mx-auto mb-2" />
              <p className="text-sm text-blue-600">No photos added</p>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-600">{data.listingType?.toUpperCase()}</Badge>
                <Badge variant="outline">{data.propertyType?.replace('-', ' ').toUpperCase()}</Badge>
              </div>
              <h4>
                {data.bedrooms}BHK {data.propertyType?.replace('-', ' ')} in {data.locality}
              </h4>
            </div>
            {data.expectedPrice && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Expected Price</p>
                <p className="text-green-600">
                  <IndianRupee className="inline w-4 h-4" />
                  {Number(data.expectedPrice).toLocaleString('en-IN')}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-gray-600" />
              <span>{data.bedrooms} BHK</span>
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-gray-600" />
              <span>{data.carpetArea} sq.ft</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span>{data.locality}</span>
            </div>
            {data.furnishingLevel && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gray-600" />
                <span className="capitalize">{data.furnishingLevel}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Section Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p>Basic Details</p>
            <Button variant="ghost" size="sm" onClick={() => onEditStep?.(1)}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Type: {data.propertyType}</p>
            <p>Category: {data.propertyCategory}</p>
            <p>Listing: {data.listingType}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p>Location</p>
            <Button variant="ghost" size="sm" onClick={() => onEditStep?.(2)}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>{data.city}</p>
            <p>{data.locality}</p>
            {data.societyName && <p>{data.societyName}</p>}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p>Property Details</p>
            <Button variant="ghost" size="sm" onClick={() => onEditStep?.(3)}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>{data.bedrooms} Bed • {data.bathrooms} Bath</p>
            <p>{data.carpetArea} sq.ft carpet area</p>
            <p className="capitalize">{data.furnishingLevel}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p>Pricing</p>
            <Button variant="ghost" size="sm" onClick={() => onEditStep?.(5)}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>₹ {Number(data.expectedPrice).toLocaleString('en-IN')}</p>
            <p>₹ {data.pricePerSqft} per sq.ft</p>
            {data.negotiable && <Badge variant="outline" className="text-xs">Negotiable</Badge>}
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p>Photos & Videos</p>
            <Button variant="ghost" size="sm" onClick={() => onEditStep?.(4)}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Photos: {data.photos?.length ? data.photos.length : 'Not specified'}</p>
            <p>Video: {data.video ? 'Added' : 'Not specified'}</p>
          </div>
        </Card>
      </div>

      {/* Amenities Summary */}
      {(data.amenities?.length || data.societyFeatures?.length) ? (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p>Amenities & Features</p>
            <Button variant="ghost" size="sm" onClick={() => onEditStep?.(6)}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.amenities?.slice(0, 5).map((amenity) => (
              <Badge key={amenity} variant="secondary" className="text-xs">
                {amenity.replace('-', ' ')}
              </Badge>
            ))}
            {data.societyFeatures?.slice(0, 5).map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature.replace('-', ' ')}
              </Badge>
            ))}
            {((data.amenities?.length || 0) + (data.societyFeatures?.length || 0)) > 10 && (
              <Badge variant="outline" className="text-xs">
                +{((data.amenities?.length || 0) + (data.societyFeatures?.length || 0)) - 10} more
              </Badge>
            )}
          </div>
        </Card>
      ) : null}

      {data.description && (
        <Card className="p-4">
          <p className="text-sm font-medium mb-2">Property Description</p>
          <p className="text-gray-700 text-sm leading-6">{data.description}</p>
        </Card>
      )}

      {/* Visibility Settings */}
      <div className="space-y-4">
        <h4>Visibility Settings</h4>
        
        <RadioGroup value={publishOption} onValueChange={(value: any) => setPublishOption(value)}>
          <div className="space-y-3">
            <div
              className={`
                flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${publishOption === 'immediate' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => setPublishOption('immediate')}
            >
              <RadioGroupItem value="immediate" id="immediate" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="immediate" className="cursor-pointer">
                  Go live immediately
                </Label>
                <p className="text-sm text-gray-600">
                  Your property will be visible to buyers right away
                </p>
              </div>
            </div>

            <div
              className={`
                flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${publishOption === 'schedule' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => setPublishOption('schedule')}
            >
              <RadioGroupItem value="schedule" id="schedule" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="schedule" className="cursor-pointer flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule for later
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  Choose when your listing should go live
                </p>
                {publishOption === 'schedule' && (
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                )}
              </div>
            </div>

            <div
              className={`
                flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${publishOption === 'draft' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => setPublishOption('draft')}
            >
              <RadioGroupItem value="draft" id="draft" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="draft" className="cursor-pointer flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save as draft
                </Label>
                <p className="text-sm text-gray-600">
                  Keep it private and publish later
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button onClick={onBack} variant="outline" size="lg">
          Back
        </Button>
        <div className="flex gap-3">
          {publishOption !== 'draft' && (
            <Button onClick={() => onSubmit?.({ publishOption: 'draft' })} variant="outline" size="lg">
              Save as Draft
            </Button>
          )}
          <Button 
            onClick={handleSubmit} 
            size="lg" 
            className="bg-green-600 hover:bg-green-700"
          >
            {publishOption === 'draft' ? 'Save Draft' : 
             publishOption === 'schedule' ? 'Schedule Listing' : 
             'Post Property'}
          </Button>
        </div>
      </div>
    </div>
  );
}
