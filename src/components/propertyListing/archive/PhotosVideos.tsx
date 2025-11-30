"use client";
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Video, Camera, MessageCircle, Smartphone, Info } from 'lucide-react';
import type { PropertyListingData } from '@/types/propertyListing.types';

interface PhotosVideosProps {
  data?: PropertyListingData;
  onNext?: (data: Partial<PropertyListingData>) => void;
  onBack?: () => void;
}

export function PhotosVideos({ data = {}, onNext, onBack }: PhotosVideosProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(URL.createObjectURL(file));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onNext?.({ photos, video });
  };

  const handleSkip = () => {
    onNext?.({ photos: [], video: null });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-2">Add Photos & Videos</h3>
        <p className="text-gray-600">
          Properties with photos get 5x more enquiries
        </p>
      </div>

      {/* Photo Upload */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4>Property Photos</h4>
          <span className="text-sm text-gray-600">
            {photos.length > 0 && `${photos.length} photo${photos.length > 1 ? 's' : ''} uploaded`}
          </span>
        </div>

        {/* Upload Zone */}
        <div
          className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-all"
          onClick={() => photoInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="mb-2">
            Drag & drop photos here or click to browse
          </p>
          <p className="text-sm text-gray-600">
            Minimum 5 photos recommended • JPG, PNG • Max 10MB each
          </p>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={photo}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Cover Photo
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Photo Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex gap-3">
            <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm">Use landscape mode</p>
              <p className="text-xs text-gray-600">Better viewing experience</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Camera className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm">Take photos in daylight</p>
              <p className="text-xs text-gray-600">Natural lighting works best</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm">Keep spaces tidy</p>
              <p className="text-xs text-gray-600">Clean rooms attract buyers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Upload */}
      <div className="space-y-4">
        <h4>Property Video (Optional)</h4>
        
        {!video ? (
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-all"
            onClick={() => videoInputRef.current?.click()}
          >
            <Video className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="mb-2">Upload property video</p>
            <p className="text-sm text-gray-600">
              Max 80MB • 10 minutes • MP4, MOV
            </p>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
            />
          </div>
        ) : (
          <div className="relative">
            <video
              src={video}
              controls
              className="w-full rounded-lg"
            />
            <button
              onClick={() => setVideo(null)}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Upload Options */}
      <div className="space-y-4">
        <h4>Upload from Mobile</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            WhatsApp Upload
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            SMS Link
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Camera Capture
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
        <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-green-900">
            Properties with photos get 5x more enquiries and sell 50% faster
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button onClick={onBack} variant="outline" size="lg">
          Back
        </Button>
        <div className="flex gap-3">
          <Button onClick={handleSkip} variant="ghost" size="lg">
            Continue without photos
          </Button>
          <Button onClick={handleContinue} size="lg" className="bg-blue-600 hover:bg-blue-700">
            Upload & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
