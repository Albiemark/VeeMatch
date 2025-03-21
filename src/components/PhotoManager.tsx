'use client';

import { useState, useEffect } from 'react';
import PhotoUpload from './PhotoUpload';
import PhotoGallery from './PhotoGallery';
import { toast } from 'sonner';

interface PhotoManagerProps {
  profileId: string;
  maxPhotos?: number;
}

export default function PhotoManager({ profileId, maxPhotos = 6 }: PhotoManagerProps) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) {
      setError('Profile ID is required');
    }
  }, [profileId]);

  const handleUploadComplete = (photo: any) => {
    setPhotos(prev => [...prev, photo]);
  };

  const handlePhotoDelete = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Profile Photos</h2>
        <p className="text-sm text-gray-500">
          {photos.length}/{maxPhotos} photos
        </p>
      </div>

      <PhotoGallery
        profileId={profileId}
        onPhotoDelete={handlePhotoDelete}
      />

      {photos.length < maxPhotos && (
        <PhotoUpload
          profileId={profileId}
          onUploadComplete={handleUploadComplete}
          maxPhotos={maxPhotos}
        />
      )}
    </div>
  );
} 